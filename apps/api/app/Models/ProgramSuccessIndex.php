<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'program_id',
    'academic_year',
    'admitted_count',
    'passed_without_backlog_count',
])]
class ProgramSuccessIndex extends Model
{
    use HasFactory, HasUlids;

    protected function casts(): array
    {
        return [
            'academic_year' => 'integer',
            'admitted_count' => 'integer',
            'passed_without_backlog_count' => 'integer',
        ];
    }

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }
}
