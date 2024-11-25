<?php
// staffHandler.php

include_once "../models/Staff.php";
include_once "../models/User.php";
include_once "../models/Member.php";
include_once "../models/Trainer.php";
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
function addStaff() {
    logMessage("Starting 'addStaff' function...");

    // Include necessary classes

    $user = new User();
    $user_id = null;

    // Parse incoming JSON data
    $data = json_decode(file_get_contents("php://input"), true);

    if (!$data) {
        logMessage("No input data provided.");
        http_response_code(400);
        echo json_encode(["error" => "Invalid input. No data received."]);
        return;
    }

    // Sanitize and validate input data
    $role = filter_var($data['role'] ?? null, FILTER_SANITIZE_STRING);
    $email = filter_var($data['email'] ?? null, FILTER_SANITIZE_EMAIL);
    $password = generateRandomPassword();
    $firstName = filter_var($data['firstName'] ?? null, FILTER_SANITIZE_STRING);
    $lastName = filter_var($data['lastName'] ?? null, FILTER_SANITIZE_STRING);
    $dob = filter_var($data['dob'] ?? null, FILTER_SANITIZE_STRING);
    $phone = filter_var($data['mobile'] ?? null, FILTER_SANITIZE_STRING);
    $address = filter_var($data['address'] ?? null, FILTER_SANITIZE_STRING);
    $gender = filter_var($data['gender'] ?? null, FILTER_SANITIZE_STRING);

    // Validate required fields
    if (!$role || !$email || !$firstName || !$lastName || !$dob || !$phone || !$address || !$gender) {
        logMessage("Missing required fields: role=$role, email=$email, firstName=$firstName, lastName=$lastName.");
        http_response_code(400);
        echo json_encode(["error" => "Missing required fields."]);
        return;
    }

    // Begin adding staff
    try {
        logMessage("Processing user registration: role=$role, email=$email.");

        // Add user to User table
        if ($role === "staff" || $role === "owner") {
            $staff = new Staff();
            if ($user->register($email, $password, $role)) {
                $user_id = $user->userExists($email);
                if ($user_id) {
                    logMessage("User registered successfully. User ID: $user_id.");
                } else {
                    throw new Exception("Failed to retrieve user ID after registration.");
                }
            } else {
                throw new Exception("User registration failed for email: $email.");
            }

            // Add details to Staff table
            logMessage("Adding staff details for user ID: $user_id.");
            if ($staff->createStaff($user_id, $firstName, $lastName, $dob, $phone, $address, $gender)) {
                logMessage("Staff added successfully: $firstName $lastName.");
                account_creation($email, $password); // Send account creation email
                http_response_code(201); // Resource created
                echo json_encode(["message" => "Staff added successfully."]);
            } else {
                throw new Exception("Failed to add staff details for user ID: $user_id.");
            }
        }
        elseif($role === "member"){
            $member = new Member();
            if ($user->register($email, $password, $role)) {
                $user_id = $user->userExists($email);
                if ($user_id) {
                    logMessage("User registered successfully. User ID: $user_id.");
                } else {
                    throw new Exception("Failed to retrieve user ID after registration.");
                }
            } else {
                throw new Exception("User registration failed for email: $email.");
            }

            // Add details to member table
            logMessage("Adding member details for user ID: $user_id.");
            if ($member->registerMember($user_id, $firstName, $lastName, $dob, $phone, $address, $gender)) {
                logMessage("Member added successfully: $firstName $lastName.");
                account_creation($email, $password); // Send account creation email
                http_response_code(201); // Resource created
                echo json_encode(["message" => "Member added successfully."]);
            } else {
                throw new Exception("Failed to add member details for user ID: $user_id.");
            }
        }
        elseif($role === "trainer"){
            $trainer = new Trainer();
            if ($user->register($email, $password, $role)) {
                $user_id = $user->userExists($email);
                if ($user_id) {
                    logMessage("User registered successfully. User ID: $user_id.");
                } else {
                    throw new Exception("Failed to retrieve user ID after registration.");
                }
            } else {
                throw new Exception("User registration failed for email: $email.");
            }

            $NIC = "123";
            $years_of_experience = 5;
            $specialties = "none";
            $cv_link = "http";
            // Add details to trainer table
            logMessage("Adding trainer details for user ID: $user_id.");
            if ($trainer->registerTrainer($user_id, $firstName, $lastName, $NIC, $dob, $address, $phone, $years_of_experience, $specialties, $cv_link)) {
                logMessage("Trainer added successfully: $firstName $lastName.");
                account_creation($email, $password); // Send account creation email
                http_response_code(201); // Resource created
                echo json_encode(["message" => "Trainer added successfully."]);
            } else {
                throw new Exception("Failed to add trainer details for user ID: $user_id.");
            }
        }
        else {
            logMessage("Invalid role provided: $role.");
            http_response_code(400);
            echo json_encode(["error" => "Invalid role."]);
        }
    } catch (Exception $e) {
        logMessage("Error in 'addStaff': " . $e->getMessage());
        http_response_code(500);
        echo json_encode(["error" => "An error occurred while adding staff. Please try again later."]);
    }
}


// Get all staff or a specific staff by ID
function getStaff($role) {
    logMessage("Get staff function running for role: $role");

    try {
        // Validate role
        $validRoles = ['member', 'staff', 'owner', 'trainer'];
        if (!in_array($role, $validRoles)) {
            logMessage("Invalid role provided: $role");
            echo json_encode(["error" => "Invalid role provided"]);
            return;
        }

        if ($role === "member") {
            logMessage("Fetching details for members...");
            $member = new Member();
            $members = $member->getMemberDetails();

            if (!empty($members)) {
                logMessage("Member details fetched successfully.");
                echo json_encode($members);
            } else {
                logMessage("No members found.");
                echo json_encode(["error" => "No members found"]);
            }
        } elseif ($role === "staff" || $role === "owner") {
            logMessage("Fetching details for $role...");
            $staff = new Staff();
            $staffDetails = $staff->getStaffDetails($role); // Assuming getStaffDetails handles roles

            if (!empty($staffDetails)) {
                logMessage(ucfirst($role) . " details fetched successfully.");
                echo json_encode($staffDetails);
            } else {
                logMessage("No $role found.");
                echo json_encode(["error" => "No $role found"]);
            }
        } elseif ($role === "trainer") {
            logMessage("Fetching details for trainers...");
            $trainer = new Trainer();
            $trainerDetails = $trainer->getTrainerDetails();

            if (!empty($trainerDetails)) {
                logMessage("Trainer details fetched successfully.");
                echo json_encode($trainerDetails);
            } else {
                logMessage("No trainers found.");
                echo json_encode(["error" => "No trainers found"]);
            }
        } else {
            logMessage("Unhandled role: $role");
            echo json_encode(["error" => "Unhandled role"]);
        }
    } catch (Exception $e) {
        logMessage("An error occurred in getStaff function: " . $e->getMessage());
        echo json_encode(["error" => "An internal server error occurred"]);
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
function deleteStaff($user_id) {
    logMessage("Delete staff function running...ID - $user_id");

    $user = new User();

    if ($user->deleteUser($user_id)) {
        logMessage("Staff deleted successfully:");
        echo json_encode(["message" => "User deleted successfully"]);
    } else {
        logMessage("Failed to delete staff:");
        echo json_encode(["error" => "User deletion failed"]);
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
