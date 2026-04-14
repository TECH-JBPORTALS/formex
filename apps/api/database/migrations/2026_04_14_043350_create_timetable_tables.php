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
        Schema::create('time_tables', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->unsignedInteger('semester');
            $table->unsignedInteger('academic_year');
            $table->foreignUlid('program_id')->index()->constrained('programs');
            $table->timestamps();
        });

        Schema::create('time_table_slots', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->unsignedInteger('start_hour_no');
            $table->unsignedInteger('end_hour_no');
            $table->string('day');
            $table->foreignUlid('time_table_id')->index()->constrained('time_tables')->cascadeOnDelete();
            $table->timestamps();
        });

        Schema::create('time_table_slot_subjects', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('subject_id')->index()->constrained('subjects')->cascadeOnDelete();
            $table->foreignUlid('course_coordinator_id')->index()->constrained('users');
            $table->foreignUlid('time_table_slot_id')->index()->constrained('time_table_slots')->cascadeOnDelete();
            $table->text('batch');
            $table->text('room_no');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('time_table_slot_subjects');
        Schema::dropIfExists('time_table_slots');
        Schema::dropIfExists('time_tables');
    }
};
