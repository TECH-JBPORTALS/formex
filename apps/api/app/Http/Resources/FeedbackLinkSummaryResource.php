<?php

namespace App\Http\Resources;

use App\Models\FeedbackLink;
use Dedoc\Scramble\Attributes\SchemaName;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin FeedbackLink
 */
#[SchemaName('FeedbackLinkSummary')]
class FeedbackLinkSummaryResource extends JsonResource
{
    public static $wrap = null;

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var FeedbackLink $link */
        $link = $this->resource;
        $now = now();
        $expiredByDate = $link->expires_at !== null && $link->expires_at->lt($now);
        $status = $link->is_active === false
            ? 'inactive'
            : ($expiredByDate ? 'expired' : 'active');

        return [
            'id' => $link->id,
            'course_id' => $link->course_id,
            'semester' => $link->semester,
            'academic_year' => $link->academic_year,
            'feedback_type' => $link->feedback_type,
            'expires_at' => $link->expires_at !== null
                ? $link->expires_at->toISOString()
                : '',
            'is_active' => $link->is_active,
            'status' => $status,
            'created_at' => optional($link->created_at)->toISOString(),
            'share_url' => $link->shareUrl() ?? '',
        ];
    }
}
