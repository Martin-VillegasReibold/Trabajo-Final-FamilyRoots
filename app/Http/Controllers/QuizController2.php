<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Arbol;
use App\Models\FamilyTreeLink;

class QuizController2 extends Controller
{
    public function index(Request $request)
    {
        $userTrees = Arbol::where('user_id', $request->user()->id)
            ->with(['nodes'])
            ->get();
        return Inertia::render('Activities', [
            'userTrees' => $userTrees,
            'quizData' => null
        ]);
    }


    public function generateQuizForTree(Request $request, $treeId)
    {
        $tree = Arbol::where('id', $treeId)
            ->where('user_id', $request->user()->id)
            ->with(['nodes'])
            ->first();
        if (!$tree) {
            return response()->json(['error' => 'Árbol no encontrado'], 404);
        }
        $quizData = $this->generateQuizData(collect([$tree]));
        if (!$quizData) {
            return response()->json(['error' => 'No hay suficientes datos para generar el quiz'], 400);
        }
        return response()->json($quizData);
    }

    private function generateQuizData($trees)
    {
        $allNodes = collect();
        foreach ($trees as $tree) {
            $allNodes = $allNodes->merge($tree->nodes);
        }
        if ($allNodes->count() < 4) {
            return null;
        }
        $questions = collect();
        $usedBaseKeys = [];
        $tree = $trees->first();
        $familyMembers = $this->convertNodesToFamilyMembers($tree);
        $shuffledMembers = $familyMembers;
        shuffle($shuffledMembers);
        $types = ['rel', 'birth', 'death'];
        $typeIndex = 0;
        $maxSameTypeInRow = 2; // Máximo permitido de la misma pregunta seguida
        $lastTypes = [];
        $maxPerType = 2;
        $typeCounts = [
            'abuelo' => 0,
            'hermano' => 0,
            'padre' => 0,
            'hijo' => 0,
            'primo' => 0,
            'nieto' => 0,
            'tio' => 0,
            'sobrino' => 0,
            'birth' => 0
        ];
        foreach ($shuffledMembers as $member) {
            if (in_array($member['key'], $usedBaseKeys)) continue;
            $type = $types[$typeIndex % 3];
            $added = false;
            $questionType = null;
            if ($type === 'rel') {
                $added = $this->tryAddRelationshipQuestion($member, $familyMembers, $questions, $questionType, $typeCounts, $maxPerType);
            } elseif ($type === 'birth') {
                if ($typeCounts['birth'] < $maxPerType) {
                    $added = $this->tryAddBirthQuestion($member, $familyMembers, $questions, $questionType);
                    if ($added) $typeCounts['birth']++;
                }
            } elseif ($type === 'death') {
                $added = $this->tryAddDeathQuestion($member, $familyMembers, $questions, $questionType);
            }
            if ($added && $questionType) {
                $usedBaseKeys[] = $member['key'];
                $typeIndex++;
                $lastTypes[] = $questionType;
                if (isset($typeCounts[$questionType])) $typeCounts[$questionType]++;
                if (count($lastTypes) > $maxSameTypeInRow) array_shift($lastTypes);
                if (count(array_unique($lastTypes)) === 1 && count($lastTypes) === $maxSameTypeInRow) {
                    continue;
                }
            }
            if (!$added) {
                $otherTypes = array_diff($types, [$type]);
                foreach ($otherTypes as $otherType) {
                    $questionType = null;
                    if ($otherType === 'rel') {
                        $added = $this->tryAddRelationshipQuestion($member, $familyMembers, $questions, $questionType, $typeCounts, $maxPerType);
                    } elseif ($otherType === 'birth') {
                        if ($typeCounts['birth'] < $maxPerType) {
                            $added = $this->tryAddBirthQuestion($member, $familyMembers, $questions, $questionType);
                            if ($added) $typeCounts['birth']++;
                        }
                    } elseif ($otherType === 'death') {
                        $added = $this->tryAddDeathQuestion($member, $familyMembers, $questions, $questionType);
                    }
                    if ($added && $questionType) {
                        $usedBaseKeys[] = $member['key'];
                        $typeIndex++;
                        $lastTypes[] = $questionType;
                        if (isset($typeCounts[$questionType])) $typeCounts[$questionType]++;
                        if (count($lastTypes) > $maxSameTypeInRow) array_shift($lastTypes);
                        if (count(array_unique($lastTypes)) === 1 && count($lastTypes) === $maxSameTypeInRow) {
                            break;
                        }
                        break;
                    }
                }
            }
        }
    return $questions->shuffle()->take(10)->values(); //CANTIDAD DE PREGUNTAS
    }
    // Intenta agregar una pregunta de relación para un miembro base
    private function tryAddRelationshipQuestion($member, $familyMembers, &$questions, &$questionType = null, &$typeCounts = [], $maxPerType = 2) {
        // Pregunta específica de abuelos (ancestros a distancia 2)
        $visited = [];
        $ancestors = $this->findAncestors($member['key'], $familyMembers, 2, 1, $visited);
        foreach ($ancestors as $ancestor) {
            if ($ancestor['distance'] === 2 && $typeCounts['abuelo'] < $maxPerType) {
                $relatedPerson = collect($familyMembers)->firstWhere('key', $ancestor['key']);
                if ($relatedPerson) {
                    if ($this->generateDistanceRelationshipQuestion($member, $relatedPerson, 'Mi Abuelo/a es', $familyMembers, $questions)) {
                        $questionType = 'abuelo';
                        return true;
                    }
                }
            }
        }
        $maxDepth = 3;
        // Pregunta específica de hermanos
        $siblings = $this->findSiblings($member, $familyMembers);
        foreach ($siblings as $siblingKey) {
            if ($typeCounts['hermano'] >= $maxPerType) break;
            $relatedPerson = collect($familyMembers)->firstWhere('key', $siblingKey);
            if ($relatedPerson) {
                if ($this->generateDistanceRelationshipQuestion($member, $relatedPerson, 'Mi Hermano/a es', $familyMembers, $questions)) {
                    $questionType = 'hermano';
                    return true;
                }
            }
        }
        // Pregunta específica de padre/madre
        foreach (($member['parents'] ?? []) as $parentKey) {
            if ($typeCounts['padre'] >= $maxPerType) break;
            $relatedPerson = collect($familyMembers)->firstWhere('key', $parentKey);
            if ($relatedPerson) {
                if ($this->generateDistanceRelationshipQuestion($member, $relatedPerson, 'Mi Padre/Madre es', $familyMembers, $questions)) {
                    $questionType = 'padre';
                    return true;
                }
            }
        }
        // Pregunta específica de hijo/a
        foreach ($familyMembers as $possibleChild) {
            if ($typeCounts['hijo'] >= $maxPerType) break;
            if (in_array($member['key'], $possibleChild['parents'] ?? [])) {
                if ($this->generateDistanceRelationshipQuestion($member, $possibleChild, 'Mi Hijo/a es', $familyMembers, $questions)) {
                    $questionType = 'hijo';
                    return true;
                }
            }
        }
        // Pregunta específica de primo/a
        $cousins = $this->findCousins($member, $familyMembers);
        foreach ($cousins as $cousinKey) {
            if ($typeCounts['primo'] >= $maxPerType) break;
            $relatedPerson = collect($familyMembers)->firstWhere('key', $cousinKey);
            if ($relatedPerson) {
                if ($this->generateDistanceRelationshipQuestion($member, $relatedPerson, 'Mi Primo/a es', $familyMembers, $questions)) {
                    $questionType = 'primo';
                    return true;
                }
            }
        }
        // Pregunta específica de nieto/a
        $visited = [];
        $descendants = $this->findDescendants($member['key'], $familyMembers, 2, 1, $visited);
        foreach ($descendants as $descendant) {
            if ($typeCounts['nieto'] >= $maxPerType) break;
            if ($descendant['distance'] === 2) {
                $relatedPerson = collect($familyMembers)->firstWhere('key', $descendant['key']);
                if ($relatedPerson) {
                    if ($this->generateDistanceRelationshipQuestion($member, $relatedPerson, 'Mi Nieto/a es', $familyMembers, $questions)) {
                        $questionType = 'nieto';
                        return true;
                    }
                }
            }
        }
        // Pregunta específica de tío/a
        $parents = $member['parents'] ?? [];
        $unclesAunts = [];
        foreach ($parents as $parentKey) {
            $parent = collect($familyMembers)->firstWhere('key', $parentKey);
            if ($parent) {
                $unclesAunts = array_merge($unclesAunts, $this->findSiblings($parent, $familyMembers));
            }
        }
        foreach ($unclesAunts as $uncleKey) {
            if ($typeCounts['tio'] >= $maxPerType) break;
            $relatedPerson = collect($familyMembers)->firstWhere('key', $uncleKey);
            if ($relatedPerson) {
                if ($this->generateDistanceRelationshipQuestion($member, $relatedPerson, 'Mi Tío/a es', $familyMembers, $questions)) {
                    $questionType = 'tio';
                    return true;
                }
            }
        }
        // Pregunta específica de sobrino/a
        $siblings = $this->findSiblings($member, $familyMembers);
        foreach ($siblings as $siblingKey) {
            if ($typeCounts['sobrino'] >= $maxPerType) break;
            foreach ($familyMembers as $possibleNephew) {
                if (in_array($siblingKey, $possibleNephew['parents'] ?? [])) {
                    if ($this->generateDistanceRelationshipQuestion($member, $possibleNephew, 'Mi Sobrino/a es', $familyMembers, $questions)) {
                        $questionType = 'sobrino';
                        return true;
                    }
                }
            }
        }
        // Abuelos (ancestros a distancia 2)
        $visited = [];
        $ancestors = $this->findAncestors($member['key'], $familyMembers, $maxDepth, 1, $visited);
        foreach ($ancestors as $ancestor) {
            if ($ancestor['distance'] === 2) {
                $relatedPerson = collect($familyMembers)->firstWhere('key', $ancestor['key']);
                if ($relatedPerson) {
                    if ($this->generateDistanceRelationshipQuestion($member, $relatedPerson, 'Mi Abuelo/a es', $familyMembers, $questions)) {
                        return true;
                    }
                }
            }
        }
        // Nietos (descendientes a distancia 2)
        $visited = [];
        $descendants = $this->findDescendants($member['key'], $familyMembers, $maxDepth, 1, $visited);
        foreach ($descendants as $descendant) {
            if ($descendant['distance'] === 2) {
                $relatedPerson = collect($familyMembers)->firstWhere('key', $descendant['key']);
                if ($relatedPerson) {
                    if ($this->generateDistanceRelationshipQuestion($member, $relatedPerson, 'Mi Nieto/a es', $familyMembers, $questions)) {
                        return true;
                    }
                }
            }
        }
        // Ancestros generales
        foreach ($ancestors as $ancestor) {
            $relation = $this->getRelationNameByDistance($ancestor['distance'], 'up');
            if ($relation) {
                $relatedPerson = collect($familyMembers)->firstWhere('key', $ancestor['key']);
                if ($relatedPerson) {
                    if ($this->generateDistanceRelationshipQuestion($member, $relatedPerson, $relation, $familyMembers, $questions)) {
                        return true;
                    }
                }
            }
        }
        // Descendientes generales
        foreach ($descendants as $descendant) {
            $relation = $this->getRelationNameByDistance($descendant['distance'], 'down');
            if ($relation) {
                $relatedPerson = collect($familyMembers)->firstWhere('key', $descendant['key']);
                if ($relatedPerson) {
                    if ($this->generateDistanceRelationshipQuestion($member, $relatedPerson, $relation, $familyMembers, $questions)) {
                        return true;
                    }
                }
            }
        }
        // Primos
        $cousins = $this->findCousins($member, $familyMembers);
        foreach ($cousins as $cousinKey) {
            $relatedPerson = collect($familyMembers)->firstWhere('key', $cousinKey);
            if ($relatedPerson) {
                if ($this->generateDistanceRelationshipQuestion($member, $relatedPerson, 'Mi Primo/a es', $familyMembers, $questions)) {
                    return true;
                }
            }
        }
        // Padre/Madre
        foreach (($member['parents'] ?? []) as $parentKey) {
            $relatedPerson = collect($familyMembers)->firstWhere('key', $parentKey);
            if ($relatedPerson) {
                if ($this->generateDistanceRelationshipQuestion($member, $relatedPerson, 'Mi Padre/Madre es', $familyMembers, $questions)) {
                    return true;
                }
            }
        }
        // Hijo/a
        foreach ($familyMembers as $possibleChild) {
            if (in_array($member['key'], $possibleChild['parents'] ?? [])) {
                if ($this->generateDistanceRelationshipQuestion($member, $possibleChild, 'Mi Hijo/a es', $familyMembers, $questions)) {
                    return true;
                }
            }
        }
        // Cónyuge
        foreach (($member['spouses'] ?? []) as $spouseKey) {
            $relatedPerson = collect($familyMembers)->firstWhere('key', $spouseKey);
            if ($relatedPerson) {
                if ($this->generateDistanceRelationshipQuestion($member, $relatedPerson, 'Mi Cónyuge es', $familyMembers, $questions)) {
                    return true;
                }
            }
        }
        return false;
    }

