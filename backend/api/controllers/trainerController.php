<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

session_start();

include_once "../../middleware/authMiddleware.php";
include_once "../../config/database.php";
include_once "workoutPlanHandler.php";
include_once "../models/User.php";

$conn = include_once "../../config/database.php";
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    logMessage("Handling preflight OPTIONS request.");
    http_response_code(204);  
    exit();
}

$request_method = $_SERVER['REQUEST_METHOD'];
$action = $_POST['action'] ?? $_GET['action'] ?? null; 

/*$token = getBearerToken();
$requiredRole = "trainer";
verifyRequest($requiredRole, $token);
$user_id  = getUserIdFromToken($token);*/

logMessage("Running trainer controller, $action token - $token   id - $user_id ");

switch ($action) {
    case 'add_workout_plan':
        logMessage("Running add_workout_plan....in controller");
        addWorkoutPlan();
        break;
    case 'get_workout_plans':
        logMessage("Running get_workout_plans....in controller");
        getWorkoutPlans();
        break;
    case 'update_workout_plan':
        logMessage("Running update_workout_plan....in controller");
        updateWorkoutPlan();
        break;
    case 'delete_workout_plan':
        logMessage("Running delete_workout_plan....in controller");
        deleteWorkoutPlan();
        break;
        
    default:
        echo json_encode(["error" => "Invalid action"]);
}
?>
