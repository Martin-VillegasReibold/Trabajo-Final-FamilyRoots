<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ArbolInvitacion extends Model
{
    use HasFactory;

    protected $fillable = [
        'arbol_id',
        'invited_by',
        'email',
        'token',
        'accepted',
    ];

    public function arbol()
    {
        return $this->belongsTo(Arbol::class);
    }

    public function invitador()
    {
        return $this->belongsTo(User::class, 'invited_by');
    }
}
