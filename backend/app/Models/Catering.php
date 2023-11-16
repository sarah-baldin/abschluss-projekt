<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Catering extends Model
{
    use HasFactory;

    public function bookings() {
        return $this->belongsToMany('App\Models\Booking', 'booking_catering');
    }
}
