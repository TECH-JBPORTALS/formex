<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'institution_id',
    'kind',
    'original_filename',
    'mime_type',
    'bytes',
    'disk',
    'storage_path',
])]
class InstitutionCalendarUpload extends Model
{
    use HasUlids;

    public function institution(): BelongsTo
    {
        return $this->belongsTo(Institution::class);
    }
}
