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

    public function index(Request $request)
    {

        //dump($request->all());

        if ($request->has('search') && !empty($request->input('search'))) {
            $search = $request->input('search');
            $arboles = Arbol::where('user_id', auth()->id())
                ->where('name', 'like', '%' . $search . '%')
                ->get();
        } else {
            $arboles = Arbol::where('user_id', auth()->id())->get();
        }

        //$arboles = Arbol::where('user_id', auth()->id())->get();

        return Inertia::render('arboles', [
            'arboles' => $arboles,
        ]);
    }

    public function show($id)
    {
        $arbol = Arbol::where('id', $id)
            ->where('user_id', auth()->id())
            ->firstOrFail();

        // Obtener los datos del árbol (nodos y enlaces)
        $treeData = $arbol->getTreeData();

        return Inertia::render('espacio-trabajo', [
            'arbol' => $arbol,
            'initialTreeData' => $treeData,
        ]);
    }

    // Para Editar
    public function update(Request $request, $id)
    {
        $request->validate(['name' => 'required|string|max:255']);

        $arbol = Arbol::where('id', $id)
            ->where('user_id', auth()->id())
            ->firstOrFail();

        $arbol->update([
            'name' => $request->name,
        ]);

        return redirect()->route('arboles')->with('success', 'Árbol actualizado correctamente.');
    }

    // Eliminar
    public function destroy($id)
    {
        $arbol = Arbol::where('id', $id)
            ->where('user_id', auth()->id())
            ->firstOrFail();

        $arbol->delete();

        return redirect()->route('arboles')->with('success', 'Árbol eliminado correctamente.');
    }
}
