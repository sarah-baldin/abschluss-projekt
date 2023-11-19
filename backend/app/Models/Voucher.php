<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Voucher extends Model
{
    use HasFactory;

    protected $fillable = ['code', 'booking_id'];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }
}
