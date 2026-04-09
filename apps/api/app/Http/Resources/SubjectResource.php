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
        return [
            'id' => $this->id,
            'name' => $this->name,
            'short_name' => $this->short_name,
            'type' => $this->type,
            'semester' => $this->semester,
            'scheme' => $this->scheme,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'program' => ProgramResource::make($this->whenLoaded('program'))
        ];
    }
}
