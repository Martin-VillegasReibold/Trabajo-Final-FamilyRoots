<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FamilyTreeNode extends Model
{
    protected $fillable = [
        'arbol_id',
        'node_key',
        'name',
        'gender',
        'birth_year',
        'death_year',
        'img',
        'node_data',
        'position'
    ];

    protected $casts = [
        'node_data' => 'array',
        'position' => 'array',
        'birth_year' => 'integer',
        'death_year' => 'integer'
    ];

    /**
     * Get the arbol that owns this node.
     */
    public function arbol(): BelongsTo
    {
        return $this->belongsTo(Arbol::class);
    }

    /**
     * Get all links from this node.
     */
    public function linksFrom(): HasMany
    {
        return $this->hasMany(FamilyTreeLink::class, 'from_node', 'node_key')
                    ->where('arbol_id', $this->arbol_id);
    }

    /**
     * Get all links to this node.
     */
    public function linksTo(): HasMany
    {
        return $this->hasMany(FamilyTreeLink::class, 'to_node', 'node_key')
                    ->where('arbol_id', $this->arbol_id);
    }
}
