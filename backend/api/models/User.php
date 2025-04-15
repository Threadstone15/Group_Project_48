<?php
// api/models/User.php

include_once "../../logs/save.php"; // Assuming this is where logMessage is defined
require_once "../../config/database.php"; // Include the DatabaseConnection class


class User
{
    private $conn;
    private $table = "users";

    public function __construct()
    {
        // Get the database connection instance
        $this->conn = DatabaseConnection::getInstance()->getConnection();
        logMessage("User class instantiated with database connection.");
    }

    public function register($email, $password, $role)
    {
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

    public function getUserByEmail($email)
    {
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





    public function login($email, $password)
    {
        logMessage("User Login model running for: $email");
        $user = $this->getUserByEmail($email);
        if ($user == false) {
            logMessage("User not found for email: $email");
            echo json_encode(["error" => "User not found"]);
            return false;
        } else {
            logMessage("User found for email: $email");

            // Prepare the query
            $query = "SELECT user_id, password,status, role FROM " . $this->table . " WHERE email = ?";
            $stmt = $this->conn->prepare($query);

            // Check if statement preparation was successful
            if ($stmt === false) {
                logMessage("Error preparing statement for login: " . $this->conn->error);
                echo json_encode(["error" => "Internal server error"]);
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
                    $status = $userData['status'];
                    logMessage("User status: $status");
                    if ($status == 2) {
                        logMessage("User is deactivated: $email");
                        echo json_encode(["error" => "User is deactivated"]);
                        return false;
                    } elseif ($status == 3) {
                        logMessage("User is deleted: $email");
                        echo json_encode(["error" => "User is deleted"]);
                        return false;
                    } else {
                        logMessage("User login successful: $email with role: " . $userData['role']);
                        return $userData;
                    }
                } else {
                    logMessage("Invalid credentials for user: $email");
                    echo json_encode(["error" => "Invalid password"]);
                    return false;
                }
            } else {
                logMessage("Error executing login query for: $email with error: " . $stmt->error);
                echo json_encode(["error" => "Internal server error"]);
                return false;
            }
        }
    }





    public function getUserRoleById($user_id)
    {
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

    public function userExists($email)
    {
        logMessage("Checking if user exists for email: $email");

        // Prepare the query
        $query = "SELECT user_id FROM " . $this->table . " WHERE email = ? LIMIT 1";
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
                $row = $result->fetch_assoc();
                $user_id = $row['user_id'];
                logMessage("User exists for email: $email with user_id: $user_id");
                return $user_id; // Return user_id if the user exists
            } else {
                logMessage("No user found for email: $email");
                return false; // Return false if no user is found
            }
        } else {
            logMessage("Error executing userExists query for email: $email with error: " . $stmt->error);
            return false;
        }
    }

    public function resetPassword($user_id, $new_password)
    {
        logMessage("Resetting password for user ID: $user_id");

        // Hash the new password
        $hashed_password = password_hash($new_password, PASSWORD_DEFAULT);
        logMessage("New password hashed for user ID: $user_id");

        // Prepare the query
        $query = "UPDATE " . $this->table . " SET password = ? WHERE user_id = ?";
        $stmt = $this->conn->prepare($query);

        // Check if statement preparation was successful
        if ($stmt === false) {
            logMessage("Error preparing statement for resetPassword: " . $this->conn->error);
            return false;
        }

        // Bind parameters
        $stmt->bind_param("si", $hashed_password, $user_id);

        // Execute the query
        if ($stmt->execute()) {
            if ($stmt->affected_rows > 0) {
                logMessage("Password reset successfully for user ID: $user_id");
                return true;
            } else {
                logMessage("No rows updated. Possibly invalid user ID: $user_id");
                return false;
            }
        } else {
            logMessage("Error executing resetPassword query for user ID: $user_id with error: " . $stmt->error);
            return false;
        }
    }

    public function getAllEmails()
    {
        logMessage("Fetching all emails from the users table.");

        // Prepare the query
        $query = "SELECT email FROM " . $this->table;
        $stmt = $this->conn->prepare($query);

        // Check if statement preparation was successful
        if ($stmt === false) {
            logMessage("Error preparing statement for getAllEmails: " . $this->conn->error);
            return false;
        }

        // Execute the query
        if ($stmt->execute()) {
            $result = $stmt->get_result();
            $emails = [];

            // Fetch all email addresses
            while ($row = $result->fetch_assoc()) {
                $emails[] = $row['email'];
            }

            logMessage("Emails fetched successfully. Total: " . count($emails));
            return $emails;
        } else {
            logMessage("Error executing getAllEmails query with error: " . $stmt->error);
            return false;
        }
    }

