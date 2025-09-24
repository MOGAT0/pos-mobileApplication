<?php
$log_file = __DIR__ . "/request_log.txt";
$lines = file_exists($log_file) ? file($log_file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) : [];

// Exclude specific endpoints
$exclude_patterns = [
    "fetch_items",
    "fetch_areas"
];

// Filter out excluded URIs
$filtered_lines = array_filter($lines, function($line) use ($exclude_patterns) {
    foreach ($exclude_patterns as $pattern) {
        if (strpos($line, $pattern) !== false) {
            return false;
        }
    }
    return true;
});

$last_lines = array_slice($filtered_lines, -50);
?>
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="refresh" content="2">
    <title>Server Request Monitor</title>
    <style>
        body { font-family: monospace; background: #111; color: #0f0; }
        h2 { color: #fff; }
        pre { background: #000; padding: 10px; border-radius: 5px; }
    </style>
</head>
<body>
    <h2>📡 Live Server Request Monitor</h2>
    <pre>
<?php
foreach ($last_lines as $line) {
    $display_line = str_replace("_", " ", $line);
    echo htmlspecialchars($display_line) . "\n";
}
?>
    </pre>
</body>
</html>