    // Intenta agregar una pregunta de nacimiento
    private function tryAddBirthQuestion($member, $familyMembers, &$questions) {
        if (!isset($member['birth_year']) || !$member['birth_year']) return false;
        $wrongYears = [];
        foreach ($familyMembers as $other) {
            if ($other['key'] !== $member['key'] && isset($other['birth_year']) && $other['birth_year']) {
                $wrongYears[] = $other['birth_year'];
            }
        }
        $wrongYears = array_unique($wrongYears);
        if (count($wrongYears) >= 3) {
            shuffle($wrongYears);
            $answers = array_slice($wrongYears, 0, 3);
            $answers[] = $member['birth_year'];
            shuffle($answers);
            $questions->push([
                'id' => 'birth_' . $member['key'],
                'question' => "¿En qué año nació {$member['name']}?",
                'img' => $member['img'] ?? null,
                'description' => 'Año de nacimiento',
                'answers' => collect($answers),
                'correctAnswer' => array_search($member['birth_year'], $answers),
                'type' => 'birth_year',
            ]);
            return true;
        }
        return false;
    }

    // Intenta agregar una pregunta de fallecimiento
    private function tryAddDeathQuestion($member, $familyMembers, &$questions) {
        if (!isset($member['death_year']) || !$member['death_year']) return false;
        $wrongYears = [];
        foreach ($familyMembers as $other) {
            if ($other['key'] !== $member['key'] && isset($other['death_year']) && $other['death_year']) {
                $wrongYears[] = $other['death_year'];
            }
        }
        $wrongYears = array_unique($wrongYears);
        if (count($wrongYears) >= 3) {
            shuffle($wrongYears);
            $answers = array_slice($wrongYears, 0, 3);
            $answers[] = $member['death_year'];
            shuffle($answers);
            $questions->push([
                'id' => 'death_' . $member['key'],
                'question' => "¿En qué año falleció {$member['name']}?",
                'img' => $member['img'] ?? null,
                'description' => 'Año de fallecimiento',
                'answers' => collect($answers),
                'correctAnswer' => array_search($member['death_year'], $answers),
                'type' => 'death_year',
            ]);
            return true;
        }
        return false;
        return false;
    }

