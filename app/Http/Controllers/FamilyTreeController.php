<?php

namespace App\Http\Controllers;

use App\Models\Arbol;
use App\Models\FamilyTreeNode;
use App\Models\FamilyTreeLink;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class FamilyTreeController extends Controller
{
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
     * Display a listing of user's family trees.
     */
    /*public function index()
    {
        $this->checkAuth();
        
        $trees = Auth::user()->arboles()->withCount('nodes')->get();
        return response()->json($trees);
    }

    /**
     * Store a newly created family tree.
     */
    /*public function store(Request $request)
    {
        $this->checkAuth();
        
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $tree = Auth::user()->arboles()->create([
            'name' => $request->name
        ]);

        return response()->json($tree->load('nodes'), 201);
    }

    /**
     * Display the specified family tree with all its data.
     */
    /*public function show(Arbol $arbol)
    {
        $this->checkAuth();
        
        // Verify ownership
        if ($arbol->user_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return response()->json($arbol->getTreeData());
    }

    /**
     * Update the specified family tree.
     */
    /*public function update(Request $request, Arbol $arbol)
    {
        $this->checkAuth();
        
        // Verify ownership
        if ($arbol->user_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $request->validate([
            'name' => 'sometimes|required|string|max:255'
        ]);

        $arbol->update($request->only('name'));

        return response()->json($arbol);
    }

    /**
     * Remove the specified family tree.
     */
    /*public function destroy(Arbol $arbol)
    {
        $this->checkAuth();
        
        // Verify ownership
        if ($arbol->user_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Don't allow deletion of the last tree
        if (Auth::user()->arboles()->count() <= 1) {
            return response()->json(['error' => 'Cannot delete the only family tree'], 422);
        }

        $arbol->delete();

        return response()->json(['message' => 'Family tree deleted successfully']);
    }

    /**
     * Save complete tree data (nodes and links).
     */
    public function saveTreeData(Request $request, Arbol $arbol)
    {
        $this->checkAuth();

        // Verify ownership
        if ($arbol->user_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $request->validate([
            'nodes' => 'required|array',
            'links' => 'sometimes|array'
        ]);

        DB::transaction(function () use ($request, $arbol) {
            $existingNodeIds = $arbol->nodes()->pluck('id', 'node_key')->toArray();

            $newKeys = collect($request->nodes)->pluck('key')->toArray();

            // 🔹 Eliminar solo los nodos que ya no existen
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


    /**
     * Add a single node to the tree.
     */
    /*public function addNode(Request $request, Arbol $arbol)
    {
        // Check ownership
        if ($arbol->user_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $request->validate([
            'key' => 'required|string',
            'name' => 'required|string',
            'gender' => 'string|in:M,F,Other',
            'birthYear' => 'nullable|integer',
            'deathYear' => 'nullable|integer',
            'img' => 'nullable|string'
        ]);

        // Check if key already exists in this tree
        if ($arbol->nodes()->where('node_key', $request->key)->exists()) {
            return response()->json(['error' => 'Node key already exists in this tree'], 422);
        }

        $node = FamilyTreeNode::create([
            'arbol_id' => $arbol->id,
            'node_key' => $request->key,
            'name' => $request->name,
            'gender' => $request->gender ?? 'M',
            'birth_date' => $request->birth_date,
            'death_date' => $request->death_date,
            'img' => $request->img,
            'birth_country' => $request->input('birth_place.country'),
            'birth_state' => $request->input('birth_place.state'),
            'birth_city' => $request->input('birth_place.city'),
            'death_country' => $request->input('death_place.country'),
            'death_state' => $request->input('death_place.state'),
            'death_city' => $request->input('death_place.city'),
            'node_data' => $request->all()
        ]);

        return response()->json($node, 201);
    }

    /**
     * Update a node in the tree.
     */
    /*public function updateNode(Request $request, Arbol $arbol, FamilyTreeNode $node)
    {
        // Check ownership
        if ($arbol->user_id !== Auth::id() || $node->arbol_id !== $arbol->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $request->validate([
            'name' => 'sometimes|required|string',
            'gender' => 'sometimes|string|in:M,F,Other',
            'birthYear' => 'nullable|integer',
            'deathYear' => 'nullable|integer',
            'img' => 'nullable|string'
        ]);

        $node->update([
            'name' => $request->name ?? $node->name,
            'gender' => $request->gender ?? $node->gender,
            'birth_date' => $request->birth_date ?? $node->birth_date,
            'death_date' => $request->death_date ?? $node->death_date,
            'img' => $request->img ?? $node->img,
            'node_data' => array_merge($node->node_data ?? [], $request->all())
        ]);

        return response()->json($node);
    }

    /**
     * Delete a node from the tree.
     */
    /*public function deleteNode(Arbol $arbol, FamilyTreeNode $node)
    {
        // Check ownership
        if ($arbol->user_id !== Auth::id() || $node->arbol_id !== $arbol->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Delete related links
        FamilyTreeLink::where('arbol_id', $arbol->id)
            ->where(function ($query) use ($node) {
                $query->where('from_node', $node->node_key)
                      ->orWhere('to_node', $node->node_key);
            })->delete();

        $node->delete();

        return response()->json(['message' => 'Node deleted successfully']);
    }*/
}
