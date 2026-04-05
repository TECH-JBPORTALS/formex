<?php

namespace App\Providers;

use App\Models\PersonalAccessToken;
use Dedoc\Scramble\Scramble;
use Dedoc\Scramble\Support\Generator\Types\IntegerType;
use Dedoc\Scramble\Support\Generator\Types\ObjectType;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use Laravel\Sanctum\Sanctum;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Sanctum::usePersonalAccessTokenModel(PersonalAccessToken::class);

        Scramble::afterOpenApiGenerated(function ($openApi): void {
            $schema = $openApi->components->schemas['AuthSession'] ?? null;
            if (! $schema) {
                return;
            }

            $type = $schema->type;
            if (! $type instanceof ObjectType) {
                return;
            }

            $type->addProperty(
                'current_academic_year',
                (new IntegerType)->nullable(true),
            );
        });

        Route::bind('institution', function (string $value) {
            $user = request()->user();
            if (! $user) {
                abort(404);
            }

            return $user->institutions()->whereKey($value)->firstOrFail();
        });
    }
}
