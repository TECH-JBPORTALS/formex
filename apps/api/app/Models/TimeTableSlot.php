<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'start_hour_no',
    'end_hour_no',
    'day',
    'time_table_id',
])]
class TimeTableSlot extends Model
{
    use HasFactory, HasUlids;

    protected function casts(): array
    {
        return [
            'start_hour_no' => 'integer',
            'end_hour_no' => 'integer',
        ];
    }

    public function time_table(): BelongsTo
    {
        return $this->belongsTo(TimeTable::class);
    }

    public function subjects(): HasMany
    {
        return $this->hasMany(TimeTableSlotSubject::class);
    }
}
