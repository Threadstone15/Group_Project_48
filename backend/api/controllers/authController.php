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
include_once '../../config/token.php';

$conn = include_once "../../config/database.php";  // Corrected line to include the connection
$user = new User($conn);

$request_method = $_SERVER['REQUEST_METHOD'];
logMessage("Running: $request_method");

// Register User
if ($request_method == 'POST' && isset($_POST['signup'])) {
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
if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $email = filter_var($_GET['email'], FILTER_SANITIZE_EMAIL);
    $password = $_GET['password'];

    // Assuming $user is your User class instance that has the login method
    $userData = $user->login($email, $password);

    if ($userData && password_verify($password, $userData['password'])) {
        // User authenticated, generate token
        $token = generateToken($userData['user_id']);  // Token is generated using the separate function

        // Respond with token and user role
        echo json_encode([
            "message" => "Login successful",
            "role" => $userData['role'],
            "token" => $token  // Send the token to the frontend
        ]);
    } else {
        echo json_encode(["error" => "Invalid credentials"]);
    }
}



// Logout User
if ($request_method == 'POST' && isset($_POST['logout'])) {
    $email = $_SESSION['email'] ?? 'Unknown User';
    session_destroy();
    logMessage("User logged out: $email");
    echo json_encode(["message" => "Logged out successfully"]);
}
?>
