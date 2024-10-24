<?php
// api/models/Equipment.php

include_once "../../logs/save.php"; // Assuming logMessage is defined here

class Equipment {
    private $conn;
    private $table = "equipment";

    public function __construct($db) {
        $this->conn = $db;
        logMessage("Equipment model initialized");
    }

    // Create Equipment
    public function addEquipment($name, $purchase_date, $status, $maintenance_frequency) {
        logMessage("Adding new equipment...");

        // Prepare the query
        $query = "INSERT INTO " . $this->table . " (name, purchase_date, status, maintenance_frequency) 
                  VALUES (?, ?, ?, ?)";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for equipment insertion: " . $this->conn->error);
            return false;
        }

        // Bind parameters
        $stmt->bind_param("sssi", $name, $purchase_date, $status, $maintenance_frequency);
        logMessage("Query bound for adding equipment: $name");

        // Execute the query
        if ($stmt->execute()) {
            logMessage("Equipment added successfully: $name");
            return true;
        } else {
            logMessage("Equipment insertion failed: " . $stmt->error);
            return false;
        }
    }

    // Read Equipment
    public function getEquipment($equipment_id = null) {
        logMessage("Fetching equipment...");

        if ($equipment_id) {
            // Fetch specific equipment
            $query = "SELECT * FROM " . $this->table . " WHERE equipment_id = ?";
            $stmt = $this->conn->prepare($query);

            if ($stmt === false) {
                logMessage("Error preparing statement for fetching equipment: " . $this->conn->error);
                return false;
            }

            $stmt->bind_param("i", $equipment_id);
        } else {
            // Fetch all equipment
            $query = "SELECT * FROM " . $this->table;
            $stmt = $this->conn->prepare($query);

            if ($stmt === false) {
                logMessage("Error preparing statement for fetching all equipment: " . $this->conn->error);
                return false;
            }
        }

        // Execute the query
        if ($stmt->execute()) {
            $result = $stmt->get_result();
            $equipment = $result->fetch_all(MYSQLI_ASSOC);
            logMessage("Equipment fetched successfully");
            return $equipment;
        } else {
            logMessage("Error fetching equipment: " . $stmt->error);
            return false;
        }
    }

    // Update Equipment Status
    public function updateEquipmentStatus($equipment_id, $status) {
        logMessage("Updating equipment status...");

        // Prepare the query
        $query = "UPDATE " . $this->table . " SET status = ? WHERE equipment_id = ?";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for updating equipment status: " . $this->conn->error);
            return false;
        }

        // Bind parameters
        $stmt->bind_param("si", $status, $equipment_id);
        logMessage("Query bound for updating equipment status: $equipment_id to $status");

        // Execute the query
        if ($stmt->execute()) {
            logMessage("Equipment status updated successfully: $equipment_id");
            return true;
        } else {
            logMessage("Equipment status update failed: " . $stmt->error);
            return false;
        }
    }

    // Delete Equipment
    public function deleteEquipment($equipment_id) {
        logMessage("Deleting equipment...");

        // Prepare the query
        $query = "DELETE FROM " . $this->table . " WHERE equipment_id = ?";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for deleting equipment: " . $this->conn->error);
            return false;
        }

        // Bind parameter
        $stmt->bind_param("i", $equipment_id);
        logMessage("Query bound for deleting equipment: $equipment_id");

        // Execute the query
        if ($stmt->execute()) {
            logMessage("Equipment deleted successfully: $equipment_id");
            return true;
        } else {
            logMessage("Equipment deletion failed: " . $stmt->error);
            return false;
        }
    }
}
?>
