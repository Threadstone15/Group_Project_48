<?php

// api/controllers/trainerController.php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json'); // Set content type to JSON

session_start();
include_once "../models/User.php";
include_once "../models/Trainer.php"; // Include Trainer model
include_once "../../middleware/authMiddleware.php";
include_once "../../logs/save.php";

$conn = include_once "../../config/database.php";
$user = new User($conn);
$trainer = new Trainer($conn);

$request_method = $_SERVER['REQUEST_METHOD'];
logMessage("Running: $request_method");

// Register User and Trainer
if ($request_method == 'POST' && isset($_POST['signup'])) {

    logMessage("Running Trainer Sign-up");

    // Get the user data from the request
    $email = filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);
    $password = $_POST['password'];
    $firstName = filter_var($_POST['firstName'], FILTER_SANITIZE_STRING);
    $lastName = filter_var($_POST['lastName'], FILTER_SANITIZE_STRING);
    $NIC = $_POST['NIC']; 
    $dob = $_POST['dob'];  // Assuming this is sent as yyyy-mm-dd
    $address = $_POST['address'];
    $mobile_number = $_POST['mobile_number'];
    $years_of_experience = $_POST['years_of_experience'];
    $specialties = $_POST['specialties'];
    $cv_link = $_POST['cv_link'];
    $role = 'trainer';  // Assuming the role is trainer for this example

    logMessage("Details: $email , $password, $role");

    // Register user
    if ($user->register($email, $password, $role)) {
        logMessage("User registered: $email");

        // Get the user_id for the newly registered user
        $userData = $user->getUserByEmail($email);
        if ($userData) {
            $user_id = $userData['user_id'];

            logMessage("Entering to trainers: $user_id");

            // Register the trainer using the user_id
            if ($trainer->registerTrainer($user_id, $firstName, $lastName, $NIC, $dob, $address, $mobile_number, $years_of_experience, $specialties, $cv_link)) {
                logMessage("Trainer registered successfully with user ID: $user_id");
                echo json_encode(["message" => "User and Trainer registered successfully"]);
            } else {
                logMessage("Trainer registration failed for user ID: $user_id");
                echo json_encode(["error" => "Trainer registration failed"]);
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
