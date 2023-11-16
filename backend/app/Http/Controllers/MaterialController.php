<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Material;

class MaterialController extends Controller
{
    public function index()
    {
        // Holen Sie alle Buchungen aus der Datenbank und laden Sie den zugehörigen Benutzer
        $materials = Material::all();

        // Geben Sie die Buchungen zurück (in diesem Fall als JSON)
        return response()->json($materials);
    }

    // show function für material identifizierung
    public function show($id)
    {
        $material = Material::find($id);
        if ($material) {
            return response()->json($material);
        } else {
            return response()->json(['error' => 'material not found'], 404);
        }
    }
}
