<?php
// api/models/Member.php

include_once "../../logs/save.php"; 
require_once "../../config/database.php";

class Member {
    private $conn;
    private $table = "member";

    public function __construct() {
        $this->conn = DatabaseConnection::getInstance()->getConnection();
        logMessage("Member model initialized with database connection.");
    }

    private function generateMemberID() {
        // Use SUBSTRING to extract the numeric part and ORDER BY it as an integer
        $query = "SELECT member_id 
                  FROM " . $this->table . " 
                  ORDER BY CAST(SUBSTRING(member_id, 2) AS UNSIGNED) DESC 
                  LIMIT 1";
        $result = $this->conn->query($query);
    
        if ($result && $row = $result->fetch_assoc()) {
            // Extract the numeric part of the last ID and increment it
            $lastID = (int)substr($row['member_id'], 1); // Remove 'M' and convert to integer
            $newID = $lastID + 1;
            return 'M' . $newID; // Format as MX where X is the incremented value
        } else {
            // If no records exist, start from 1
            logMessage("No existing members found, starting ID from M1.");
            return 'M1';
        }
    }

    public function registerMember($user_id, $firstName, $lastName, $dob, $phone, $address, $gender) {
        logMessage("Registering member...");

        // Prepare the query
        $query = "INSERT INTO " . $this->table . " (member_id, user_id, firstName, lastName, DOB, phone, address, gender, join_date)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for member registration: " . $this->conn->error);
            return false;
        }

        $member_id = $this->generateMemberID();
        if (!$member_id) {
            logMessage("Member ID generation failed");
            return false;
        }

        // Bind parameters
        $stmt->bind_param("sissssss", $member_id,$user_id, $firstName, $lastName, $dob, $phone, $address, $gender);
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
