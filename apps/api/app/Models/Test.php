<?php

namespace App\Models;

use Database\Factories\TestFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'institution_id',
    'program_id',
    'semester',
    'name',
    'cie_number',
    'maximum_marks',
    'minimum_passing_marks',
    'academic_year',
])]
class Test extends Model
{
    /** @use HasFactory<TestFactory> */
    use HasFactory, HasUlids;

    protected function casts(): array
    {
        return [
            'semester' => 'integer',
            'cie_number' => 'integer',
            'maximum_marks' => 'integer',
            'minimum_passing_marks' => 'integer',
            'academic_year' => 'integer',
        ];
    }

    public function institution(): BelongsTo
    {
        return $this->belongsTo(Institution::class);
    }

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    public function courseOutcomeMarks(): HasMany
    {
        return $this->hasMany(TestCourseOutcome::class);
    }
}
