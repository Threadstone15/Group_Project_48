<?php
// api/models/User.php

include_once "../../logs/save.php"; // Assuming this is where logMessage is defined
require_once "../../config/database.php"; // Include the DatabaseConnection class

class User {
    private $conn;
    private $table = "users";

    public function __construct() {
        // Get the database connection instance
        $this->conn = DatabaseConnection::getInstance()->getConnection();
        logMessage("User class instantiated with database connection.");
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



    public function getUserByEmail($email) {
        logMessage("Fetching user by email: $email");
    
        // Prepare the query
        $query = "SELECT user_id FROM " . $this->table . " WHERE email = ?";
        $stmt = $this->conn->prepare($query);
    
        if ($stmt === false) {
            logMessage("Error preparing statement for getUserByEmail: " . $this->conn->error);
            return false;
        }
    
        // Bind the email parameter
        $stmt->bind_param("s", $email);
    
        // Execute the query
        if ($stmt->execute()) {
            $result = $stmt->get_result();
            return $result->fetch_assoc();
        } else {
            logMessage("Error executing getUserByEmail query: " . $stmt->error);
            return false;
        }
    }

    public function getUserRoleById($user_id) {
        logMessage("Fetching user role by user ID: $user_id");
    
        // Prepare the query
        $query = "SELECT role FROM " . $this->table . " WHERE user_id = ?";
        $stmt = $this->conn->prepare($query);
    
        // Check if statement preparation was successful
        if ($stmt === false) {
            logMessage("Error preparing statement for getUserRoleById: " . $this->conn->error);
            return false;
        }
    
        // Bind the user_id parameter
        $stmt->bind_param("i", $user_id);
    
        // Execute the query
        if ($stmt->execute()) {
            $result = $stmt->get_result();
            $userData = $result->fetch_assoc();
    
            // Check if user exists and return the role
            if ($userData) {
                logMessage("User role fetched successfully for user ID: $user_id");
                return $userData['role'];
            } else {
                logMessage("No user found with ID: $user_id");
                return false;
            }
        } else {
            logMessage("Error executing getUserRoleById query for user ID: $user_id with error: " . $stmt->error);
            return false;
        }
    }

    public function userExists($email) {
        logMessage("Checking if user exists for email: $email");
    
        // Prepare the query
        $query = "SELECT 1 FROM " . $this->table . " WHERE email = ? LIMIT 1";
        $stmt = $this->conn->prepare($query);
    
        // Check if statement preparation was successful
        if ($stmt === false) {
            logMessage("Error preparing statement for userExists: " . $this->conn->error);
            return false;
        }
    
        // Bind the email parameter
        $stmt->bind_param("s", $email);
    
        // Execute the query
        if ($stmt->execute()) {
            $result = $stmt->get_result();
    
            // Check if the result contains a row
            if ($result->num_rows > 0) {
                logMessage("User exists for email: $email");
                return true;
            } else {
                logMessage("No user found for email: $email");
                return false;
            }
        } else {
            logMessage("Error executing userExists query for email: $email with error: " . $stmt->error);
            return false;
        }
    }
    
    
}
?>