    // --- Lógica de relaciones por distancia ---
    private function findHalfSiblings($member, $allMembers) {
        $halfSiblings = [];
        $memberParents = $member['parents'] ?? [];
        foreach ($allMembers as $other) {
            if ($other['key'] !== $member['key']) {
                $otherParents = $other['parents'] ?? [];
                $sharedParents = array_intersect($memberParents, $otherParents);
                if (count($sharedParents) === 1 && count($memberParents) > 0 && count($otherParents) > 0 && count($memberParents) !== count($sharedParents)) {
                    $halfSiblings[] = $other['key'];
                }
            }
        }
        return $halfSiblings;
    }

    private function findSiblings($member, $allMembers) {
        $siblings = [];
        foreach ($allMembers as $other) {
            if ($other['key'] !== $member['key']) {
                $sharedParents = array_intersect($member['parents'] ?? [], $other['parents'] ?? []);
                if (count($sharedParents) > 0) {
                    $siblings[] = $other['key'];
                }
            }
        }
        return $siblings;
    }

    private function findCousins($member, $allMembers) {
        $cousins = [];
        $parents = $member['parents'] ?? [];
        $unclesAunts = [];
        foreach ($parents as $parentKey) {
            $parent = collect($allMembers)->firstWhere('key', $parentKey);
            if ($parent) {
                $unclesAunts = array_merge($unclesAunts, $this->findSiblings($parent, $allMembers));
            }
        }
        foreach ($unclesAunts as $uncleKey) {
            foreach ($allMembers as $other) {
                if ($other['key'] !== $member['key'] && in_array($uncleKey, $other['parents'] ?? [])) {
                    $cousins[] = $other['key'];
                }
            }
        }
        return $cousins;
    }

