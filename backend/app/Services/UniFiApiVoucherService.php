<?php

namespace App\Services;

use UniFi_API\Client;

class UniFiApiVoucherService
{
    protected $unifi;

    public function __construct(Client $unifi)
    {
        $this->unifi = $unifi;
    }

    public function generateVoucher($voucherLifetime, $voucherCount)
    {
        try {
            $this->unifi->login();

            $daysNeeded = $voucherLifetime * 1440; // 1440 minutes == 1 day
            $count = $voucherCount;
            $quota = 1;
            $note = 'created by uniFi API';
            $up = null;
            $down = null;
            $bytes = null;

            $voucherResult = $this->unifi->create_voucher($daysNeeded, $count, $quota, $note, $up, $down, $bytes);

            if ($voucherResult && isset($voucherResult[0]->create_time)) {
                $creationTime = $voucherResult[0]->create_time;
                $vouchers = $this->unifi->stat_voucher($creationTime);

                return $vouchers;
            } else {
                throw new \Exception('Error creating voucher. Check UniFi API response.');
            }
        } catch (\Exception $e) {
            throw new \Exception('Error generating voucher: ' . $e->getMessage());
        }
    }

    public function deleteVoucher($voucherId)
    {
        try {
            $this->unifi->login();

            $deletedVoucher = $this->unifi->revoke_voucher($voucherId);

            return $deletedVoucher;
        } catch (\Exception $e) {
            return false;
        }
    }

    public function listVouchers()
    {
        try {
            $this->unifi->login();
            $vouchers = $this->unifi->stat_voucher();

            return $vouchers;
        } catch (\Exception $e) {
            return null;
        }
    }
}
