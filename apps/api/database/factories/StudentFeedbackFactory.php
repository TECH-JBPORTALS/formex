<?php

namespace Database\Factories;

use App\Models\FeedbackLink;
use App\Models\FeedbackQuestion;
use App\Models\Program;
use App\Models\Student;
use App\Models\StudentFeedback;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<StudentFeedback>
 */
class StudentFeedbackFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'semester' => fake()->numberBetween(1, 8),
            'course_id' => Program::factory(),
            'student_id' => Student::factory(),
            'feedback_link_id' => FeedbackLink::factory(),
            'question_id' => FeedbackQuestion::factory(),
            'rating' => fake()->numberBetween(1, 5),
            'academic_year' => (int) now()->year,
            'feedback_type' => fake()->randomElement(['mid', 'end']),
        ];
    }
}
