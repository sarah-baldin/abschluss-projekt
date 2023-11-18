<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoomsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('rooms')->insert([
            [
                'name' => 'Kesselraum',
                'max_persons' => 12,
                'windowed' => true,
                'presentation' => true,
            ],
            [
                'name' => 'Alte Räucherei',
                'max_persons' => 16,
                'windowed' => true,
                'presentation' => true,
            ],
            [
                'name' => 'Kreativwerkstatt',
                'max_persons' => 100,
                'windowed' => true,
                'presentation' => false,
            ],
            [
                'name' => 'Kammer 1',
                'max_persons' => 8,
                'windowed' => false,
                'presentation' => true,
            ],
            [
                'name' => 'Kammer 2',
                'max_persons' => 8,
                'windowed' => false,
                'presentation' => true,
            ],
            [
                'name' => 'Geheime Weide',
                'max_persons' => 6,
                'windowed' => false,
                'presentation' => true,
            ],
        ]);
    }
}
