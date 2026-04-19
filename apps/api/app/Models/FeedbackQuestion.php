<?php

namespace App\Models;

use Database\Factories\FeedbackQuestionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'institution_id',
    'question',
    'order_index',
])]
class FeedbackQuestion extends Model
{
    /** @use HasFactory<FeedbackQuestionFactory> */
    use HasFactory;

    use HasUlids;

    public function institution(): BelongsTo
    {
        return $this->belongsTo(Institution::class);
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(StudentFeedback::class, 'question_id');
    }
}
