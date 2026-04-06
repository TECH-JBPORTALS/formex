<?php

namespace App\Http\Resources;

use App\Models\Placement;
use Dedoc\Scramble\Attributes\SchemaName;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

#[SchemaName('Placement')]
/**
 * @param  Placement  $resource
 */
class PlacementResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'industry_name' => $this->industry_name,
            'industry_address' => $this->industry_address,
            'role' => $this->role,
            'ctc' => $this->ctc,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'student' => StudentResource::make($this->whenLoaded('student')),
            'program' => ProgramResource::make($this->whenLoaded('program')),
        ];
    }
}
