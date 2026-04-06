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
        Schema::create('skill_programs', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('program_id')->index();
            $table->foreignUlid('institution_id')->index();
            $table->foreignUlid('student_id')->index();
            $table->integer('semester');
            $table->string('details');
            $table->string('resource_person_name');
            $table->string('company_name');
            $table->string('designation');
            $table->date('conducted_date');
            $table->integer('academic_year');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('skill_programs');
    }
};