    private function findAncestors($memberKey, $allMembers, $maxDepth = 3, $currentDepth = 1, &$visited = []) {
        $ancestors = [];
        if ($currentDepth > $maxDepth) return $ancestors;
        if (in_array($memberKey, $visited)) return $ancestors;
        $visited[] = $memberKey;
        $member = collect($allMembers)->firstWhere('key', $memberKey);
        if (!$member || empty($member['parents'])) return $ancestors;
        foreach ($member['parents'] as $parentKey) {
            $ancestors[] = ['key' => $parentKey, 'distance' => $currentDepth];
            $ancestors = array_merge($ancestors, $this->findAncestors($parentKey, $allMembers, $maxDepth, $currentDepth + 1, $visited));
        }
        return $ancestors;
    }

    private function findDescendants($memberKey, $allMembers, $maxDepth = 3, $currentDepth = 1, &$visited = []) {
        $descendants = [];
        if ($currentDepth > $maxDepth) return $descendants;
        if (in_array($memberKey, $visited)) return $descendants;
        $visited[] = $memberKey;
        foreach ($allMembers as $member) {
            if (!empty($member['parents']) && in_array($memberKey, $member['parents'])) {
                $descendants[] = ['key' => $member['key'], 'distance' => $currentDepth];
                $descendants = array_merge($descendants, $this->findDescendants($member['key'], $allMembers, $maxDepth, $currentDepth + 1, $visited));
            }
        }
        return $descendants;
    }

