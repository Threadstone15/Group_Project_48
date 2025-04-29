<?php

// Allow cross-origin requests from any origin
header("Access-Control-Allow-Origin: *");
// Allow specific HTTP methods
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS");
// Allow specific headers
header("Access-Control-Allow-Headers: Content-Type, Authorization");
// Set the response content type to JSON
header('Content-Type: application/json');

// Start the PHP session
session_start();

// Include required files
include_once "../../middleware/authMiddleware.php";
include_once "../../config/database.php";
include_once "trainerCareerHandler.php";
include_once "staffHandler.php";
include_once "../models/User.php";
include_once "../models/Staff.php";
include_once "./accountDetailHandler.php";
include_once "./trainerClassHandler.php";
include_once "./markAttendanceHandler.php";
include_once "./systemHistoryHandler.php";
include_once "./noticeHandler.php";
include_once "./configHandler.php";
include_once "./membershipPlanHandler.php";

// Handle CORS preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    logMessage("Handling preflight OPTIONS request.");
    http_response_code(204);
    exit();
}

// Get request method and action
$request_method = $_SERVER['REQUEST_METHOD'];
$action = $_POST['action'] ?? $_GET['action'] ?? null;

// Extract and verify JWT token
$token = getBearerToken();
$requiredRole = "admin";
verifyRequest($requiredRole, $token);
$user_id = getUserIdFromToken($token);

// Log current action and token
logMessage("Running admin controller ,$action token - $token   id - $user_id ");

switch ($action) {

    // Trainer Career Management
    case 'add_trainer_career':
        logMessage("Running add_trainer_career....in controller");
        addTrainerCareer();
        break;
    case 'get_trainer_career':
        logMessage("Running get_trainer_career....in controller");
        getTrainerCareer();
        break;
    case 'update_trainer_career':
        logMessage("Running update_trainer_career....in controller");
        updateTrainerCareer();
        break;
    case 'delete_trainer_career':
        logMessage("Running delete_trainer_career....in controller");
        deleteTrainerCareer();
        break;

    // Staff Management
    case 'get_members_by_role':
        // Retrieve staff based on their role
        $role = $_POST['role'] ?? $_GET['role'] ?? null;
        logMessage("Running get_members_by_role....in controller");
        getStaff($role);
        break;

    case 'deactivate_staff':
        // Deactivate a staff member with a reason
        $deleted_by = $user_id;
        logMessage("Running delete_staff....in controller");
        $input = json_decode(file_get_contents('php://input'), true);
        $user_id = $input['userId'] ?? null;
        $remark = $input['reason'] ?? null;
        logMessage("User ID: $user_id, Remark: $remark, Deleted By: $deleted_by");
        deactivateStaff($user_id, $remark, $deleted_by);
        break;

    case 'reactivate_staff':
        // Reactivate a previously deactivated staff member
        $reactivated_by = $user_id;
        logMessage("Running reactivate_staff....in controller");
        $input = json_decode(file_get_contents('php://input'), true);
        $user_id = $input['userId'] ?? null;
        $remark = $input['reason'] ?? null;
        logMessage("User ID: $user_id, Remark: $remark, Reactivated By: $reactivated_by");
        reactivateStaff($user_id, $remark, $reactivated_by);
        break;

    case 'add_staff':
        // Add a new staff member
        logMessage("Running add_staff....in controller");
        addStaff();
        break;

    // System History
    case 'get_history':
        logMessage("Running get_history....in controller");
        getHistory();
        break;

    // System Configuration Management
    case 'get_all_system_configs':
        logMessage("Running get_system_config....in controller");
        getAllSystemConfigs();
        break;
    case 'update_system_config':
        logMessage("Running update_system_config....in controller");
        updateSystemConfig();
        break;

    // Payments Section
    case 'get_all_payments':
        logMessage("Running get_all_payments....in controller");
        getAllPayments();
        break;

    // My Account Section
    case 'change_password':
        logMessage("Running change_password....in controller");
        changePassword($user_id);
        break;

    // Admin Home Page Features
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

    // Admin Gym Notices Management
    case 'get_notices':
        logMessage("Running get_notices....in controller");
        getNotices();
        break;
    case 'add_notice':
        logMessage("Running add_notice....in controller");
        addNotice($user_id);
        break;
    case 'update_notice':
        logMessage("Running update_notice....in controller");
        updateNotice($user_id);
        break;
    case 'delete_notice':
        logMessage("Running delete_notice....in controller");
        deleteNotice();
        break;

    //trainer class handling
    case 'get_classes':
        getTrainerClasses();
        break;
    case 'update_class':
        updateTrainerClass("admin");
        break;
    case 'delete_class':
        deleteTrainerClass("admin");
        break;

    //cash payments
    case 'get_cash_payments':
        logMessage("Running get_cash_payments....in controller");
        getFullPaymentDetailsWithEvidence();
        break;

    // Default case for undefined actions
    default:
        echo json_encode(["error" => "Invalid action"]);
}
