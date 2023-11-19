<?php

namespace App\Http\Controllers\Api\V1;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Services\UniFiApiVoucherService;

class UniFiApiController extends Controller
{
    protected $voucherService;

    public function __construct(UniFiApiVoucherService $voucherService)
    {
        $this->voucherService = $voucherService;
    }

    public function createVoucher(Request $request)
    {
        try {
            $voucherLifetime = $request->input('voucher_lifetime', 0);
            $voucherCount = $request->input('voucher_count', 0);

            $vouchers = $this->voucherService->generateVoucher($voucherLifetime, $voucherCount);

            if ($vouchers) {
                return response()->json([
                    'success' => true,
                    'vouchers' => $vouchers,
                ], 200);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Voucher could not be created',
                ], 500);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function deleteVoucher($voucherId)
    {
        try {
            $deleted = $this->voucherService->deleteVoucher($voucherId);

            if ($deleted) {
                return response()->json([
                    'success' => true,
                    'deleted_voucher_id' => $voucherId,
                ], 200);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Voucher could not be deleted',
                ], 500);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function listVouchers()
    {
        try {
            $vouchers = $this->voucherService->listVouchers();

            if ($vouchers) {
                return response()->json([
                    'success' => true,
                    'vouchers' => $vouchers,
                ], 200);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Error listing vouchers',
                ], 500);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }
}
