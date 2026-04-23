<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('program_success_indices', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('program_id')->constrained()->cascadeOnDelete();
            $table->unsignedSmallInteger('academic_year');
            $table->unsignedInteger('admitted_count')->default(0);
            $table->unsignedInteger('passed_without_backlog_count')->default(0);
            $table->timestamps();

            $table->unique(['program_id', 'academic_year'], 'program_success_indices_program_year_uq');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('program_success_indices');
    }
};
