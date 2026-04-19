<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('student_feedback', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->unsignedInteger('semester');
            $table->foreignUlid('course_id')->index()->constrained('programs')->cascadeOnDelete();
            $table->foreignUlid('student_id')->index()->constrained('students')->cascadeOnDelete();
            $table->foreignUlid('feedback_link_id')->index()->constrained('feedback_links')->cascadeOnDelete();
            $table->foreignUlid('question_id')->index()->constrained('feedback_questions')->cascadeOnDelete();
            $table->unsignedTinyInteger('rating');
            $table->unsignedInteger('academic_year');
            $table->enum('feedback_type', ['mid', 'end']);
            $table->timestamps();

            $table->unique([
                'course_id',
                'student_id',
                'feedback_link_id',
                'question_id',
                'semester',
                'academic_year',
                'feedback_type',
            ], 'student_feedback_unique_submission');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_feedback');
    }
};
