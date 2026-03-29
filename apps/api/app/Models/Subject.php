<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'name',
    'short_name',
    'type',
    'program_id',
    'institution_id'
])]
class Subject extends Model
{
    use HasUlids, HasFactory;

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    public function institution(): BelongsTo
    {
        return $this->belongsTo(Institution::class);
    }
}
