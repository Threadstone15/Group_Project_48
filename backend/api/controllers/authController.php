<?php


use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . '/../../vendor/autoload.php'; // Adjust path to the vendor directory

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
include_once "../models/User.php"; // Include the User model
include_once "../../middleware/authMiddleware.php"; // Include the authentication middleware if needed

$request_method = $_SERVER['REQUEST_METHOD'];
logMessage("Running: $request_method");
logMessage("Running auth controller");

// Read JSON input
$input = json_decode(file_get_contents("php://input"), true);

$rawInput = file_get_contents("php://input");
logMessage("Raw input: $rawInput");

logMessage("step...1");

// Check if input is set and is an array
if (is_array($input)) {
    logMessage("step...2");

    // Register User
    if ($request_method == 'POST' && isset($input['signup'])) {
        logMessage("Running Sign-up");

        $email = filter_var($input['email'], FILTER_SANITIZE_EMAIL);
        $password = $input['password'];
        $role = filter_var($input['role'], FILTER_SANITIZE_STRING);

        logMessage("Request received: $email with role: $role");

        // Instantiate User model and call register method
        $user = new User();
        if ($user->register($email, $password, $role)) {
            logMessage("User registered: $email with role: $role");
            echo json_encode(["message" => "User registered successfully"]);
        } else {
            logMessage("User registration failed: $email");
            echo json_encode(["error" => "User registration failed"]);
        }
    }



    if ($request_method == 'POST' && isset($input['password_reset_mail_check'])) {
        logMessage("Received POST request for password reset.");
    
        $email = filter_var($input['email'], FILTER_SANITIZE_EMAIL);
        logMessage("Sanitized email: $email");
    
        $user = new User();
    
        // Check if the user exists
        if ($user->userExists($email)) {
            logMessage("User exists for email: $email");
    
            // Generate a password reset token
            try {
                $token = bin2hex(random_bytes(32));
                logMessage("Generated password reset token for email: $email");
    
                $reset_link = "https://yourwebsite.com/reset-password?token=$token";
                logMessage("Generated reset link: $reset_link");
    
                // Send the email using PHPMailer
                $mail = new PHPMailer(true);
    
                try {
                    // SMTP configuration
                    logMessage("Configuring PHPMailer for email sending.");
                    $mail->isSMTP();
                    $mail->Host = 'smtp.gmail.com'; // Gmail SMTP server
                    $mail->SMTPAuth = true;
                    $mail->Username = 'gymverse.services@gmail.com'; // Replace with your SMTP username
                    $mail->Password = 'tizz sjfn wrwl gayt'; // Replace with your SMTP password
                    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
                    $mail->Port = 587;
    
                    // Email settings
                    $mail->setFrom('no-reply@yourwebsite.com', 'Your Team');
                    $mail->addAddress($email);
                    $mail->Subject = "Password Reset Request";
                    $mail->Body = "Hello,\n\nWe received a request to reset your password. Click the link below to reset it:\n\n$reset_link\n\nIf you didn't request this, you can safely ignore this email.\n\nBest Regards,\nYour Team";
    
                    logMessage("Attempting to send email to: $email");
                    $mail->send();
                    logMessage("Password reset email sent successfully to: $email");
                    
                    echo json_encode(["success" => true, "message" => "Password reset email sent."]);
    
                    // Optionally, save the token to the database for validation later
                    // $user->saveResetToken($email, $token);
                    logMessage("Reset token saved for email: $email");
    
                } catch (Exception $e) {
                    logMessage("Failed to send password reset email to: $email. PHPMailer Error: " . $mail->ErrorInfo);
                    echo json_encode(["success" => false, "message" => "Failed to send email."]);
                }
    
            } catch (Exception $e) {
                logMessage("Failed to generate token for email: $email. Error: " . $e->getMessage());
                echo json_encode(["success" => false, "message" => "An error occurred while processing your request."]);
            }
    
        } else {
            logMessage("No account found for email: $email");
            echo json_encode(["success" => false, "message" => "No account found for this email."]);
        }
    } else {
        logMessage("Invalid request method or missing parameter: password_reset_mail_check");
        echo json_encode(["success" => false, "message" => "Invalid request."]);
    }
    

    

    // Login User
    if ($request_method == 'POST' && isset($input['login'])) {
        logMessage("Running log-in");

        $email = filter_var($input['email'], FILTER_SANITIZE_EMAIL);
        $password = $input['password'];

        // Instantiate User model and call login method
        $user = new User();
        $userData = $user->login($email, $password);

        if ($userData) {
            if (password_verify($password, $userData['password'])) {
                $token = generateToken($userData['user_id']);
                $role = $userData['role'];
                logMessage("Login Successful: $token $role");

                // Set the HTTP status code for successful login
                http_response_code(200);

                // Respond with a success message and token
                $response = [
                    "success" => true,
                    "message" => "Login successful",
                    "role" => $role,
                    "token" => $token
                ];
            } else {
                // Incorrect password, return error response
                http_response_code(401); // Unauthorized
                $response = [
                    "success" => false,
                    "error" => "Invalid credentials"
                ];
            }
        } else {
            // User not found, return error response
            http_response_code(404); // Not Found
            $response = [
                "success" => false,
                "error" => "User not found"
            ];
        }

        // Send the response as JSON
        echo json_encode($response);

        // Ensure that the script stops after sending the response
        exit;
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

    




} else {
    // If the input is not in the expected format
    http_response_code(400);  // Bad Request
    echo json_encode(["error" => "Invalid input format"]);
}

?>
