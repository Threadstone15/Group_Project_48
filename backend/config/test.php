<?php
// Include the database connection file
$conn = include_once "database.php"; // Ensure the correct path

// Check if the connection was successful
if ($conn === false) {
    die("Error: Could not connect to the database.");
}

// Insert data into the "users" table
$email = "john.doe@example.com";
$password = password_hash("password123", PASSWORD_DEFAULT); // Always hash passwords
$role = "member"; // Role can be 'trainer', 'owner', 'staff', or 'member'

// Prepare the SQL query
$query = "INSERT INTO users (email, password, role) VALUES (?, ?, ?)";
$stmt = $conn->prepare($query);

// Check if statement preparation was successful
if ($stmt === false) {
    logMessage("Error preparing statement: " . $conn->error);
    die("Error: Could not prepare SQL statement.");
}

// Bind parameters to the query
$stmt->bind_param("sss", $email, $password, $role);

// Execute the query
if ($stmt->execute()) {
    echo json_encode(["message" => "Data inserted successfully"]);
} else {
    logMessage("Error executing query: " . $stmt->error);
    echo json_encode(["error" => "Failed to insert data"]);
}

// Close the statement and connection
$stmt->close();
$conn->close();
?>
