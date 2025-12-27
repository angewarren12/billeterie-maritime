<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ship;
use App\Http\Resources\ShipResource;
use Illuminate\Http\Request;

class ShipController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return ShipResource::collection(Ship::all());
    }

    /**
     * Display the specified resource.
     */
    public function show(Ship $ship)
    {
        return new ShipResource($ship);
    }
}
