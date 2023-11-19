<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Services\UniFiApiVoucherService;
use Illuminate\Support\Facades\Log;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_name',
        'person_count',
        'start_date',
        'end_date',
        'others',
        'user_id',
        'room_id',
        'code',
    ];


    // Make $voucherService a transient property
    protected $voucherService;

    // Inject the voucher service through the constructor
    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);
        $this->voucherService = app(UniFiApiVoucherService::class);
    }

    public function getVouchers($lifetime, $count)
    {
        $vouchers = [];

        $voucherResult = $this->voucherService->generateVoucher($lifetime, $count);
        Log::info('Voucher Result in Model: ' . json_encode($voucherResult));

        if ($voucherResult) {
            foreach ($voucherResult as $voucherData) {
                // Create a new Voucher model instance
                $voucher = new Voucher([
                    'code' => $voucherData->code,
                    'voucher_lifetime' => $lifetime,
                ]);

                // Save the voucher to the vouchers table
                $voucher->save();

                // Associate the voucher with the booking
                $this->vouchers()->attach($voucher->id);

                $vouchers[] = $voucher;
            }
        }

        return $vouchers;
    }

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function room() {
        return $this->belongsTo(Room::class);
    }

    public function caterings() {
        return $this->belongsToMany('App\Models\Catering', 'booking_catering');
    }

    public function materials() {
        return $this->belongsToMany('App\Models\Material', 'booking_material');
    }

    public function vouchers()
    {
        return $this->belongsToMany('App\Models\Voucher', 'booking_voucher');
    }
}
