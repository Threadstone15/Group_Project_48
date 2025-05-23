<?php
// api/models/Notice.php

include_once "../../logs/save.php";
require_once "../../config/database.php";

class Notice
{
    private $conn;
    private $table = "notice";
    private $read_table = "notice_reads";

    public function __construct()
    {
        $this->conn = DatabaseConnection::getInstance()->getConnection();
        logMessage("Notice model initialized with database connection.");
    }

    public function addNotice($publisher_id, $title, $description, $duration)
    {
        logMessage("Adding new notice...");

        if (!$this->conn) {
            logMessage("Database connection is not valid.");
            return false;
        }

        $query = "INSERT INTO " . $this->table . " (publisher_id, title, description, duration) VALUES (?, ?, ?, ?)";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for notice insertion: " . $this->conn->error);
            return false;
        }

        if (!$stmt->bind_param("issi", $publisher_id, $title, $description, $duration)) {
            logMessage("Error binding parameters for notice insertion: " . $stmt->error);
            return false;
        }
        logMessage("Query bound for adding notice: $title");

        if ($stmt->execute()) {
            logMessage("Notice added successfully: $title");
            return true;
        } else {
            logMessage("Notice insertion failed: " . $stmt->error);
            return false;
        }
    }

    public function getNotices()
    {
        logMessage("Fetching notices using stored procedure...");

        $query = "CALL GetAllActiveNotices()";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for fetching notice: " . $this->conn->error);
            return false;
        }

        if ($stmt->execute()) {
            $result = $stmt->get_result();
            if ($result && $result->num_rows > 0) {
                $notices = $result->fetch_all(MYSQLI_ASSOC);
                logMessage("Notices fetched successfully via stored procedure");
                return $notices;
            } else {
                logMessage("No notices found via stored procedure");
                return [];
            }
        } else {
            logMessage("Error executing stored procedure: " . $stmt->error);
            return false;
        }
    }


    public function updateNotice($notice_id, $publisher_id, $title, $description, $duration)
    {
        logMessage("Updating notice with ID: $notice_id");

        $query = "UPDATE " . $this->table . " SET publisher_id = ?,title = ?, description = ?, duration = ? WHERE notice_id = ?";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for updating notice: " . $this->conn->error);
            return false;
        }

        if (!$stmt->bind_param("issii", $publisher_id, $title, $description, $duration, $notice_id)) {
            logMessage("Error binding parameters for updating notice: " . $stmt->error);
            return false;
        }
        logMessage("Query bound for updating notice: $notice_id");

        if ($stmt->execute()) {
            logMessage("Notice updated successfully for ID: $notice_id");
            return true;
        } else {
            logMessage("Notice update failed: " . $stmt->error);
            return false;
        }
    }

    public function deleteNotice($notice_id)
    {
        logMessage("Deleting notice with ID: $notice_id");

        $query = "DELETE FROM " . $this->table . " WHERE notice_id = ?";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for deleting notice: " . $this->conn->error);
            return false;
        }

        if (!$stmt->bind_param("i", $notice_id)) {
            logMessage("Error binding parameters for deleting notice: " . $stmt->error);
            return false;
        }
        logMessage("Query bound for deleting notice: $notice_id");

        if ($stmt->execute()) {
            logMessage("Notice deleted successfully for ID: $notice_id");
            return true;
        } else {
            logMessage("Notice deletion failed: " . $stmt->error);
            return false;
        }
    }

    public function getPersonalNotices($user_id)
    {
        logMessage("Fetching personal notices for user ID: $user_id");

        if (!$this->conn) {
            logMessage("Database connection is not valid.");
            return false;
        }

        try {
            // Step 1: Call ExpireOldNotices to clean expired ones
            $expireStmt = $this->conn->prepare("CALL ExpireOldNotices()");
            if (!$expireStmt) {
                logMessage("Failed to prepare ExpireOldNotices: " . $this->conn->error);
                return false;
            }
            $expireStmt->execute();
            $expireStmt->close();
            logMessage("Expired notices removed.");

            // Step 2: Call GetUnreadNoticesForUser
            $stmt = $this->conn->prepare("CALL GetUnreadNoticesForUser(?)");
            if (!$stmt) {
                logMessage("Failed to prepare GetUnreadNoticesForUser: " . $this->conn->error);
                return false;
            }
            $stmt->bind_param("i", $user_id);
            $stmt->execute();

            $result = $stmt->get_result();
            $notices = [];

            while ($row = $result->fetch_assoc()) {
                $notices[] = $row;
            }

            $stmt->close();
            logMessage("Fetched " . count($notices) . " unread notices for user ID: $user_id");
            return $notices;
        } catch (Exception $e) {
            logMessage("Error fetching personal notices: " . $e->getMessage());
            return false;
        }
    }

    public function markNoticeAsRead($user_id, $notice_id)
    {
        logMessage("Marking notice as read for user ID: $user_id and notice ID: $notice_id");

        $query = "INSERT INTO $this->read_table (user_id, notice_id) VALUES (?, ?)";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for marking notice as read: " . $this->conn->error);
            return false;
        }

        if (!$stmt->bind_param("ii", $user_id, $notice_id)) {
            logMessage("Error binding parameters for marking notice as read: " . $stmt->error);
            return false;
        }
        logMessage("Query bound for marking notice as read: $notice_id");

        if ($stmt->execute()) {
            logMessage("Notice marked as read successfully for user ID: $user_id and notice ID: $notice_id");
            return true;
        } else {
            logMessage("Notice marking as read failed: " . $stmt->error);
            return false;
        }
    }
}
