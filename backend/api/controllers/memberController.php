<?php 

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

session_start();

include_once "../../middleware/authMiddleware.php";
include_once "../../config/database.php";
include_once "./notificationHandler.php";
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
$requiredRole = "member";
verifyRequest($requiredRole, $token);
$user_id  =getUserIdFromToken($token);

logMessage("Running member controller ,$action token - $token   id - $user_id ");

switch ($action) {
    case 'add_notification':
        logMessage("Running add_notification....in controller");
        addNotification();
        break;
    case 'get_notifications':
        logMessage("Running get_notification....in controller");
        getNotifications();
        break;
    case 'update_notification':
        logMessage("Running update_notification....in controller");
        updateNotification();
        break;
    case 'delete_notification':
        logMessage("Running delete_notification....in controller");
        deleteNotification();
        break;

    case 'add_Subscription':
        logMessage("Running add_subscription....in controller");
        ($user_id);
        break;
    case 'get_Subscription':
        logMessage("Running get_Subscription....in controller");
        getSubscription();
        break;
    case 'updateSubscription':
        logMessage("Running update_Subscription....in controller");
        updateSubscription();
        break;
    case 'delete_Subscription':
        logMessage("Running delete_Subscription....in controller");
        deleteSubscription();
        break;


    default:
        echo json_encode(["error" => "Invalid action"]);
    }

?>