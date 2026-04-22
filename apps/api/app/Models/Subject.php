<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'name',
    'short_name',
    'code',
    'type',
    'semester',
    'scheme',
    'program_id',
    'institution_id',
])]

class Subject extends Model
{
    use HasFactory, HasUlids;

    protected function casts(): array
    {
        return [
            'semester' => 'integer',
        ];
    }

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    public function institution(): BelongsTo
    {
        return $this->belongsTo(Institution::class);
    }

    public function roomreports(): HasMany
    {
        return $this->hasMany(Roomreport::class);
    }

    public function bridges(): HasMany
    {
        return $this->hasMany(Bridge::class);
    }

    public function assigned_staff(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'institution_user_subject', 'subject_id', 'user_id')
            ->withPivot('institution_id')
            ->withTimestamps();
    }

    public function time_table_slot_subjects(): HasMany
    {
        return $this->hasMany(TimeTableSlotSubject::class);
    }

    public function course_plans(): HasMany
    {
        return $this->hasMany(CoursePlan::class, 'course_id');
    }

    public function course_outcomes(): HasMany
    {
        return $this->hasMany(CourseOutcome::class, 'course_id');
    }

    public function course_monthly_attendances(): HasMany
    {
        return $this->hasMany(CourseMonthlyAttendance::class, 'course_id');
    }

    public function result_analyses(): HasMany
    {
        return $this->hasMany(ResultAnalysis::class, 'course_id');
    }
}
