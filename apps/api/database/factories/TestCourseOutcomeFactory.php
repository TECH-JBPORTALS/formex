<?php

namespace Database\Factories;

use App\Models\CourseOutcome;
use App\Models\Test;
use App\Models\TestCourseOutcome;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TestCourseOutcome>
 */
class TestCourseOutcomeFactory extends Factory
{
    public function definition(): array
    {
        $test = Test::factory()->create();
        $courseOutcome = CourseOutcome::factory()->create([
            'institution_id' => $test->institution_id,
            'program_id' => $test->program_id,
        ]);

        return [
            'test_id' => $test->id,
            'course_outcome_id' => $courseOutcome->id,
            'assigned_marks' => fake()->numberBetween(1, 25),
        ];
    }
}
