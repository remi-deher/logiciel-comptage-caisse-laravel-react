<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CashCountController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Route par défaut pour l'authentification (générée par `install:api`)
// Elle est protégée par Sanctum, ce qui est une bonne pratique.
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Route pour récupérer le dernier comptage de caisse.
// Accessible publiquement pour que le frontend puisse obtenir la valeur initiale.
Route::get('/counts', [CashCountController::class, 'index']);

// Route pour soumettre un nouveau comptage.
// Elle devrait être protégée pour s'assurer que seuls les utilisateurs authentifiés
// peuvent modifier le total. Sanctum s'en chargera.
Route::post('/counts', [CashCountController::class, 'store'])->middleware('auth:sanctum');
