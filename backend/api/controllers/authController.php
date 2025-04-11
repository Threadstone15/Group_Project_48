<?php


header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

session_start();

include_once "../../middleware/authMiddleware.php";
include_once "../models/User.php";
include_once "../models/Payments.php";
include_once "../models/Member.php";
include_once "../models/Subscription.php";
include_once "../../logs/save.php";
include_once "./passwordReset.php";

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    logMessage("Handling preflight OPTIONS request.");
    http_response_code(204);
    exit();
}

$request_method = $_SERVER['REQUEST_METHOD'];
$action = $_POST['action'] ?? $_GET['action'] ?? null;


logMessage("Running auth controller ,$action ");

switch ($action) {
    case 'signup':
        logMessage("Running signup....in auth controller");
        signup();
        break;
    case 'login':
        logMessage('running login...in auth controller');
        login();
        break;
    case 'password_reset_mail_check':
        logMessage("Running password reset mail check....in auth controller");
        pass_reset_mail();
        break;
    case 'password_reset':
        logMessage("Running password reset....in auth controller");
        pass_reset();
        break;
    case 'register_member':
        logMessage('running member register...in auth controller');
        registerMember();
        break;
    default:
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
        if ($userData) {
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
            $token = generateToken($userData['user_id']);
            $role = $userData['role'];
            logMessage("Login Successful: $token $role");
            http_response_code(200);

            if ($role === 'member') {
                $payment = new Payment();
                $user_id = $userData['user_id'];
                $payments = $payment->getLatestPaymentByUserId($user_id);

                if (!$payments) {
                    $response = [
                        "success" => true,
                        "message" => "Login successful",
                        "role" => $role,
                        "token" => $token
                    ];
                } else {
                    $response = [
                        "success" => true,
                        "message" => "Login successful",
                        "role" => $role,
                        "token" => $token,
                        "membership_plan_id" => $payments['membership_plan_id'],
                        "amount" => $payments['amount'],
                        "status" => $payments['status'],
                        "date_time" => $payments['date_time']
                    ];
                }
            } else {
                $response = [
                    "success" => true,
                    "message" => "Login successful",
                    "role" => $role,
                    "token" => $token
                ];
            }
        } else {
            exit();
        }

        // Send the response as JSON
        echo json_encode($response);
        exit;
    } else {
        logMessage("Invalid input data for user login");
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
    $subscription = new Subscription();

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
        if ($userData) {
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
                $member_id = $member->registerMember($user_id, $firstName, $lastName, $dob, $phone, $address, $gender);
                if ($member_id) {
                    logMessage("Member registered successfully with user ID: $user_id");

                    //add free suscription for every new member
                    $membership_plan_id = 'MP1';
                    $startDate = NULL;
                    $endDate = NULL;
                    $paymentDue_date = NULL;
                    $status = 'active';
                    $period = 'monthly';
                    if ($subscription->addSubscription($member_id, $membership_plan_id, $startDate, $endDate, $paymentDue_date, $status, $period)) {
                        logMessage("Subscription added successfully for member ID: $member_id");
                        echo json_encode(["message" => "User and Member registered successfully, with a free subscription"]);
                    }
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
