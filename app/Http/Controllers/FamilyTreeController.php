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
            // Clear existing data
            $arbol->nodes()->delete();
            $arbol->links()->delete();

            // Save nodes
            foreach ($request->nodes as $nodeData) {
                FamilyTreeNode::create([
                    'arbol_id' => $arbol->id,
                    'node_key' => $nodeData['key'],
                    'name' => $nodeData['name'],
                    'gender' => $nodeData['gender'] ?? 'M',
                    'birth_year' => $nodeData['birthYear'] ?? null,
                    'death_year' => $nodeData['deathYear'] ?? null,
                    'img' => $nodeData['img'] ?? null,
                    'node_data' => $nodeData,
                    'position' => isset($nodeData['loc']) ? $nodeData['loc'] : null
                ]);
            }

            // Save links
            if ($request->has('links') && is_array($request->links)) {
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
        $this->checkAuth();

        if ($arbol->user_id !== auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

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
            'birth_year' => $request->birthYear,
            'death_year' => $request->deathYear,
            'img' => $request->img,
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
            'birth_year' => $request->birthYear ?? $node->birth_year,
            'death_year' => $request->deathYear ?? $node->death_year,
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
