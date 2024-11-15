<?php


include_once "../../logs/save.php"; 
require_once "../../config/database.php"; 

class EquipmentMaintenance {
    private $conn;
    private $table = "equipment_maintenance";

    public function __construct() {
        $this->conn = DatabaseConnection::getInstance()->getConnection();
        logMessage("EquipmentMaintenance model initialized");
    }

    public function addMaintenance($equipment_id, $maintenance_date, $details, $next_maintenance_date) {
        logMessage("Adding new maintenance record...");

        if (!$this->conn) {
            logMessage("Database connection is not valid.");
            return false;
        }

        $query = "INSERT INTO " . $this->table . " (equipment_id, maintenance_date, details, next_maintenance_date)
                  VALUES (?, ?, ?, ?)";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for maintenance insertion: " . $this->conn->error);
            return false;
        }

        $stmt->bind_param("isss", $equipment_id, $maintenance_date, $details, $next_maintenance_date);
        logMessage("Query bound for adding maintenance for equipment: $equipment_id");

        if ($stmt->execute()) {
            logMessage("Maintenance added successfully for equipment: $equipment_id");
            return true;
        } else {
            logMessage("Maintenance insertion failed: " . $stmt->error);
            return false;
        }
    }

    public function getMaintenance() {
        logMessage("Fetching maintenance data...");

        $query = "SELECT * FROM " . $this->table;
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for fetching maintenance record: " . $this->conn->error);
            return false;
        }

        if ($stmt->execute()) {
            $result = $stmt->get_result();
            $maintenance = $result->fetch_all(MYSQLI_ASSOC);
            logMessage("Maintenance data fetched successfully");
            return $maintenance;
        } else {
            logMessage("Error fetching maintenance data: " . $stmt->error);
            return false;
        }
    }

    public function updateMaintenance($maintenance_id, $equipment_id, $maintenance_date, $details, $next_maintenance_date) {
        logMessage("Updating maintenance record: $maintenance_id");

        $query = "UPDATE " . $this->table . " 
                  SET equipment_id = ?, maintenance_date = ?, details = ?, next_maintenance_date = ? 
                  WHERE maintenance_id = ?";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for updating maintenance record: " . $this->conn->error);
            return false;
        }

        $stmt->bind_param("sssi", $equipment_id, $maintenance_date, $details, $next_maintenance_date, $maintenance_id);
        logMessage("Query bound for updating maintenance: $maintenance_id");

        if ($stmt->execute()) {
            logMessage("Maintenance record updated successfully: $maintenance_id");
            return true;
        } else {
            logMessage("Maintenance update failed: " . $stmt->error);
            return false;
        }
    }

    public function deleteMaintenance($maintenance_id) {
        logMessage("Deleting maintenance record...");

        $query = "DELETE FROM " . $this->table . " WHERE maintenance_id = ?";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for deleting maintenance: " . $this->conn->error);
            return false;
        }

        $stmt->bind_param("i", $maintenance_id);
        logMessage("Query bound for deleting maintenance: $maintenance_id");

        if ($stmt->execute()) {
            logMessage("Maintenance record deleted successfully: $maintenance_id");
            return true;
        } else {
            logMessage("Maintenance deletion failed: " . $stmt->error);
            return false;
        }
    }
}

?>
