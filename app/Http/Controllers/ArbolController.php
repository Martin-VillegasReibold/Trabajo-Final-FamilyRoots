<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Arbol;
use Illuminate\Http\Request;

class ArbolController extends Controller
{
    public function store(Request $request)
    {
        $request->validate(['name' => 'required|string|max:255']);

        $arbol = Arbol::create([
            'name' => $request->name,
            'user_id' => auth()->id(),
        ]);

        // Para requests de Inertia, usar location redirect
        //redirecciona a la url y carga todo
        if ($request->header('X-Inertia')) {
            return Inertia::location(route('espacio-trabajo', $arbol->id));
        }

        // Para requests normales
        return redirect()->route('espacio-trabajo', $arbol->id);
    }

    public function index()
    {
        $arboles = Arbol::where('user_id', auth()->id())->get();

        return Inertia::render('arboles', [
            'arboles' => $arboles,
        ]);
    }

    public function show($id)
    {
        $arbol = Arbol::where('id', $id)
            ->where('user_id', auth()->id())
            ->firstOrFail();

        return Inertia::render('espacio-trabajo', [
            'arbol' => $arbol,
        ]);
    }
}
