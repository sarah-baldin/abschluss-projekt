<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Room;

class RoomController extends Controller
{

    public function index()
    {
        // Holen Sie alle Buchungen aus der Datenbank und laden Sie den zugehörigen Benutzer
        $rooms = Room::all();

        // Geben Sie die Buchungen zurück (in diesem Fall als JSON)
        return response()->json($rooms);
    }

    // show function für room identifizierung
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
