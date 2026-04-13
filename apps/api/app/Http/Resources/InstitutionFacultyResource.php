<?php

namespace App\Http\Resources;

use Dedoc\Scramble\Attributes\SchemaName;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property array{
 *   id: string,
 *   name: string,
 *   email: string,
 *   role: string,
 *   programs: array<int, array{id: string, name: string, short_name: string}>,
 *   subjects: array<int, array{id: string, name: string, short_name: string}>
 * } $resource
 */
#[SchemaName('InstitutionFaculty')]
class InstitutionFacultyResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource['id'],
            'name' => $this->resource['name'],
            'email' => $this->resource['email'],
            'role' => $this->resource['role'],
            'programs' => FacultyProgramResource::collection($this->resource['programs']),
            'subjects' => FacultySubjectResource::collection($this->resource['subjects']),
        ];
    }
}
