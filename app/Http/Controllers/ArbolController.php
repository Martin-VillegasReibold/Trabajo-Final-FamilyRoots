<?php

namespace App\Http\Controllers;
use App\Models\Arbol;

use Illuminate\Http\Request;

class ArbolController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $arbol = Arbol::create([
            'name' => $request->name,
            'user_id' => auth()->id(),
        ]);

        return redirect()->route('crear-arbol')->with('success', 'Árbol creado con éxito');
    }
}
