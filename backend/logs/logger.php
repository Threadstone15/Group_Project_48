<?php
$logFile = 'log.txt';  // Replace with your log file path

if (!file_exists($logFile)) {
    die("Log file not found.");
}

while (true) {
    clearstatcache(); // Clear cache for file modification time
    $lastModified = filemtime($logFile); // Get the last modified time of the log file

    // Read the log file
    $lines = file($logFile);

    // Output the contents
    foreach ($lines as $line) {
        echo $line . "<br>"; // Change to \n for CLI output
    }

    flush(); // Flush the output buffer
    ob_flush(); // Ensure the output is sent to the browser

    // Sleep for a few seconds before checking again
    sleep(2);
}
?>
