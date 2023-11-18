<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CateringsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('caterings')->insert([
            ['name' => 'belegte Brötchen'],
            ['name' => 'Müsliriegel'],
            ['name' => 'Kekse'],
            ['name' => 'Kaffee'],
            ['name' => 'Wasserflaschen'],
            ['name' => 'Softdrinks'],
            ['name' => 'Obst'],
        ]);
    }
}
