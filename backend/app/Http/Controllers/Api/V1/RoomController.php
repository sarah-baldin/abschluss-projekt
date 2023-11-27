<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Room;

class RoomController extends Controller
{

    public function index()
    {
        /* // Get the currently authenticated user
        $user = auth()->user();

        // Check if the user has either 'CO' or 'EX' role and filter rooms accordingly
        $rooms = [];
        if ($user && ($user->role === 'CO' || $user->role === 'EX')) {
            // If the user has either 'CO' or 'EX' role, filter rooms accordingly
            $rooms = Room::whereIn('id', [1, 2, 3])->get();
        } elseif ($user && $user->role === 'RS') {
            // If the user has the 'RS' role, get all rooms
            $rooms = Room::all();
        } */
        $rooms = Room::all();
        // Return the filtered rooms (in this case as JSON)
        return response()->json($rooms);
    }

    // show specific room
    public function show($id)
    {
        $room = Room::find($id);
        if ($room) {
            return response()->json($room);
        } else {
            return response()->json(['error' => 'Room not found'], 404);
        }
    }
}
