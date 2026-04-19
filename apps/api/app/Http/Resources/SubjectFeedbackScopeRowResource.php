<?php

namespace App\Http\Resources;

use Dedoc\Scramble\Attributes\SchemaName;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * One aggregated student submission for a feedback link, including link context.
 *
 * @property array{
 *     feedback_link_id: string,
 *     feedback_type: string,
 *     link_status: string,
 *     share_url: string,
 *     feedback_link_exists: bool,
 *     student_id: string|null,
 *     full_name: string|null,
 *     register_no: string|null,
 *     average_rating: float,
 *     ratings: array<int, array{question_id: string, question: string|null, order_index: int|null, rating: int}>
 * } $resource
 */
#[SchemaName('SubjectFeedbackScopeRow')]
class SubjectFeedbackScopeRowResource extends JsonResource
{
    public static $wrap = null;

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'feedback_link_id' => $this->resource['feedback_link_id'],
            'feedback_type' => $this->resource['feedback_type'],
            'link_status' => $this->resource['link_status'],
            'share_url' => $this->resource['share_url'],
            'feedback_link_exists' => $this->resource['feedback_link_exists'],
            'student_id' => $this->resource['student_id'],
            'full_name' => $this->resource['full_name'],
            'register_no' => $this->resource['register_no'],
            'average_rating' => $this->resource['average_rating'],
            'ratings' => StudentFeedbackFacultyRatingResource::collection($this->resource['ratings']),
        ];
    }
}
