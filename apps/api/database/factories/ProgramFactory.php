<?php

namespace Database\Factories;

use App\Models\Institution;
use App\Models\Program;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Program>
 */
class ProgramFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->words(3, true),
            'short_name' => strtoupper(fake()->lexify('??')),
            'intake' => fake()->numberBetween(1, 120),
            'institution_id' => Institution::factory(),
        ];
    }
}
