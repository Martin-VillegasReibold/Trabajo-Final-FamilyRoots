<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NodeTag extends Model
{
    use HasFactory;

    protected $table = 'node_tags';

    protected $fillable = [
        'node_id',
        'tag_value',
    ];

    /**
     * Relación: una etiqueta pertenece a un nodo.
     */
    public function node()
    {
        return $this->belongsTo(FamilyTreeNode::class, 'node_id');
    }
}
