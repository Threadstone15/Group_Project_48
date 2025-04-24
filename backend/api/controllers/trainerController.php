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
include_once "./accountDetailHandler.php";
include_once "./trainerClassHandler.php";
include_once "./planRequestHandler.php";

$conn = include_once "../../config/database.php";
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    logMessage("Handling preflight OPTIONS request.");
    http_response_code(204);
    exit();
}

$request_method = $_SERVER['REQUEST_METHOD'];
$action = $_POST['action'] ?? $_GET['action'] ?? null;

$token = getBearerToken();
$requiredRole = "trainer";
verifyRequest($requiredRole, $token);
$user_id  = getUserIdFromToken($token);

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

    case 'add_class':
        logMessage("Running add_class....in controller");
        addTrainerClass($user_id);
        break;
    case 'get_classes':
        logMessage("Running get_classes....in controller");
        getTrainerClasses();
        break;
    case 'update_class':
        logMessage("Running update_class....in controller");
        updateTrainerClass('trainer');
        break;
    case 'delete_class':
        logMessage("Running delete_class....in controller");
        deleteTrainerClass('trainer');
        break;
    case 'get_classes_of_trainer':
        logMessage("Running get_classes_of_trainer....in controller");
        getClassesBelongToATrainer($user_id);
        break;

    case 'account_delete':
        logMessage('running account delete...in controller');
        deleteUserAccount($user_id);
        break;
    case 'get_profile':
        logMessage("Running get_profile....in controller");
        getProfileDetails($user_id);
        break;
    case 'update_profile':
        logMessage("Running update_profile....in controller");
        updateProfileDetails($user_id);
        break;
    case 'change_password':
        logMessage("Running change_password....in controller");
        changePassword($user_id);
        break;

    //Plan Requests from the user
    case 'get_requests':
        logMessage("Running get_requests....in controller");
        getRequests($user_id);
        break;
    // Reject a plan request
    case 'reject_request':
        logMessage("Running reject_request....in controller");
        $data = json_decode(file_get_contents("php://input"), true);
        logMessage("data: " . json_encode($data));
        rejectRequest($data);
        break;

    default:
        echo json_encode(["error" => "Invalid action"]);
}
