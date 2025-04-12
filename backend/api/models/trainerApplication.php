<?php
// models/TrainerCareer.php

include_once "../../logs/save.php";
require_once "../../config/database.php";

class TrainerApplication
{
    private $conn;
    private $table = "trainer_application";

    public function __construct()
    {
        $this->conn = DatabaseConnection::getInstance()->getConnection();
        logMessage("TrainerCareer model initialized with database connection.");
    }

    private function generateApplicationID()
    {
        // Use SUBSTRING to extract the numeric part and ORDER BY it as an integer
        $query = "SELECT application_id 
                  FROM " . $this->table . " 
                  ORDER BY CAST(SUBSTRING(application_id, 3) AS UNSIGNED) DESC 
                  LIMIT 1";
        $result = $this->conn->query($query);

        if ($result && $row = $result->fetch_assoc()) {
            // Extract the numeric part of the last ID and increment it
            $lastID = (int)substr($row['application_id'], 2); // Remove 'TA' and convert to integer
            $newID = $lastID + 1;
            return 'TA' . $newID; // Format as TAX where X is the incremented value
        } else {
            // If no records exist, start from 1
            logMessage("No existing applications found, starting ID from TA1.");
            return 'TA1';
        }
    }

    public function addApplication($career_id, $firstName, $lastName, $NIC, $dob, $email,  $address, $gender, $mobile_number, $years_of_experience, $specialties, $cv, $approved_by_owner)
    {
        logMessage("Adding new application...");

        if (!$this->conn) {
            logMessage("Database connection is not valid.");
            return false;
        }

        // generate carere_id
        $application_id = $this->generateApplicationID();
        if (!$application_id) {
            logMessage("Application ID generation failed");
            return false;
        }
        logMessage("Query prepared for adding application: $career_id");
        $query = "INSERT INTO " . $this->table . " (application_id, career_id, firstName, lastName, NIC, DOB, email, address, gender, mobile_number, years_of_experience, specialties, cv, submission_date, approved_by_owner) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,NOW(), ?)";
        $stmt = $this->conn->prepare($query);
        logMessage("Query prepared for adding application: $career_id");
        if ($stmt === false) {
            logMessage("Error preparing statement for application insertion: " . $this->conn->error);
            return false;
        }

        if (!$stmt->bind_param(
            "ssssssssssisss",
            $application_id,
            $career_id,
            $firstName,
            $lastName,
            $NIC,
            $dob,
            $email,
            $address,
            $gender,
            $mobile_number,
            $years_of_experience,
            $specialties,
            $cv,
            $approved_by_owner
        )) {
            logMessage("Error binding parameters for application insertion: " . $stmt->error);
            return false;
        }
        logMessage("Query bound for adding application: $career_id");

        if ($stmt->execute()) {
            logMessage("Application added successfully: $application_id");
            return true;
        } else {
            logMessage("Trainer application insertion failed: " . $stmt->error);
            return false;
        }
    }

    public function getApplications()
    {
        logMessage("Fetching trainer applications...");

        if (!$this->conn) {
            logMessage("Database connection is not valid.");
            return false;
        }

        $query = "SELECT * FROM " . $this->table;
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for fetching trainer applications: " . $this->conn->error);
            return false;
        }

        if ($stmt->execute()) {
            $result = $stmt->get_result();

            if ($result && $result->num_rows > 0) {
                $careers = $result->fetch_all(MYSQLI_ASSOC);
                logMessage("Trainer applicatins fetched successfully.");
                return $careers;
            } else {
                logMessage("No trainer applications found.");
                return [];
            }
        } else {
            logMessage("Error fetching trainer applications: " . $stmt->error);
            return false;
        }
    }

    public function updateApplicationStatus($application_id, $approved_by_owner)
    {

        logMessage("Updating trainer application status...");

        if (!$this->conn) {
            logMessage("Database connection is not valid.");
            return false;
        }

        $query = "UPDATE " . $this->table . " SET approved_by_owner = ? WHERE application_id = ?";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for updating trainer applciation status: " . $this->conn->error);
            return false;
        }

        if (!$stmt->bind_param("ss", $approved_by_owner, $application_id)) {
            logMessage("Error binding parameters for updating trainer application status: " . $stmt->error);
            return false;
        }
        logMessage("Query bound for updating trainer application status: $application_id");

        if ($stmt->execute()) {
            logMessage("Trainer application status updated successfully for ID: $application_id");
            return true;
        } else {
            logMessage("Trainer application status update failed: " . $stmt->error);
            return false;
        }
    }

    public function deleteApplication($application_id)
    {
        logMessage("Deleting trainer application...");

        if (!$this->conn) {
            logMessage("Database connection is not valid.");
            return false;
        }

        $query = "DELETE FROM " . $this->table . " WHERE application_id = ?";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for deleting trainer application: " . $this->conn->error);
            return false;
        }

        if (!$stmt->bind_param("s", $application_id)) {
            logMessage("Error binding parameters for deleting trainer application: " . $stmt->error);
            return false;
        }
        logMessage("Query bound for deleting trainer application: $application_id");

        if ($stmt->execute()) {
            logMessage("Trainer application deleted successfully for ID: $application_id");
            return true;
        } else {
            logMessage("Trainer application deletion failed: " . $stmt->error);
            return false;
        }
    }

    public function getApplicationByEmail($email)
    {
        logMessage("Fetching application by email: $email");

        // Prepare the query
        $query = "SELECT * FROM " . $this->table . " WHERE email = ?";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for getApplicationByEmail: " . $this->conn->error);
            return false;
        }

        // Bind the email parameter
        $stmt->bind_param("s", $email);

        // Execute the query
        if ($stmt->execute()) {
            $result = $stmt->get_result();
            return $result->fetch_assoc();
        } else {
            logMessage("Error executing getApplicationByEmail query: " . $stmt->error);
            return false;
        }
    }
}
