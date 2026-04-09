<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

#[Fillable([
    'institution_id',
    'program_id',
    'course_coordinator_id',
    'subject_id',
    'semester',
    'curriculum_gap',
    'details',
    'conducted_date',
    'venue',
    'resource_person_name',
    'company_name',
    'designation',
    'students_present',
    'relevance',
    'academic_year',
])]
class Bridge extends Model
{
    //
    use HasUlids, HasFactory;

        public function institutions(): BelongsTo
    {
        return $this->belongsTo(Institution::class);
    }
    public function programs(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }
    public function users(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
    public function subjects(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }
}
