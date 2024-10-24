<?php

// api/controllers/staffController.php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json'); // Set content type to JSON

session_start();
include_once "../models/Equipment.php"; // Include Equipment model
include_once "../../middleware/authMiddleware.php"; // Assuming you have authentication middleware
include_once "../../logs/save.php";

$conn = include_once "../../config/database.php";
$equipment = new Equipment($conn);

$request_method = $_SERVER['REQUEST_METHOD'];
logMessage("Running: $request_method");

// Create new equipment
if ($request_method == 'POST') {
    logMessage("Adding new equipment");

    $name = filter_var($_POST['name'], FILTER_SANITIZE_STRING);
    $purchase_date = $_POST['purchase_date']; // Assuming this is sent as yyyy-mm-dd
    $status = filter_var($_POST['status'], FILTER_SANITIZE_STRING);
    $maintenance_frequency = intval($_POST['maintenance_frequency']); // Frequency in days

    // Add equipment to the database
    if ($equipment->addEquipment($name, $purchase_date, $status, $maintenance_frequency)) {
        logMessage("Equipment added: $name");
        echo json_encode(["message" => "Equipment added successfully"]);
    } else {
        logMessage("Failed to add equipment: $name");
        echo json_encode(["error" => "Equipment addition failed"]);
    }
}

// Get equipment details
if ($request_method == 'GET') {
    logMessage("Fetching equipment data");

    if (isset($_GET['equipment_id'])) {
        $equipment_id = intval($_GET['equipment_id']);
        $result = $equipment->getEquipment($equipment_id);
    } else {
        $result = $equipment->getEquipment();
    }

    if ($result) {
        logMessage("Equipment data fetched");
        echo json_encode($result);
    } else {
        logMessage("No equipment found");
        echo json_encode(["error" => "No equipment found"]);
    }
}

// Update equipment status
if ($request_method == 'PUT') {
    logMessage("Updating equipment status");

    // Get input data from PUT request body (JSON)
    $data = json_decode(file_get_contents("php://input"), true);

    if (isset($data['equipment_id']) && isset($data['status'])) {
        $equipment_id = intval($data['equipment_id']);
        $status = filter_var($data['status'], FILTER_SANITIZE_STRING);

        if ($equipment->updateEquipmentStatus($equipment_id, $status)) {
            logMessage("Equipment status updated: $equipment_id to $status");
            echo json_encode(["message" => "Equipment status updated successfully"]);
        } else {
            logMessage("Failed to update equipment status: $equipment_id");
            echo json_encode(["error" => "Equipment status update failed"]);
        }
    } else {
        logMessage("Invalid input for equipment update");
        echo json_encode(["error" => "Invalid input data"]);
    }
}

// Delete equipment
// Delete equipment
if ($request_method == 'DELETE') {
    logMessage("Deleting equipment");

    // Get JSON input data
    $input = json_decode(file_get_contents("php://input"), true); // Decode the JSON input

    if (isset($input['equipment_id'])) {
        $equipment_id = intval($input['equipment_id']);

        if ($equipment->deleteEquipment($equipment_id)) {
            logMessage("Equipment deleted: $equipment_id");
            echo json_encode(["message" => "Equipment deleted successfully"]);
        } else {
            logMessage("Failed to delete equipment: $equipment_id");
            echo json_encode(["error" => "Equipment deletion failed"]);
        }
    } else {
        logMessage("Invalid input for equipment deletion");
        echo json_encode(["error" => "Invalid input data"]);
    }
}

?>
