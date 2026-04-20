<?php

namespace App\Http\Resources;

use Dedoc\Scramble\Attributes\SchemaName;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

#[SchemaName('CourseOutcome')]
class CourseOutcomeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'institution_id' => $this->institution_id,
            'program_id' => $this->program_id,
            'course_id' => $this->course_id,
            'type' => $this->type,
            'name' => $this->name,
            'description' => $this->description,
            'syllabus_scheme' => $this->syllabus_scheme,
            'academic_year' => $this->academic_year,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'program' => ProgramResource::make($this->whenLoaded('program')),
            'course' => SubjectResource::make($this->whenLoaded('course')),
        ];
    }
}
