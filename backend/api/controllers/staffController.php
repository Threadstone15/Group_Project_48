<?php

// Allow cross-origin requests from any origin
header("Access-Control-Allow-Origin: *");
// Allow specific HTTP methods
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS");
// Allow specific headers
header("Access-Control-Allow-Headers: Content-Type, Authorization");
// Set the response content type to JSON
header('Content-Type: application/json');

// Start the session
session_start();

// Include middleware and handler files
include_once "../../middleware/authMiddleware.php";
include_once "../../config/database.php";
include_once "equipmentHandler.php";
include_once "equipmentMaintenanceHandler.php";
include_once "noticeHandler.php";
include_once "markAttendanceHandler.php";
include_once "../models/User.php";
include_once "./accountDetailHandler.php";
include_once "./trainerClassHandler.php";
include_once "./classBookingHandler.php";
include_once "./membershipPlanHandler.php";

// Establish database connection
$conn = include_once "../../config/database.php";

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    logMessage("Handling preflight OPTIONS request.");
    http_response_code(204);
    exit();
}

// Determine the HTTP method and action
$request_method = $_SERVER['REQUEST_METHOD'];
$action = $_POST['action'] ?? $_GET['action'] ?? null;

// Authenticate request
$token = getBearerToken();
$requiredRole = "staff";
verifyRequest($requiredRole, $token);
$user_id = getUserIdFromToken($token);

// Log incoming request details
logMessage("Running staff controller ,$action token - $token   id - $user_id ");

// Route the request based on the 'action' parameter
switch ($action) {
    // Staff Home Page Features
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


    // Equipment Management
    case 'add_equipment':
        logMessage("Running add_equip....in controller");
        addEquipment();
        break;
    case 'get_equipments':
        logMessage("Running get_equip....in controller");
        getEquipment();
        break;
    case 'get_equipment_types':
        logMessage("Running get_equip_types....in controller");
        getEquipmentTypes();
        break;
    case 'update_equipment_status':
        logMessage("Running update_equip....in controller");
        updateEquipment();
        break;
    case 'delete_equipment':
        logMessage("Running delete_equip....in controller");
        deleteEquipment();
        break;

    // Maintenance Management
    case 'add_maintenance':
        logMessage("Running add_maintenance....in controller");
        addMaintenance();
        break;
    case 'get_maintenances':
        logMessage("Running get_maintenance....in controller");
        getMaintenance();
        break;
    case 'update_maintenance_status':
        logMessage("Running update_maintenance....in controller");
        updateMaintenance();
        break;
    case 'delete_maintenance':
        logMessage("Running delete_maintenance....in controller");
        deleteMaintenance();
        break;

    // Notice Management
    case 'add_notice':
        logMessage("Running add_notice....in controller");
        addNotice($user_id);
        break;
    case 'get_notices':
        logMessage("Running get_notice....in controller");
        getNotices();
        break;
    case 'update_notice':
        logMessage("Running update_notice....in controller");
        updateNotice($user_id);
        break;
    case 'delete_notice':
        logMessage("Running delete_notice....in controller");
        deleteNotice();
        break;

    // Account Management
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

    // trainer class
    case 'get_classes':
        getTrainerClasses();
        break;
    case 'get_enrolled_member_list_of_class':
        getEnrolledMemberListOfClass();
        break;

    // mark attendance QR
    case 'mark_attendance':
        logMessage("Running mark_attendance....in controller");
        $jsonData = json_decode(file_get_contents("php://input"), true);
        logMessage("Received JSON data: " . json_encode($jsonData));
        $token = $jsonData['member_id'];
        $mem_userid = getUserIdFromTokenNoVerify($token);
        markAttendance($mem_userid, $jsonData);
        break;
    // mark attendance manual
    case 'mark_attendance_manual':
        logMessage("Running mark_attendance_manual....in controller");
        $jsonData = json_decode(file_get_contents("php://input"), true);
        logMessage("Received JSON data: " . json_encode($jsonData));
        markAttendanceManual($jsonData);
        break;
    case 'get_attendance':
        logMessage("Running get_attendance....in controller");
        getTodayArrivalDepartureTimes();
        break;

    //fetch get_active_plans
    case 'get_active_plans':
        logMessage("Running get_active_plans....in controller");
        getActiveMembershipPlans();
        break;
    //record_payment_reciept
    case 'record_payment':
        logMessage("Running record_payment_reciept....in controller");
        recordPaymentReciept();
        break;


    default:
        echo json_encode(["error" => "Invalid action"]);
}
