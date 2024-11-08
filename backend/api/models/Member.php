<?php
// api/models/Member.php

include_once "../../logs/save.php"; // Assuming this is where logMessage is defined

class Member {
    private $conn;
    private $table = "members";

    public function __construct($db) {
        $this->conn = $db;
        logMessage("Member model initialized");
    }

    public function registerMember($user_id, $firstName, $lastName, $dob, $phone, $address, $gender) {
        logMessage("Registering member...");

        // Prepare the query
        $query = "INSERT INTO " . $this->table . " (user_id, firstName, lastName, DOB, phone, address, gender, join_date)
                  VALUES (?, ?, ?, ?, ?, ?, ?, NOW())";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for member registration: " . $this->conn->error);
            return false;
        }

        // Bind parameters
        $stmt->bind_param("issssss", $user_id, $firstName, $lastName, $dob, $phone, $address, $gender);
        logMessage("Query bound for member registration: $firstName $lastName");

        // Execute the query
        if ($stmt->execute()) {
            logMessage("Member registered successfully: $firstName $lastName");
            return true;
        } else {
            logMessage("Member registration failed: " . $stmt->error);
            return false;
        }
    }
}
?>
