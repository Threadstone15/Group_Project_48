<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . '/../../vendor/autoload.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

include_once "../../logs/save.php";

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    logMessage("Handling preflight OPTIONS request.");
    http_response_code(204);
    exit();
}

session_start();

include_once "../../middleware/authMiddleware.php";
include_once "../models/User.php";
include_once "../models/Member.php";


$request_method = $_SERVER['REQUEST_METHOD'];


logMessage("Running auth in $request_method controller ");
$input = json_decode(file_get_contents("php://input"), true);
$rawInput = file_get_contents("php://input");
logMessage("Raw input: $rawInput");

if (isset($input['signup'])) {
    logMessage("Running signup....in auth controller");
    signup();
}
elseif (isset($input['login'])) {
    logMessage('running login...in auth controller');
    login();
}
elseif (isset($input['password_reset_mail_check'])) {
    logMessage("Running password reset....in auth controller");
    pass_reset();
}
elseif (isset($input['register_member'])) {
    logMessage('running member register...in auth controller');
    registerMember();
}
 else {
    echo json_encode(["error" => "Invalid action"]);
}




function signup()
{
    logMessage("signup function running...");

    $user = new User();

    // Get the raw input data and decode JSON
    $data = json_decode(file_get_contents("php://input"), true);

    // Validate that required fields exist
    if (
        isset($data['email']) &&
        isset($data['password']) &&
        isset($data['role'])
    ) {
        $email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
        $password = $data['password'];
        $role = filter_var($data['role'], FILTER_SANITIZE_STRING);

        $userData = $user->getUserByEmail($email);
        if ($userData){
            logMessage('Email already exists in the db');
            echo json_encode(["error" => "Email is already in use"]);
            exit();
        }

        if ($user->register($email, $password, $role)) {
            logMessage("User registered: $email with role: $role");
            echo json_encode(["message" => "User registered successfully"]);
        } else {
            logMessage("User registration failed: $email");
            echo json_encode(["error" => "User registration failed"]);
        }
    } else {
        logMessage("Invalid input data for user signup");
        http_response_code(400);  // Bad Request
        echo json_encode(["error" => "Invalid input data"]);
    }
}


function login()
{
    logMessage("login function running...");

    $user = new User();

    // Get the raw input data and decode JSON
    $data = json_decode(file_get_contents("php://input"), true);

    // Validate that required fields exist
    if (
        isset($data['email']) &&
        isset($data['password'])
    ) {
        $email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
        $password = $data['password'];

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
    } else {
        logMessage("Invalid input data for user login");
        http_response_code(400);  // Bad Request
        echo json_encode(["error" => "Invalid input data"]);
    }
}

function pass_reset()
{

    $data = json_decode(file_get_contents("php://input"), true);

    $email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
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
    

}

function logout()
{
    logMessage("logout function running...");

    $token = getBearerToken();  // Helper function to extract the token

    if (!$token) {
        echo json_encode(["error" => "Token missing"]);
        exit();
    }

    $payload = verifyToken($token);  // Validate the token

    if ($payload) {
        $email = $payload['user_id'] ?? 'Unknown User';
        logMessage("User logged out: $email");
        echo json_encode(["message" => "Logged out successfully"]);
    } else {
        echo json_encode(["error" => "Invalid or expired token"]);
    }
}

function registerMember()
{
    logMessage("register member function running...");

    $user = new User();
    $member = new Member();

    // Get the raw input data and decode JSON
    $data = json_decode(file_get_contents("php://input"), true);

    // Validate that required fields exist
    if (
        isset($data['firstName']) &&
        isset($data['lastName']) &&
        isset($data['email']) &&
        isset($data['password']) &&
        isset($data['dob']) &&
        isset($data['address']) &&
        isset($data['phone']) &&
        isset($data['gender'])
    ) {
        $firstName = filter_var($data['firstName'], FILTER_SANITIZE_STRING);
        $lastName = filter_var($data['lastName'], FILTER_SANITIZE_STRING);
        $dob = $data['dob'];  
        $phone = $data['phone'];
        $address = $data['address'];
        $gender = $data['gender'];

        $email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
        $password = $data['password'];
        $role = 'member';

        $userData = $user->getUserByEmail($email);
        if ($userData){
            logMessage('Email already exists in the db');
            echo json_encode(["error" => "Email is already in use"]);
            exit();
        }

        if ($user->register($email, $password, $role)) {
            logMessage("User registered: $email");
    
            // Get the user_id for the newly registered user
            $userData = $user->getUserByEmail($email);
            if ($userData) {
                $user_id = $userData['user_id'];
    
                logMessage("Entering to members: $user_id");
    
                // Register the member using the user_id
                if ($member->registerMember($user_id, $firstName, $lastName, $dob, $phone, $address, $gender)) {
                    logMessage("Member registered successfully with user ID: $user_id");
                    echo json_encode(["message" => "User and Member registered successfully"]);
                } else {
                    logMessage("Member registration failed for user ID: $user_id");
                    echo json_encode(["error" => "Member registration failed"]);
                }
            } else {
                logMessage("User not found after registration: $email");
                echo json_encode(["error" => "User registration successful, but user data not found"]);
            }
        } else {
            logMessage("User registration failed: $email");
            echo json_encode(["error" => "User registration failed"]);
        }
    } else {
        logMessage("Invalid input data for member registration");
        http_response_code(400);  // Bad Request
        echo json_encode(["error" => "Invalid input data"]);
    }
}




?>