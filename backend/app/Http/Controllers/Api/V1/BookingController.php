<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Booking;
use App\Services\UniFiApiVoucherService;
use Illuminate\Support\Facades\DB;

class BookingController extends Controller
{
    protected $voucherService;

    //register voucherService
    public function __construct(UniFiApiVoucherService $voucherService)
    {
        $this->voucherService = $voucherService;
    }


    public function show($id)
   {
        // find specific booking by it's id
       $booking = Booking::find($id);
       if ($booking) {
           return response()->json($booking);
       } else {
           return response()->json(['error' => 'booking not found'], 404);
       }
   }

    public function index()
    {
        // get all bookings with related users, materials, caterings and vouhcers
        $bookings = Booking::with(['user', 'materials', 'caterings', 'vouchers'])->get();

        return response()->json($bookings);
    }

    public function store(Request $request)
    {
        // validate data
        $validatedData = $request->validate([
            'customer_name' => 'required',
            'person_count' => 'required|integer',
            'start_date' => 'required|date_format:Y-m-d\TH:i:s',
            'end_date' => 'required|date_format:Y-m-d\TH:i:s',
            'others' => 'nullable|string',
            'user_id' => 'required|integer',
            'room_id' => 'required|integer',
            'voucher_count' => 'required|integer',
            'voucher_lifetime' => 'required|integer', 'materials' => 'array',
            'caterings' => 'array',
            'vouchers' => 'array',
        ]);

        // create booking
        $booking = new Booking;
        $booking->customer_name = $validatedData['customer_name'];
        $booking->start_date = $validatedData['start_date'];
        $booking->end_date = $validatedData['end_date'];
        $booking->person_count = $validatedData['person_count'];
        $booking->others = $validatedData['others'];
        $booking->user_id = $validatedData['user_id'];
        $booking->room_id = $validatedData['room_id'];

        // store booking
        $booking->save();

        $voucherCount = $request->input('voucher_count', 0);
        $voucherLifetime = $request->input('voucher_lifetime', 0);

        // Generate vouchers and associate them with the booking, if vouchers are requested
        if ($voucherCount && $voucherLifetime) {
            $booking->getVouchers($voucherLifetime, $voucherCount);
        }

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

            // validate data
            $validatedData = $request->validate([
                'customer_name' => 'required',
                'person_count' => 'required|integer',
                'start_date' => 'required|date_format:Y-m-d\TH:i:s',
                'end_date' => 'required|date_format:Y-m-d\TH:i:s',
                'others' => 'nullable|string',
                'user_id' => 'required|integer',
                'room_id' => 'required|integer', 'materials' => 'array',
                'caterings' => 'array'
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


    public function checkOverlapping(Request $request)
    {
        // Validate the incoming request
        $request->validate([
            'room_id' => 'required|exists:rooms,id',
            'start_date' => 'required|date_format:Y-m-d H:i:s',
            'end_date' => 'required|date_format:Y-m-d H:i:s',
            'person_count' => 'required|integer',
        ]);

        $roomId = $request->input('room_id');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        $personCount = $request->input('person_count');

        // Check for overlapping bookings excluding the current room
        $overlapping = Booking::where('room_id', '!=', $roomId) // Exclude the current room
            ->where(function ($query) use ($roomId, $startDate, $endDate) {
                $query->where(function ($q) use ($roomId, $startDate, $endDate) {
                    $q->where('room_id', '!=', $roomId) // Exclude the current room
                        ->where('start_date', '<', $endDate)
                        ->where('end_date', '>', $startDate);
                })
                    ->orWhere(function ($q) use ($roomId, $startDate, $endDate) {
                        $q->where('room_id', '!=', $roomId) // Exclude the current room
                            ->where('start_date', '>=', $startDate)
                            ->where('end_date', '<=', $endDate);
                    });
            })
            ->exists();

        // Check if the room capacity is exceeded
        $roomCapacity = DB::table('rooms')->where('id', $roomId)->value('max_persons');
        $capacityExceeded = $personCount > $roomCapacity;

        // return status as booleans
        return response()->json([
            'overlapping' => $overlapping,
            'capacityExceeded' => $capacityExceeded,
        ]);
    }
}
