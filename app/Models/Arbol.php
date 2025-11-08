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
        // Eager load tags to include them in each node
        $this->loadMissing(['nodes.tags', 'links']);

        return [
            'nodes' => $this->nodes->map(function ($node) {
                $base = [
                    'id' => $node->id,
                    'key' => $node->node_key,
                    'name' => $node->name,
                    'gender' => $node->gender,
                    'birth_date' => $node->birth_date,
                    'death_date' => $node->death_date,
                    'img' => $node->img,
                    'position' => $node->position,
                    'tags' => $node->tags->map(function ($tag) {
                        return [
                            'id' => $tag->id,
                            'tag_value' => $tag->tag_value,
                        ];
                    })->values()->toArray(),
                ];
                // Keep original precedence: node_data can override base fields used by GoJS,
                // but do NOT allow node_data['tags'] to override relational tags.
                $nodeData = $node->node_data ?? [];
                if (is_array($nodeData) && array_key_exists('tags', $nodeData)) {
                    unset($nodeData['tags']);
                }
                // Preserve previous behavior (base first, then node_data overriding),
                // which avoids visual changes in the diagram.
                return array_merge($base, $nodeData);
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

    public function colaboradores()
    {
        return $this->belongsToMany(User::class, 'arbol_user')
            ->withPivot('rol')
            ->withTimestamps();
    }
}
