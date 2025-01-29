<?php
// api/models/Job.php

include_once "../../logs/save.php"; 
require_once "../../config/database.php"; 

class Job {
    private $conn;
    private $table = "job";

    public function __construct() {
        $this->conn = DatabaseConnection::getInstance()->getConnection();
        logMessage("Job model initialized with database connection.");
    }

    public function addJob($publisher_id, $title, $description) {
        logMessage("Adding new job...");

        if (!$this->conn) {
            logMessage("Database connection is not valid.");
            return false;
        }

        $query = "INSERT INTO " . $this->table . " (publisher_id, title, description) VALUES (?, ?, ?)";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for job insertion: " . $this->conn->error);
            return false;
        }

        if (!$stmt->bind_param("iss", $publisher_id, $title, $description)) {
            logMessage("Error binding parameters for job insertion: " . $stmt->error);
            return false;
        }
        logMessage("Query bound for adding job: $title");

        if ($stmt->execute()) {
            logMessage("Job added successfully: $title");
            return true;
        } else {
            logMessage("Job insertion failed: " . $stmt->error);
            return false;
        }
    }

    public function getJobs() {
        logMessage("Fetching jobs...");

        $query = "SELECT * FROM " . $this->table;
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for fetching jobs: " . $this->conn->error);
            return false;
        }

        if ($stmt->execute()) {
            $result = $stmt->get_result();
            if ($result && $result->num_rows > 0) {
                $jobs = $result->fetch_all(MYSQLI_ASSOC);
                logMessage("Jobs fetched successfully");
                return $jobs;
            } else {
                logMessage("No jobs found");
                return [];
            }
        } else {
            logMessage("Error fetching jobs: " . $stmt->error);
            return false;
        }
    }

    public function updateJob($job_id, $publisher_id, $title, $description) {
        logMessage("Updating job with ID: $job_id");

        $query = "UPDATE " . $this->table . " SET publisher_id = ?, title = ?, description = ? WHERE job_id = ?";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for updating job: " . $this->conn->error);
            return false;
        }

        if (!$stmt->bind_param("issi", $publisher_id, $title, $description, $job_id)) {
            logMessage("Error binding parameters for updating job: " . $stmt->error);
            return false;
        }
        logMessage("Query bound for updating job: $job_id");

        if ($stmt->execute()) {
            logMessage("Job updated successfully for ID: $job_id");
            return true;
        } else {
            logMessage("Job update failed: " . $stmt->error);
            return false;
        }
    }

    public function deleteJob($job_id) {
        logMessage("Deleting job with ID: $job_id");

        $query = "DELETE FROM " . $this->table . " WHERE job_id = ?";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for deleting job: " . $this->conn->error);
            return false;
        }

        if (!$stmt->bind_param("i", $job_id)) {
            logMessage("Error binding parameters for deleting job: " . $stmt->error);
            return false;
        }
        logMessage("Query bound for deleting job: $job_id");

        if ($stmt->execute()) {
            logMessage("Job deleted successfully for ID: $job_id");
            return true;
        } else {
            logMessage("Job deletion failed: " . $stmt->error);
            return false;
        }
    }
}
?>
