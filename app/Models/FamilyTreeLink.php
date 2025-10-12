<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FamilyTreeLink extends Model
{
    protected $fillable = [
        'arbol_id',
        'from_node',
        'to_node',
        'relationship_type',
        'link_data'
    ];

    protected $casts = [
        'link_data' => 'array'
    ];

    /**
     * Get the arbol that owns this link.
     */
    public function arbol(): BelongsTo
    {
        return $this->belongsTo(Arbol::class);
    }

    /**
     * Get the source node.
     */
    public function fromNode(): BelongsTo
    {
        return $this->belongsTo(FamilyTreeNode::class, 'from_node', 'node_key')
                    ->where('arbol_id', $this->arbol_id);
    }

    /**
     * Get the target node.
     */
    public function toNode(): BelongsTo
    {
        return $this->belongsTo(FamilyTreeNode::class, 'to_node', 'node_key')
                    ->where('arbol_id', $this->arbol_id);
    }
}
