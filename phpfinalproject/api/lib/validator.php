<?php
declare(strict_types=1);

/**
 * Reads and checks fields from request data, collecting a message per invalid field.
 * Call validate() after reading every field to send all errors back at once (HTTP 422).
 */
final class Validator
{
    /** @var array<string, string> */
    private array $errors = [];

    public function __construct(private readonly array $data)
    {
    }

    public function string(string $field, int $max, bool $required = true, int $min = 1): ?string
    {
        $value = $this->data[$field] ?? null;
        if ($value === null || (is_string($value) && trim($value) === '')) {
            return $this->missing($field, $required);
        }
        if (!is_string($value) && !is_int($value) && !is_float($value)) {
            return $this->fail($field, 'Must be text.');
        }

        $value = trim((string) $value);
        $length = mb_strlen($value);
        if ($length < $min) {
            return $this->fail($field, "Must be at least $min characters.");
        }
        if ($length > $max) {
            return $this->fail($field, "Must be at most $max characters.");
        }
        return $value;
    }

    public function email(string $field): ?string
    {
        $value = $this->string($field, 190);
        if ($value !== null && filter_var($value, FILTER_VALIDATE_EMAIL) === false) {
            return $this->fail($field, 'Enter a valid email address.');
        }
        return $value === null ? null : strtolower($value);
    }

    /** Passwords are not trimmed. bcrypt only uses the first 72 bytes, hence the limit. */
    public function password(string $field, int $min = 8): ?string
    {
        $value = $this->data[$field] ?? null;
        if (!is_string($value) || $value === '') {
            return $this->missing($field, true);
        }
        if (strlen($value) < $min) {
            return $this->fail($field, "Must be at least $min characters.");
        }
        if (strlen($value) > 72) {
            return $this->fail($field, 'Must be at most 72 characters.');
        }
        return $value;
    }

    public function int(string $field, int $min, int $max, bool $required = true): ?int
    {
        $value = $this->data[$field] ?? null;
        if ($value === null || $value === '') {
            return $this->missing($field, $required);
        }
        $int = filter_var($value, FILTER_VALIDATE_INT);
        if ($int === false || $int < $min || $int > $max) {
            return $this->fail($field, "Must be a whole number between $min and $max.");
        }
        return $int;
    }

    public function number(string $field, float $min, float $max): ?float
    {
        $value = $this->data[$field] ?? null;
        if ($value === null || $value === '') {
            return $this->missing($field, true);
        }
        if (!is_numeric($value) || (float) $value < $min || (float) $value > $max) {
            return $this->fail($field, "Must be a number between $min and $max.");
        }
        return round((float) $value, 2);
    }

    public function bool(string $field, bool $default): bool
    {
        $value = $this->data[$field] ?? $default;
        return filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? $default;
    }

    public function oneOf(string $field, array $allowed): ?string
    {
        $value = $this->data[$field] ?? null;
        if ($value === null || $value === '') {
            return $this->missing($field, true);
        }
        if (!in_array($value, $allowed, true)) {
            return $this->fail($field, 'Must be one of: ' . implode(', ', $allowed) . '.');
        }
        return $value;
    }

    /** A date in YYYY-MM-DD format. */
    public function date(string $field): ?DateTimeImmutable
    {
        $value = $this->data[$field] ?? null;
        if (!is_string($value) || $value === '') {
            return $this->missing($field, true);
        }
        $date = DateTimeImmutable::createFromFormat('!Y-m-d', $value);
        if ($date === false || $date->format('Y-m-d') !== $value) {
            return $this->fail($field, 'Must be a date in YYYY-MM-DD format.');
        }
        return $date;
    }

    /** An image URL: either a path on this site ("/uploads/x.jpg") or an http(s) URL. */
    public function imageUrl(string $field, bool $required = true): ?string
    {
        $value = $this->string($field, 500, $required);
        if ($value !== null && !preg_match('#^(/[^/\\\\]|https?://)#i', $value)) {
            return $this->fail($field, 'Must be a site path starting with "/" or an http(s) URL.');
        }
        return $value;
    }

    /** @return string[] */
    public function imageUrlList(string $field, int $maxItems): array
    {
        $urls = $this->stringList($field, $maxItems, 500);
        foreach ($urls as $url) {
            if (!preg_match('#^(/[^/\\\\]|https?://)#i', $url)) {
                $this->fail($field, 'Each image must be a site path starting with "/" or an http(s) URL.');
                return [];
            }
        }
        return $urls;
    }

    /** @return string[] */
    public function stringList(string $field, int $maxItems, int $maxLength): array
    {
        $value = $this->data[$field] ?? [];
        if (!is_array($value)) {
            $this->fail($field, 'Must be a list.');
            return [];
        }

        $items = [];
        foreach ($value as $item) {
            if (!is_string($item)) {
                $this->fail($field, 'Every item must be text.');
                return [];
            }
            $item = trim($item);
            if ($item === '') {
                continue;
            }
            if (mb_strlen($item) > $maxLength) {
                $this->fail($field, "Each item must be at most $maxLength characters.");
                return [];
            }
            $items[] = $item;
        }

        if (count($items) > $maxItems) {
            $this->fail($field, "At most $maxItems items are allowed.");
            return [];
        }
        return $items;
    }

    /** Records an error that is checked after the basic field rules (e.g. comparing two dates). */
    public function addError(string $field, string $message): void
    {
        $this->errors[$field] ??= $message;
    }

    public function validate(): void
    {
        if ($this->errors) {
            abort(422, reset($this->errors), $this->errors);
        }
    }

    private function missing(string $field, bool $required): mixed
    {
        if ($required) {
            $this->fail($field, 'This field is required.');
        }
        return null;
    }

    private function fail(string $field, string $message): mixed
    {
        $this->errors[$field] ??= $message;
        return null;
    }
}
