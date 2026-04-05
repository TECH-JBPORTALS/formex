<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;


#[Fillable([
    'full_name',
    'date_of_birth',
    'institution_id',
    'program_id',
    'semester',
    'academic_year',
    'register_no',
    'is_approved',
    'gender',
    'category',
    'email',
    'mobile',
    'appar_id',
])]
class Student extends Model
{

    use HasUlids, HasFactory;

    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
            'is_approved' => 'boolean',
            'semester' => 'integer',
            'academic_year' => 'integer',
        ];
    }

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }
    public function internships(): HasMany
    {
        return $this->hasMany(Internship::class);
    }
    public function institution(): BelongsTo
    {
        return $this->belongsTo(Institution::class);
    }

    public function placements(): HasMany
    {
        return $this->hasMany(Placement::class);
    }
    public function higherEducations(): HasMany
    {
        return $this->hasMany(Highereducation::class);
    }
}
