<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

require_once '../models/Staff.php';
require_once '../../config/database.php';

session_start();

include_once "../../middleware/authMiddleware.php";
include_once "../../config/database.php";
include_once "equipmentHandler.php";
include_once "equipmentMaintenanceHandler.php";
include_once "noticeHandler.php";
include_once "../models/User.php";

$database = new DatabaseConnection();
$db = $database->connect();
$staff = new Staff($db);

$conn = include_once "../../config/database.php";
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    logMessage("Handling preflight OPTIONS request.");
    http_response_code(204);
    exit();
}

$request_method = $_SERVER['REQUEST_METHOD'];
$action = $_POST['action'] ?? $_GET['action'] ?? null;

$token = getBearerToken();
$requiredRole = "staff";
verifyRequest($requiredRole, $token);
$user_id  = getUserIdFromToken($token);

logMessage("Running staff controller ,$action token - $token   id - $user_id ");

switch ($action) {
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


    default:
        echo json_encode(["error" => "Invalid action"]);
}

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["error" => "Unauthorized"]);
    exit();
}



$user_id = $_SESSION['user_id'];
$userDetails = $staff->getLoggedInStaffDetails($user_id);

header('Content-Type: application/json');
echo json_encode($userDetails);
?>
