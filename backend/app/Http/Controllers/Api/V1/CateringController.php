<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Catering;

class CateringController extends Controller
{
   public function index()
   {
       // Hole alle Buchungen aus der Datenbank und lade den zugehörigen Benutzer
       $caterings = Catering::all();

       // Gebe die Buchungen zurück
       return response()->json($caterings);
   }

   // show function für Catering identifizierung
   public function show($id)
   {
       $catering = Catering::find($id);
       if ($catering) {
           return response()->json($catering);
       } else {
           return response()->json(['error' => 'Catering not found'], 404);
       }
   }
}
