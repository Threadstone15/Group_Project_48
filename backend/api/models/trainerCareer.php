<?php
// models/TrainerCareer.php

include_once "../../logs/save.php";

class TrainerCareer {
    private $conn;
    private $table = "trainer_career";

    public function __construct($db) {
        $this->conn = $db;
        logMessage("TrainerCareer model initialized");
    }

    public function addCareer($job_role, $requirements) {
        logMessage("Adding new trainer career...");

        $query = "INSERT INTO " . $this->table . " (job_role, requirements) VALUES (?, ?)";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for trainer career insertion: " . $this->conn->error);
            return false;
        }

        $stmt->bind_param("ss", $job_role, $requirements);
        logMessage("Query bound for adding trainer career: $job_role");

        if ($stmt->execute()) {
            logMessage("Trainer career added successfully: $job_role");
            return true;
        } else {
            logMessage("Trainer career insertion failed: " . $stmt->error);
            return false;
        }
    }

    public function getCareer($career_id = null) {
        logMessage("Fetching trainer careers...");

        if ($career_id) {
            $query = "SELECT * FROM " . $this->table . " WHERE career_id = ?";
            $stmt = $this->conn->prepare($query);

            if ($stmt === false) {
                logMessage("Error preparing statement for fetching trainer career: " . $this->conn->error);
                return false;
            }

            $stmt->bind_param("i", $career_id);
        } else {
            $query = "SELECT * FROM " . $this->table;
            $stmt = $this->conn->prepare($query);

            if ($stmt === false) {
                logMessage("Error preparing statement for fetching all trainer careers: " . $this->conn->error);
                return false;
            }
        }

        if ($stmt->execute()) {
            $result = $stmt->get_result();
            $careers = $result->fetch_all(MYSQLI_ASSOC);
            logMessage("Trainer careers fetched successfully");
            return $careers;
        } else {
            logMessage("Error fetching trainer careers: " . $stmt->error);
            return false;
        }
    }

    public function updateCareer($career_id, $job_role, $requirements) {
        logMessage("Updating trainer career...");

        $query = "UPDATE " . $this->table . " SET job_role = ?, requirements = ? WHERE career_id = ?";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for updating trainer career: " . $this->conn->error);
            return false;
        }

        $stmt->bind_param("ssi", $job_role, $requirements, $career_id);
        logMessage("Query bound for updating trainer career: $career_id");

        if ($stmt->execute()) {
            logMessage("Trainer career updated successfully: $career_id");
            return true;
        } else {
            logMessage("Trainer career update failed: " . $stmt->error);
            return false;
        }
    }

    public function deleteCareer($career_id) {
        logMessage("Deleting trainer career...");

        $query = "DELETE FROM " . $this->table . " WHERE career_id = ?";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for deleting trainer career: " . $this->conn->error);
            return false;
        }

        $stmt->bind_param("i", $career_id);
        logMessage("Query bound for deleting trainer career: $career_id");

        if ($stmt->execute()) {
            logMessage("Trainer career deleted successfully: $career_id");
            return true;
        } else {
            logMessage("Trainer career deletion failed: " . $stmt->error);
            return false;
        }
    }
}
?>
