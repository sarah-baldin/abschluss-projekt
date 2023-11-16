<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CateringMaterialTablesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Zufällige IDs für Catering und Materialien generieren
        $cateringIds = [1, 2, 3, 4, 5, 6, 7];  // Sie können die tatsächlichen IDs basierend auf Ihrer Datenbank anpassen
        $materialIds = [1, 2, 3];

        // Für Booking ID 1
        shuffle($cateringIds);
        DB::table('booking_catering')->insert([
            ['booking_id' => 1, 'catering_id' => $cateringIds[0]],
            ['booking_id' => 1, 'catering_id' => $cateringIds[1]],
            ['booking_id' => 1, 'catering_id' => $cateringIds[2]],
        ]);
        shuffle($materialIds);
        DB::table('booking_material')->insert([
            ['booking_id' => 1, 'material_id' => $materialIds[0]],
        ]);

        // Für Booking ID 2
        shuffle($cateringIds);
        DB::table('booking_catering')->insert([
            ['booking_id' => 2, 'catering_id' => $cateringIds[0]],
            ['booking_id' => 2, 'catering_id' => $cateringIds[1]],
            ['booking_id' => 2, 'catering_id' => $cateringIds[2]],
        ]);
        shuffle($materialIds);
        DB::table('booking_material')->insert([
            ['booking_id' => 2, 'material_id' => $materialIds[0]],
            ['booking_id' => 2, 'material_id' => $materialIds[1]],
        ]);

        // Für Booking ID 3
        shuffle($cateringIds);
        DB::table('booking_catering')->insert([
            ['booking_id' => 3, 'catering_id' => $cateringIds[0]],
            ['booking_id' => 3, 'catering_id' => $cateringIds[1]],
            ['booking_id' => 3, 'catering_id' => $cateringIds[2]],
        ]);
        shuffle($materialIds);
        DB::table('booking_material')->insert([
            ['booking_id' => 3, 'material_id' => $materialIds[0]],
        ]);
    }
}
