<?php

use Illuminate\Support\Facades\Artisan;

test('openapi export produces valid document', function () {
    $path = storage_path('app/openapi-export-test.json');

    if (file_exists($path)) {
        unlink($path);
    }

    $code = Artisan::call('scramble:export', [
        '--path' => $path,
    ]);

    expect($code)->toBe(0);
    expect(file_exists($path))->toBeTrue();

    $json = json_decode(file_get_contents($path), true, 512, JSON_THROW_ON_ERROR);

    expect($json['openapi'] ?? null)->toStartWith('3.');
    expect($json['paths'])->toBeArray()->not->toBeEmpty();

    unlink($path);
});
