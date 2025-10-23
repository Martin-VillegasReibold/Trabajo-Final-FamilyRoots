<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Arbol extends Model
{
    protected $table = 'arboles';
    protected $fillable = ['name', 'user_id'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get all nodes for this family tree.
     */
    public function nodes(): HasMany
    {
        return $this->hasMany(FamilyTreeNode::class, 'arbol_id');
    }

    /**
     * Get all links for this family tree.
     */
    public function links(): HasMany
    {
        return $this->hasMany(FamilyTreeLink::class, 'arbol_id');
    }

    /**
     * Get complete tree data (nodes + links) for GoJS.
     */
    public function getTreeData()
    {
        return [
            'nodes' => $this->nodes->map(function ($node) {
                return array_merge([
                    'id' => $node->id,
                    'key' => $node->node_key,
                    'name' => $node->name,
                    'gender' => $node->gender,
                    'birthYear' => $node->birth_year,
                    'deathYear' => $node->death_year,
                    'img' => $node->img,
                    'position' => $node->position
                ], $node->node_data ?? []);
            })->values()->toArray(),
            'links' => $this->links->map(function ($link) {
                return array_merge([
                    'from' => $link->from_node,
                    'to' => $link->to_node,
                    'relationship' => $link->relationship_type
                ], $link->link_data ?? []);
            })->values()->toArray(),
        ];
    }
}
