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
include_once "./assignedTrainerHandler.php";
include_once "./planRequestHandler.php";
include_once "noticeHandler.php";
include_once "markAttendanceHandler.php";
include_once "messageHandler.php";

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
    // Trainer Home Page Features
    case 'get_personal_notices':
        logMessage("Running get_personal_notices....in controller");
        getPersonalNotices($user_id);
        break;

    case 'get_gym_crowd':
        logMessage("Running get_gym_crowd....in controller");
        getGymCrowd();
        break;

    case 'mark_notice_as_read':
        logMessage("Running mark_notice_read....in controller");
        markNoticeAsRead($user_id);
        break;

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

    case 'get_assigned_members':
        logMessage("Running get_assigned_members....in controller");
        getAssignedMembersOfATrainer($user_id);
        break;

    //view created workout plans
    case 'get_created_workout_plans':
        logMessage("Running get_created_workout_plans....in controller");
        createdTrainerWorkoutPlans($user_id);
        break;
    //edit created workout plans
    case 'edit_created_workout_plans':
        logMessage("Running edit_created_workout_plans....in controller");
        $data = json_decode(file_get_contents("php://input"), true);
        logMessage("data: " . json_encode($data));
        editCreatedWorkoutPlans($data);
        break;
    //delete created workout plans
    case 'delete_created_workout_plans':
        logMessage("Running delete_created_workout_plans....in controller");
        $data = json_decode(file_get_contents("php://input"), true);
        logMessage("data: " . json_encode($data));
        $plan_id = $data['id'];
        deleteCreatedWorkoutPlans($plan_id);
        break;



    //view created meal plans
    case 'get_created_meal_plans':
        logMessage("Running get_created_meal_plans....in controller");
        createdTrainerMealPlans($user_id);
        break;
    //edit created meal plans
    case 'edit_created_meal_plan':
        logMessage("Running edit_created_meal_plans....in controller");
        $data = json_decode(file_get_contents("php://input"), true);
        logMessage("data: " . json_encode($data));
        editCreatedMealPlans($data);
        break;
    //delete created meal plans
    case 'delete_created_meal_plan':
        logMessage("Running delete_created_meal_plans....in controller");
        $data = json_decode(file_get_contents("php://input"), true);
        logMessage("data: " . json_encode($data));
        $plan_id = $data['id'];
        deleteCreatedMealPlans($plan_id);
        break;

    //Plan Requests from the user
    case 'get_requests':
        logMessage("Running get_requests....in controller");
        getRequests($user_id);
        break;
    case 'create_workout_plan_for_member':
        logMessage("Running create_workout_plan_for_member....in controller");
        $data = json_decode(file_get_contents("php://input"), true);
        logMessage("data: " . json_encode($data));
        createWorkoutPlanForMember($data);
        break;
    case 'create_meal_plan_for_member':
        logMessage("Running create_meal_plan_for_member....in controller");
        $data = json_decode(file_get_contents("php://input"), true);
        logMessage("data: " . json_encode($data));
        createMealPlanForMember($data);
        break;

    // Reject a plan request
    case 'reject_request':
        logMessage("Running reject_request....in controller");
        $data = json_decode(file_get_contents("php://input"), true);
        logMessage("data: " . json_encode($data));
        rejectRequest($data);
        break;

    // getThreads
    case 'get_threads':
        logMessage("Running get_threads....in controller");
        $trainer_roll_id = $_GET['userId'] ?? null;
        logMessage("trainer_roll_id: " . json_encode($trainer_roll_id));
        getThreads($trainer_roll_id);
        break;
    case 'get_messages':
        logMessage("Running get_messages....in controller");
        $current_user_id = $_GET['userId'] ?? null;
        $other_user_id = $_GET['otherUserId'] ?? null;
        logMessage("current_user_id: " . json_encode($current_user_id));
        logMessage("other_user_id: " . json_encode($other_user_id));
        getMessages($current_user_id, $other_user_id);
        break;
    case 'send':
        logMessage("Running send....in controller");
        $data = json_decode(file_get_contents("php://input"), true);
        logMessage("data: " . json_encode($data));
        sendMessage($data);
        break;
    case 'mark_as_read':
        logMessage("Running mark_as_read....in controller");
        $data = json_decode(file_get_contents("php://input"), true);
        logMessage("data: " . json_encode($data));
        markAsRead($data);
        break;

    default:
        echo json_encode(["error" => "Invalid action"]);
}
