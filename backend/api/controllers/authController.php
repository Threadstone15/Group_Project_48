<?php


// api/controllers/authController.php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json'); // Set content type to JSON

session_start();
include_once "../models/User.php";
include_once "../../middleware/authMiddleware.php";
include_once "../../logs/save.php";

$conn = include_once "../../config/database.php";  // Corrected line to include the connection
$user = new User($conn);

$request_method = $_SERVER['REQUEST_METHOD'];
logMessage("Running: $request_method");

// Register User
if ($request_method == 'POST' && isset($_POST['signup'])) {

    logMessage("Running Sign-up");
     
    $email = filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);
    $password = $_POST['password'];
    $role = filter_var($_POST['role'], FILTER_SANITIZE_STRING);  // trainer, owner, staff, member

    logMessage("Request received: $email with role: $role"); // Removed password logging

    if ($user->register($email, $password, $role)) {
        logMessage("User registered: $email with role: $role");
        echo json_encode(["message" => "User registered successfully"]);
    } else {
        logMessage("User registration failed: $email");
        echo json_encode(["error" => "User registration failed"]);
    }
}

// Login User
// Handle login with GET request
// Login User
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['login'])) {
    logMessage("Running log-in");

    $email = filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);
    $password = $_POST['password'];

    // Get user data
    $userData = $user->login($email, $password);

    if ($userData) {
        if (password_verify($password, $userData['password'])) {
            $token = generateToken($userData['user_id']);
            $role = $userData['role'];
            logMessage("Login Successful: $token $role");
            echo json_encode(["message" => "Login successful", "role" => $role, "token" => $token]);
        } else {
            echo json_encode(["error" => "Invalid credentials"]);
        }
    } else {
        echo json_encode(["error" => "User not found"]);
    }
}




// Logout User
if ($request_method == 'POST' && isset($_POST['logout'])) {
    // Get the token from the Authorization header
    $token = getBearerToken();  // Helper function to extract the token

    if (!$token) {
        echo json_encode(["error" => "Token missing"]);
        exit();
    }

    // Verify the token
    $payload = verifyToken($token, $secretkey);  // Function to validate the token

    // If the token is valid, proceed with the logout
    if ($payload) {
        // Logging user out (no need for session_destroy since we use tokens)
        $email = $payload['user_id'] ?? 'Unknown User';  // Retrieve email or user ID from token
        logMessage("User logged out: $email");

        // Send response that the user has logged out successfully
        echo json_encode(["message" => "Logged out successfully"]);
    } else {
        echo json_encode(["error" => "Invalid or expired token"]);
    }
}

?>
