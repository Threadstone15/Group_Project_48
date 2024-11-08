<?php

// api/controllers/authController.php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json'); // Set content type to JSON

session_start();
include_once "../models/User.php";
include_once "../models/Member.php"; // Include Member model
include_once "../../middleware/authMiddleware.php";
include_once "../../logs/save.php";

$conn = include_once "../../config/database.php";
$user = new User($conn);
$member = new Member($conn);

$request_method = $_SERVER['REQUEST_METHOD'];
logMessage("Running: $request_method");

// Register User and Member
if ($request_method == 'POST' && isset($_POST['signup'])) {

    logMessage("Running Member Sign-up");

    // Get the user data from the request
    $email = filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);
    $password = $_POST['password'];
    $firstName = filter_var($_POST['firstName'], FILTER_SANITIZE_STRING);
    $lastName = filter_var($_POST['lastName'], FILTER_SANITIZE_STRING);
    $dob = $_POST['dob'];  // Assuming this is sent as yyyy-mm-dd
    $phone = $_POST['phone'];
    $address = $_POST['address'];
    $gender = $_POST['gender'];
    $role = 'member';  // Assuming the role is member for this example

    logMessage("Details: $email , $password, $role");

    // Register user
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
}

?>
