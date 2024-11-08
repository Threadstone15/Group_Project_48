<?php
// db_connection.php

require_once __DIR__ . '/../logs/save.php'; // Adjust path if needed

$servername = "mysql-rad.alwaysdata.net"; 
$username = "rad";                          
$password = "ucsc_rad_123";                 
$dbname = "rad_gymverse";                   

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname, 3306);

// Check connection
if ($conn->connect_error) {
    logMessage("Connection failed: " . $conn->connect_error);
    die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
} else {
    logMessage("Connection established successfully to the database: $dbname");
}

// Return the connection object so that it can be used elsewhere
return $conn;
?>
