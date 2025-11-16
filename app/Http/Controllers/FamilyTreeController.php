<?php

namespace App\Http\Controllers;

use App\Models\Arbol;
use App\Models\FamilyTreeNode;
use App\Models\FamilyTreeLink;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class FamilyTreeController extends Controller
{
    use AuthorizesRequests;

    /**
     * Verify user is authenticated for all methods
     */
    private function checkAuth()
    {
        if (!Auth::check()) {
            abort(401, 'Unauthorized');
        }
    }

    /**
     * Save complete tree data (nodes and links).
     */
    public function saveTreeData(Request $request, Arbol $arbol)
    {
        $this->checkAuth();

        //Autorizar tanto creador como colaborador
        $this->authorize('access', $arbol);

        // Verify ownership
        // if ($arbol->user_id !== Auth::id()) {
        //     return response()->json(['error' => 'Unauthorized'], 403);
        // }

        $request->validate([
            'nodes' => 'required|array',
            'links' => 'sometimes|array'
        ]);

        DB::transaction(function () use ($request, $arbol) {
            $existingNodeIds = $arbol->nodes()->pluck('id', 'node_key')->toArray();

            $newKeys = collect($request->nodes)->pluck('key')->toArray();

            // Eliminar solo los nodos que ya no existen
            $arbol->nodes()->whereNotIn('node_key', $newKeys)->delete();

            foreach ($request->nodes as $nodeData) {
                FamilyTreeNode::updateOrCreate(
                    [
                        'arbol_id' => $arbol->id,
                        'node_key' => $nodeData['key'],
                    ],
                    [
                        'name' => $nodeData['name'],
                        'gender' => $nodeData['gender'] ?? 'M',
                        'birth_date' => $nodeData['birth_date'] ?? null,
                        'death_date' => $nodeData['death_date'] ?? null,
                        'img' => $nodeData['img'] ?? null,
                        'birth_country' => $nodeData['birth_place']['country'] ?? null,
                        'birth_state' => $nodeData['birth_place']['state'] ?? null,
                        'birth_city' => $nodeData['birth_place']['city'] ?? null,
                        'death_country' => $nodeData['death_place']['country'] ?? null,
                        'death_state' => $nodeData['death_place']['state'] ?? null,
                        'death_city' => $nodeData['death_place']['city'] ?? null,
                        'nationality' => $nodeData['nationality'] ?? null,
                        'node_data' => $nodeData,
                        'position' => $nodeData['loc'] ?? null,
                    ]
                );
            }

            if ($request->has('links') && is_array($request->links)) {
                $arbol->links()->delete(); 
                foreach ($request->links as $linkData) {
                    FamilyTreeLink::create([
                        'arbol_id' => $arbol->id,
                        'from_node' => $linkData['from'],
                        'to_node' => $linkData['to'],
                        'relationship_type' => $linkData['relationship'] ?? 'family',
                        'link_data' => $linkData
                    ]);
                }
            }
        });

        return response()->json([
            'message' => 'Tree data saved successfully',
            'data' => $arbol->getTreeData()
        ]);
    }

    public function getTreeData(Arbol $arbol)
    {
        // Permitir acceso público de solo lectura al overview
        return response()->json($arbol->getTreeData());
    }

}
