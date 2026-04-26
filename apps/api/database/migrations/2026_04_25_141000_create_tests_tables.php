<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tests', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('institution_id')->index();
            $table->foreignUlid('program_id')->index();
            $table->unsignedTinyInteger('semester')->index();
            $table->string('name');
            $table->unsignedInteger('maximum_marks');
            $table->unsignedInteger('minimum_passing_marks');
            $table->integer('academic_year');
            $table->timestamps();
        });

        Schema::create('test_course_outcomes', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('test_id')->constrained('tests')->cascadeOnDelete();
            $table->foreignUlid('course_outcome_id')->constrained('course_outcomes')->cascadeOnDelete();
            $table->unsignedInteger('assigned_marks');
            $table->timestamps();

            $table->unique(['test_id', 'course_outcome_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('test_course_outcomes');
        Schema::dropIfExists('tests');
    }
};
