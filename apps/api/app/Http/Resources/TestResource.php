<?php

namespace App\Http\Resources;

use Dedoc\Scramble\Attributes\SchemaName;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

#[SchemaName('Test')]
class TestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'institution_id' => $this->institution_id,
            'program_id' => $this->program_id,
            'semester' => $this->semester,
            'name' => $this->name,
            'cie_number' => $this->cie_number,
            'maximum_marks' => $this->maximum_marks,
            'minimum_passing_marks' => $this->minimum_passing_marks,
            'total_assigned_marks' => (int) ($this->course_outcome_marks_sum_assigned_marks ?? 0),
            'academic_year' => $this->academic_year,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'program' => ProgramResource::make($this->whenLoaded('program')),
            'course_outcome_marks' => TestCourseOutcomeResource::collection(
                $this->whenLoaded('courseOutcomeMarks')
            ),
        ];
    }
}
