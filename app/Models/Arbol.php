<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Arbol extends Model
{
    protected $table = 'arboles';
    protected $fillable = ['name', 'user_id'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
