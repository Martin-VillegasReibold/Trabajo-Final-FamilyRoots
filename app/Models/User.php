<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    //relacion usuario arbol
    public function arboles()
    {
        return $this->hasMany(Arbol::class, 'user_id');
    }

    //relacion usuario fotos
    public function fotos()
    {
        return $this->hasMany(\App\Models\Foto::class, 'user_id');
    }

    //relacion usuario calendario
    public function calendars()
    {
        return $this->hasMany(Calendar::class, 'user_id');
    }

    public function arbolesColaborativos()
    {
        return $this->belongsToMany(Arbol::class, 'arbol_user')
            ->withPivot('rol')
            ->withTimestamps();
    }
}
