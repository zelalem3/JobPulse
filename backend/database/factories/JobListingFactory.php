<?php

namespace Database\Factories;

use App\Models\Company;
use Illuminate\Database\Eloquent\Factories\Factory;

class JobListingFactory extends Factory
{
    public function definition(): array
    {
        return [
            'company_id' => Company::factory(),

            'title' => fake()->jobTitle(),

            'location' => fake()->randomElement([
                'Addis Ababa',
                'Bole, Addis Ababa',
                'Kazanchis, Addis Ababa',
                'Remote',
            ]),

            'requirements' => fake()->paragraph(),

            'description' => fake()->paragraphs(2, true),

            'employment_type' => fake()->randomElement([
                'Full-time',
                'Part-time',
                'Contract',
            ]),

            'experience_level' => fake()->randomElement([
                'Entry Level',
                'Mid Level',
                'Senior Level',
            ]),

            'salary' => fake()->optional()->randomElement([
                '15,000 ETB',
                '20,000 ETB',
                '25,000 ETB',
            ]),

            'category' => fake()->randomElement([
                'Software Engineering',
                'Marketing',
                'Finance',
                'Sales',
            ]),

            'deadline' => fake()->dateTimeBetween('now', '+30 days'),

            'posted_at' => fake()->dateTimeBetween('-30 days', 'now'),

            'source' => 'Test',

            'url' => fake()->unique()->url(),

            'responsibilities' => fake()->paragraphs(2, true),

            'is_active' => true,
        ];
    }
}