<?php

namespace App\Models;

use Database\Factories\TestCourseOutcomeFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'test_id',
    'course_outcome_id',
    'assigned_marks',
])]
class TestCourseOutcome extends Model
{
    /** @use HasFactory<TestCourseOutcomeFactory> */
    use HasFactory, HasUlids;

    protected function casts(): array
    {
        return [
            'assigned_marks' => 'integer',
        ];
    }

    public function test(): BelongsTo
    {
        return $this->belongsTo(Test::class);
    }

    public function courseOutcome(): BelongsTo
    {
        return $this->belongsTo(CourseOutcome::class);
    }
}
