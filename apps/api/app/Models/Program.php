<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(["name", "short_name", "intake", "institution_id"])]
class Program extends Model
{
    use HasUlids, HasFactory;

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
    public function highereducations(): HasMany
    {
        return $this->hasMany(Highereducation::class);
    }
    public function roomreports(): HasMany
    {
        return $this->hasMany(Roomreport::class);
    }
    
}
