<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Voucher extends Model
{
    use HasFactory;

    protected $fillable = [
        'voucher_lifetime',
        'code',
        'booking_id',
    ];

    public function bookings()
    {
        return $this->belongsToMany('App\Models\Booking', 'booking_voucher');
    }
}
