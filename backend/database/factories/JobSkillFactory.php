<?php
namespace Database\Factories;

use App\Models\JobSkill;
use Illuminate\Database\Eloquent\Factories\Factory;

class JobSkillFactory extends Factory
{
    public function defination(): array{
        return [
            'title' => fake()->skiltitle(),
            'location' => fake()->randomElement([
                'Addis Ababa',
                'Bole, Addis Ababa',
                'Kazanchis, Addis Ababa',
                'Remote',
            ]),
            'url' => fake()-> urlname(),
            'skill' => fake() -> randomElemente([
                "Python",
                "React",
                "Java",
                "Backend",
                "Frontend"
            ])

        ];
    }
}