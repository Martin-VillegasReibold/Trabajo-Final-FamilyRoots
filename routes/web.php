<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\ArbolController;
use App\Models\Arbol;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::get('/about', function () {
    return Inertia::render('about');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    //vista crear arbol
    Route::get('crear-arbol', function () {
        $arbol = Arbol::where('user_id', auth()->id())->first();
        return Inertia::render('crear-arbol', [
            'arbol' => $arbol,
        ]);
    })->name('crear-arbol');

    // accion POST para guardar en BD
    Route::post('crear-arbol', [ArbolController::class, 'store'])->name('arbol.store');

    Route::get('/arboles', [ArbolController::class, 'index'])->name('arboles');

    Route::get('/espacio-trabajo/{id}', [ArbolController::class, 'show'])->name('espacio-trabajo');

});



require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
