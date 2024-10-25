<?php

// api/models/EquipmentMaintenance.php

include_once "../../logs/save.php"; // Assuming logMessage is defined here

class EquipmentMaintenance {
    private $conn;
    private $table = "equipment_maintenance";

    public function __construct($db) {
        $this->conn = $db;
        logMessage("EquipmentMaintenance model initialized");
    }

    // Create a new maintenance record
    public function addMaintenance($equipment_id, $maintenance_date, $details, $next_maintenance_date) {
        logMessage("Adding new maintenance record...");

        // Prepare the query
        $query = "INSERT INTO " . $this->table . " (equipment_id, maintenance_date, details, next_maintenance_date)
                  VALUES (?, ?, ?, ?)";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for maintenance insertion: " . $this->conn->error);
            return false;
        }

        // Bind parameters
        $stmt->bind_param("isss", $equipment_id, $maintenance_date, $details, $next_maintenance_date);
        logMessage("Query bound for adding maintenance for equipment: $equipment_id");

        // Execute the query
        if ($stmt->execute()) {
            logMessage("Maintenance added successfully for equipment: $equipment_id");
            return true;
        } else {
            logMessage("Maintenance insertion failed: " . $stmt->error);
            return false;
        }
    }

    // Read Maintenance Records
    public function getMaintenance($maintenance_id = null) {
        logMessage("Fetching maintenance data...");

        if ($maintenance_id) {
            // Fetch specific maintenance record
            $query = "SELECT * FROM " . $this->table . " WHERE maintenance_id = ?";
            $stmt = $this->conn->prepare($query);

            if ($stmt === false) {
                logMessage("Error preparing statement for fetching maintenance record: " . $this->conn->error);
                return false;
            }

            $stmt->bind_param("i", $maintenance_id);
        } else {
            // Fetch all maintenance records
            $query = "SELECT * FROM " . $this->table;
            $stmt = $this->conn->prepare($query);

            if ($stmt === false) {
                logMessage("Error preparing statement for fetching all maintenance records: " . $this->conn->error);
                return false;
            }
        }

        // Execute the query
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

    // Update Maintenance Record
    public function updateMaintenance($maintenance_id, $maintenance_date, $details, $next_maintenance_date) {
        logMessage("Updating maintenance record...");

        // Prepare the query
        $query = "UPDATE " . $this->table . " 
                  SET maintenance_date = ?, details = ?, next_maintenance_date = ? 
                  WHERE maintenance_id = ?";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for updating maintenance record: " . $this->conn->error);
            return false;
        }

        // Bind parameters
        $stmt->bind_param("sssi", $maintenance_date, $details, $next_maintenance_date, $maintenance_id);
        logMessage("Query bound for updating maintenance: $maintenance_id");

        // Execute the query
        if ($stmt->execute()) {
            logMessage("Maintenance record updated successfully: $maintenance_id");
            return true;
        } else {
            logMessage("Maintenance update failed: " . $stmt->error);
            return false;
        }
    }

    // Delete Maintenance Record
    public function deleteMaintenance($maintenance_id) {
        logMessage("Deleting maintenance record...");

        // Prepare the query
        $query = "DELETE FROM " . $this->table . " WHERE maintenance_id = ?";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for deleting maintenance: " . $this->conn->error);
            return false;
        }

        // Bind parameter
        $stmt->bind_param("i", $maintenance_id);
        logMessage("Query bound for deleting maintenance: $maintenance_id");

        // Execute the query
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
