<?php
// equipmentMaintenanceHandler.php

include_once "../models/EquipmentMaintenance.php";
include_once "../../logs/save.php";

// Add Maintenance
function addMaintenance() {
    logMessage("addMaintenance function running...");

    $equipmentMaintenance = new EquipmentMaintenance();

    // Retrieve and sanitize POST data
    $equipment_id = intval($_POST['equipment_id']);
    $maintenance_date = $_POST['maintainance_date'];
    $details = filter_var($_POST['details'], FILTER_SANITIZE_STRING);
    $next_maintenance_date = $_POST['next_maintenance_date'];

    // Log received data
    logMessage("Received data: equipment_id = $equipment_id, maintenance_date = $maintenance_date, details = $details, next_maintenance_date = $next_maintenance_date");

    // Validate input
    if (!empty($equipment_id) && !empty($maintenance_date) && !empty($details) && !empty($next_maintenance_date)) {
        // Attempt to add maintenance record
        if ($equipmentMaintenance->addMaintenance($equipment_id, $maintenance_date, $details, $next_maintenance_date)) {
            logMessage("Maintenance added for equipment: $equipment_id");
            echo json_encode(["message" => "Maintenance record added successfully"]);
        } else {
            logMessage("Failed to add maintenance for equipment: $equipment_id");
            echo json_encode(["error" => "Failed to add maintenance record"]);
        }
    } else {
        logMessage("Invalid input for adding maintenance");
        echo json_encode(["error" => "Invalid input data"]);
    }
}



// Get Maintenance Records
function getMaintenance() {
    $equipmentMaintenance = new EquipmentMaintenance();

    $result = $equipmentMaintenance->getMaintenance();

    if ($result) {
        logMessage("Maintenance data fetched successfully");
        echo json_encode($result);
    } else {
        logMessage("No maintenance records found");
        echo json_encode(["error" => "No maintenance records found"]);
    }
}

// Update Maintenance Record
function updateMaintenance() {
    $equipmentMaintenance = new EquipmentMaintenance();
    $data = json_decode(file_get_contents("php://input"), true);

    if (isset($data['maintenance_id'], $data['equipment_id'], $data['maintenance_date'], $data['details'], $data['next_maintenance_date'])) {
        $maintenance_id = intval($data['maintenance_id']);
        $equipment_id = intval($data['equipment_id']);
        $maintenance_date = $data['maintenance_date'];
        $details = filter_var($data['details'], FILTER_SANITIZE_STRING);
        $next_maintenance_date = $data['next_maintenance_date'];

        if ($equipmentMaintenance->updateMaintenance($maintenance_id, $equipment_id, $maintenance_date, $details, $next_maintenance_date)) {
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

// Delete Maintenance Record
function deleteMaintenance() {

    logMessage("delete equipMaintaince function running...");

    $equipmentMaintenance = new EquipmentMaintenance();

    if (isset($_GET['maintenance_id'])) {
        $maintenance_id = intval($_GET['maintenance_id']);

        if ($equipmentMaintenance->deleteMaintenance($maintenance_id)) {
            logMessage("Maintenance record deleted: $maintenance_id");
            echo json_encode(["message" => "Maintenance record deleted successfully"]);
        } else {
            logMessage("Failed to delete maintenance record: $maintenance_id");
            echo json_encode(["error" => "Maintenance record deletion failed"]);
        }
    } else {
        logMessage("Invalid input for maintenance deletion");
        echo json_encode(["error" => "Invalid input data"]);
    }
}
?>
