<?php
// staffHandler.php

include_once "../models/Staff.php";
include_once "../models/User.php";
include_once "../../logs/save.php";
include_once "accountMail.php";

function generateRandomPassword($length = 8) {
    $lowercase = 'abcdefghijklmnopqrstuvwxyz';
    $uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $digits = '0123456789';
    $specialChars = '!@#$%^&*()-_=+[]{}<>?';


    $allChars = $lowercase . $uppercase . $digits . $specialChars;

    $password = $lowercase[random_int(0, strlen($lowercase) - 1)] .
                $uppercase[random_int(0, strlen($uppercase) - 1)] .
                $digits[random_int(0, strlen($digits) - 1)] .
                $specialChars[random_int(0, strlen($specialChars) - 1)];

    for ($i = 4; $i < $length; $i++) {
        $password .= $allChars[random_int(0, strlen($allChars) - 1)];
    }

    return str_shuffle($password);
}


// Add new staff
function addStaff($user_id) {
    logMessage("Add staff function running...");

    $staff = new Staff();

    $role = filter_var($_POST['role'], FILTER_SANITIZE_STRING);
    $email = filter_var($_POST['email'], FILTER_SANITIZE_STRING);
    $password = generateRandomPassword();


    $firstName = filter_var($_POST['first_name'], FILTER_SANITIZE_STRING);
    $lastName = filter_var($_POST['last_name'], FILTER_SANITIZE_STRING);
    $dob = filter_var($_POST['DOB'], FILTER_SANITIZE_STRING);
    $phone = filter_var($_POST['phone'], FILTER_SANITIZE_STRING);
    $address = filter_var($_POST['address'], FILTER_SANITIZE_STRING);
    $gender = filter_var($_POST['gender'], FILTER_SANITIZE_STRING);

    if ($staff->createStaff($role, $user_id, $firstName, $lastName, $dob, $phone, $address, $gender)) {
        logMessage("Staff added successfully: $firstName $lastName");
        account_creation($email, $password);
        echo json_encode(["message" => "Staff added successfully"]);
    } else {
        logMessage("Failed to add staff: $firstName $lastName");
        echo json_encode(["error" => "Staff addition failed"]);
    }
}

// Get all staff or a specific staff by ID
function getStaff() {
    logMessage("Get staff function running...");

    $staff = new Staff();
    $staff_id = isset($_GET['staff_id']) ? filter_var($_GET['staff_id'], FILTER_SANITIZE_STRING) : null;

    $staffRecords = $staff_id ? [$staff->getStaffById($staff_id)] : $staff->getAllStaff();
    if ($staffRecords) {
        logMessage("Staff fetched successfully");
        echo json_encode($staffRecords);
    } else {
        logMessage("No staff found");
        echo json_encode(["error" => "No staff found"]);
    }
}

// Update existing staff
function updateStaff() {
    logMessage("Update staff function running...");

    $staff = new Staff();
    $data = json_decode(file_get_contents("php://input"), true);


    $staff_id = filter_var($data['staff_id'], FILTER_SANITIZE_STRING);
    $user_id = filter_var($data['user_id'], FILTER_VALIDATE_INT);
    $firstName = filter_var($data['first_name'], FILTER_SANITIZE_STRING);
    $lastName = filter_var($data['last_name'], FILTER_SANITIZE_STRING);
    $dob = filter_var($data['DOB'], FILTER_SANITIZE_STRING);
    $phone = filter_var($data['phone'], FILTER_SANITIZE_STRING);
    $address = filter_var($data['address'], FILTER_SANITIZE_STRING);
    $gender = filter_var($data['gender'], FILTER_SANITIZE_STRING);

    if ($staff->updateStaff($staff_id, $user_id, $firstName, $lastName, $dob, $phone, $address, $gender)) {
        logMessage("Staff updated successfully: $staff_id");
        echo json_encode(["message" => "Staff updated successfully"]);
    } else {
        logMessage("Failed to update staff: $staff_id");
        echo json_encode(["error" => "Staff update failed"]);
    }
}

// Delete staff
function deleteStaff() {
    logMessage("Delete staff function running...");

    $staff = new Staff();
    $staff_id = filter_var($_GET['staff_id'], FILTER_SANITIZE_STRING);

    if ($staff->deleteStaff($staff_id)) {
        logMessage("Staff deleted successfully: $staff_id");
        echo json_encode(["message" => "Staff deleted successfully"]);
    } else {
        logMessage("Failed to delete staff: $staff_id");
        echo json_encode(["error" => "Staff deletion failed"]);
    }
}

// Get all emails
function getAllEmails() {
    logMessage("Fetching all emails from the users table.");
    
    $user = new User();

    // Fetch all emails
    $emails = $user->getAllEmails();

    if ($emails !== false) {
        logMessage("Emails fetched successfully. Total: " . count($emails));
        echo json_encode($emails);
    } else {
        logMessage("Failed to fetch emails.");
        echo json_encode(["error" => "Failed to fetch emails"]);
    }
}

?>
