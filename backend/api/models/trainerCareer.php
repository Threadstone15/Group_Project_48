<?php
// models/TrainerCareer.php

include_once "../../logs/save.php"; 
require_once "../../config/database.php"; 

class TrainerCareer {
    private $conn;
    private $table = "trainer_career";

    public function __construct() {
        $this->conn = DatabaseConnection::getInstance()->getConnection();
        logMessage("TrainerCareer model initialized with database connection.");
    }

    private function generateCareerID() {
        // Use SUBSTRING to extract the numeric part and ORDER BY it as an integer
        $query = "SELECT career_id 
                  FROM " . $this->table . " 
                  ORDER BY CAST(SUBSTRING(career_id, 2) AS UNSIGNED) DESC 
                  LIMIT 1";
        $result = $this->conn->query($query);
    
        if ($result && $row = $result->fetch_assoc()) {
            // Extract the numeric part of the last ID and increment it
            $lastID = (int)substr($row['career_id'], 1); // Remove 'C' and convert to integer
            $newID = $lastID + 1;
            return 'C' . $newID; // Format as CX where X is the incremented value
        } else {
            // If no records exist, start from 1
            logMessage("No existing careers found, starting ID from C1.");
            return 'C1';
        }
    }

    public function addCareer($job_role, $requirements) {
        logMessage("Adding new trainer career...");

        if (!$this->conn) {
            logMessage("Database connection is not valid.");
            return false;
        }

        // generate carere_id
        $career_id = $this->generateCareerID();
        if (!$career_id) {
            logMessage("Career ID generation failed");
            return false;
        }

        $query = "INSERT INTO " . $this->table . " (career_id, job_role, requirements) VALUES (?, ?, ?)";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for trainer career insertion: " . $this->conn->error);
            return false;
        }

        if (!$stmt->bind_param("sss",$career_id,  $job_role, $requirements)) {
            logMessage("Error binding parameters for trainer career insertion: " . $stmt->error);
            return false;
        }
        logMessage("Query bound for adding trainer career: $job_role");

        if ($stmt->execute()) {
            logMessage("Trainer career added successfully: $job_role");
            return true;
        } else {
            logMessage("Trainer career insertion failed: " . $stmt->error);
            return false;
        }
    }

    public function getCareer() {
        logMessage("Fetching trainer careers...");

        if (!$this->conn) {
            logMessage("Database connection is not valid.");
            return false;
        }

        $query = "SELECT * FROM " . $this->table;
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for fetching trainer careers: " . $this->conn->error);
            return false;
        }

        if ($stmt->execute()) {
            $result = $stmt->get_result();
    
            if ($result && $result->num_rows > 0) {
                $careers = $result->fetch_all(MYSQLI_ASSOC);
                logMessage("Trainer careers fetched successfully.");
                return $careers;
            } else {
                logMessage("No trainer careers found.");
                return [];
            }
        } else {
            logMessage("Error fetching trainer careers: " . $stmt->error);
            return false;
        }
    }
    

    public function updateCareer($career_id, $job_role, $requirements) {

        logMessage("Updating trainer career...");

        if (!$this->conn) {
            logMessage("Database connection is not valid.");
            return false;
        }

        $query = "UPDATE " . $this->table . " SET job_role = ?, requirements = ? WHERE career_id = ?";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for updating trainer career: " . $this->conn->error);
            return false;
        }

        if (!$stmt->bind_param("sss", $job_role, $requirements, $career_id)) {
            logMessage("Error binding parameters for updating trainer career: " . $stmt->error);
            return false;
        }
        logMessage("Query bound for updating trainer career: $career_id");

        if ($stmt->execute()) {
            logMessage("Trainer career updated successfully for ID: $career_id");
            return true;
        } else {
            logMessage("Trainer career update failed: " . $stmt->error);
            return false;
        }
    }

    public function deleteCareer($career_id) {
        logMessage("Deleting trainer career...");

        if (!$this->conn) {
            logMessage("Database connection is not valid.");
            return false;
        }

        $query = "DELETE FROM " . $this->table . " WHERE career_id = ?";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for deleting trainer career: " . $this->conn->error);
            return false;
        }

        if (!$stmt->bind_param("s", $career_id)) {
            logMessage("Error binding parameters for deleting trainer career: " . $stmt->error);
            return false;
        }
        logMessage("Query bound for deleting trainer career: $career_id");

        if ($stmt->execute()) {
            logMessage("Trainer career deleted successfully for ID: $career_id");
            return true;
        } else {
            logMessage("Trainer career deletion failed: " . $stmt->error);
            return false;
        }
    }
}
?>
