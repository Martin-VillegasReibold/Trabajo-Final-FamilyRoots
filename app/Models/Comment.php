<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    use HasFactory;

    protected $fillable = [
        'node_id',
        'user_id',
        'content',
        'metadata',
    ];

    // Casts para manejar el JSON automáticamente
    protected $casts = [
        'metadata' => 'array',
    ];

    /**
     * Relacion con el nodo del arbol genealógico
     */
    public function node()
    {
        return $this->belongsTo(FamilyTreeNode::class, 'node_id');
    }

    /**
     * Relacion con el usuario que escribio el comentario
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
