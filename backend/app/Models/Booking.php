<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
        'room_id'
    ];

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
}
