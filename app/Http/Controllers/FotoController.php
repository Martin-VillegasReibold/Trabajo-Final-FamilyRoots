<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class FotoController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $fotos = $user->fotos()->get(['id', 'nombre', 'ruta'])
            ->map(function ($foto) {
                return [
                    'id' => $foto->id,
                    'nombre' => $foto->nombre,
                    'url' => '/storage/' . ltrim($foto->ruta, '/'),
                ];
            })->values()->toArray();
        return \Inertia\Inertia::render('mis-fotos', [
            'fotos' => $fotos,
        ]);
    }

    // API para obtener fotos del usuario autenticado (para el modal de selección de imagen)
    public function apiIndex()
    {
        $user = Auth::user();
        $fotos = $user->fotos()->get(['id', 'nombre', 'ruta'])
            ->map(function ($foto) {
                return [
                    'id' => $foto->id,
                    'nombre' => $foto->nombre,
                    'url' => '/storage/' . ltrim($foto->ruta, '/'),
                ];
            })->values()->toArray();
        return response()->json(['fotos' => $fotos]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'foto' => 'required|image|max:4096',
            'nombre' => 'required|string|max:40',
        ]);
        $user = Auth::user();
        $path = $request->file('foto')->store('fotos/' . $user->id, 'public');
        $user->fotos()->create([
            'nombre' => $request->nombre,
            'ruta' => $path,
        ]);
        return redirect()->route('mis-fotos')->with('success', 'Foto subida correctamente');
    }

    public function destroy($id)
    {
        $user = Auth::user();
        $foto = $user->fotos()->where('id', $id)->firstOrFail();
        // Eliminar archivo físico
        \Storage::disk('public')->delete($foto->ruta);
        $foto->delete();
        return redirect()->route('mis-fotos')->with('success', 'Foto eliminada correctamente');
    }
}
