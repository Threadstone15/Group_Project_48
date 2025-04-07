<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

session_start();

include_once "../../middleware/authMiddleware.php";
include_once "../../config/database.php";
include_once "trainerCareerHandler.php";
include_once "staffHandler.php";
include_once "../models/User.php";
include_once "../models/Staff.php";

$conn = include_once "../../config/database.php";
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    logMessage("Handling preflight OPTIONS request.");
    http_response_code(204);
    exit();
}

$request_method = $_SERVER['REQUEST_METHOD'];
$action = $_POST['action'] ?? $_GET['action'] ?? null;

$token = getBearerToken();
$requiredRole = "admin";
verifyRequest($requiredRole, $token);
$user_id  = getUserIdFromToken($token);

logMessage("Running admin controller ,$action token - $token   id - $user_id ");

switch ($action) {

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


    case 'add_staff':
        logMessage("Running add_staff....in controller");
        addStaff();
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
        logMessage("Running delete_staff....in controller");
        $user_id = $_POST['userID'] ?? $_GET['userID'] ?? null;
        deleteStaff($user_id);
        break;


    case 'get_all_emails':
        logMessage("Running get_all_emails....in controller");
        getAllEmails();
        break;


    case 'get_all_payments':
        logMessage("Running get_all_payments....in controller");
        getAllPayments(); //staffHandler
        break;


    default:
        echo json_encode(["error" => "Invalid action"]);
}
