<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Arbol;
use App\Models\FamilyTreeNode;
use App\Models\FamilyTreeLink;

class QuizController extends Controller
{
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
        
        if (count($sharedParents) >= 1 && count($person1Parents) > 0 && count($person2Parents) > 0) {
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
            case 'Mi Cónyuge es':
                return "¿Quién es el/la cónyuge de {$personName}?";
            case 'Mi Padre/Madre es':
                return "¿Cuál de estas personas es padre o madre de {$personName}?";
            case 'Mi Hijo/a es':
                return "¿Cuál de estas personas es hijo/a de {$personName}?";
            case 'Mi Hermano/a es':
                return "¿Cuál de estas personas es hermano/a de {$personName}?";
            default:
                return "¿Cuál de estas personas tiene una relación familiar con {$personName}?";
        }
    }

    private function getRelationshipDescription($relationshipType)
    {
        switch ($relationshipType) {
            case 'Mi Cónyuge es':
                return 'Relación matrimonial o de pareja';
            case 'Mi Padre/Madre es':
                return 'Relación de parentesco directo ascendente';
            case 'Mi Hijo/a es':
                return 'Relación de parentesco directo descendente';
            case 'Mi Hermano/a es':
                return 'Relación fraternal';
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
