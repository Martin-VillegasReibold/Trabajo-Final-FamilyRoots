<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Arbol;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class ArbolController extends Controller
{
    use AuthorizesRequests;

    public function store(Request $request)
    {
        $request->validate(['name' => 'required|string|max:255']);

        $arbol = Arbol::create([
            'name' => $request->name,
            'user_id' => auth()->id(),
        ]);

        // agregar al creador como colaborador con rol 'creador'
        $arbol->colaboradores()->attach(auth()->id(), ['rol' => 'creador']);

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
        $arbol = Arbol::with('colaboradores')->findOrFail($id);
        $this->authorize('access', $arbol);

        // Obtener los datos del árbol (nodos y enlaces)
        $treeData = $arbol->getTreeData();

        // ¿Es colaborador (invitado) y no el creador?
        $isCollaborator = auth()->check()
            && $arbol->user_id !== auth()->id()
            && $arbol->colaboradores()->where('user_id', auth()->id())->exists();

        return Inertia::render('espacio-trabajo', [
            'arbol' => $arbol,
            'initialTreeData' => $treeData,
            'isCollaborator' => $isCollaborator,
        ]);
    }

    // Para Editar
    public function update(Request $request, $id)
    {
        $request->validate(['name' => 'required|string|max:255']);

        $arbol = Arbol::with('colaboradores')->findOrFail($id);
        $this->authorize('manage', $arbol); // solo creador

        $arbol->update([
            'name' => $request->name,
        ]);

        return redirect()->route('arboles')->with('success', 'Árbol actualizado correctamente.');
    }

    // Eliminar
    public function destroy($id)
    {
        $arbol = Arbol::with('colaboradores')->findOrFail($id);
        $this->authorize('manage', $arbol); // solo creador

        $arbol->delete();

        return redirect()->route('arboles')->with('success', 'Árbol eliminado correctamente.');
    }
}
