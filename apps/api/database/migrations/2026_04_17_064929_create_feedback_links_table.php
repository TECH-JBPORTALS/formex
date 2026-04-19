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
        Schema::create('feedback_links', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('institution_id')->index()->constrained('institutions')->cascadeOnDelete();
            $table->foreignUlid('course_id')->index()->constrained('programs')->cascadeOnDelete();
            $table->foreignUlid('created_by_user_id')->index()->constrained('users');
            $table->unsignedInteger('semester');
            $table->unsignedInteger('academic_year');
            $table->enum('feedback_type', ['mid', 'end']);
            $table->string('token_hash', 64)->unique();
            $table->timestamp('expires_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['institution_id', 'course_id', 'semester', 'academic_year', 'feedback_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('feedback_links');
    }
};
