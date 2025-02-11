<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

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

    default:
        echo json_encode(["error" => "Invalid action"]);
}
