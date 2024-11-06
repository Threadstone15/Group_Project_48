<?php
// api/models/Trainer.php

include_once "../../logs/save.php"; // Assuming logMessage is defined here

class Trainer {
    private $conn;
    private $table = "trainer";

    public function __construct($db) {
        $this->conn = $db;
        logMessage("Trainer model initialized");
    }

    private function generateTrainerID() {
        $query = "SELECT COUNT(*) AS count FROM " . $this->table;
        $result = $this->conn->query($query);

        if ($result && $row = $result->fetch_assoc()) {
            $count = (int)$row['count'] + 1;  // Increment count for the new ID
            return 'T' . $count;  // Format as T1, T2, etc., without leading zeros
        } else {
            logMessage("Failed to generate Trainer ID: " . $this->conn->error);
            return false;
        }
    }

    public function saveTrainerDetails($user_id, $firstName, $lastName, $NIC, $DOB_date, $DOB_month, $DOB_year, $address, $mobile_number, $years_of_experience, $specialties) {
        logMessage("Saving trainer details...");

        // generate trainer_id
        $trainer_id = $this->generateTrainerID();
        if (!$trainer_id) {
            logMessage("Trainer ID generation failed");
            return false;
        }

        $query = "INSERT INTO " . $this->table . " 
                  (trainer_id, user_id, firstName, lastName, NIC, DOB_date, DOB_month, DOB_year, address, mobile_number, years_of_experience, specialties) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for trainer details saving: " . $this->conn->error);
            return false;
        }

        $stmt->bind_param("sissssssssss", 
            $trainer_id, 
            $user_id, 
            $firstName, 
            $lastName, 
            $NIC, 
            $DOB_date,
            $DOB_month,
            $DOB_year,
            $address, 
            $mobile_number, 
            $years_of_experience, 
            $specialties
        );
        logMessage("Query bound for trainer details saving: $firstName $lastName with Trainer ID: $trainer_id");

        // Execute the query
        if ($stmt->execute()) {
            logMessage("Trainer details saved successfully with Trainer ID: $trainer_id");
            return true;
        } else {
            logMessage("Trainer details couldn't be saved: " . $stmt->error);
            return false;
        }
    }

    public function checkTrainerExists($user_id){
        $query = "SELECT user_id FROM ". $this->table . " WHERE user_id = ? ";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for checkTrainerExists". $this->conn->error);
            return false;
        }
        $stmt->bind_param("i", $user_id);
        if ($stmt->execute()) {
            $result = $stmt->get_result();
            return $result->fetch_assoc();
        }else{
            logMessage("Error executing checkTrainerExists". $stmt->error);
            return false;
        }
    }

    public function getTrainerDetails($user_id){
        $query = "SELECT trainer_id, user_id, firstName, lastName, NIC, DOB_date, DOB_month, DOB_year, address, mobile_number, years_of_experience, specialties 
              FROM " . $this->table . " WHERE user_id = ?";
        $stmt = $this->conn->prepare($query);

        $stmt->bind_param("i", $user_id);
        if ($stmt->execute()) {
            $result = $stmt->get_result();
            return $result->fetch_assoc();
        }else{
            logMessage("Error executing getTrainerDetails". $stmt->error);
            return false;
        }
    }

    public function updateTrainerDetails($user_id, $firstName, $lastName, $NIC, $DOB_date, $DOB_month, $DOB_year, $address, $mobile_number, $years_of_experience, $specialties) {
        logMessage("Updating trainer details for user ID: $user_id");
    
        // Prepare the update query
        $query = "UPDATE " . $this->table . " 
                  SET firstName = ?, lastName = ?, NIC = ?, DOB_date = ?, DOB_month = ?, DOB_year = ?, address = ?, mobile_number = ?, years_of_experience = ?, specialties = ? 
                  WHERE user_id = ?";
        $stmt = $this->conn->prepare($query);
    
        if ($stmt === false) {
            logMessage("Error preparing statement for updating trainer details: " . $this->conn->error);
            return false;
        }
    
        // Bind parameters
        $stmt->bind_param("ssssssssssi",  
            $firstName, 
            $lastName, 
            $NIC, 
            $DOB_date, 
            $DOB_month, 
            $DOB_year, 
            $address, 
            $mobile_number, 
            $years_of_experience, 
            $specialties,
            $user_id
        );
    
        // Execute the query
        if ($stmt->execute()) {
            logMessage("Trainer details updated successfully for user ID: $user_id");
            return true;
        } else {
            logMessage("Trainer details couldn't be updated: " . $stmt->error);
            return false;
        }
    }

    public function removeTrainerDetails($user_id) {
        logMessage("Deleting trainer with user ID: $user_id");
    
        // Prepare the delete query
        $query = "DELETE FROM " . $this->table . " WHERE user_id = ?";
        $stmt = $this->conn->prepare($query);
    
        if ($stmt === false) {
            logMessage("Error preparing statement for deleting trainer: " . $this->conn->error);
            return false;
        }
    
        // Bind parameter
        $stmt->bind_param("i", $user_id);
    
        // Execute the query
        if ($stmt->execute()) {
            logMessage("Trainer deleted successfully with user ID: $user_id");
            return true;
        } else {
            logMessage("Trainer couldn't be deleted: " . $stmt->error);
            return false;
        }
    }
    
    
}
?>
