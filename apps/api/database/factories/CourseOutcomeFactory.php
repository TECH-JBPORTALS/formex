<?php

namespace Database\Factories;

use App\Models\CourseOutcome;
use App\Models\Institution;
use App\Models\Program;
use App\Models\Subject;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CourseOutcome>
 */
class CourseOutcomeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $institution = Institution::factory()->create();
        $program = Program::factory()->create([
            'institution_id' => $institution->id,
        ]);
        $course = Subject::query()->create([
            'name' => fake()->words(2, true),
            'short_name' => strtoupper(fake()->lexify('??')).fake()->numberBetween(100, 499),
            'type' => fake()->randomElement(['theory', 'practical']),
            'semester' => fake()->numberBetween(1, 8),
            'scheme' => 'C25',
            'institution_id' => $institution->id,
            'program_id' => $program->id,
        ]);

        return [
            'institution_id' => $institution->id,
            'program_id' => $program->id,
            'course_id' => $course->id,
            'type' => fake()->randomElement([
                'program_outcome',
                'program_specific_outcome',
                'program_educational_objectives',
            ]),
            'name' => fake()->sentence(4),
            'description' => fake()->optional()->paragraph(),
            'syllabus_scheme' => fake()->optional()->randomElement(['C20', 'C25', 'R22']),
            'academic_year' => fake()->numberBetween(2024, 2035),
        ];
    }
}
