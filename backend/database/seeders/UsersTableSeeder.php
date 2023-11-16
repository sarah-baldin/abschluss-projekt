<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;


class UsersTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('users')->insert([
            [
                'firstname' => 'Sarah',
                'lastname' => 'Baldin',
                'admin' => 1,
                'role' => "RS",
                'email' => 'sbaldin.dev@gmail.com',
                'password' => Hash::make('test123'),
            ],
            [
                'firstname' => 'Harry',
                'lastname' => 'Pesch',
                'admin' => 0,
                'role' => "CO",
                'email' => 'hpesch@gmail.com',
                'password' => Hash::make('test123'),
            ],
            [
                'firstname' => 'Niklas',
                'lastname' => 'Vredenberg',
                'admin' => 0,
                'role' => "EX",
                'email' => 'vredi@gmail.com',
                'password' => Hash::make('test234'),
            ],
            [
                'firstname' => 'Externer',
                'lastname' => 'Admin',
                'admin' => 1,
                'role' => "EX",
                'email' => 'ex1@gmail.com',
                'password' => Hash::make('test234'),
            ]
        ]);
    }
}
