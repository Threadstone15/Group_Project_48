<?php
// equipmentHandler.php

include_once "../models/Equipment.php";
include_once "../../logs/save.php";

function addEquipment() {
    logMessage("add equip function running...");

    // Initialize the Equipment model
    $equipment = new Equipment(); // No need for passing the $conn parameter

    // Get the data from the request
    $name = filter_var($_POST['name'], FILTER_SANITIZE_STRING);
    $purchase_date = $_POST['purchase_date'];
    $status = filter_var($_POST['status'], FILTER_SANITIZE_STRING);
    $maintenance_frequency = intval($_POST['maintenance_frequency']);

    // Call the addEquipment method from the Equipment model
    if ($equipment->addEquipment($name, $purchase_date, $status, $maintenance_frequency)) {
        logMessage("Equipment added: $name");
        echo json_encode(["message" => "Equipment added successfully"]);
    } else {
        logMessage("Failed to add equipment: $name");
        echo json_encode(["error" => "Equipment addition failed"]);
    }
}


function getEquipment() {
    logMessage("get equip function running...");
    $equipment = new Equipment();

    $result = $equipment->getEquipment();


    if ($result) {
        logMessage("Equipment data fetched");
        echo json_encode($result);
    } else {
        logMessage("No equipment found");
        echo json_encode(["error" => "No equipment found"]);
    }
}

function updateEquipmentStatus() {
    logMessage("update equip status function running...");

    $equipment = new Equipment();
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

function deleteEquipment() {
    logMessage("delete equip function running...");

    $equipment = new Equipment();
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
?>
