<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Voucher;

class VoucherController extends Controller
{
    public function index()
    {
        // Holen Sie alle Buchungen aus der Datenbank und laden Sie den zugehörigen Voucher
        $vouchers = Voucher::all();

        // Geben Sie die Buchungen zurück (in diesem Fall als JSON)
        return response()->json($vouchers);
    }

    // show function für voucher identifizierung
    public function show($id)
    {
        $voucher = Voucher::find($id);
        if ($voucher) {
            return response()->json($voucher);
        } else {
            return response()->json(['error' => 'voucher not found'], 404);
        }
    }
}
