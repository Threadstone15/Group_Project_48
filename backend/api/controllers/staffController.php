<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

session_start();

include_once "../../middleware/authMiddleware.php";
include_once "../../config/database.php";
include_once "equipmentHandler.php";
include_once "equipmentMaintenanceHandler.php";
include_once "noticeHandler.php";
include_once "trainerCareerHandler.php";
include_once "../models/User.php";


$conn = include_once "../../config/database.php";
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    logMessage("Handling preflight OPTIONS request.");
    http_response_code(204);  // No Content
    exit();
}
$request_method = $_SERVER['REQUEST_METHOD'];
$action = $_POST['action'] ?? $_GET['action'] ?? null;

$token = getBearerToken();
$requiredRole = "staff";
verifyRequest($requiredRole,$token);


logMessage("Running staff controller ,$action token - $token ");



switch ($action) {
    case 'add_equipment':
        logMessage("Running add_equip....in controller");
        addEquipment();
        break;
    case 'get_equipment':
        getEquipment($conn);
        break;
    case 'update_equipment_status':
        updateEquipmentStatus($conn);
        break;
    case 'delete_equipment':
        deleteEquipment($conn);
        break;

    case 'add_maintenance':
        addMaintenance($conn);
        break;
    case 'get_maintenance':
        getMaintenance($conn);
        break;
    case 'update_maintenance':
        updateMaintenance($conn);
        break;
    case 'delete_maintenance':
        deleteMaintenance($conn);
        break;

    case 'add_notice':
        addNotice($conn);
        break;
    case 'get_notice':
        getNotices($conn);
        break;
    case 'update_notice':
        updateNotice($conn);
        break;
    case 'delete_notice':
        deleteNotice($conn);
        break;

    case 'add_trainer_career':
        addTrainerCareer($conn);
        break;
    case 'get_trainer_career':
        getTrainerCareer($conn);
        break;
    case 'update_trainer_career':
        updateTrainerCareer($conn);
        break;
    case 'delete_trainer_career':
        deleteTrainerCareer($conn);
        break;

    default:
        echo json_encode(["error" => "Invalid action"]);
}
