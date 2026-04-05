<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('room_reports', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('institution_id')->index();
            $table->foreignUlid('program_id')->index();
            $table->foreignUlid('subject_id')->index();
            $table->foreignUlid('users_id')->index();
            $table->string('room_number');
            $table->integer('academic_year');
            $table->integer('semester');
            $table->integer('strength');
            $table->integer('present');
            $table->string('attendance_register');
            $table->string('student_attendance');
            $table->string('topic_planned');
            $table->string('topic_taught');
            $table->string('pedagogy_used');
            $table->string('aids_used');
            $table->string('teaching_skill');
            $table->string('interaction');
            $table->string('learning_outcome');
            $table->string('valuation');
            $table->string('principal_remarks');
            $table->date('report_date');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('room_reports');
    }
};
