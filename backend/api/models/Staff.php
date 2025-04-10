<?php
// api/models/Staff.php

include_once "../../logs/save.php";
require_once "../../config/database.php";

class Staff
{
    private $conn;
    private $table = "staff";

    public function __construct()
    {
        $this->conn = DatabaseConnection::getInstance()->getConnection();
        logMessage("Staff model initialized with database connection.");
    }

    // Generate a unique Staff ID
    private function generateStaffID()
    {
        $query = "SELECT staff_id 
                  FROM " . $this->table . " 
                  ORDER BY CAST(SUBSTRING(staff_id, 2) AS UNSIGNED) DESC 
                  LIMIT 1";
        $result = $this->conn->query($query);

        if ($result && $row = $result->fetch_assoc()) {
            $lastID = (int)substr($row['staff_id'], 1);
            $newID = $lastID + 1;
            return 'S' . $newID;
        } else {
            logMessage("No existing staff found, starting ID from S1.");
            return 'S1';
        }
    }

    // Create staff record
    public function createStaff($user_id, $firstName, $lastName, $dob, $phone, $address, $gender)
    {
        logMessage("Creating staff...");

        $query = "INSERT INTO " . $this->table . " (staff_id, user_id, first_name, last_name, DOB, phone, address, gender, join_date)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for staff creation: " . $this->conn->error);
            return false;
        }

        $staff_id = $this->generateStaffID();
        if (!$staff_id) {
            logMessage("Staff ID generation failed");
            return false;
        }

        $stmt->bind_param("sissssss", $staff_id, $user_id, $firstName, $lastName, $dob, $phone, $address, $gender);

        if ($stmt->execute()) {
            logMessage("Staff created successfully: $firstName $lastName");
            return true;
        } else {
            logMessage("Staff creation failed: " . $stmt->error);
            return false;
        }
    }

    // Read staff records
    public function getAllStaff()
    {
        logMessage("Fetching all staff records...");

        $query = "SELECT * FROM " . $this->table;
        $result = $this->conn->query($query);

        if ($result === false) {
            logMessage("Error fetching staff records: " . $this->conn->error);
            return false;
        }

        $staffRecords = [];
        while ($row = $result->fetch_assoc()) {
            $staffRecords[] = $row;
        }

        logMessage("Fetched " . count($staffRecords) . " staff records.");
        return $staffRecords;
    }

    // Get staff record by ID
    public function getStaffByID($staff_id)
    {
        logMessage("Fetching staff record with ID: $staff_id");

        $query = "SELECT * FROM " . $this->table . " WHERE staff_id = ?";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for fetching staff by ID: " . $this->conn->error);
            return false;
        }

        $stmt->bind_param("s", $staff_id);

        if ($stmt->execute()) {
            $result = $stmt->get_result();
            if ($result->num_rows > 0) {
                $staffRecord = $result->fetch_assoc();
                logMessage("Staff record fetched successfully: $staff_id");
                return $staffRecord;
            } else {
                logMessage("No staff record found with ID: $staff_id");
                return null;
            }
        } else {
            logMessage("Error executing statement for fetching staff by ID: " . $stmt->error);
            return false;
        }
    }


    // Update staff record
    public function updateStaff($staff_id, $user_id, $firstName, $lastName, $dob, $phone, $address, $gender)
    {
        logMessage("Updating staff with ID: $staff_id");

        $query = "UPDATE " . $this->table . "
                  SET user_id = ?, first_name = ?, last_name = ?, DOB = ?, phone = ?, address = ?, gender = ?
                  WHERE staff_id = ?";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for staff update: " . $this->conn->error);
            return false;
        }

        $stmt->bind_param("isssssss", $user_id, $firstName, $lastName, $dob, $phone, $address, $gender, $staff_id);

        if ($stmt->execute()) {
            logMessage("Staff updated successfully: $staff_id");
            return true;
        } else {
            logMessage("Staff update failed: " . $stmt->error);
            return false;
        }
    }

    // Delete staff record
    public function deleteStaff($staff_id)
    {
        logMessage("Deleting staff with ID: $staff_id");

        $query = "DELETE FROM " . $this->table . " WHERE staff_id = ?";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for staff deletion: " . $this->conn->error);
            return false;
        }

        $stmt->bind_param("s", $staff_id);

        if ($stmt->execute()) {
            logMessage("Staff deleted successfully: $staff_id");
            return true;
        } else {
            logMessage("Staff deletion failed: " . $stmt->error);
            return false;
        }
    }

    public function getStaffDetails($role)
    {
        logMessage("Fetching member details...");

        $query = "SELECT 
                    s.staff_id as userID, 
                    s.first_name as firstName, 
                    s.last_name as lastName, 
                    s.phone, 
                    u.user_id,
                    u.email,
                    u.status
                  FROM 
                    " . $this->table . " s
                  JOIN 
                    users u 
                  ON 
                    s.user_id = u.user_id
                  WHERE 
                    u.role = '$role'";

        $result = $this->conn->query($query);

        if ($result && $result->num_rows > 0) {
            $members = [];
            while ($row = $result->fetch_assoc()) {
                $members[] = $row;
            }
            logMessage("Member details fetched successfully.");
            return $members;
        } else {
            logMessage("No members found.");
            return [];
        }
    }
}
