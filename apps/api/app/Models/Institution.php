<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'code', 'type', 'address'])]
class Institution extends Model
{
    use HasFactory, HasUlids;

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class)->withPivot('role');
    }

    public function programs(): HasMany
    {
        return $this->hasMany(Program::class);
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

    public function bridges(): HasMany
    {
        return $this->hasMany(Bridge::class);
    }

    public function students(): HasMany
    {
        return $this->hasMany(Student::class);
    }

    public function feedback_questions(): HasMany
    {
        return $this->hasMany(FeedbackQuestion::class);
    }

    public function feedback_links(): HasMany
    {
        return $this->hasMany(FeedbackLink::class);
    }
}
