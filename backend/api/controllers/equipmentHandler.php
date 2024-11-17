<?php
// equipmentHandler.php

include_once "../models/Equipment.php";
include_once "../../logs/save.php";

function addEquipment() {
    logMessage("add equip function running...");

    $equipment = new Equipment(); 

    $name = filter_var($_POST['name'], FILTER_SANITIZE_STRING);
    $purchase_date = $_POST['purchase_date'];
    $status = filter_var($_POST['status'], FILTER_SANITIZE_STRING);
    $maintenance_frequency = intval($_POST['maintenance_frequency']);

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

function updateEquipment() {
    logMessage("updateEquipment function running...");

    $equipment = new Equipment();
    $data = json_decode(file_get_contents("php://input"), true);

    if (
        isset($data['equipment_id']) &&
        isset($data['name']) &&
        isset($data['purchase_date']) &&
        isset($data['status']) &&
        isset($data['maintenance_frequency'])
    ) {

        $equipment_id = intval($data['equipment_id']);
        $name = filter_var($data['name'], FILTER_SANITIZE_STRING);
        $purchase_date = filter_var($data['purchase_date'], FILTER_SANITIZE_STRING);
        $status = filter_var($data['status'], FILTER_SANITIZE_STRING);
        $maintenance_frequency = intval($data['maintenance_frequency']);

        if ($equipment->updateEquipment($equipment_id, $name, $purchase_date, $status, $maintenance_frequency)) {
            logMessage("Equipment updated successfully: ID $equipment_id");
            echo json_encode(["message" => "Equipment updated successfully"]);
        } else {
            logMessage("Failed to update equipment: ID $equipment_id");
            echo json_encode(["error" => "Equipment update failed"]);
        }
    } else {
        logMessage("Invalid input for equipment update");
        echo json_encode(["error" => "Invalid input data"]);
    }
}


function deleteEquipment() {
    logMessage("delete equip function running...");

    $equipment = new Equipment();

    if (isset($_GET['equipment_id'])) {
        $equipment_id = intval($_GET['equipment_id']);

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