    private function getRelationNameByDistance($distance, $direction) {
        $map = [
            1 => $direction === 'up' ? 'Mi Padre/Madre es' : 'Mi Hijo/a es',
            2 => $direction === 'up' ? 'Mi Abuelo/a es' : 'Mi Nieto/a es',
            3 => $direction === 'up' ? 'Mi Bisabuelo/a es' : 'Mi Bisnieto/a es',
        ];
        return $map[$distance] ?? null;
    }

    private function convertNodesToFamilyMembers($tree)
    {
        $members = [];
        $links = FamilyTreeLink::where('arbol_id', $tree->id)->get();
        // Build a map of node_key to member info
        foreach ($tree->nodes as $node) {
            $members[$node->node_key] = [
                'key' => $node->node_key,
                'name' => $node->name,
                'img' => $node->img ?? null,
                'birth_year' => $node->birth_year ?? null,
                'death_year' => $node->death_year ?? null,
                'parents' => [],
                'spouses' => [],
            ];
        }

        // Assign parents and spouses using the correct link fields
        foreach ($links as $link) {
            if ($link->relationship_type === 'parent') {
                // from_node = parent, to_node = child
                if (isset($members[$link->to_node]) && isset($members[$link->from_node])) {
                    $members[$link->to_node]['parents'][] = $link->from_node;
                }
            } elseif ($link->relationship_type === 'spouse') {
                // from_node <-> to_node are spouses
                if (isset($members[$link->from_node]) && isset($members[$link->to_node])) {
                    $members[$link->from_node]['spouses'][] = $link->to_node;
                    $members[$link->to_node]['spouses'][] = $link->from_node;
                }
            }
        }

        // Return as a simple array
        return array_values($members);
    }

    private function formatRelationshipQuestion($personName, $relationshipType)
    {
        switch ($relationshipType) {
            case 'Mi Hermanastro/a es':
                return "¿Cuál de estas personas es hermanastro/a de {$personName}?";
            case 'Mi Cónyuge es':
                return "¿Quién es el/la cónyuge de {$personName}?";
            case 'Mi Padre/Madre es':
                return "¿Cuál de estas personas es padre o madre de {$personName}?";
            case 'Mi Hijo/a es':
                return "¿Cuál de estas personas es hijo/a de {$personName}?";
            case 'Mi Hermano/a es':
                return "¿Cuál de estas personas es hermano/a de {$personName}?";
            case 'Mi Primo/a es':
                return "¿Cuál de estas personas es primo/a de {$personName}?";
            case 'Mi Abuelo/a es':
                return "¿Cuál de estas personas es abuelo/a de {$personName}?";
            case 'Mi Bisabuelo/a es':
                return "¿Cuál de estas personas es bisabuelo/a de {$personName}?";
            case 'Mi Nieto/a es':
                return "¿Cuál de estas personas es nieto/a de {$personName}?";
            case 'Mi Bisnieto/a es':
                return "¿Cuál de estas personas es bisnieto/a de {$personName}?";
            default:
                return "¿Cuál de estas personas tiene una relación familiar con {$personName}?";
        }
    }

