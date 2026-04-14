<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'subject_id',
    'course_coordinator_id',
    'time_table_slot_id',
    'batch',
    'room_no',
])]
class TimeTableSlotSubject extends Model
{
    use HasFactory, HasUlids;

    public function slot(): BelongsTo
    {
        return $this->belongsTo(TimeTableSlot::class, 'time_table_slot_id');
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function course_coordinator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'course_coordinator_id');
    }
}
