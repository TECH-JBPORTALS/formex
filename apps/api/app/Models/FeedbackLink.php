<?php

namespace App\Models;

use Database\Factories\FeedbackLinkFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'institution_id',
    'course_id',
    'created_by_user_id',
    'semester',
    'academic_year',
    'feedback_type',
    'token_hash',
    'share_token',
    'expires_at',
    'is_active',
])]
class FeedbackLink extends Model
{
    /** @use HasFactory<FeedbackLinkFactory> */
    use HasFactory;

    use HasUlids;

    protected function casts(): array
    {
        return [
            'semester' => 'integer',
            'academic_year' => 'integer',
            'expires_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    public function institution(): BelongsTo
    {
        return $this->belongsTo(Institution::class);
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Program::class, 'course_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(StudentFeedback::class, 'feedback_link_id');
    }

    public function shareUrl(): ?string
    {
        if ($this->share_token === null || $this->share_token === '') {
            return null;
        }

        return rtrim((string) config('app.frontend_url'), '/').'/feedback?token='.$this->share_token;
    }
}
