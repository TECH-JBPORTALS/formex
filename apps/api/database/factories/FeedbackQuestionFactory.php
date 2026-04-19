<?php

namespace Database\Factories;

use App\Models\FeedbackQuestion;
use App\Models\Institution;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<FeedbackQuestion>
 */
class FeedbackQuestionFactory extends Factory
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
            'question' => fake()->sentence(),
            'order_index' => fake()->numberBetween(1, 20),
        ];
    }
}
