<?php

namespace App\Models;

use Database\Factories\StudentFeedbackFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'semester',
    'course_id',
    'student_id',
    'feedback_link_id',
    'question_id',
    'rating',
    'academic_year',
    'feedback_type',
])]
class StudentFeedback extends Model
{
    /** @use HasFactory<StudentFeedbackFactory> */
    use HasFactory;

    use HasUlids;

    protected function casts(): array
    {
        return [
            'semester' => 'integer',
            'rating' => 'integer',
            'academic_year' => 'integer',
        ];
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Program::class, 'course_id');
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function link(): BelongsTo
    {
        return $this->belongsTo(FeedbackLink::class, 'feedback_link_id');
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(FeedbackQuestion::class, 'question_id');
    }
}
