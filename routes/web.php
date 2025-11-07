<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\ArbolController;
use App\Models\Arbol;
use App\Http\Controllers\BuscadorController;
use App\Http\Controllers\CalendarController;
use App\Http\Controllers\QuizController2;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\NodeTagController;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\ArbolInvitacionController;

// Ruta raíz: delegar al BuscadorController para pasar `arboles` a la vista welcome
Route::get('/', [BuscadorController::class, 'index'])->name('home');

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

    Route::get('actividades', [QuizController2::class, 'index'])->name('activities');

    // Quiz Routes
    Route::get('/quiz/generate/{treeId}', [QuizController2::class, 'generateQuizForTree'])->name('quiz.generate');
    Route::post('/quiz/submit', [QuizController2::class, 'submitQuiz'])->name('quiz.submit');

    // accion POST para guardar en BD
    Route::post('crear-arbol', [ArbolController::class, 'store'])->name('arbol.store');

    Route::get('/arboles', [ArbolController::class, 'index'])->name('arboles');

    Route::get('/espacio-trabajo/{id}', [ArbolController::class, 'show'])->name('espacio-trabajo');

    // Editar arbol
    Route::put('/arboles/{id}', [ArbolController::class, 'update'])->name('arbol.update');

    // Eliminar arbol
    Route::delete('/arboles/{id}', [ArbolController::class, 'destroy'])->name('arbol.destroy');


    // Family Tree API Routes - AUTO-GUARDADO (EN USO)
    Route::post('/arboles/api/{arbol}/save-data', [\App\Http\Controllers\FamilyTreeController::class, 'saveTreeData'])
        ->name('arboles.api.save-data');
    


    // Comentarios
    Route::get('/nodes/{node}/comments', [CommentController::class, 'index']);
    Route::post('/nodes/{node}/comments', [CommentController::class, 'store']);
    Route::delete('/comments/{comment}', [CommentController::class, 'destroy'])->name('comments.destroy');
    Route::put('/comments/{comment}', [CommentController::class, 'update']);

    // CRUD Calendar Routes
    Route::get('/calendario', [CalendarController::class, 'index'])->name('calendar.index');
    Route::post('/calendario', [CalendarController::class, 'store'])->name('calendar.store');
    Route::delete('/calendario/{id}', [CalendarController::class, 'destroy'])->name('calendar.destroy');
    Route::put('/calendario/{id}', [CalendarController::class, 'update'])->name('calendar.update');

    // Etiquetas de nodos 
    Route::get('/nodes/{node}/tags', [NodeTagController::class, 'index'])->name('node-tags.index');
    Route::post('/nodes/tags', [NodeTagController::class, 'store'])->name('node-tags.store');
    Route::delete('/nodes/tags/{id}', [NodeTagController::class, 'destroy'])->name('node-tags.destroy');

    // Rutas para fotos
    Route::get('/mis-fotos', [\App\Http\Controllers\FotoController::class, 'index'])->name('mis-fotos');
    Route::post('/mis-fotos', [\App\Http\Controllers\FotoController::class, 'store'])->name('mis-fotos.store');
    Route::delete('/mis-fotos/{id}', [\App\Http\Controllers\FotoController::class, 'destroy'])->name('mis-fotos.destroy');

    // API para obtener fotos del usuario autenticado (para el modal de selección de imagen)
    Route::get('/api/mis-fotos', function () {
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
    });


    Route::post('/arboles/{arbol}/invitar', [ArbolInvitacionController::class, 'store'])
        ->middleware(['auth'])
        ->name('invitaciones.enviar');

    Route::get('/invitaciones/aceptar/{token}', [ArbolInvitacionController::class, 'aceptar'])
    ->name('invitaciones.aceptar');
    // Family Tree Management Routes (COMENTADAS - NO UTILIZADAS - NO BORRAR POR AHORA)
    // Estas rutas fueron creadas para gestión completa de árboles via API,
    // pero el frontend actual usa un flujo diferente con ArbolController y rutas web
    // Route::get('/arboles/api', [\App\Http\Controllers\FamilyTreeController::class, 'index'])->name('arboles.api.index');
    // Route::post('/arboles/api', [\App\Http\Controllers\FamilyTreeController::class, 'store'])->name('arboles.api.store');
    // Route::get('/arboles/api/{arbol}', [\App\Http\Controllers\FamilyTreeController::class, 'show'])->name('arboles.api.show');
    // Route::put('/arboles/api/{arbol}', [\App\Http\Controllers\FamilyTreeController::class, 'update'])->name('arboles.api.update');
    // Route::delete('/arboles/api/{arbol}', [\App\Http\Controllers\FamilyTreeController::class, 'destroy'])->name('arboles.api.destroy');

    // Individual Node Management Routes (COMENTADAS - NO UTILIZADAS - NO BORRAR POR AHORA)
    // El sistema actual guarda todos los datos del árbol de una vez via save-data
    // Route::post('/arboles/api/{arbol}/nodes', [\App\Http\Controllers\FamilyTreeController::class, 'addNode'])
    //     ->name('arboles.api.add-node');
    // Route::put('/arboles/api/{arbol}/nodes/{node}', [\App\Http\Controllers\FamilyTreeController::class, 'updateNode'])
    //     ->name('arboles.api.update-node');
    // Route::delete('/arboles/api/{arbol}/nodes/{node}', [\App\Http\Controllers\FamilyTreeController::class, 'deleteNode'])
    //     ->name('arboles.api.delete-node');

});

    // Nueva ruta para obtener datos del arbol (para el Overview)
    Route::get('/arboles/api/{arbol}/data', [\App\Http\Controllers\FamilyTreeController::class, 'getTreeData'])
        ->name('arboles.api.data');

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
