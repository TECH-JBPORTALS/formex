<?php

namespace App\Http\Resources;

use Dedoc\Scramble\Attributes\SchemaName;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

#[SchemaName('Subject')]
class SubjectResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        /** @var list<array{id:string,name:string,role:string}> $assigned_staff */
        $assigned_staff = [];

        if ($this->relationLoaded('assigned_staff')) {
            $assigned_staff = $this->assigned_staff->map(function ($staff): array {
                return [
                    'id' => $staff->id,
                    'name' => $staff->name,
                    'role' => $staff->institutions->first()?->pivot?->role ?? 'course_coordinator',
                ];
            })->values()->all();
        }

        return [
            'id' => $this->id,
            'name' => $this->name,
            'short_name' => $this->short_name,
            'code' => $this->code ?? $this->short_name,
            'type' => $this->type,
            'semester' => $this->semester,
            'scheme' => $this->scheme,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'program' => ProgramResource::make($this->whenLoaded('program')),
            'assigned_staff' => $assigned_staff,
        ];
    }
}
