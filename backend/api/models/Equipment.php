<?php

include_once "../../logs/save.php"; 
require_once "../../config/database.php"; 

class Equipment {
    private $conn;
    private $table = "equipment";

    public function __construct() {
        $this->conn = DatabaseConnection::getInstance()->getConnection();
        logMessage("Equipment model initialized with database connection.");
    }


    public function addEquipment($name, $purchase_date, $status, $maintenance_frequency) {
        logMessage("Adding new equipment...");

        if (!$this->conn) {
            logMessage("Database connection is not valid.");
            return false;
        }

        $query = "INSERT INTO " . $this->table . " (name, purchase_date, status, maintenance_frequency) 
                  VALUES (?, ?, ?, ?)";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for equipment insertion: " . $this->conn->error);
            return false;
        }

        if (!$stmt->bind_param("sssi", $name, $purchase_date, $status, $maintenance_frequency)) {
            logMessage("Error binding parameters for equipment insertion: " . $stmt->error);
            return false;
        }
        logMessage("Query bound for adding equipment: $name");

        if ($stmt->execute()) {
            logMessage("Equipment added successfully: $name");
            return true;
        } else {
            logMessage("Equipment insertion failed: " . $stmt->error);
            return false;
        }
    }

    public function getEquipment() {
        logMessage("Fetching equipment...");

            $query = "SELECT * FROM " . $this->table;
            $stmt = $this->conn->prepare($query);

            if ($stmt === false) {
                logMessage("Error preparing statement for fetching all equipment: " . $this->conn->error);
                return false;
            }    

        if ($stmt->execute()) {
            $result = $stmt->get_result();
            if ($result && $result->num_rows > 0) {
                $equipment = $result->fetch_all(MYSQLI_ASSOC);
                logMessage("Equipment fetched successfully");
                return $equipment;
            } else {
                logMessage("No equipment found");
                return [];
            }
        } else {
            logMessage("Error fetching equipment: " . $stmt->error);
            return false;
        }
    }

    public function updateEquipment($equipment_id, $name, $purchase_date, $status, $maintenance_frequency) {
        logMessage("Updating equipment with ID: $equipment_id");

        $query = "UPDATE " . $this->table . " 
                  SET name = ?, purchase_date = ?, status = ?, maintenance_frequency = ? 
                  WHERE equipment_id = ?";
        $stmt = $this->conn->prepare($query);
    
        if ($stmt === false) {
            logMessage("Error preparing statement for updating equipment: " . $this->conn->error);
            return false;
        }

        if (!$stmt->bind_param("sssii", $name, $purchase_date, $status, $maintenance_frequency, $equipment_id)) {
            logMessage("Error binding parameters for updating equipment: " . $stmt->error);
            return false;
        }
        logMessage("Query bound for updating equipment ID: $equipment_id");

        if ($stmt->execute()) {
            logMessage("Equipment updated successfully for ID: $equipment_id");
            return true;
        } else {
            logMessage("Error updating equipment: " . $stmt->error);
            return false;
        }
    }
    

    public function deleteEquipment($equipment_id) {
        logMessage("Deleting equipment with ID: $equipment_id");

        $query = "DELETE FROM " . $this->table . " WHERE equipment_id = ?";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for deleting equipment: " . $this->conn->error);
            return false;
        }

        $stmt->bind_param("i", $equipment_id);
        logMessage("Query bound for deleting equipment ID: $equipment_id");

        if ($stmt->execute()) {
            logMessage("Equipment deleted successfully with ID: $equipment_id");
            return true;
        } else {
            logMessage("Error deleting equipment: " . $stmt->error);
            return false;
        }
    }
}
?>
