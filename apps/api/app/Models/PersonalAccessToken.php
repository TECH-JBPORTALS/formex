<?php

namespace App\Models;

use Illuminate\Support\Str;
use Laravel\Sanctum\PersonalAccessToken as SanctumPersonalAccessToken;

class PersonalAccessToken extends SanctumPersonalAccessToken
{
    public $incrementing = false;

    protected $keyType = 'string';

    protected static function booted(): void
    {
        static::creating(function (PersonalAccessToken $personalAccessToken): void {
            if (! $personalAccessToken->getKey()) {
                $personalAccessToken->{$personalAccessToken->getKeyName()} = strtolower((string) Str::ulid());
            }
        });
    }
}
