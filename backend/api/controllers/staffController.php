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

$conn = include_once "../../config/database.php";
$request_method = $_SERVER['REQUEST_METHOD'];
$action = $_POST['action'] ?? $_GET['action'] ?? null;

switch ($action) {
    case 'add_equipment':
        addEquipment($conn);
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

    default:
        echo json_encode(["error" => "Invalid action"]);
}
