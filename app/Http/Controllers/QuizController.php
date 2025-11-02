<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Arbol;
use App\Models\FamilyTreeNode;
use App\Models\FamilyTreeLink;

class QuizController extends Controller
{
    // Devuelve los keys de los hermanastros de un miembro
    private function findHalfSiblings($member, $allMembers) {
        $halfSiblings = [];
        $memberParents = $member['parents'] ?? [];
        foreach ($allMembers as $other) {
            if ($other['key'] !== $member['key']) {
                $otherParents = $other['parents'] ?? [];
                $sharedParents = array_intersect($memberParents, $otherParents);
                // Hermanastro: comparten solo UN padre/madre y no todos
                if (count($sharedParents) === 1 && count($memberParents) > 0 && count($otherParents) > 0 && count($memberParents) !== count($sharedParents)) {
                    $halfSiblings[] = $other['key'];
                }
            }
        }
        return $halfSiblings;
    }
    // Devuelve los keys de los hermanos de un miembro
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

    // Devuelve los keys de los primos de un miembro
    private function findCousins($member, $allMembers) {
        $cousins = [];
        // Buscar los padres del miembro
        $parents = $member['parents'] ?? [];
        $unclesAunts = [];
        // Para cada padre, buscar sus hermanos (tíos/tías)
        foreach ($parents as $parentKey) {
            $parent = collect($allMembers)->firstWhere('key', $parentKey);
            if ($parent) {
                $unclesAunts = array_merge($unclesAunts, $this->findSiblings($parent, $allMembers));
            }
        }
        // Para cada tío/tía, buscar sus hijos (primos)
        foreach ($unclesAunts as $uncleKey) {
            foreach ($allMembers as $other) {
                if ($other['key'] !== $member['key'] && in_array($uncleKey, $other['parents'] ?? [])) {
                    $cousins[] = $other['key'];
                }
            }
        }
        return $cousins;
    }
    // Encuentra ancestros de un nodo hasta una profundidad máxima
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

    // Encuentra descendientes de un nodo hasta una profundidad máxima
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

    // Traduce la distancia a un nombre de relación
    private function getRelationNameByDistance($distance, $direction) {
        $map = [
            1 => $direction === 'up' ? 'Mi Padre/Madre es' : 'Mi Hijo/a es',
            2 => $direction === 'up' ? 'Mi Abuelo/a es' : 'Mi Nieto/a es',
            3 => $direction === 'up' ? 'Mi Bisabuelo/a es' : 'Mi Bisnieto/a es',
        ];
        return $map[$distance] ?? null;
    }

