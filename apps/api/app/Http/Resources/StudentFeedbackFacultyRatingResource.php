<?php

namespace App\Http\Resources;

use Dedoc\Scramble\Attributes\SchemaName;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * One criterion rating within a faculty feedback row.
 *
 * @property array{question_id: string, question: string|null, order_index: int|null, rating: int} $resource
 */
#[SchemaName('StudentFeedbackFacultyRating')]
class StudentFeedbackFacultyRatingResource extends JsonResource
{
    public static $wrap = null;

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'question_id' => $this->resource['question_id'],
            'question' => $this->resource['question'],
            'order_index' => $this->resource['order_index'],
            'rating' => $this->resource['rating'],
        ];
    }
}
