<?php

namespace App\Http\Resources;

use Dedoc\Scramble\Attributes\SchemaName;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

#[SchemaName('TestCourseOutcome')]
class TestCourseOutcomeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'test_id' => $this->test_id,
            'course_outcome_id' => $this->course_outcome_id,
            'assigned_marks' => $this->assigned_marks,
            'course_outcome' => CourseOutcomeResource::make($this->whenLoaded('courseOutcome')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
