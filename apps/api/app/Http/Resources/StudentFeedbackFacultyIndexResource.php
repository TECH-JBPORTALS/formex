<?php

namespace App\Http\Resources;

use Dedoc\Scramble\Attributes\SchemaName;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Faculty view of aggregated student feedback for one feedback link.
 *
 * @property array{
 *     feedback_link_id: string,
 *     course_id: string,
 *     semester: int,
 *     academic_year: int,
 *     feedback_type: string,
 *     responses: array<int, array{
 *         student_id: string|null,
 *         full_name: string|null,
 *         register_no: string|null,
 *         average_rating: float,
 *         ratings: array<int, array{question_id: string, question: string|null, order_index: int|null, rating: int}>
 *     }>
 * } $resource
 */
#[SchemaName('StudentFeedbackFacultyIndex')]
class StudentFeedbackFacultyIndexResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'feedback_link_id' => $this->resource['feedback_link_id'],
            'course_id' => $this->resource['course_id'],
            'semester' => $this->resource['semester'],
            'academic_year' => $this->resource['academic_year'],
            'feedback_type' => $this->resource['feedback_type'],
            'responses' => StudentFeedbackFacultyRowResource::collection($this->resource['responses']),
        ];
    }
}
