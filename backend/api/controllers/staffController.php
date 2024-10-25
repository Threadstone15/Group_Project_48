<?php

// api/controllers/staffController.php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json'); // Set content type to JSON

session_start();
include_once "../models/Equipment.php"; // Include Equipment model
include_once "../models/EquipmentMaintenance.php"; // Include EquipmentMaintenance model
include_once "../../middleware/authMiddleware.php"; // Assuming you have authentication middleware
include_once "../../logs/save.php";

$conn = include_once "../../config/database.php";
$equipment = new Equipment($conn);
$equipmentMaintenance = new EquipmentMaintenance($conn);

$request_method = $_SERVER['REQUEST_METHOD'];
logMessage("Running: $request_method");

// Equipment-related operations
// -----------------------------------------

// Create new equipment
if ($request_method == 'POST' && isset($_POST['action']) && $_POST['action'] == 'add_equipment') {
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
if ($request_method == 'GET' && isset($_GET['action']) && $_GET['action'] == 'get_equipment') {
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
if ($request_method == 'PUT' && isset($_GET['action']) && $_GET['action'] == 'update_equipment_status') {
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
if ($request_method == 'DELETE' && isset($_GET['action']) && $_GET['action'] == 'delete_equipment') {
    logMessage("Deleting equipment");

    $input = json_decode(file_get_contents("php://input"), true);

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

// Equipment Maintenance-related operations
// -----------------------------------------

// Create new maintenance record
if ($request_method == 'POST' && isset($_POST['action']) && $_POST['action'] == 'add_maintenance') {
    logMessage("Adding new maintenance record");

    $equipment_id = intval($_POST['equipment_id']);
    $maintenance_date = $_POST['maintenance_date'];
    $details = filter_var($_POST['details'], FILTER_SANITIZE_STRING);
    $next_maintenance_date = $_POST['next_maintenance_date'];

    if ($equipmentMaintenance->addMaintenance($equipment_id, $maintenance_date, $details, $next_maintenance_date)) {
        logMessage("Maintenance added for equipment: $equipment_id");
        echo json_encode(["message" => "Maintenance record added successfully"]);
    } else {
        logMessage("Failed to add maintenance for equipment: $equipment_id");
        echo json_encode(["error" => "Failed to add maintenance record"]);
    }
}

// Get maintenance records
if ($request_method == 'GET' && isset($_GET['action']) && $_GET['action'] == 'get_maintenance') {
    logMessage("Fetching maintenance records");

    if (isset($_GET['maintenance_id'])) {
        $maintenance_id = intval($_GET['maintenance_id']);
        $result = $equipmentMaintenance->getMaintenance($maintenance_id);
    } else {
        $result = $equipmentMaintenance->getMaintenance();
    }

    if ($result) {
        logMessage("Maintenance records fetched");
        echo json_encode($result);
    } else {
        logMessage("No maintenance records found");
        echo json_encode(["error" => "No maintenance records found"]);
    }
}

// Update maintenance record
if ($request_method == 'PUT' && isset($_GET['action']) && $_GET['action'] == 'update_maintenance') {
    logMessage("Updating maintenance record");

    $data = json_decode(file_get_contents("php://input"), true);

    if (isset($data['maintenance_id']) && isset($data['maintenance_date']) && isset($data['details']) && isset($data['next_maintenance_date'])) {
        $maintenance_id = intval($data['maintenance_id']);
        $maintenance_date = $data['maintenance_date'];
        $details = filter_var($data['details'], FILTER_SANITIZE_STRING);
        $next_maintenance_date = $data['next_maintenance_date'];

        if ($equipmentMaintenance->updateMaintenance($maintenance_id, $maintenance_date, $details, $next_maintenance_date)) {
            logMessage("Maintenance record updated: $maintenance_id");
            echo json_encode(["message" => "Maintenance record updated successfully"]);
        } else {
            logMessage("Failed to update maintenance record: $maintenance_id");
            echo json_encode(["error" => "Maintenance record update failed"]);
        }
    } else {
        logMessage("Invalid input for maintenance update");
        echo json_encode(["error" => "Invalid input data"]);
    }
}

// Delete maintenance record
if ($request_method == 'DELETE' && isset($_GET['action']) && $_GET['action'] == 'delete_maintenance') {
    logMessage("Deleting maintenance record");

    $input = json_decode(file_get_contents("php://input"), true);

    if (isset($input['maintenance_id'])) {
        $maintenance_id = intval($input['maintenance_id']);

        if ($equipmentMaintenance->deleteMaintenance($maintenance_id)) {
            logMessage("Maintenance record deleted: $maintenance_id");
            echo json_encode(["message" => "Maintenance record deleted successfully"]);
        } else {
            logMessage("Failed to delete maintenance record: $maintenance_id");
            echo json_encode(["error" => "Maintenance deletion failed"]);
        }
    } else {
        logMessage("Invalid input for maintenance deletion");
        echo json_encode(["error" => "Invalid input data"]);
    }
}

?>
