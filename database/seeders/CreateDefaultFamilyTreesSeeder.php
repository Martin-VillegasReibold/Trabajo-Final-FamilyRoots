<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CreateDefaultFamilyTreesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = \App\Models\User::all();
        
        foreach ($users as $user) {
            // Check if user already has family trees
            if ($user->arboles()->count() === 0) {
                $user->arboles()->create([
                    'name' => 'Mi Árbol Familiar'
                ]);
                echo "Created default family tree for user: {$user->email}\n";
            }
        }
    }
}
