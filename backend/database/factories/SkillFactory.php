<?php

namespace Database\Factories;

use App\Models\Skill;
use Illuminate\Database\Eloquent\Factories\Factory;

class SkillFactory extends Factory
{
    protected $model = Skill::class;

    public function definition(): array
    {
        return [
            'name' => fake()->unique()->randomElement([
                'PHP', 'Laravel', 'Python', 'Django', 'React',
                'JavaScript', 'TypeScript', 'PostgreSQL', 'Docker',
                'AWS', 'Node.js', 'Vue.js', 'MySQL', 'Redis',
            ]),
        ];
    }
}