<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable([
    'institution_id',
    'program_id',
    'semester',
    'subject_id',
    'user_id',
    'room_number',
    'acad_year',
    'report_date',
    'strength',
    'present',
    'attendance_register',
    'student_attendance',
    'topic_planned',
    'topic_taught',
    'pedagogy_used',
    'aids_used',
    'teaching_skill',
    'interaction',
    'learning_outcome',
    'valuation',
    'principal_remarks',
])]
class Roomreport extends Model
{
    use HasUlids, HasFactory;
    public function institution(): BelongsTo
    {
        return $this->belongsTo(Institution::class);
    }
    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }
    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