    // Genera preguntas de relaciones por distancia
    private function generateDistanceRelationshipQuestions($tree, &$questions) {
        $nodes = $tree->nodes;
        if ($nodes->count() < 4) return;
        $familyMembers = $this->convertNodesToFamilyMembers($tree);
        $maxDepth = 3;
        $generated = 0;
        // Relación: tipo => [personKey, relatedKey]
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
                        }
                    }
                }
                // Nietos
                if ($descendant['distance'] === 2 && $found['Mi Nieto/a es'] === null) {
                    $relatedPerson = collect($familyMembers)->firstWhere('key', $descendant['key']);
                    if ($relatedPerson) {
                        if ($this->generateDistanceRelationshipQuestion($member, $relatedPerson, 'Mi Nieto/a es', $familyMembers, $questions)) {
                            $found['Mi Nieto/a es'] = [$member['key'], $descendant['key']];
                        }
                    }
                }
                // Bisnietos
                if ($descendant['distance'] === 3 && $found['Mi Bisnieto/a es'] === null) {
                    $relatedPerson = collect($familyMembers)->firstWhere('key', $descendant['key']);
                    if ($relatedPerson) {
                        if ($this->generateDistanceRelationshipQuestion($member, $relatedPerson, 'Mi Bisnieto/a es', $familyMembers, $questions)) {
                            $found['Mi Bisnieto/a es'] = [$member['key'], $descendant['key']];
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
                        }
                    }
                }
            }
            // Hijo/a
            foreach ($familyMembers as $possibleChild) {
                if (in_array($member['key'], $possibleChild['parents'] ?? []) && $found['Mi Hijo/a es'] === null) {
                    if ($this->generateDistanceRelationshipQuestion($member, $possibleChild, 'Mi Hijo/a es', $familyMembers, $questions)) {
                        $found['Mi Hijo/a es'] = [$member['key'], $possibleChild['key']];
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
                        }
                    }
                }
            }
            if (count(array_filter($found)) === count($found)) break;
        }
    }

    // Genera una pregunta de relación por distancia
    private function generateDistanceRelationshipQuestion($person, $relatedPerson, $relationshipType, $allMembers, &$questions) {
        // Opciones incorrectas: miembros que no tengan esa relación
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
        // Mostrar la imagen del padre/madre en preguntas de padre/madre, y la del nodo base en las demás
        // Siempre mostrar la imagen de la persona base de la pregunta
    // Siempre mostrar la imagen de la persona base de la pregunta (incluyendo preguntas de hijo/a y cónyuge)
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
    public function index(Request $request)
    {
        // Obtener árboles del usuario
        $userTrees = Arbol::where('user_id', $request->user()->id)
            ->with(['nodes'])
            ->get();

        return Inertia::render('Activities', [
            'userTrees' => $userTrees,
            'quizData' => null // No generar quiz automáticamente
        ]);
    }

    public function generateQuizForTree(Request $request, $treeId)
    {
        // Validar que el árbol pertenezca al usuario
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
            return null; // No hay suficientes nodos para crear preguntas
        }

        $questions = collect();

        // Generar diferentes tipos de preguntas
    $this->generateNameQuestions($allNodes, $questions);
    $this->generateRelationshipQuestions($trees->first(), $questions);
    $this->generateDistanceRelationshipQuestions($trees->first(), $questions);
    $this->generateBirthYearQuestions($allNodes, $questions);
    $this->generateDeathYearQuestions($allNodes, $questions);
    return $questions->shuffle()->take(10)->values();
    }

    private function generateDeathYearQuestions($nodes, &$questions)
    {
        $validNodes = $nodes->filter(function($node) {
            return !empty($node->name) && !empty($node->death_year);
        });

        foreach ($validNodes->take(4) as $node) {
            $wrongYears = collect();
            $baseYear = $node->death_year;
            // Generar años incorrectos cercanos al correcto
            for ($i = 0; $i < 3; $i++) {
                $wrongYear = $baseYear + (rand(-20, 20));
                if ($wrongYear != $baseYear && !$wrongYears->contains($wrongYear)) {
                    $wrongYears->push($wrongYear);
                }
            }

            if ($wrongYears->count() >= 3) {
                $answers = $wrongYears->push($baseYear)->shuffle()->values();
                $correctIndex = $answers->search($baseYear);

                $questions->push([
                    'id' => 'death_' . $node->id,
                    'question' => "¿En qué año falleció {$node->name}?",
                    'description' => "Género: " . ($node->gender === 'F' ? 'Femenino' : 'Masculino'),
                    'img' => $node->img ?? null,
                    'answers' => $answers,
                    'correctAnswer' => $correctIndex,
                    'type' => 'death_year'
                ]);
            }
        }
    }

    private function generateNameQuestions($nodes, &$questions)
    {
        $validNodes = $nodes->filter(function($node) {
            return !empty($node->name) && !empty($node->gender);
        });

        foreach ($validNodes->take(3) as $node) {
            $wrongAnswers = $validNodes->where('id', '!=', $node->id)
                ->pluck('name')
                ->shuffle()
                ->take(3)
                ->values();

            if ($wrongAnswers->count() >= 3) {
                $answers = $wrongAnswers->push($node->name)->shuffle()->values();
                $correctIndex = $answers->search($node->name);

                $questions->push([
                    'id' => 'name_' . $node->id,
                    'question' => "¿Cuál es el nombre de esta persona " . ($node->gender === 'F' ? 'femenina' : 'masculina') . "?",
                    'description' => "Género: " . ($node->gender === 'F' ? 'Femenino' : 'Masculino') . 
                                   ($node->birth_year ? ", Año de nacimiento: {$node->birth_year}" : ""),
                    'img' => $node->img ?? null,
                    'answers' => $answers,
                    'correctAnswer' => $correctIndex,
                    'type' => 'name'
                ]);
            }
        }
    }

    private function generateRelationshipQuestions($tree, &$questions)
    {
        $nodes = $tree->nodes;
        
        if ($nodes->count() < 4) {
            return;
        }

        // Convertir nodos a formato compatible con useFamilyRelationships
        $familyMembers = $this->convertNodesToFamilyMembers($tree);
        
        // Generar preguntas de parentesco
        $generatedQuestions = 0;
        $maxQuestions = 4;
        
        foreach ($familyMembers as $member) {
            if ($generatedQuestions >= $maxQuestions) break;
            
            $relationships = $this->getAllRelationships($member, $familyMembers);
            
            if (count($relationships) > 0) {
                foreach ($relationships as $relationship) {
                    if ($generatedQuestions >= $maxQuestions) break;
                    
                    if ($this->generateRelationshipQuestion($member, $relationship, $familyMembers, $questions)) {
                        $generatedQuestions++;
                    }
                }
            }
        }
    }

    private function convertNodesToFamilyMembers($tree)
    {
        $members = [];
        $links = FamilyTreeLink::where('arbol_id', $tree->id)->get();
        
        foreach ($tree->nodes as $node) {
            $member = [
                'key' => $node->node_key ?? $node->id,
                'name' => $node->name,
                'gender' => $node->gender,
                'birthYear' => $node->birth_year,
                'deathYear' => $node->death_year,
                'img' => $node->img ?? null,
                'spouses' => [],
                'parents' => [],
                'isMarriageNode' => false
            ];
            
            // Encontrar relaciones familiares basadas en los links
            foreach ($links as $link) {
                if ($link->from_node == $node->node_key || $link->from_node == $node->id) {
                    if ($link->relationship_type === 'spouse' || $link->relationship_type === 'partner') {
                        $member['spouses'][] = $link->to_node;
                    } elseif ($link->relationship_type === 'child') {
                        $member['parents'][] = $link->to_node;
                    }
                } elseif ($link->to_node == $node->node_key || $link->to_node == $node->id) {
                    if ($link->relationship_type === 'spouse' || $link->relationship_type === 'partner') {
                        $member['spouses'][] = $link->from_node;
                    } elseif ($link->relationship_type === 'parent') {
                        $member['parents'][] = $link->from_node;
                    }
                }
            }
            
            $members[] = $member;
        }
        
        return $members;
    }

    private function getAllRelationships($selectedMember, $allMembers)
    {
        $relationships = [];
        
        foreach ($allMembers as $member) {
            if ($member['key'] !== $selectedMember['key']) {
                $relationship = $this->getRelationship($selectedMember, $member, $allMembers);
                if ($relationship && $relationship !== 'Sin relación directa') {
                    $relationships[] = ['member' => $member, 'relationship' => $relationship];
                }
            }
        }
        
        return $relationships;
    }

    private function getRelationship($person1, $person2, $allMembers)
    {
        // Verificar relación de cónyuges
        if (in_array($person2['key'], $person1['spouses'] ?? [])) {
            return 'Mi Cónyuge es';
        }
        
        // Verificar relación padre/madre - hijo/a
        if (in_array($person2['key'], $person1['parents'] ?? [])) {
            return 'Mi Padre/Madre es';
        }
        if (in_array($person1['key'], $person2['parents'] ?? [])) {
            return 'Mi Hijo/a es';
        }
        
        // Verificar relación de hermanos (padres compartidos)
        $person1Parents = $person1['parents'] ?? [];
        $person2Parents = $person2['parents'] ?? [];
        $sharedParents = array_intersect($person1Parents, $person2Parents);
        // Considerar hermanos si comparten al menos un padre/madre y no son la misma persona
        if (count($sharedParents) >= 1) {
            return 'Mi Hermano/a es';
        }
        
        return 'Sin relación directa';
    }

    private function generateRelationshipQuestion($person, $relationship, $allMembers, &$questions)
    {
        $relatedPerson = $relationship['member'];
        $relationshipType = $relationship['relationship'];
        
        // Filtrar opciones incorrectas asegurando que NO tengan la misma relación
        $wrongOptions = [];
        
        foreach ($allMembers as $member) {
            if ($member['key'] !== $person['key'] && $member['key'] !== $relatedPerson['key']) {
                $memberRelationship = $this->getRelationship($person, $member, $allMembers);
                
                // Solo agregar si NO tiene la misma relación que la respuesta correcta
                if ($memberRelationship !== $relationshipType) {
                    $wrongOptions[] = $member;
                }
            }
        }
        
        // Necesitamos al menos 3 opciones incorrectas válidas
        if (count($wrongOptions) < 3) {
            return false;
        }
        
        // Tomar 3 opciones incorrectas aleatorias
        shuffle($wrongOptions);
        $wrongAnswers = array_slice(array_column($wrongOptions, 'name'), 0, 3);
        $correctAnswer = $relatedPerson['name'];
        
        $answers = collect($wrongAnswers);
        $answers->push($correctAnswer);
        $answers = $answers->shuffle()->values();
        
        $correctIndex = $answers->search($correctAnswer);
        
        // Validación final: verificar que solo hay UNA respuesta correcta
        $correctCount = 0;
        foreach ($answers as $answer) {
            foreach ($allMembers as $member) {
                if ($member['name'] === $answer) {
                    $testRelationship = $this->getRelationship($person, $member, $allMembers);
                    if ($testRelationship === $relationshipType) {
                        $correctCount++;
                    }
                    break;
                }
            }
        }
        
        // Si hay más de una respuesta correcta, descartar esta pregunta
        if ($correctCount > 1) {
            return false;
        }
        
        // Adaptar la pregunta según el tipo de relación
        $questionText = $this->formatRelationshipQuestion($person['name'], $relationshipType);
        
        $questions->push([
            'id' => 'relationship_' . $person['key'] . '_' . $relatedPerson['key'],
            'question' => $questionText,
            'description' => $this->getRelationshipDescription($relationshipType),
            'answers' => $answers,
            'correctAnswer' => $correctIndex,
            'type' => 'relationship'
        ]);
        
        return true;
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

    private function generateBirthYearQuestions($nodes, &$questions)
    {
        $validNodes = $nodes->filter(function($node) {
            return !empty($node->name) && !empty($node->birth_year);
        });

        foreach ($validNodes->take(4) as $node) {
            $wrongYears = collect();
            $baseYear = $node->birth_year;
            
            // Generar años incorrectos cercanos al correcto
            for ($i = 0; $i < 3; $i++) {
                $wrongYear = $baseYear + (rand(-20, 20));
                if ($wrongYear != $baseYear && !$wrongYears->contains($wrongYear)) {
                    $wrongYears->push($wrongYear);
                }
            }

            if ($wrongYears->count() >= 3) {
                $answers = $wrongYears->push($baseYear)->shuffle()->values();
                $correctIndex = $answers->search($baseYear);

                $questions->push([
                    'id' => 'birth_' . $node->id,
                    'question' => "¿En qué año nació {$node->name}?",
                    'description' => "Género: " . ($node->gender === 'F' ? 'Femenino' : 'Masculino'),
                    'img' => $node->img ?? null,
                    'answers' => $answers,
                    'correctAnswer' => $correctIndex,
                    'type' => 'birth_year'
                ]);
            }
        }
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
