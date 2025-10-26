<?php

namespace App\Http\Controllers;
use App\Models\NodeTag;

use Illuminate\Http\Request;

class NodeTagController extends Controller
{
    /**
     * Mostrar todas las etiquetas de un nodo específico.
     */
    public function index($nodeId)
    {
        $tags = NodeTag::where('node_id', $nodeId)->get();
        return response()->json($tags);
    }

    /**
     * Crear una nueva etiqueta para un nodo.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'node_id' => 'required|integer|exists:family_tree_nodes,id',
            'tag_value' => 'required|string|max:255',
        ]);

        $tag = NodeTag::create($validated);

        return response()->json([
            'message' => 'Etiqueta agregada correctamente.',
            'tag' => $tag
        ], 201);
    }

    /**
     * Eliminar una etiqueta.
     */
    public function destroy($id)
    {
        $tag = NodeTag::findOrFail($id);
        $tag->delete();

        return response()->json([
            'message' => 'Etiqueta eliminada correctamente.'
        ]);
    }
}
