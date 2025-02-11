<?php

include_once "../../logs/save.php";
require_once "../../config/database.php";

class Attendance
{
    private $conn;
    private $historyTable = "Attendance_History";
    private $todayTable = "today_attendance";

    public function __construct()
    {
        $this->conn = DatabaseConnection::getInstance()->getConnection();
        logMessage("Attendance model initialized with database connection.");
    }

    // Insert attendance into Today_attendance
    public function markAttendance($userid, $date, $time, $arrived)
    {
        logMessage("Marking attendance for User ID: $userid");

        if (!$this->conn) {
            logMessage("Database connection is not valid.");
            return false;
        }

        $query = "INSERT INTO " . $this->todayTable . " (user_id, Date, Time, Arrived) 
                  VALUES (?, ?, ?, ?)";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for attendance insertion: " . $this->conn->error);
            return false;
        }

        if (!$stmt->bind_param("issi", $userid, $date, $time, $arrived)) {
            logMessage("Error binding parameters for attendance insertion: " . $stmt->error);
            return false;
        }

        if ($stmt->execute()) {
            logMessage("Attendance recorded successfully for User ID: $userid");
            return true;
        } else {
            logMessage("Error inserting attendance: " . $stmt->error);
            return false;
        }
    }

    // Fetch all attendance records from Today_attendance
    public function getTodayAttendance()
    {
        logMessage("Fetching today's attendance...");

        $query = "SELECT * FROM " . $this->todayTable;
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for fetching today's attendance: " . $this->conn->error);
            return false;
        }

        if ($stmt->execute()) {
            $result = $stmt->get_result();
            if ($result && $result->num_rows > 0) {
                $attendance = $result->fetch_all(MYSQLI_ASSOC);
                logMessage("Today's attendance fetched successfully.");
                return $attendance;
            } else {
                logMessage("No attendance records found for today.");
                return [];
            }
        } else {
            logMessage("Error fetching today's attendance: " . $stmt->error);
            return false;
        }
    }

    // Fetch all attendance records from Attendance_History
    public function getAttendanceHistory()
    {
        logMessage("Fetching attendance history...");

        $query = "SELECT * FROM " . $this->historyTable;
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement for fetching attendance history: " . $this->conn->error);
            return false;
        }

        if ($stmt->execute()) {
            $result = $stmt->get_result();
            if ($result && $result->num_rows > 0) {
                $history = $result->fetch_all(MYSQLI_ASSOC);
                logMessage("Attendance history fetched successfully.");
                return $history;
            } else {
                logMessage("No attendance history records found.");
                return [];
            }
        } else {
            logMessage("Error fetching attendance history: " . $stmt->error);
            return false;
        }
    }
}
