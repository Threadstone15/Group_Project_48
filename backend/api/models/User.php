<?php
// api/models/User.php

include_once "../../logs/save.php"; // Assuming this is where logMessage is defined

class User {
    private $conn;
    private $table = "users";

    public function __construct($db) {
        $this->conn = $db;
        logMessage("passed");
    }

    public function register($email, $password, $role) {
        logMessage("User Register model running...");

        if (!$this->conn) {
            logMessage("Database connection is not valid.");
            return false;
        }

        // Hash password
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);
        logMessage("Password hashed for user: $email");
    
    
        // Prepare the query
        $query = "INSERT INTO " . $this->table . " (email, password, role) VALUES (?, ?, ?)";
        $stmt = $this->conn->prepare($query);

        // Check if statement preparation was successful
        if ($stmt === false) {
            logMessage("Error preparing statement for registration: " . $this->conn->error);
            return false;
        }

        // Bind parameters
        $stmt->bind_param("sss", $email, $hashed_password, $role);
        logMessage("Query bound and ready to execute for user: $email");

        // Execute the statement
        if ($stmt->execute()) {
            logMessage("User registered successfully: $email with role: $role");
            return true;
        } else {
            logMessage("User registration failed for: $email with error: " . $stmt->error);
            return false;
        }
    }

    public function login($email, $password) {
        logMessage("User Login model running for: $email");

        // Prepare the query
        $query = "SELECT user_id, password, role FROM " . $this->table . " WHERE email = ?";
        $stmt = $this->conn->prepare($query);

        // Check if statement preparation was successful
        if ($stmt === false) {
            logMessage("Error preparing statement for login: " . $this->conn->error);
            return false;
        }

        // Bind parameters
        $stmt->bind_param("s", $email);
        logMessage("Query bound and ready to execute for login: $email");

        // Execute the query
        if ($stmt->execute()) {
            $result = $stmt->get_result();
            $userData = $result->fetch_assoc();

            // Verify user data and password
            if ($userData && password_verify($password, $userData['password'])) {
                logMessage("User login successful: $email with role: " . $userData['role']);
                return $userData;
            } else {
                logMessage("Invalid credentials for user: $email");
                return false;
            }
        } else {
            logMessage("Error executing login query for: $email with error: " . $stmt->error);
            return false;
        }
    }
}
?>
