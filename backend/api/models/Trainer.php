<?php
// api/models/Trainer.php

include_once "../../logs/save.php";
require_once "../../config/database.php"; // Added to follow the structure of Member.php

class Trainer
{
    private $conn;
    private $table = "trainer";

    public function __construct()
    {
        $this->conn = DatabaseConnection::getInstance()->getConnection(); // Changed to align with Member.php
        logMessage("Trainer model initialized with database connection.");
    }

    private function generateTrainerID()
    {
        // Use SUBSTRING to extract the numeric part and ORDER BY it as an integer
        $query = "SELECT trainer_id 
                  FROM " . $this->table . " 
                  ORDER BY CAST(SUBSTRING(trainer_id, 2) AS UNSIGNED) DESC 
                  LIMIT 1";
        $result = $this->conn->query($query);

        if ($result && $row = $result->fetch_assoc()) {
            // Extract the numeric part of the last ID and increment it
            $lastID = (int) substr($row['trainer_id'], 1); // Remove 'T' and convert to integer
            $newID = $lastID + 1;
            return 'T' . $newID; // Format as TX where X is the incremented value
        } else {
            // If no records exist, start from 1
            logMessage("No existing trainers found, starting ID from T1.");
            return 'T1';
        }
    }

    public function registerTrainer($user_id, $firstName, $lastName, $NIC, $dob, $address, $mobile_number, $years_of_experience, $specialties, $cv_link, $gender)
    {
        logMessage("Registering trainer...");

        logMessage("All details: $user_id, $firstName, $lastName, $NIC, $dob, $address, $mobile_number, $years_of_experience, $specialties, $cv_link, $gender");

        $query = "INSERT INTO " . $this->table . " 
          (trainer_id, user_id, firstName, lastName, NIC, DOB, address, phone, years_of_experience, specialties, cv_link, gender) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        logMessage("Running..");
        $stmt = $this->conn->prepare($query);
        logMessage("Running..1");
        if ($stmt === false) {
            logMessage("Error preparing statement for trainer registration: " . $this->conn->error);
            return false;
        }

        $trainer_id = $this->generateTrainerID();
        logMessage("generated ID - $trainer_id");
        if (!$trainer_id) {
            logMessage("Trainer ID generation failed");
            return false;
        }

        $stmt->bind_param(
            "sissssssisss",
            $trainer_id,
            $user_id,
            $firstName,
            $lastName,
            $NIC,
            $dob,
            $address,
            $mobile_number,
            $years_of_experience,
            $specialties,
            $cv_link,
            $gender
        );


        if ($stmt->execute()) {
            logMessage("Trainer registered successfully: $firstName $lastName");
            return true;
        } else {
            logMessage("Trainer registration failed: " . $stmt->error);
            return false;
        }
    }

    public function getTrainerDetails()
    {
        logMessage("Fetching trainer details...");

        $query = "SELECT 
                    t.trainer_id as userID, 
                    t.firstName, 
                    t.lastName, 
                    t.phone, 
                    t.specialties,
                    t.gender,
                    t.DOB,
                    t.years_of_experience, 
                    u.user_id,
                    u.email,
                    u.status
                  FROM 
                    " . $this->table . " t
                  JOIN 
                    users u 
                  ON 
                    t.user_id = u.user_id
                  WHERE 
                    u.role = 'trainer'";

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

    public function getTrainerIdByUserId($user_id)
    {
        logMessage("Fetching trainer ID by user ID : $user_id...");
        $query = "SELECT trainer_id FROM " . $this->table . " WHERE user_id = ?";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing query: " . $this->conn->error);
            return false;
        }
        $stmt->bind_param("i", $user_id);
        if ($stmt->execute()) {
            $result = $stmt->get_result();
            $row = $result->fetch_assoc();
            return $row ? $row['trainer_id'] : null;
        } else {
            logMessage("Error executing query: " . $this->conn->error);
            return false;
        }
    }

    public function getAllActiveTrainers()
    {
        logMessage("Calling stored procedure to fetch active trainers...");

        $query = "CALL GetActiveTrainers()";
        $result = $this->conn->query($query);

        if ($result && $result->num_rows > 0) {
            $trainers = [];
            while ($row = $result->fetch_assoc()) {
                $trainers[] = $row;
            }
            logMessage("Active trainers fetched successfully. Count: " . count($trainers));
            return $trainers;
        } else {
            logMessage("No active trainers found or error occurred: " . $this->conn->error);
            return [];
        }
    }
}
