<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Port;
use App\Http\Resources\PortResource;
use Illuminate\Http\Request;

class PortController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return PortResource::collection(Port::all());
    }

    /**
     * Display the specified resource.
     */
    public function show(Port $port)
    {
        return new PortResource($port);
    }
}
