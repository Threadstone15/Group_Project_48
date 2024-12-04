<?php

include_once "../../logs/save.php";
require_once "../../config/database.php";

class EquipmentTypes
{
    private $conn;
    private $table = "equipment_types";

    public function __construct()
    {
        $this->conn = DatabaseConnection::getInstance()->getConnection();
        logMessage("EquipmentTypes model initialized with database connection.");
    }

    // Add a new equipment type with no_items = 0
    public function addEquipmentType($type_name)
    {
        logMessage("Adding new equipment type: $type_name");

        $query = "INSERT INTO " . $this->table . " (type_name, no_items) VALUES (?, 0)";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for adding equipment type: " . $this->conn->error);
            return false;
        }

        if (!$stmt->bind_param("s", $type_name)) {
            logMessage("Error binding parameters for adding equipment type: " . $stmt->error);
            return false;
        }

        if ($stmt->execute()) {
            logMessage("Equipment type added successfully: $type_name");
            return true;
        } else {
            logMessage("Error adding equipment type: " . $stmt->error);
            return false;
        }
    }

    // Update the number of items for an equipment type (increase or decrease by 1)
    public function updateEquipmentCount($type_name, $increment = true)
    {
        $operation = $increment ? "+" : "-";
        logMessage("Updating equipment count for type: $type_name, operation: $operation");

        $query = "UPDATE " . $this->table . " SET no_items = no_items $operation 1 WHERE type_name = ?";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for updating equipment count: " . $this->conn->error);
            return false;
        }

        if (!$stmt->bind_param("s", $type_name)) {
            logMessage("Error binding parameters for updating equipment count: " . $stmt->error);
            return false;
        }

        if ($stmt->execute()) {
            logMessage("Equipment count updated successfully for type: $type_name");
            return true;
        } else {
            logMessage("Error updating equipment count: " . $stmt->error);
            return false;
        }
    }

    // Get all equipment types with their counts
    public function getEquipmentTypes()
    {
        logMessage("Fetching all equipment types...");

        $query = "SELECT * FROM " . $this->table . " ORDER BY type_name ASC";

        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for fetching equipment types: " . $this->conn->error);
            return false;
        }

        if ($stmt->execute()) {
            $result = $stmt->get_result();
            if ($result && $result->num_rows > 0) {
                $equipmentTypes = $result->fetch_all(MYSQLI_ASSOC);
                logMessage("Equipment types fetched successfully.");
                return $equipmentTypes;
            } else {
                logMessage("No equipment types found.");
                return [];
            }
        } else {
            logMessage("Error fetching equipment types: " . $stmt->error);
            return false;
        }
    }

    public function updateEquipmentName($old_name, $new_name)
    {
        logMessage("Updating equipment name from '$old_name' to '$new_name'");

        $query = "UPDATE " . $this->table . " SET type_name = ? WHERE type_name = ?";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for updating equipment name: " . $this->conn->error);
            return false;
        }

        if (!$stmt->bind_param("ss", $new_name, $old_name)) {
            logMessage("Error binding parameters for updating equipment name: " . $stmt->error);
            return false;
        }

        if ($stmt->execute()) {
            logMessage("Equipment name updated successfully from '$old_name' to '$new_name'");
            return true;
        } else {
            logMessage("Error updating equipment name: " . $stmt->error);
            return false;
        }
    }

    public function getEquipmentName($type)
    {
        logMessage("Checking if equipment type exists: $type");

        // Step 1: Check if the type exists and get the no_items
        $query = "SELECT no_items FROM " . $this->table . " WHERE type_name = ?";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for checking equipment type: " . $this->conn->error);
            return false;
        }

        if (!$stmt->bind_param("s", $type)) {
            logMessage("Error binding parameters for checking equipment type: " . $stmt->error);
            return false;
        }

        if ($stmt->execute()) {
            $result = $stmt->get_result();
            if ($result->num_rows > 0) {
                // Step 2: If type exists, fetch no_items and increment by 1
                $row = $result->fetch_assoc();
                $no_items = $row['no_items'] + 1;

                // Update the no_items in the table
                $updateQuery = "UPDATE " . $this->table . " SET no_items = ? WHERE type_name = ?";
                $updateStmt = $this->conn->prepare($updateQuery);

                if ($updateStmt === false) {
                    logMessage("Error preparing update statement: " . $this->conn->error);
                    return false;
                }

                if (!$updateStmt->bind_param("is", $no_items, $type)) {
                    logMessage("Error binding parameters for update: " . $updateStmt->error);
                    return false;
                }

                if ($updateStmt->execute()) {
                    logMessage("Equipment type '$type' updated with no_items = $no_items");
                    return $type . "_" . $no_items;
                } else {
                    logMessage("Error updating no_items: " . $updateStmt->error);
                    return false;
                }
            } else {
                // Step 3: If type does not exist, insert new type with no_items = 1
                $insertQuery = "INSERT INTO " . $this->table . " (type_name, no_items) VALUES (?, 1)";
                $insertStmt = $this->conn->prepare($insertQuery);

                if ($insertStmt === false) {
                    logMessage("Error preparing insert statement: " . $this->conn->error);
                    return false;
                }

                if (!$insertStmt->bind_param("s", $type)) {
                    logMessage("Error binding parameters for insert: " . $insertStmt->error);
                    return false;
                }

                if ($insertStmt->execute()) {
                    logMessage("New equipment type '$type' inserted with no_items = 1");
                    return $type . "_1";
                } else {
                    logMessage("Error inserting new equipment type: " . $insertStmt->error);
                    return false;
                }
            }
        } else {
            logMessage("Error executing query: " . $stmt->error);
            return false;
        }
    }
}
