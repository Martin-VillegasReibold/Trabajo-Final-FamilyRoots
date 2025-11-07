<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Arbol;

class ArbolPolicy
{
    /**
     * Permite acceder al árbol si el usuario es creador o colaborador
     */
    public function access(User $user, Arbol $arbol)
    {
        return $arbol->user_id === $user->id
            || $arbol->colaboradores()
            ->where('user_id', $user->id)
            ->exists();
    }


    /**
     * Solo el creador puede eliminar
     */
    public function delete(User $user, Arbol $arbol)
    {
        return $arbol->user_id === $user->id;
    }

    /**
     * Solo el creador puede cambiar el nombre
     */
    public function rename(User $user, Arbol $arbol)
    {
        return $arbol->user_id === $user->id;
    }

    public function manage(User $user, Arbol $arbol)
    {
        // Solo el creador puede gestionar (editar o eliminar)
        return $arbol->user_id === $user->id;
    }
}
