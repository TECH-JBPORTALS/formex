<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('students', function (Blueprint $table) {
            $table->ulid('id')->primary();

            $table->string('full_name');
            $table->date('date_of_birth')->nullable();

            $table->foreignUlid('institution_id')->index();
            $table->foreignUlid('program_id')->index();

            $table->integer('semester');
            $table->integer('academic_year');

            $table->string('register_no')->nullable();

            $table->string('gender')->nullable();
            $table->string('category')->nullable();

            $table->string('email')->nullable();
            $table->string('mobile')->nullable();

            $table->string('appar_id')->nullable();

            $table->timestamps();

        });
    }

    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
