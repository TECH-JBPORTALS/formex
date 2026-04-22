<?php

namespace App\Http\Resources;

use Dedoc\Scramble\Attributes\SchemaName;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

#[SchemaName('ResultAnalysis')]
class ResultAnalysisResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'course_id' => $this->course_id,
            'student_id' => $this->student_id,
            'scored_grade' => $this->scored_grade,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'course' => SubjectResource::make($this->whenLoaded('course')),
            'student' => StudentResource::make($this->whenLoaded('student')),
        ];
    }
}
