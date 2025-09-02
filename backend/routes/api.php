<?php

use App\Events\CashCountUpdated;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
Route::post('/counts', function (Request $request) {
    $data = $request->validate(['total' => 'required|numeric']);
    broadcast(new CashCountUpdated($data))->toOthers();

    return response()->json(['status' => 'success', 'data' => $data]);
})->middleware('auth:sanctum');
