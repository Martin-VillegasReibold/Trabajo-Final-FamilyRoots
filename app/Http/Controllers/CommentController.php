<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\FamilyTreeNode;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CommentController extends Controller
{
    /**
     * Listar todos los comentarios de un nodo
     */
    public function index($nodeId)
    {
        $node = \App\Models\FamilyTreeNode::find($nodeId);

        if (!$node) {
            return response()->json([], 200); 
        }

        $comments = $node->comments()->with('user')->orderBy('created_at', 'asc')->get();

        return response()->json($comments);
    }


    /**
     * Crear un comentario en un nodo
     */
    public function store(Request $request, $nodeId)
    {
        $request->validate([
            'content' => 'required|string|max:1000',
        ]);

        $node = FamilyTreeNode::findOrFail($nodeId);

        $comment = Comment::create([
            'node_id' => $node->id,
            'user_id' => Auth::id(),
            'content' => $request->content,
            'metadata' => $request->metadata ?? null,
        ]);

        // Cargar relacion de usuario para frontend
        $comment->load('user');

        return response()->json($comment, 201);
    }

    /**
     * Eliminar un comentario
     */
    public function destroy(Comment $comment)
    {
        // Solo el autor del comentario puede eliminarlo
        if (Auth::id() !== $comment->user_id) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $comment->delete();

        return response()->json(['message' => 'Comentario eliminado correctamente']);
    }

    /**
     * Actualizar (editar) un comentario
     */
    public function update(Request $request, Comment $comment)
    {
        // Validar contenido
        $request->validate([
            'content' => 'required|string|max:1000',
        ]);

        // Verificar autenticaci0n
        if (!auth()->check()) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        // Verificar propiedad del comentario
        if ($comment->user_id !== auth()->id()) {
            return response()->json(['message' => 'No autorizado para editar este comentario'], 403);
        }

        // Actualizar contenido
        $comment->content = $request->content;
        $comment->save();

        // Devolver comentario actualizado
        $comment->load('user');
        return response()->json($comment);
    }
}
