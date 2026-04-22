<?php

namespace App\Models;

use Database\Factories\ResultAnalysisFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'course_id',
    'student_id',
    'scored_grade',
])]
class ResultAnalysis extends Model
{
    /** @use HasFactory<ResultAnalysisFactory> */
    use HasFactory, HasUlids;

    public const SCORED_GRADES = ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'E', 'AB'];

    public function course(): BelongsTo
    {
        return $this->belongsTo(Subject::class, 'course_id');
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }
}
