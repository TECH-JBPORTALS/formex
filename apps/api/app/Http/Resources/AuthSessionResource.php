<?php

namespace App\Http\Resources;

use App\Models\Institution;
use App\Models\User;
use Dedoc\Scramble\Attributes\SchemaName;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Session payload for `/api/user` and `/api/user/current-institution`.
 *
 * @property array{user: User, current_institution: Institution|null, current_institution_id: string|null} $resource
 */
#[SchemaName('AuthSession')]
class AuthSessionResource extends JsonResource
{
    public static $wrap = null;

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'user' => UserResource::make($this->resource['user']),
            'current_institution' => $this->resource['current_institution'] !== null
                ? InstitutionResource::make($this->resource['current_institution'])
                : null,
            'current_institution_id' => $this->resource['current_institution_id'],
        ];
    }
}
