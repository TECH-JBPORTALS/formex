<?php

namespace Database\Factories;

use App\Models\Institution;
use App\Models\Program;
use App\Models\ResultAnalysis;
use App\Models\Student;
use App\Models\Subject;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ResultAnalysis>
 */
class ResultAnalysisFactory extends Factory
{
    protected $model = ResultAnalysis::class;

    /**
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
            'type' => 'theory',
            'semester' => 5,
            'scheme' => 'C25',
            'institution_id' => $institution->id,
            'program_id' => $program->id,
        ]);
        $student = Student::query()->create([
            'full_name' => fake()->name(),
            'institution_id' => $institution->id,
            'program_id' => $program->id,
            'semester' => 5,
            'academic_year' => (int) now()->year,
        ]);

        return [
            'course_id' => $course->id,
            'student_id' => $student->id,
            'scored_grade' => fake()->randomElement(ResultAnalysis::SCORED_GRADES),
        ];
    }
}
