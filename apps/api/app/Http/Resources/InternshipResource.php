<?php

namespace App\Http\Resources;

use Dedoc\Scramble\Attributes\SchemaName;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

#[SchemaName('Internship')]
class InternshipResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'student_id' => $this->student_id,
            'institution_id' => $this->institution_id,
            'program_id' => $this->program_id,
            'industry_name' => $this->industry_name,
            'industry_address' => $this->industry_address,
            'role' => $this->role,

            /** @format date */
            'from_date' => $this->from_date,

            /** @format date */
            'to_date' => $this->to_date,
            'acad_year' => $this->acad_year,
            'semester' => $this->semester,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'student' => $this->whenLoaded(
                'student',
                fn() => StudentResource::make($this->student)
            ),
            'program' => $this->whenLoaded(
                'program',
                fn() => ProgramResource::make($this->program)
            ),
        ];
    }
}
