<?php

namespace Database\Factories;

use App\Models\FeedbackLink;
use App\Models\Institution;
use App\Models\Program;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<FeedbackLink>
 */
class FeedbackLinkFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'institution_id' => Institution::factory(),
            'course_id' => Program::factory(),
            'created_by_user_id' => User::factory(),
            'semester' => fake()->numberBetween(1, 8),
            'academic_year' => (int) now()->year,
            'feedback_type' => fake()->randomElement(['mid', 'end']),
            'token_hash' => hash('sha256', fake()->uuid()),
            'expires_at' => now()->addDays(7),
            'is_active' => true,
        ];
    }
}
