<?php
// api/models/Trainer.php

include_once "../../logs/save.php"; // Assuming logMessage is defined here

class Trainer {
    private $conn;
    private $table = "trainers";

    public function __construct($db) {
        $this->conn = $db;
        logMessage("Trainer model initialized");
    }

    public function registerTrainer($user_id, $firstName, $lastName, $NIC, $dob, $address, $mobile_number, $years_of_experience, $specialties, $cv_link) {
        logMessage("Registering trainer...");

        // Prepare the query
        $query = "INSERT INTO " . $this->table . " 
                  (user_id, firstName, lastName, NIC, DOB, address, mobile_number, years_of_experience, specialties, cv_link) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for trainer registration: " . $this->conn->error);
            return false;
        }

        // Bind parameters
        $stmt->bind_param("issssssiss", 
            $user_id, 
            $firstName, 
            $lastName, 
            $NIC, 
            $dob, 
            $address, 
            $mobile_number, 
            $years_of_experience, 
            $specialties, 
            $cv_link
        );
        logMessage("Query bound for trainer registration: $firstName $lastName");

        // Execute the query
        if ($stmt->execute()) {
            logMessage("Trainer registered successfully: $firstName $lastName");
            return true;
        } else {
            logMessage("Trainer registration failed: " . $stmt->error);
            return false;
        }
    }
}
?>
