<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

require_once '../models/Member.php';
require_once '../../config/database.php';

session_start();

include_once "../../middleware/authMiddleware.php";
include_once "../../config/database.php";
include_once "./membershipPlanHandler.php";
include_once "../models/User.php";
include_once "./subscriptionHandler.php";
include_once "./markAttendanceHandler.php";

$conn = include_once "../../config/database.php";
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    logMessage("Handling preflight OPTIONS request.");
    http_response_code(204);
    exit();
}

$request_method = $_SERVER['REQUEST_METHOD'];
$action = $_POST['action'] ?? $_GET['action'] ?? null;

$token = getBearerToken();
$requiredRole = "member";
verifyRequest($requiredRole, $token);
$user_id  = getUserIdFromToken($token);

logMessage("Running member controller ,$action token - $token   id - $user_id ");

switch ($action) {
    case 'get_membershipPlans':
        logMessage("Running get_membership plan....in controller");
        getMembershipPlans();
        break;
    case 'get_subscription':
        logMessage("Running get_subscription....in controller");
        getSubscriptionOfAMember($user_id);
        break;
    case 'update_subscription':
        logMessage("Running update_subscription....in controller");
        updateSubscription($user_id);
        break;
    case 'update_attendance':
        logMessage("Running member mark_attendance....in controller");
        mark_attendance($user_id);
        break;
    case 'get_daily_attendance':
        logMessage("Running get_attendance....in controller");
        getDailyAttendance();
        break;
    case 'account_delete':
        logMessage('running account delete...in auth controller');
        deleteAccount($user_id);
        break;
    
    case 'get_member_details':
        $userDetails = $member->getLoggedInMemberDetails($user_id);
        if ($userDetails) {
            echo json_encode([
                "status" => "success",
                "data" => $userDetails
        ]);
        } else {
            echo json_encode([
                "status" => "error",
                "message" => "Failed to fetch member details"
        ]);
    }
    break;

    default:
        echo json_encode(["error" => "Invalid action"]);
}


function deleteAccount($user_id)
{
    logMessage("delete account function running...");

    $password = $_POST['password'] ?? $_GET['password'] ?? null;
    $reason = $_POST['reason'] ?? $_GET['reason'] ?? null;

    $user = new User();
    $password_original = $user->getPasswordByUserId($user_id);

    if (!$password_original) {
        echo json_encode(["error" => "User not found"]);
        return;
    }

    $reason = ($reason ?? '') . "- by user";

    if (password_verify($password, $password_original)) {
        logMessage("Password correct");

        if ($user->deactivateUser($user_id, $reason)) {
            echo json_encode(["message" => "Account deleted successfully"]);
        } else {
            echo json_encode(["error" => "Failed to delete account"]);
        }
    } else {
        echo json_encode(["error" => "Invalid password"]);
    }
}

$database = new DatabaseConnection();
$db = $database->connect();
$member = new Member($db);

$token = getBearerToken();
$requiredRole = "member";
verifyRequest($requiredRole, $token);
$user_id = getUserIdFromToken($token);

$action = $_GET['action'] ?? '';

if ($action === 'get_member_details') {
    $userDetails = $member->getLoggedInMemberDetails($user_id);
    echo json_encode([
        "status" => "success",
        "data" => $userDetails
    ]);
}
