<?php

// api/controllers/authController.php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json'); // Set content type to JSON

include_once "../../logs/save.php";

// Handle preflight (OPTIONS) requests for CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    logMessage("Handling preflight OPTIONS request.");
    http_response_code(204);  // No Content
    exit();
}

session_start();
include_once "../models/User.php";
include_once "../../middleware/authMiddleware.php";

$conn = include_once "../../config/database.php";  // Corrected line to include the connection
$user = new User($conn);

$request_method = $_SERVER['REQUEST_METHOD'];
logMessage("Running: $request_method");
logMessage("Running auth controller");

// Read JSON input
$input = json_decode(file_get_contents("php://input"), true);

// Check if input is set and is an array
if (is_array($input)) {

    // Register User
    if ($request_method == 'POST' && isset($input['signup'])) {
        logMessage("Running Sign-up");

        $email = filter_var($input['email'], FILTER_SANITIZE_EMAIL);
        $password = $input['password'];
        $role = filter_var($input['role'], FILTER_SANITIZE_STRING);

        logMessage("Request received: $email with role: $role");

        if ($user->register($email, $password, $role)) {
            logMessage("User registered: $email with role: $role");
            echo json_encode(["message" => "User registered successfully"]);
        } else {
            logMessage("User registration failed: $email");
            echo json_encode(["error" => "User registration failed"]);
        }
    }

    // Login User
    if ($request_method == 'POST' && isset($input['login'])) {
        logMessage("Running log-in");

        $email = filter_var($input['email'], FILTER_SANITIZE_EMAIL);
        $password = $input['password'];

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
    if ($request_method == 'POST' && isset($input['logout'])) {
        $token = getBearerToken();  // Helper function to extract the token

        if (!$token) {
            echo json_encode(["error" => "Token missing"]);
            exit();
        }

        $payload = verifyToken($token, $secretkey);  // Validate the token

        if ($payload) {
            $email = $payload['user_id'] ?? 'Unknown User';
            logMessage("User logged out: $email");
            echo json_encode(["message" => "Logged out successfully"]);
        } else {
            echo json_encode(["error" => "Invalid or expired token"]);
        }
    }
}
?>