    private function getRelationshipDescription($relationshipType)
    {
        switch ($relationshipType) {
            case 'Mi Hermanastro/a es':
                return 'Relación de parentesco: hermanastro/a';
            case 'Mi Cónyuge es':
                return 'Relación matrimonial o de pareja';
            case 'Mi Padre/Madre es':
                return 'Relación de parentesco directo ascendente';
            case 'Mi Hijo/a es':
                return 'Relación de parentesco directo descendente';
            case 'Mi Hermano/a es':
                return 'Relación fraternal';
            case 'Mi Primo/a es':
                return 'Relación de parentesco: primo/a';
            case 'Mi Abuelo/a es':
                return 'Relación de parentesco: abuelo/a';
            case 'Mi Bisabuelo/a es':
                return 'Relación de parentesco: bisabuelo/a';
            case 'Mi Nieto/a es':
                return 'Relación de parentesco: nieto/a';
            case 'Mi Bisnieto/a es':
                return 'Relación de parentesco: bisnieto/a';
            default:
                return 'Relación familiar';
        }
    }

    private function generateDistanceRelationshipQuestions($tree, &$questions, &$usedBaseKeys) {
        $nodes = $tree->nodes;
        if ($nodes->count() < 4) return;
        $familyMembers = $this->convertNodesToFamilyMembers($tree);
        $maxDepth = 3;
        $found = [
            'Mi Abuelo/a es' => null,
            'Mi Nieto/a es' => null,
            'Mi Hermano/a es' => null,
            'Mi Hermanastro/a es' => null,
            'Mi Primo/a es' => null,
            'Mi Padre/Madre es' => null,
            'Mi Hijo/a es' => null,
            'Mi Bisabuelo/a es' => null,
            'Mi Bisnieto/a es' => null,
            'Mi Cónyuge es' => null
        ];
        foreach ($familyMembers as $member) {
            if (in_array($member['key'], $usedBaseKeys)) continue;
            // Ancestros
            $visited = [];
            $ancestors = $this->findAncestors($member['key'], $familyMembers, $maxDepth, 1, $visited);
            foreach ($ancestors as $ancestor) {
                $relation = $this->getRelationNameByDistance($ancestor['distance'], 'up');
                if ($relation && isset($found[$relation]) && $found[$relation] === null) {
                    $relatedPerson = collect($familyMembers)->firstWhere('key', $ancestor['key']);
                    if ($relatedPerson) {
                        if ($this->generateDistanceRelationshipQuestion($member, $relatedPerson, $relation, $familyMembers, $questions)) {
                            $found[$relation] = [$member['key'], $ancestor['key']];
                            $usedBaseKeys[] = $member['key'];
                        }
                    }
                }
            }
            // Descendientes
            $visited = [];
            $descendants = $this->findDescendants($member['key'], $familyMembers, $maxDepth, 1, $visited);
            foreach ($descendants as $descendant) {
                $relation = $this->getRelationNameByDistance($descendant['distance'], 'down');
                if ($relation && isset($found[$relation]) && $found[$relation] === null) {
                    $relatedPerson = collect($familyMembers)->firstWhere('key', $descendant['key']);
                    if ($relatedPerson) {
                        if ($this->generateDistanceRelationshipQuestion($member, $relatedPerson, $relation, $familyMembers, $questions)) {
                            $found[$relation] = [$member['key'], $descendant['key']];
                            $usedBaseKeys[] = $member['key'];
                        }
                    }
                }
                // Nietos
                if ($descendant['distance'] === 2 && $found['Mi Nieto/a es'] === null) {
                    $relatedPerson = collect($familyMembers)->firstWhere('key', $descendant['key']);
                    if ($relatedPerson) {
                        if ($this->generateDistanceRelationshipQuestion($member, $relatedPerson, 'Mi Nieto/a es', $familyMembers, $questions)) {
                            $found['Mi Nieto/a es'] = [$member['key'], $descendant['key']];
                            $usedBaseKeys[] = $member['key'];
                        }
                    }
                }
                // Bisnietos
                if ($descendant['distance'] === 3 && $found['Mi Bisnieto/a es'] === null) {
                    $relatedPerson = collect($familyMembers)->firstWhere('key', $descendant['key']);
                    if ($relatedPerson) {
                        if ($this->generateDistanceRelationshipQuestion($member, $relatedPerson, 'Mi Bisnieto/a es', $familyMembers, $questions)) {
                            $found['Mi Bisnieto/a es'] = [$member['key'], $descendant['key']];
                            $usedBaseKeys[] = $member['key'];
                        }
                    }
                }
            }
            // Hermanos
            $siblings = $this->findSiblings($member, $familyMembers);
            foreach ($siblings as $siblingKey) {
                if ($found['Mi Hermano/a es'] === null) {
                    $relatedPerson = collect($familyMembers)->firstWhere('key', $siblingKey);
                    if ($relatedPerson) {
                        if ($this->generateDistanceRelationshipQuestion($member, $relatedPerson, 'Mi Hermano/a es', $familyMembers, $questions)) {
                            $found['Mi Hermano/a es'] = [$member['key'], $siblingKey];
                            $usedBaseKeys[] = $member['key'];
                        }
                    }
                }
            }
            // Hermanastros
            $halfSiblings = $this->findHalfSiblings($member, $familyMembers);
            foreach ($halfSiblings as $halfSiblingKey) {
                if ($found['Mi Hermanastro/a es'] === null) {
                    $relatedPerson = collect($familyMembers)->firstWhere('key', $halfSiblingKey);
                    if ($relatedPerson) {
                        if ($this->generateDistanceRelationshipQuestion($member, $relatedPerson, 'Mi Hermanastro/a es', $familyMembers, $questions)) {
                            $found['Mi Hermanastro/a es'] = [$member['key'], $halfSiblingKey];
                            $usedBaseKeys[] = $member['key'];
                        }
                    }
                }
            }
            // Primos
            $cousins = $this->findCousins($member, $familyMembers);
            foreach ($cousins as $cousinKey) {
                if ($found['Mi Primo/a es'] === null) {
                    $relatedPerson = collect($familyMembers)->firstWhere('key', $cousinKey);
                    if ($relatedPerson) {
                        if ($this->generateDistanceRelationshipQuestion($member, $relatedPerson, 'Mi Primo/a es', $familyMembers, $questions)) {
                            $found['Mi Primo/a es'] = [$member['key'], $cousinKey];
                            $usedBaseKeys[] = $member['key'];
                        }
                    }
                }
            }
            // Padre/Madre
            foreach (($member['parents'] ?? []) as $parentKey) {
                if ($found['Mi Padre/Madre es'] === null) {
                    $relatedPerson = collect($familyMembers)->firstWhere('key', $parentKey);
                    if ($relatedPerson) {
                        if ($this->generateDistanceRelationshipQuestion($member, $relatedPerson, 'Mi Padre/Madre es', $familyMembers, $questions)) {
                            $found['Mi Padre/Madre es'] = [$member['key'], $parentKey];
                            $usedBaseKeys[] = $member['key'];
                        }
                    }
                }
            }
            // Hijo/a
            foreach ($familyMembers as $possibleChild) {
                if (in_array($member['key'], $possibleChild['parents'] ?? []) && $found['Mi Hijo/a es'] === null) {
                    if ($this->generateDistanceRelationshipQuestion($member, $possibleChild, 'Mi Hijo/a es', $familyMembers, $questions)) {
                        $found['Mi Hijo/a es'] = [$member['key'], $possibleChild['key']];
                        $usedBaseKeys[] = $member['key'];
                    }
                }
            }
            // Cónyuge
            foreach (($member['spouses'] ?? []) as $spouseKey) {
                if ($found['Mi Cónyuge es'] === null) {
                    $relatedPerson = collect($familyMembers)->firstWhere('key', $spouseKey);
                    if ($relatedPerson) {
                        if ($this->generateDistanceRelationshipQuestion($member, $relatedPerson, 'Mi Cónyuge es', $familyMembers, $questions)) {
                            $found['Mi Cónyuge es'] = [$member['key'], $spouseKey];
                            $usedBaseKeys[] = $member['key'];
                        }
                    }
                }
            }
            if (count(array_filter($found)) === count($found)) break;
        }
    }

