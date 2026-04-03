<?php

namespace Database\Factories;

use App\Models\Institution;
use App\Models\Program;
use App\Models\Student;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Student>
 */
class StudentFactory extends Factory
{
    protected $model = Student::class;

    public function definition(): array
    {
        return [
            'full_name' => $this->faker->name(),
            'date_of_birth' => $this->faker->optional()->date(),
            'institution_id' => Institution::factory(),
            'program_id' => Program::factory(),
            'semester' => $this->faker->numberBetween(1, 6),
            'academic_year' => $this->faker->numberBetween(2000, 2030),
            'register_no' => $this->faker->optional()->bothify('??-#####'),
            'gender' => $this->faker->optional()->randomElement(['male', 'female']),
            'category' => $this->faker->optional()->word(),
            'email' => $this->faker->optional()->safeEmail(),
            'mobile' => $this->faker->optional()->numerify('##########'),
            'appar_id' => $this->faker->optional()->bothify('APP-#####'),
        ];
    }
}
