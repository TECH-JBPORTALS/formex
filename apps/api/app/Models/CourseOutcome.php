<?php

namespace App\Models;

use Database\Factories\CourseOutcomeFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'institution_id',
    'program_id',
    'course_id',
    'type',
    'name',
    'description',
    'syllabus_scheme',
    'academic_year',
])]
class CourseOutcome extends Model
{
    /** @use HasFactory<CourseOutcomeFactory> */
    use HasFactory, HasUlids;

    protected function casts(): array
    {
        return [
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

    public function course(): BelongsTo
    {
        return $this->belongsTo(Subject::class, 'course_id');
    }
}
