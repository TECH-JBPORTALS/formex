<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('institution_calendar_uploads', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('institution_id')->index()->constrained()->cascadeOnDelete();
            $table->string('kind');
            $table->string('original_filename');
            $table->string('mime_type');
            $table->unsignedBigInteger('bytes');
            $table->string('disk')->default('local');
            $table->string('storage_path');
            $table->timestamps();

            $table->unique(['institution_id', 'kind']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('institution_calendar_uploads');
    }
};
