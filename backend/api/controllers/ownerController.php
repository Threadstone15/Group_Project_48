<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

session_start();

include_once "../../middleware/authMiddleware.php";
include_once "../../config/database.php";
include_once "./membershipPlanHandler.php";
// include_once "equipmentMaintenanceHandler.php";
// include_once "noticeHandler.php";
include_once "../models/User.php";

$conn = include_once "../../config/database.php";
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    logMessage("Handling preflight OPTIONS request.");
    http_response_code(204);  
    exit();
}

$request_method = $_SERVER['REQUEST_METHOD'];
$action = $_POST['action'] ?? $_GET['action'] ?? null; 

$token = getBearerToken();
$requiredRole = "owner";
verifyRequest($requiredRole, $token);
$user_id  =getUserIdFromToken($token);

logMessage("Running owner controller ,$action token - $token   id - $user_id ");

switch ($action) {
    case 'add_membershipPlan':
        logMessage("Running add_membership plan....in controller");
        addMembershipPlan();
        break;
    case 'get_membershipPlans':
        logMessage("Running get_membership plan....in controller");
        getMembershipPlans();
        break;
    case 'update_membershipPlan':
        logMessage("Running update_membership plan....in controller");
        updateMembershipPlan();
        break;
    case 'delete_membershipPlan':
        logMessage("Running delete_membership plan....in controller");
        deleteMembershipPlan();
        break;
    default:
        echo json_encode(["error" => "Invalid action"]);
}
?>