    private function generateDistanceRelationshipQuestion($person, $relatedPerson, $relationshipType, $allMembers, &$questions) {
        $wrongOptions = [];
        $siblings = $this->findSiblings($person, $allMembers);
        $cousins = $this->findCousins($person, $allMembers);
        foreach ($allMembers as $member) {
            if ($member['key'] !== $person['key'] && $member['key'] !== $relatedPerson['key']) {
                $isCorrect = false;
                if ($relationshipType === 'Mi Hermano/a es') {
                    $isCorrect = in_array($member['key'], $siblings);
                } elseif ($relationshipType === 'Mi Primo/a es') {
                    $isCorrect = in_array($member['key'], $cousins);
                } else {
                    $distance = null;
                    $visited = [];
                    $ancestors = $this->findAncestors($person['key'], $allMembers, 3, 1, $visited);
                    foreach ($ancestors as $a) {
                        if ($a['key'] === $member['key']) {
                            $distance = $a['distance'];
                            break;
                        }
                    }
                    $visited = [];
                    $descendants = $this->findDescendants($person['key'], $allMembers, 3, 1, $visited);
                    foreach ($descendants as $d) {
                        if ($d['key'] === $member['key']) {
                            $distance = -$d['distance'];
                            break;
                        }
                    }
                    $rel = null;
                    if ($distance !== null) {
                        $rel = $this->getRelationNameByDistance(abs($distance), $distance > 0 ? 'up' : 'down');
                    }
                    $isCorrect = ($rel === $relationshipType);
                }
                if (!$isCorrect) {
                    $wrongOptions[] = $member['name'];
                }
            }
        }
        if (count($wrongOptions) < 3) return false;
        shuffle($wrongOptions);
        $wrongAnswers = array_slice($wrongOptions, 0, 3);
        $correctAnswer = $relatedPerson['name'];
        $answers = collect($wrongAnswers);
        $answers->push($correctAnswer);
        $answers = $answers->shuffle()->values();
        $correctCount = 0;
        foreach ($answers as $answer) {
            foreach ($allMembers as $member) {
                if ($member['name'] === $answer) {
                    $isCorrect = false;
                    if ($relationshipType === 'Mi Hermano/a es') {
                        $isCorrect = in_array($member['key'], $siblings);
                    } elseif ($relationshipType === 'Mi Primo/a es') {
                        $isCorrect = in_array($member['key'], $cousins);
                    } else {
                        $distance = null;
                        $visited = [];
                        $ancestors = $this->findAncestors($person['key'], $allMembers, 3, 1, $visited);
                        foreach ($ancestors as $a) {
                            if ($a['key'] === $member['key']) {
                                $distance = $a['distance'];
                                break;
                            }
                        }
                        $visited = [];
                        $descendants = $this->findDescendants($person['key'], $allMembers, 3, 1, $visited);
                        foreach ($descendants as $d) {
                            if ($d['key'] === $member['key']) {
                                $distance = -$d['distance'];
                                break;
                            }
                        }
                        $rel = null;
                        if ($distance !== null) {
                            $rel = $this->getRelationNameByDistance(abs($distance), $distance > 0 ? 'up' : 'down');
                        }
                        $isCorrect = ($rel === $relationshipType);
                    }
                    if ($isCorrect) {
                        $correctCount++;
                    }
                    break;
                }
            }
        }
        if ($correctCount !== 1) return false;
        $questionText = $this->formatRelationshipQuestion($person['name'], $relationshipType);
        $correctIndex = $answers->search($correctAnswer);
        $questions->push([
            'id' => 'distance_' . $person['key'] . '_' . $relatedPerson['key'] . '_' . $relationshipType,
            'question' => $questionText,
            'img' => $person['img'] ?? null,
            'description' => $this->getRelationshipDescription($relationshipType),
            'answers' => $answers,
            'correctAnswer' => $correctIndex,
            'type' => 'relationship'
        ]);
        return true;
    }

    public function submitQuiz(Request $request)
    {
        $answers = $request->input('answers');
        $quizData = $request->input('quizData');
        
        $score = 0;
        $total = count($quizData);
        $results = [];

        foreach ($quizData as $index => $question) {
            $userAnswer = $answers[$index] ?? -1;
            $isCorrect = $userAnswer == $question['correctAnswer'];
            
            if ($isCorrect) {
                $score++;
            }

            $results[] = [
                'question' => $question['question'],
                'userAnswer' => $userAnswer,
                'correctAnswer' => $question['correctAnswer'],
                'isCorrect' => $isCorrect,
                'answers' => $question['answers']
            ];
        }

        return response()->json([
            'score' => $score,
            'total' => $total,
            'percentage' => round(($score / $total) * 100, 2),
            'results' => $results
        ]);
    }
}