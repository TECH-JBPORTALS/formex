<?php

namespace Database\Factories;

use App\Models\Institution;
use App\Models\Program;
use App\Models\Test;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Test>
 */
class TestFactory extends Factory
{
    public function definition(): array
    {
        $institution = Institution::factory()->create();
        $program = Program::factory()->create([
            'institution_id' => $institution->id,
        ]);

        return [
            'institution_id' => $institution->id,
            'program_id' => $program->id,
            'semester' => fake()->numberBetween(1, 6),
            'name' => fake()->randomElement(['Test 1', 'Test 2', 'Model Exam']),
            'cie_number' => fake()->numberBetween(1, 6),
            'maximum_marks' => fake()->randomElement([25, 50, 100]),
            'minimum_passing_marks' => fake()->numberBetween(10, 40),
            'academic_year' => fake()->numberBetween(2024, 2035),
        ];
    }
}
