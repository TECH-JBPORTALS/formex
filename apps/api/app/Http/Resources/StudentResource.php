<?php

namespace App\Http\Resources;

use App\Models\Student;
use Dedoc\Scramble\Attributes\SchemaName;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

#[SchemaName('Student')]
class StudentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'full_name' => $this->full_name,
            'date_of_birth' => $this->date_of_birth,
            'institution_id' => $this->institution_id,
            'program_id' => $this->program_id,
            'semester' => $this->semester,
            'academic_year' => $this->academic_year,
            'register_no' => $this->register_no,
            'gender' => $this->gender,
            'category' => $this->category,
            'email' => $this->email,
            'mobile' => $this->mobile,
            'appar_id' => $this->appar_id,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
