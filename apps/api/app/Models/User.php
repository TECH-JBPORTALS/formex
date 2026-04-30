<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

#[Fillable(['name', 'email', 'password'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, HasUlids, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function room_reports(): HasMany
    {
        return $this->hasMany(RoomReport::class);
    }

    public function institutions(): BelongsToMany
    {
        return $this->belongsToMany(Institution::class)
            ->withPivot(['role', 'deleted_at'])
            ->wherePivotNull('deleted_at');
    }

    public function higher_educations(): BelongsToMany
    {
        return $this->belongsToMany(HigherEducation::class);
    }

    public function bridges(): HasMany
    {
        return $this->hasMany(Bridge::class);
    }

    public function time_table_slot_subjects(): HasMany
    {
        return $this->hasMany(TimeTableSlotSubject::class, 'course_coordinator_id');
    }

    public function course_plans(): HasMany
    {
        return $this->hasMany(CoursePlan::class, 'course_coordinator_id');
    }
}
