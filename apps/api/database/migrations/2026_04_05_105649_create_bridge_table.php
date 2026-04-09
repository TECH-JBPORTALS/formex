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
        Schema::create('bridge', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('institution_id')->index();
            $table->foreignUlid('program_id')->index();
            $table->foreignUlid('course_coordinator_id')->index();
            $table->foreignUlid('subject_id')->index();
            $table->text('curriculum_gap');
            $table->text('details');
            $table->date('conducted_date');
            $table->string('venue');
            $table->string('resource_person_name');
            $table->string('company_name');
            $table->string('designation');
            $table->integer('students_present');
            $table->text('relevance');
            $table->integer('academic_year');
            $table->integer('semester');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bridge');
    }
};
