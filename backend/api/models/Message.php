<?php

include_once "../../logs/save.php";
require_once "../../config/database.php";

class Message
{
    private $conn;

    public function __construct()
    {
        $this->conn = DatabaseConnection::getInstance()->getConnection();
        logMessage("Message model initialized with database connection.");
    }

    public function getThreads($userId)
    {
        logMessage("Getting message threads for user_id: $userId");

        // Check if the database connection is valid
        if (!$this->conn) {
            logMessage("Database connection is not valid.");
            return [];
        }

        // Prepare the stored procedure call to get threads
        $query = "CALL GetMessagesForUser(?)"; // Assuming the stored procedure takes one parameter (userId)
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing getThreads statement: " . $this->conn->error);
            return [];
        }

        // Bind the userId parameter to the prepared statement
        if (!$stmt->bind_param("s", $userId)) {
            logMessage("Error binding parameters in getThreads: " . $stmt->error);
            return [];
        }

        // Execute the query
        if ($stmt->execute()) {
            logMessage("Successfully fetched message threads for user_id: $userId");
            $result = $stmt->get_result(); // Get the result set
            $threads = $result->fetch_all(MYSQLI_ASSOC); // Fetch all results as an associative array
            $stmt->close();
            return $threads; // Return the fetched threads
        } else {
            logMessage("Execution failed for getThreads. Error: " . $stmt->error);
            return [];
        }
    }

    public function sendMessage($from_user_id, $to_user_id, $text)
    {
        logMessage("Sending message from user_id: $from_user_id to user_id: $to_user_id with text: $text");

        // Check if the database connection is valid
        if (!$this->conn) {
            logMessage("Database connection is not valid.");
            return false;
        }

        // Prepare the insert statement to send a message
        $query = "INSERT INTO messages (from_user_id, to_user_id, text) VALUES (?, ?, ?)";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing sendMessage statement: " . $this->conn->error);
            return false;
        }

        // Bind the parameters to the prepared statement
        if (!$stmt->bind_param("sss", $from_user_id, $to_user_id, $text)) {
            logMessage("Error binding parameters in sendMessage: " . $stmt->error);
            return false;
        }

        // Execute the query
        if ($stmt->execute()) {
            logMessage("Message sent successfully from user_id: $from_user_id to user_id: $to_user_id");
            return true; // Return true on success
        } else {
            logMessage("Execution failed for sendMessage. Error: " . $stmt->error);
            return false; // Return false on failure
        }
    }

    public function getMessages($userId, $otherUserId)
    {
        logMessage("Getting messages between user_id: $userId and other_user_id: $otherUserId");

        // Check if the database connection is valid
        if (!$this->conn) {
            logMessage("Database connection is not valid.");
            return [];
        }

        // Prepare the stored procedure call
        $query = "CALL GetMessagesBetweenUsers(?, ?)";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing getMessages statement: " . $this->conn->error);
            return [];
        }

        // Bind the parameters (both are strings)
        if (!$stmt->bind_param("ss", $userId, $otherUserId)) {
            logMessage("Error binding parameters in getMessages: " . $stmt->error);
            return [];
        }

        // Execute the query
        if ($stmt->execute()) {
            logMessage("Successfully fetched messages between user_id: $userId and other_user_id: $otherUserId");
            $result = $stmt->get_result(); // Get the result set
            $messages = $result->fetch_all(MYSQLI_ASSOC); // Fetch all results as associative array
            $stmt->close();
            return $messages; // Return the fetched messages
        } else {
            logMessage("Execution failed for getMessages. Error: " . $stmt->error);
            return [];
        }
    }


    public function markAsRead($userId, $otherUserId)
    {
        logMessage("Marking messages as read between user_id: $userId and other_user_id: $otherUserId");

        // Check if the database connection is valid
        if (!$this->conn) {
            logMessage("Database connection is not valid.");
            return false;
        }

        // Prepare the SQL query
        $query = "
        UPDATE messages 
        SET is_read = 1 
        WHERE from_user_id = ? AND to_user_id = ? AND is_read = 0
    ";

        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing markAsRead statement: " . $this->conn->error);
            return false;
        }

        // Bind the parameters (both are strings, assuming userId and otherUserId are VARCHAR)
        if (!$stmt->bind_param("ss", $otherUserId, $userId)) {
            logMessage("Error binding parameters in markAsRead: " . $stmt->error);
            return false;
        }

        // Execute the query
        if ($stmt->execute()) {
            logMessage("Successfully marked messages as read between user_id: $userId and other_user_id: $otherUserId");
            $stmt->close();
            return true;
        } else {
            logMessage("Execution failed for markAsRead. Error: " . $stmt->error);
            return false;
        }
    }



    public function getUnreadCount($userId)
    {
        try {
            $query = "
                SELECT COUNT(*) as unread_count
                FROM messages
                WHERE to_user_id = :userId AND is_read = 0
            ";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
            $stmt->execute();

            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return $result['unread_count'] ?? 0;
        } catch (PDOException $e) {
            logMessage("Error getting unread count: " . $e->getMessage(), 'error');
            return 0;
        }
    }
}
