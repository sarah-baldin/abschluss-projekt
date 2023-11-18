<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Booking;

class BookingController extends Controller
{
    public function show($id)
   {
       $booking = Booking::find($id);
       if ($booking) {
           return response()->json($booking);
       } else {
           return response()->json(['error' => 'booking not found'], 404);
       }
   }

    public function index()
    {
        // Holen Sie alle Buchungen aus der Datenbank und laden Sie den zugehörigen Benutzer
        $bookings = Booking::with(['user', 'materials', 'caterings'])->get();

        // Geben Sie die Buchungen zurück (in diesem Fall als JSON)
        return response()->json($bookings);
    }

    public function store(Request $request)
    {
        // Datenvalidierung
        $validatedData = $request->validate([
            'customer_name' => 'required',
            'person_count' => 'required|integer',
            'start_date' => 'required|date_format:Y-m-d\TH:i:s',
            'end_date' => 'required|date_format:Y-m-d\TH:i:s',
            'others' => 'nullable|string',
            'user_id' => 'required|integer',
            'room_id' => 'required|integer',
            'materials' => 'array', // Ensure materials are an array
            'caterings' => 'array' // Ensure caterings are an array
        ]);

        // Buchung erstellen
        $booking = new Booking;
        $booking->customer_name = $validatedData['customer_name'];
        $booking->start_date = $validatedData['start_date'];
        $booking->end_date = $validatedData['end_date'];
        $booking->person_count = $validatedData['person_count'];
        $booking->others = $validatedData['others'];
        $booking->user_id = $validatedData['user_id'];
        $booking->room_id = $validatedData['room_id'];

        $booking->save();

         // Handle the materials and caterings arrays, extract only the 'id' values
         $materialIds = array_map(function ($material) {
            return $material['id'];
        }, $request->input('materials', []));

        $cateringIds = array_map(function ($catering) {
            return $catering['id'];
        }, $request->input('caterings', []));

        // Sync the materials and caterings with the booking.
        // This will add new ones and remove ones not in the provided arrays.
        $booking->materials()->sync($materialIds);
        $booking->caterings()->sync($cateringIds);


        return response()->json(['success' => true, 'message' => 'Buchung erfolgreich gespeichert.']);
    }

    public function update(Request $request, $id)
    {
        try {
            $booking = Booking::findOrFail($id);

            // Datenvalidierung
            $validatedData = $request->validate([
                'customer_name' => 'required',
                'person_count' => 'required|integer',
                'start_date' => 'required|date_format:Y-m-d\TH:i:s',
                'end_date' => 'required|date_format:Y-m-d\TH:i:s',
                'others' => 'nullable|string',
                'user_id' => 'required|integer',
                'room_id' => 'required|integer',
                'materials' => 'array', // Ensure materials are an array
                'caterings' => 'array' // Ensure caterings are an array
            ]);

            // Update the booking with the validated data
            $booking->update($validatedData);

            // Handle the materials and caterings arrays, extract only the 'id' values
            $materialIds = array_map(function ($material) {
                return $material['id'];
            }, $request->input('materials', []));

            $cateringIds = array_map(function ($catering) {
                return $catering['id'];
            }, $request->input('caterings', []));

            // Sync the materials and caterings with the booking.
            // This will add new ones and remove ones not in the provided arrays.
            $booking->materials()->sync($materialIds);
            $booking->caterings()->sync($cateringIds);

            return response()->json(['message' => 'Booking updated successfully']);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Booking not found'], 404);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Something went wrong. Please try again later.', 'error' => $e->getMessage()], 500);
        }

    }


    public function destroy($id)
    {
        $booking = Booking::findOrFail($id);

        $booking->delete();

        return response()->json(['message' => 'Booking deleted successfully']);
    }
}
