<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BookingsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('bookings')->insert([
            [
                'customer_name' => 'Rhenus',
                'start_date' => '2023-08-23T12:00:00',
                'end_date' => '2023-08-23T17:00:00',
                'person_count' => 7,
                'others' => null,
                'user_id' => 1,
                'room_id' => 1,
            ],
            [
                'customer_name' => 'Masterflex',
                'start_date' => '2023-08-23T11:00:00',
                'end_date' => '2023-08-23T15:00:00',
                'person_count' => 4,
                'others' => 'Grandmaster Flex is in da House',
                'user_id' => 1,
                'room_id' => 4,
            ],
            [
                'customer_name' => 'Krohne',
                'start_date' => '2023-08-23T08:00:00',
                'end_date' => '2023-08-23T13:00:00',
                'person_count' => 10,
                'others' => 'everyone get your crowns ready...',
                'user_id' => 1,
                'room_id' => 2,
            ],
        ]);
    }
}
