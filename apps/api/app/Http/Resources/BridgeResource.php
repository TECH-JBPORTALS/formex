<?php

namespace App\Http\Resources;

use Dedoc\Scramble\Attributes\SchemaName;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

#[SchemaName('Bridge')]
class BridgeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'institution_id' => $this->institution_id,
            'program_id' => $this->program_id,
            'course_coordinator_id' => $this->course_coordinator_id,
            'subject_id' => $this->subject_id,
            'curriculum_gap' => $this->curriculum_gap,
            'details' => $this->details,
            'conducted_date' => $this->conducted_date,
            'venue' => $this->venue,
            'resource_person_name' => $this->resource_person_name,
            'company_name' => $this->company_name,
            'designation' => $this->designation,
            'students_present' => $this->students_present,
            'relevance' => $this->relevance,
            'academic_year' => $this->academic_year,
            'semester' => $this->semester,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'program' => ProgramResource::make($this->whenLoaded('program')),
            'subject' => SubjectResource::make($this->whenLoaded('subject'))
        ];
    }
}
