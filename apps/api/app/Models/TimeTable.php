<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'semester',
    'academic_year',
    'program_id',
])]
class TimeTable extends Model
{
    use HasFactory, HasUlids;

    protected function casts(): array
    {
        return [
            'semester' => 'integer',
            'academic_year' => 'integer',
        ];
    }

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    public function time_table_slots(): HasMany
    {
        return $this->hasMany(TimeTableSlot::class);
    }
}
