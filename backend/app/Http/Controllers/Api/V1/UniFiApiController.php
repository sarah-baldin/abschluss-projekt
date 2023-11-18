<?php

namespace App\Http\Controllers\Api\V1;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use UniFi_API\Client;

/* require_once 'vendor/autoload.php'; */

class UniFiApiController extends Controller
{
    protected $unifi;

    public function __construct(Client $unifi)
    {
        $this->unifi = $unifi;
    }

    /**
     *check connection to UniFi client.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function testClient()
    {
        try {
            // Versuche, dich mit dem UniFi Controller anzumelden
            $this->unifi->login();

            // Wenn das Login erfolgreich war, gib eine erfolgreiche Nachricht zurück
            return response()->json([
                'success' => true,
                'message' => 'Client wurde erfolgreich geladen und angemeldet.'
            ], 200);
        } catch (\Exception $e) {
            // Wenn ein Fehler auftritt, gib eine Fehlermeldung zurück
            return response()->json([
                'success' => false,
                'message' => 'Fehler beim Laden des Clients: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * create Vouchers.
     *
     * @return \Illuminate\Http\JsonResponse
     */

    public function createVoucher(Request $request)
    {
        try {
            $this->unifi->login();
            $daysNeeded = $request->input('voucher_lifetime', 1) * 1440;
            $voucherCount = $request->input('voucher_count', 1);

            $minutes = $daysNeeded;
            $count = $voucherCount;
            $quota = 1;
            $note = 'created by uniFi API';
            $up = null;
            $down = null;
            $bytes = null;

            $voucherOptions = [
                $minutes, $count, $quota, $note, $up, $down, $bytes
            ];

            // create voucher
            $voucherResult = $this->unifi->create_voucher(...$voucherOptions);

            // check, if voucher was generated correctly and create a readable output for the newly created voucher
            if ($voucherResult && isset($voucherResult[0]->create_time)) {
                $creationTime = $voucherResult[0]->create_time;
                $vouchers = $this->unifi->stat_voucher($creationTime);

                $voucher_output = (count($vouchers) > 1) ? $vouchers : $vouchers[0];

                return response()->json([
                    'success' => true,
                    'voucher' => $voucher_output  // returns the newly created vouchers
                    , 200
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Voucher could not be created'
                ], 500);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * delete existing voucher.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteVoucher()
    {
        try {
            $this->unifi->login();
            $voucherId = "6558feaf38a56d30a6237b25";

            $deletedVoucher = $this->unifi->revoke_voucher($voucherId);

            if ($deletedVoucher) {
                return response()->json([
                    'success' => true,
                    'deleted_voucher_id' => $voucherId
                ], 200);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Voucher could not be deleted'
                ], 500);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }


    /**
     * List all existing vouchers.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function listVouchers()
    {
        try {
            $this->unifi->login();
            $clients = $this->unifi->stat_voucher();

            return response()->json([
                'success' => true,
                'clients' => $clients
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }


    /**
     * Get details for a specific UniFi client by its MAC address.
     *
     * @param  string $mac
     * @return \Illuminate\Http\JsonResponse
     */
    public function getClientDetails($mac)
    {
        try {
            $this->unifi->login();
            $client = $this->unifi->stat_client($mac);

            if (!$client) {
                return response()->json([
                    'success' => false,
                    'message' => 'Client not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'client' => $client
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
