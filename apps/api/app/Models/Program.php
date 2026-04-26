<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'short_name', 'intake', 'institution_id'])]
class Program extends Model
{
    use HasFactory, HasUlids;

    public function institution(): BelongsTo
    {
        return $this->belongsTo(Institution::class);
    }

    public function students(): HasMany
    {
        return $this->hasMany(Student::class);
    }

    public function subjects(): HasMany
    {
        return $this->hasMany(Subject::class);
    }

    public function internships(): HasMany
    {
        return $this->hasMany(Internship::class);
    }

    public function placements(): HasMany
    {
        return $this->hasMany(Placement::class);
    }

    public function higher_educations(): HasMany
    {
        return $this->hasMany(HigherEducation::class);
    }

    public function room_reports(): HasMany
    {
        return $this->hasMany(RoomReport::class);
    }

    public function skill_programs(): HasMany
    {
        return $this->hasMany(SkillProgram::class);
    }

    public function program_outcomes(): HasMany
    {
        return $this->hasMany(ProgramOutcome::class);
    }

    public function bridges(): HasMany
    {
        return $this->hasMany(Bridge::class);
    }

    public function time_tables(): HasMany
    {
        return $this->hasMany(TimeTable::class);
    }

    public function course_plans(): HasMany
    {
        return $this->hasMany(CoursePlan::class);
    }

    public function course_outcomes(): HasMany
    {
        return $this->hasMany(CourseOutcome::class);
    }

    public function feedback_links(): HasMany
    {
        return $this->hasMany(FeedbackLink::class, 'course_id');
    }

    public function feedback_entries(): HasMany
    {
        return $this->hasMany(StudentFeedback::class, 'course_id');
    }

    public function tests(): HasMany
    {
        return $this->hasMany(Test::class);
    }
}