    public function deactivateUser($user_id, $remark)
    {
        logMessage("Attempting to deactivate user with ID: $user_id");

        // check if already deleted or not active
        $query = "SELECT status FROM " . $this->table . " WHERE user_id = ?";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for deactivateUser: " . $this->conn->error);
            echo json_encode(["error" => "Error preparing statement for deactivation."]);
            http_response_code(500); // Internal Server Error
            return false;
        }

        $stmt->bind_param("i", $user_id);

        if ($stmt->execute()) {
            $result = $stmt->get_result();
            $userData = $result->fetch_assoc();

            if ($result->num_rows > 0) {
                $status = $userData['status'];
                if ($status == 2) {
                    logMessage("User already deactivated with ID: $user_id");
                    echo json_encode(["error" => "User already deactivated."]);
                    http_response_code(400); // Bad Request
                    return false;
                }
            }
        }

        $query = "UPDATE " . $this->table . " SET status = 2, remarks = ? WHERE user_id = ?";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for deactivateUser: " . $this->conn->error);
            echo json_encode(["error" => "Error preparing update query."]);
            http_response_code(500); // Internal Server Error
            return false;
        }

        $stmt->bind_param("si", $remark, $user_id);

        if ($stmt->execute()) {
            if ($stmt->affected_rows > 0) {
                logMessage("User deactivated successfully with ID: $user_id");
                echo json_encode(["message" => "User deactivated successfully."]);
                http_response_code(200); // OK
                return true;
            } else {
                logMessage("No user found with ID: $user_id to deactivate.");
                echo json_encode(["error" => "No user found with the given ID to deactivate."]);
                http_response_code(404); // Not Found
                return false;
            }
        } else {
            logMessage("Error executing deactivateUser query for user ID: $user_id with error: " . $stmt->error);
            echo json_encode(["error" => "Error deactivating user."]);
            http_response_code(500); // Internal Server Error
            return false;
        }
    }

    public function getEmailById($user_id)
    {
        $query = "SELECT email FROM " . $this->table . " WHERE user_id = ?";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for getEmailById: " . $this->conn->error);
            return false;
        }

        $stmt->bind_param("i", $user_id);

        if ($stmt->execute()) {
            $result = $stmt->get_result();
            if ($result->num_rows > 0) {
                $row = $result->fetch_assoc();
                return $row['email'];
            } else {
                return false;
            }
        } else {
            logMessage("Error executing getEmailById query for user ID: $user_id with error: " . $stmt->error);
            return false;
        }
    }




    public function updateUser($user_id, $email, $firstname, $lastname, $contact_no)
    {
        logMessage("Updating user details for user ID: $user_id");

        $userUpdateQuery = "UPDATE " . $this->table . " SET email = ? WHERE user_id = ?";
        $stmt = $this->conn->prepare($userUpdateQuery);

        if ($stmt === false) {
            logMessage("Error preparing user update query: " . $this->conn->error);
            return false;
        }

        $stmt->bind_param("si", $email, $user_id);

        if (!$stmt->execute()) {
            logMessage("Error executing user update query for user ID: $user_id with error: " . $stmt->error);
            return false;
        }

        logMessage("User table updated successfully for user ID: $user_id");

        $role = $this->getUserRoleById($user_id);
        if (!$role) {
            logMessage("Role not found for user ID: $user_id. Aborting role-specific update.");
            return false;
        }

        // Update the role-specific table
        $roleTableMap = [
            "member" => "member",
            "trainer" => "trainer",
            "owner" => "staff",
            "staff" => "staff",
        ];

        if (!isset($roleTableMap[$role])) {
            logMessage("Invalid role `$role` for user ID: $user_id.");
            return false;
        }

        $roleTable = $roleTableMap[$role];
        if ($roleTable == "member") {
            $roleUpdateQuery = "UPDATE $roleTable SET firstName = ?, lastName = ?, phone = ? WHERE user_id = ?";
        } else if ($roleTable == "trainer") {
            $roleUpdateQuery = "UPDATE $roleTable SET firstName = ?, lastName = ?, mobile_number = ? WHERE user_id = ?";
        } else if ($roleTable == "staff") {
            $roleUpdateQuery = "UPDATE $roleTable SET first_name = ?, last_name = ?, phone = ? WHERE user_id = ?";
        }

        $roleStmt = $this->conn->prepare($roleUpdateQuery);

        if ($roleStmt === false) {
            logMessage("Error preparing role-specific update query for table `$roleTable`: " . $this->conn->error);
            return false;
        }


        $roleStmt->bind_param("sssi", $firstname, $lastname, $contact_no, $user_id);

        if ($roleStmt->execute()) {
            logMessage("Role-specific table `$roleTable` updated successfully for user ID: $user_id.");
            return true;
        } else {
            logMessage("Error updating `$roleTable` for user ID: $user_id with error: " . $roleStmt->error);
            return false;
        }
    }

    public function getPasswordByUserId($user_id)
    {
        logMessage("Fetching password for user ID: $user_id");

        // Prepare the query
        $query = "SELECT password FROM " . $this->table . " WHERE user_id = ?";
        $stmt = $this->conn->prepare($query);

        // Check if statement preparation was successful
        if ($stmt === false) {
            logMessage("Error preparing statement for getPasswordByUserId: " . $this->conn->error);
            return false;
        }

        // Bind the user_id parameter
        $stmt->bind_param("i", $user_id);

        // Execute the query
        if ($stmt->execute()) {
            $result = $stmt->get_result();
            $userData = $result->fetch_assoc();

            // Check if user exists and return the password
            if ($userData) {
                logMessage("Password fetched successfully for user ID: $user_id");
                return $userData['password'];
            } else {
                logMessage("No user found with ID: $user_id");
                return false;
            }
        } else {
            logMessage("Error executing getPasswordByUserId query for user ID: $user_id with error: " . $stmt->error);
            return false;
        }
    }


    public function getProfile($user_id)
    {
        logMessage("Fetching profile for user ID: $user_id");

        // Prepare the stored procedure call
        $query = "CALL GetUserDetailsByUserID(?)";
        $stmt = $this->conn->prepare($query);

        // Check if statement preparation was successful
        if ($stmt === false) {
            logMessage("Error preparing statement for getProfile: " . $this->conn->error);
            return json_encode([
                'status' => 'error',
                'message' => 'Statement preparation failed'
            ]);
        }

        // Bind the user_id parameter
        $stmt->bind_param("i", $user_id);

        // Execute the query
        if ($stmt->execute()) {
            $result = $stmt->get_result();
            $profileData = $result->fetch_assoc();

            // Check if data exists
            if ($profileData) {
                logMessage("Profile data fetched successfully for user ID: $user_id");
                logMessage("Profile data: " . json_encode($profileData));
                return json_encode([
                    'status' => 'success',
                    'data' => $profileData
                ]);
            } else {
                logMessage("No profile found for user ID: $user_id");
                return json_encode([
                    'status' => 'error',
                    'message' => 'No profile data found'
                ]);
            }
        } else {
            logMessage("Error executing getProfile query for user ID: $user_id with error: " . $stmt->error);
            return json_encode([
                'status' => 'error',
                'message' => 'Execution failed'
            ]);
        }
    }

    public function updateProfile($user_id, $address, $dob, $gender, $phone)
    {
        logMessage("Updating profile for user ID: $user_id");

        // Prepare the stored procedure call
        $query = "CALL update_profile(?, ?, ?, ?, ?)";
        $stmt = $this->conn->prepare($query);

        // Check if statement preparation was successful
        if ($stmt === false) {
            logMessage("Error preparing statement for updateProfile: " . $this->conn->error);
            return json_encode([
                'status' => 'error',
                'message' => 'Statement preparation failed'
            ]);
        }

        // Bind parameters
        $stmt->bind_param("issss", $user_id, $address, $dob, $gender, $phone);

        // Execute the query
        if ($stmt->execute()) {
            logMessage("Profile updated successfully for user ID: $user_id");

            return json_encode([
                'status' => 'success',
                'message' => 'Profile updated successfully'
            ]);
        } else {
            logMessage("Error executing updateProfile for user ID: $user_id with error: " . $stmt->error);
            return json_encode([
                'status' => 'error',
                'message' => 'Failed to update profile'
            ]);
        }
    }

    public function changePassword($user_id, $old_password, $new_password)
    {
        logMessage("Changing password for user ID: $user_id");

        // Check the old password
        $query_check = "SELECT password FROM " . $this->table . " WHERE user_id = ?";
        $stmt_check = $this->conn->prepare($query_check);

        // Check if statement preparation was successful
        if ($stmt_check === false) {
            logMessage("Error preparing statement for changePassword: " . $this->conn->error);
            return false;
        }

        // Bind the user_id parameter
        $stmt_check->bind_param("i", $user_id);

        // Execute the query
        if ($stmt_check->execute()) {
            $result = $stmt_check->get_result();
            $userData = $result->fetch_assoc();

            // Check if user exists and return the password
            if ($userData) {
                $hashed_password = $userData['password'];
                if (password_verify($old_password, $hashed_password)) {
                    logMessage("Old password matched for user ID: $user_id");
                    // Prepare the query
                    $query = "UPDATE " . $this->table . " SET password = ? WHERE user_id = ?";
                    $stmt = $this->conn->prepare($query);

                    // Check if statement preparation was successful
                    if ($stmt === false) {
                        logMessage("Error preparing statement for changePassword: " . $this->conn->error);
                        return false;
                    }

                    // Bind parameters
                    $hashed_password_new = password_hash($new_password, PASSWORD_DEFAULT);
                    $stmt->bind_param("si", $hashed_password_new, $user_id);
                    // Execute the query
                    if ($stmt->execute()) {
                        logMessage("Password changed successfully for user ID: $user_id");
                        echo json_encode([
                            "success" => true,
                            "message" => "Password changed successfully"
                        ]);

                        return true;
                    } else {
                        logMessage("Error executing changePassword query for user ID: $user_id with error: " . $stmt->error);
                        echo json_encode(["error" => "Failed to change password"]);
                        return false;
                    }
                } else {
                    logMessage("Old password did not match for user ID: $user_id");
                    echo json_encode([
                        "success" => false,
                        "message" => "Old password did not match"
                    ]);

                    return false;
                }
            }
        }
    }

    public function deleteAccount($user_id, $remark, $password)
    {
        logMessage("Attempting to delete user with ID: $user_id");

        // check if already deleted or not active
        $query = "SELECT status, password FROM " . $this->table . " WHERE user_id = ?";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for delete User: " . $this->conn->error);
            echo json_encode([
                "success" => false,
                "message" => "Error preparing statement for deletion."
            ]);
            return false;
        }

        $stmt->bind_param("i", $user_id);

        if ($stmt->execute()) {
            $result = $stmt->get_result();
            $userData = $result->fetch_assoc();

            if ($result->num_rows > 0) {
                $status = $userData['status'];
                if ($status == 3) {
                    logMessage("User already deleted with ID: $user_id");
                    echo json_encode([
                        "success" => false,
                        "message" => "User already deleted."
                    ]);
                    return false;
                }
            }
        }

        if (!password_verify($password, $userData['password'])) {
            logMessage("Password did not match for user ID: $user_id");
            echo json_encode([
                "success" => false,
                "message" => "Password did not match."
            ]);
            return false;
        } else {

            $query = "UPDATE " . $this->table . " SET status = 3, remarks = ? WHERE user_id = ?";
            $stmt = $this->conn->prepare($query);

            if ($stmt === false) {
                logMessage("Error preparing statement for delete User: " . $this->conn->error);
                echo json_encode([
                    "success" => false,
                    "message" => "Error preparing update query."
                ]);
                return false;
            }

            $stmt->bind_param("si", $remark, $user_id);

            if ($stmt->execute()) {
                if ($stmt->affected_rows > 0) {
                    logMessage("User deleted successfully with ID: $user_id");
                    echo json_encode([
                        "success" => true,
                        "message" => "User deleted successfully."
                    ]);
                    return true;
                } else {
                    logMessage("No user found with ID: $user_id to delete.");
                    echo json_encode([
                        "success" => false,
                        "message" => "No user found with the given ID to delete."
                    ]);
                    return false;
                }
            } else {
                logMessage("Error executing delete User query for user ID: $user_id with error: " . $stmt->error);
                echo json_encode([
                    "success" => false,
                    "message" => "Error deleting user."
                ]);
                return false;
            }
        }
    }

    public function reactivateUser($user_id, $remark)
    {
        logMessage("Attempting to reactivate user with ID: $user_id");

        // check if already deleted or not active
        $query = "SELECT status FROM " . $this->table . " WHERE user_id = ?";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for reactivateUser: " . $this->conn->error);
            echo json_encode(["error" => "Error preparing statement for reactivation."]);
            http_response_code(500); // Internal Server Error
            return false;
        }

        $stmt->bind_param("i", $user_id);

        if ($stmt->execute()) {
            $result = $stmt->get_result();
            $userData = $result->fetch_assoc();

            if ($result->num_rows > 0) {
                $status = $userData['status'];
                if ($status == 1) {
                    logMessage("User already active with ID: $user_id");
                    echo json_encode(["error" => "User already active."]);
                    http_response_code(400); // Bad Request
                    return false;
                }
            }
        }

        $query = "UPDATE " . $this->table . " SET status = 1, remarks = ? WHERE user_id = ?";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for reactivateUser: " . $this->conn->error);
            echo json_encode(["error" => "Error preparing update query."]);
            http_response_code(500); // Internal Server Error
            return false;
        }

        $stmt->bind_param("si", $remark, $user_id);

        if ($stmt->execute()) {
            if ($stmt->affected_rows > 0) {
                logMessage("User reactivated successfully with ID: $user_id");
                echo json_encode(["message" => "User reactivated successfully."]);
                http_response_code(200); // OK
                return true;
            } else {
                logMessage("No user found with ID: $user_id to reactivate.");
                echo json_encode(["error" => "No user found with the given ID to reactivate."]);
                http_response_code(404); // Not Found
                return false;
            }
        } else {
            logMessage("Error executing reactivate User query for user ID: $user_id with error: " . $stmt->error);
            echo json_encode(["error" => "Error reactivating user."]);
            http_response_code(500); // Internal Server Error
            return false;
        }
    }
}
