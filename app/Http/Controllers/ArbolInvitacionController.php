<?php

namespace App\Http\Controllers;

use App\Models\Arbol;
use App\Models\ArbolInvitacion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use App\Mail\InvitacionArbolMail;

class ArbolInvitacionController extends Controller
{
    use AuthorizesRequests;

    public function store(Request $request, Arbol $arbol)
    {
        $request->validate(['email' => 'required|email']);
        $this->authorize('access', $arbol);

        $token = Str::random(32);

        $invitacion = ArbolInvitacion::create([
            'arbol_id'   => $arbol->id,
            'invited_by' => auth()->id(),
            'email'      => $request->email,
            'token'      => $token,
        ]);

        Mail::to($request->email)->send(new InvitacionArbolMail($invitacion, $arbol));

        return back()->with('success', 'Invitación enviada correctamente.');
    }

    public function aceptar($token)
{
    $invitacion = ArbolInvitacion::where('token', $token)->firstOrFail();

    // Si el usuario no está logueado, guardamos el token en sesión
    if (!auth()->check()) {
        session(['invitacion_token' => $token]);
        return redirect()->route('login')->with('info', 'Inicia sesión o regístrate para unirte al árbol.');
    }

    $user = auth()->user();

    // Si ya está aceptada, lo mandamos directo al árbol
    if ($invitacion->accepted) {
        return redirect()->route('espacio-trabajo', $invitacion->arbol_id)
            ->with('info', 'Ya formas parte de este árbol.');
    }

    // Aceptamos sin exigir que el email coincida
    $invitacion->update(['accepted' => true]);

    // Evitar duplicación
    $invitacion->arbol->colaboradores()->syncWithoutDetaching([
        $user->id => ['rol' => 'colaborador']
    ]);

    return redirect()->route('espacio-trabajo', $invitacion->arbol_id)
        ->with('success', 'Ahora puedes colaborar en este árbol.');
}

}
