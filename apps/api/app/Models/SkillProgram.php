<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Attributes\Fillable;
#[Fillable([
    'program_id',
    'institution_id',
    'student_id',
    'semester',
    'details',
    'resource_person_name',
    'company_name',
    'designation',
    'conducted_date',
    'academic_year',
])]
class SkillProgram extends Model
{
    //
    use HasUlids, HasFactory;
    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }
    public function institution(): BelongsTo
    {
        return $this->belongsTo(Institution::class);
    }
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }
}
