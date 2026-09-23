<?php

namespace Database\Seeders;

use App\Models\JobSkill;
use Illuminate\Database\Seeder;

class JobSkillSeeder extends Seeder
{
    public function run(): void
    {
        JobSkill::factory()->count(50)->create();
    }
}   