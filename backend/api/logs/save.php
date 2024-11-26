<?php
function logMessage($message) {
    // Define the log file paths
    $path1 = __DIR__ . '/../logs/log.txt';  // Adjust based on your directory structure
    $path2 = __DIR__ . '/../../logs/log.txt'; // Alternate path

    // Check if the first path exists, if not, use the second path
    if (file_exists($path1)) {
        $logFile = $path1;
    } elseif (file_exists($path2)) {
        $logFile = $path2;
    } else {
        // If neither path exists, return an error message
        return "Log file not found.";
    }

    // Format the message with a timestamp
    $formattedMessage = "[" . date("Y-m-d H:i:s") . "] " . $message . PHP_EOL;

    // Append the message to the log file
    file_put_contents($logFile, $formattedMessage, FILE_APPEND);
}

// Example usage
logMessage("This is a test log entry.");
?>
