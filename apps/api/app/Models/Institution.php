<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(["name", "code", "type", "address"])]
class Institution extends Model
{
    use HasFactory, HasUlids;


    public function programs(): HasMany
    {
        return $this->hasMany(Program::class);
    }

    public function subjects(): HasMany
    {
        return $this->hasMany(Subject::class);
    }
}
