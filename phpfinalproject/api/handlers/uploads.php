<?php
declare(strict_types=1);

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const IMAGE_EXTENSIONS = [
    'image/jpeg' => 'jpg',
    'image/png' => 'png',
    'image/webp' => 'webp',
];

/** Admin: upload a vehicle photo (multipart field "image"). Returns its public URL. */
function uploads_store(): never
{
    require_admin();

    $file = $_FILES['image'] ?? null;
    if ($file === null || is_array($file['error'])) {
        abort(400, 'No image was uploaded.');
    }
    if (in_array($file['error'], [UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE], true) || $file['size'] > MAX_UPLOAD_BYTES) {
        abort(413, 'The image is too large. The maximum size is 5 MB.');
    }
    if ($file['error'] !== UPLOAD_ERR_OK) {
        abort(400, 'The upload failed. Please try again.');
    }

    // Trust the file's actual contents, never the name or type the browser sent.
    $mime = (new finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']);
    $extension = IMAGE_EXTENSIONS[$mime] ?? abort(415, 'Only JPG, PNG or WebP images are allowed.');

    $dir = config()['upload_dir'];
    if (!is_dir($dir) && !mkdir($dir, 0755, true)) {
        throw new RuntimeException("Could not create the upload folder: $dir");
    }

    $name = bin2hex(random_bytes(16)) . '.' . $extension;
    if (!move_uploaded_file($file['tmp_name'], "$dir/$name")) {
        throw new RuntimeException("Could not save the uploaded file to $dir");
    }

    json_response(['url' => rtrim(config()['upload_url'], '/') . '/' . $name], 201);
}
