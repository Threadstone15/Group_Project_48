<?php
require_once __DIR__ . '/../logs/save.php';

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "gp_48";
$port = 3306;

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname, $port);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
} else {
    echo "Connected successfully to database: " . $dbname;
    logMessage("Connected successfully to database: " . $dbname);
}
