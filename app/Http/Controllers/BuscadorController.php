<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Arbol;
use Illuminate\Http\Request;


class BuscadorController extends Controller
{
    public function index(Request $request)
    {
        if ($request->has('search') && !empty($request->input('search'))) {
            $search = trim($request->input('search'));

            $arboles = Arbol::with('user')
                ->where(function ($query) use ($search) {
                    $query->where('name', 'like', '%' . $search . '%')
                          ->orWhereHas('user', function ($q) use ($search) {
                              $q->where('name', 'like', '%' . $search . '%');
                          });
                })
                ->get();
        } else {
            $arboles = Arbol::with('user')->get();
        }

        //$arboles = Arbol::where('user_id', auth()->id())->get();

        return Inertia::render('welcome', [
            'arboles' => $arboles,
        ]);
    }

}
