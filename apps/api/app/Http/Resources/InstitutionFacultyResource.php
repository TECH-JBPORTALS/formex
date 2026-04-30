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
 *   is_active: bool,
 *   deleted_at: string|null,
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
            'is_active' => $this->resource['is_active'],
            'deleted_at' => $this->resource['deleted_at'],
            'programs' => FacultyProgramResource::collection($this->resource['programs']),
            'subjects' => FacultySubjectResource::collection($this->resource['subjects']),
        ];
    }
}
