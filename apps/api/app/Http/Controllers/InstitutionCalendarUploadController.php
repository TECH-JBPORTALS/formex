<?php

namespace App\Http\Controllers;

use App\Models\InstitutionCalendarUpload;
use App\Support\CurrentInstitutionSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class InstitutionCalendarUploadController
{
    /** @var array<int, string> */
    private const array KINDS = ['dcet_events', 'academic_calendar'];

    private function uploadDisk(): string
    {
        return (string) config('filesystems.calendar_uploads_disk', 's3');
    }

    public function index(Request $request)
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);

        $payload = [];
        foreach (self::KINDS as $kind) {
            $upload = InstitutionCalendarUpload::query()
                ->where('institution_id', $institution->id)
                ->where('kind', $kind)
                ->first();

            $payload[$kind] = $upload === null ? null : [
                'kind' => $upload->kind,
                'original_filename' => $upload->original_filename,
                'mime_type' => $upload->mime_type,
                'size' => $upload->bytes,
                'updated_at' => optional($upload->updated_at)->toISOString(),
            ];
        }

        return response()->json([
            'data' => $payload,
        ]);
    }

    public function store(Request $request)
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);

        $validated = $request->validate([
            'kind' => ['required', 'string', Rule::in(self::KINDS)],
            'file' => ['required', 'file', 'max:12288', 'mimes:pdf,jpg,jpeg,png'],
        ]);

        $file = $validated['file'];
        $kind = $validated['kind'];

        $disk = $this->uploadDisk();
        $directory = 'calendar-uploads/'.$institution->id;
        $path = $file->store($directory, $disk);

        $previous = InstitutionCalendarUpload::query()
            ->where('institution_id', $institution->id)
            ->where('kind', $kind)
            ->first();

        if ($previous !== null) {
            Storage::disk($previous->disk)->delete($previous->storage_path);
            $previous->delete();
        }

        InstitutionCalendarUpload::query()->create([
            'institution_id' => $institution->id,
            'kind' => $kind,
            'original_filename' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType() ?? 'application/octet-stream',
            'bytes' => $file->getSize(),
            'disk' => $disk,
            'storage_path' => $path,
        ]);

        return response()->json([
            'message' => 'Calendar file uploaded successfully.',
        ], 201);
    }

    public function destroy(Request $request, string $kind)
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);

        if (! in_array($kind, self::KINDS, true)) {
            abort(404);
        }

        $upload = InstitutionCalendarUpload::query()
            ->where('institution_id', $institution->id)
            ->where('kind', $kind)
            ->first();

        if ($upload === null) {
            abort(404);
        }

        Storage::disk($upload->disk)->delete($upload->storage_path);
        $upload->delete();

        return response()->json([
            'message' => 'Calendar file removed successfully.',
        ]);
    }

    public function download(Request $request, string $kind)
    {
        $institution = CurrentInstitutionSession::requireInstitution($request);

        if (! in_array($kind, self::KINDS, true)) {
            abort(404);
        }

        $upload = InstitutionCalendarUpload::query()
            ->where('institution_id', $institution->id)
            ->where('kind', $kind)
            ->first();

        if ($upload === null) {
            abort(404);
        }

        $disk = Storage::disk($upload->disk);

        if (! $disk->exists($upload->storage_path)) {
            abort(404);
        }

        return $disk->response($upload->storage_path, $upload->original_filename, [
            'Content-Type' => $upload->mime_type,
        ]);
    }
}
