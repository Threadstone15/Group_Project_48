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
include_once "./accountDetailHandler.php";
include_once "./assignedTrainerHandler.php";
include_once "./classBookingHandler.php";
include_once "./memberPlan_check.php";
include_once "./workoutPlanHandler.php";
include_once "./mealPlanHandler.php";
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
$requiredRole = "member";
verifyRequest($requiredRole, $token);
$user_id  = getUserIdFromToken($token);

logMessage("Running member controller ,$action token - $token   id - $user_id ");

switch ($action) {
    case 'get_membershipPlans':
        logMessage("Running get_membership plan....in controller");
        getMembershipPlans();
        break;
    case 'get_subscription': //subscription handler
        logMessage("Running get_subscription....in controller");
        getSubscriptionOfAMember($user_id);
        break;
    case 'update_subscription':
        logMessage("Running update_subscription....in controller");
        updateSubscription($user_id);
        break;
    case 'payment_list':
        logMessage("Running payment_list....in controller");
        getPaymentListOfAMember($user_id);
        break;




    case 'update_attendance':
        logMessage("Running member mark_attendance....in controller");
        userArrivedStatus($user_id);
        break;
    case 'get_gym_crowd':
        logMessage("Running get_gym_crowd....in controller");
        getGymCrowd();
        break;



    case 'get_user_details':
        logMessage("Running get_user_details....in controller");
        getUserDetails($user_id);
        break;
    case 'generate_payment_hash':
        logMessage("Running generate_payment_hash....in controller");
        generatePaymentHash($user_id);
        break;
    case 'confirm_payment':
        logMessage("Running confirm_payment....in controller");
        confirmPayment($user_id);
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

    case 'select_trainer':
        logMessage("Running select_trainer....in controller");
        selectTrainer($user_id);
        break;
    case 'get_assigned_trainer':
        logMessage("Running get_assigned_trainer....in controller");
        getAssignedTrainer($user_id);
        break;
    case 'change_assigned_trainer':
        logMessage("Running change_trainer....in controller");
        changeTrainer($user_id);
        break;
    case 'remove_assigned_trainer':
        logMessage("Running remove_trainer....in controller");
        removeTrainer($user_id);
        break;
    case 'get_trainers_details':
        logMessage("Running get_trainers_details....in controller");
        getTrainersDetailsWithMemberCount();
        break;

    //class booking
    case 'get_classes_of_assigned_trainer':
        logMessage("running get_classes_of_trainer....in controller");
        getClassesofAssignedTrainer($user_id);
        break;
    case 'enroll_class':
        logMessage("running enroll_class....in controller");
        enrollToClass($user_id);
        break;
    case 'get_enrolled_classes':
        getEnrolledClasses($user_id);
        break;
    case 'cancel_class_enroll':
        cancelEnrollmentToClass($user_id);
        break;


    //veirfy subscribed membership plan
    case 'verify_membership_plan':
        logMessage("running verify_membership_plan....in controller");
        verifyMembershipPlanOfMember($user_id);
        break;

    //personal workout plan creation
    case 'create_workout_plan':
        logMessage("Running create_workout_plan....in controller");
        createWorkoutPlan($user_id);
        break;
    // personal meal plan creation
    case 'create_meal_plan':
        logMessage("Running create_meal_plan....in controller");
        createMealPlan($user_id);
        break;

    // get plans
    // check trainer for trainer plans
    case 'check_trainer':
        logMessage("Running check_trainer....in controller");
        getAssignedTrainer($user_id);
        break;
    // workout plans
    // personal or assigned workout plans
    case 'get_workout_plans':
        logMessage("Running get_workout_plans....in controller");
        getWorkoutPlans($user_id);
        break;
    // request workout plan from trainer
    case 'request_workout_plan':
        logMessage("Running request_workout_plan....in controller");
        $data = json_decode(file_get_contents("php://input"), true);
        logMessage("data: " . json_encode($data));
        requestWorkoutPlan($user_id, $data);
        break;

    // meal plans
    case 'get_meal_plans':
        logMessage("Running get_meal_plans....in controller");
        getMealPlans($user_id);
        break;
    case 'request_meal_plan':
        logMessage("Running request_meal_plan....in controller");
        $data = json_decode(file_get_contents("php://input"), true);
        logMessage("data: " . json_encode($data));
        requestMealPlan($user_id, $data);
        break;

    // check trainer




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
