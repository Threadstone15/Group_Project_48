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
            return $member_id;
        } else {
            logMessage("Member registration failed: " . $stmt->error);
            return false;
        }
    }

    public function getMemberDetails() {
        logMessage("Fetching member details...");

        $query = "SELECT 
                    m.member_id as userID, 
                    m.firstName, 
                    m.lastName, 
                    m.phone, 
                    u.user_id,
                    u.email
                  FROM 
                    " . $this->table . " m
                  JOIN 
                    users u 
                  ON 
                    m.user_id = u.user_id
                  WHERE 
                    u.role = 'member'";

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

    public function getMemberIDbyUserID($user_id) {
        logMessage("Fetching member_id of a member by user id: $user_id");
    
        // Prepare the query
        $query = "SELECT member_id FROM " . $this->table . " WHERE user_id = ?";
        $stmt = $this->conn->prepare($query);
    
        if ($stmt === false) {
            logMessage("Error preparing statement for getMemberIDbyUserID: " . $this->conn->error);
            return false;
        }
    
        // Bind the email parameter
        $stmt->bind_param("i", $user_id);
    
        // Execute the query
        if ($stmt->execute()) {
            $result = $stmt->get_result();
            return $result->fetch_assoc();
        } else {
            logMessage("Error executing getMemberIDbyUserID query: " . $stmt->error);
            return false;
        }
    }

    public function getLoggedInMemberDetails($user_id) {
        $query = "SELECT m.name, m.email, m.address, m.date_of_birth, m.gender 
                 FROM members m 
                 WHERE m.user_id = ?";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        return $result->fetch_assoc();
    }
}
?>
