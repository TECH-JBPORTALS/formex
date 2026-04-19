<?php

namespace App\Http\Resources;

use Dedoc\Scramble\Attributes\SchemaName;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Aggregated feedback for one student on a feedback link.
 *
 * @property array{
 *     student_id: string|null,
 *     full_name: string|null,
 *     register_no: string|null,
 *     average_rating: float,
 *     ratings: array<int, array{question_id: string, question: string|null, order_index: int|null, rating: int}>
 * } $resource
 */
#[SchemaName('StudentFeedbackFacultyRow')]
class StudentFeedbackFacultyRowResource extends JsonResource
{
    public static $wrap = null;

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'student_id' => $this->resource['student_id'],
            'full_name' => $this->resource['full_name'],
            'register_no' => $this->resource['register_no'],
            'average_rating' => $this->resource['average_rating'],
            'ratings' => StudentFeedbackFacultyRatingResource::collection($this->resource['ratings']),
        ];
    }
}
