<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('result_analyses', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('course_id')->constrained('subjects')->cascadeOnDelete();
            $table->foreignUlid('student_id')->constrained()->cascadeOnDelete();
            $table->string('scored_grade', 5);
            $table->timestamps();

            $table->unique(['course_id', 'student_id'], 'result_analyses_course_student_uq');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('result_analyses');
    }
};
