<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

session_start();

include_once "../../middleware/authMiddleware.php";
include_once "../../config/database.php";
include_once "./membershipPlanHandler.php";
include_once "./trainerApplicationHandler.php";
include_once "../models/User.php";
include_once "./staffHandler.php";
include_once "./accountDetailHandler.php";

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
$user_id  = getUserIdFromToken($token);


logMessage("Running owner controller ,$action token - $token   id - $user_id ");

switch ($action) {
    //for accounts section
    case 'get_all_emails':
        logMessage("Running get_all_emails....in controller");
        getAllEmails();
        break;
    case 'get_members_by_role':
        $role = $_POST['role'] ?? $_GET['role'] ?? null;
        logMessage("Running get_members_by_role....in controller");
        getStaff($role);
        break;
    case 'update_staff':
        logMessage("Running update_staff....in controller");
        updateStaff();
        break;
    case 'delete_staff':
        $deleted_by = $user_id;
        logMessage("Running delete_staff....in controller");
        $input = json_decode(file_get_contents('php://input'), true);
        $user_id = $input['userId'] ?? null;
        $remark = $input['reason'] ?? null;
        logMessage("User ID: $user_id, Remark: $remark, Deleted By: $deleted_by");
        deleteStaff($user_id, $remark, $deleted_by);
        break;

    case 'add_staff':
        logMessage("Running add_staff....in controller");
        addStaff();
        break;




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

    case 'get_trainerApplications':
        logMessage("Running get_trainer_applications....in controller");
        getTrainerApplications();
        break;
    case 'get_trainerAppliedCareers':
        logMessage("Running get_trainerAppliedCareers....in controller");
        getTrainerAppliedCareers();
        break;
    case 'update_trainerApplicationStatus':
        logMessage("Running update_trainer_application_status....in controller");
        updateTrainerApplicationStatus();
        break;
    case 'delete_trainerApplication':
        logMessage("Running delete_trainer_application....in controller");
        deleteTrainerApplication();
        break;
    case 'get_all_payments':
        logMessage("Running get_all_payments....in controller");
        getAllPayments(); //staffHandler
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

    default:
        echo json_encode(["error" => "Invalid action"]);
}
