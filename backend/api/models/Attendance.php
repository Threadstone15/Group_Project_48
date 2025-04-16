<?php

include_once "../../logs/save.php";
require_once "../../config/database.php";

class Attendance
{
    private $conn;
    private $historyTable = "Attendance_History";
    private $todayTable = "today_attendance";
    private $configtable = "configuration";

    public function __construct()
    {
        $this->conn = DatabaseConnection::getInstance()->getConnection();
        logMessage("Attendance model initialized with database connection.");
    }

    // Insert attendance into Today_attendance
    public function markAttendance($userid, $date, $time, $arrived)
    {
        logMessage("Marking attendance for User ID: $userid with Date: $date, Time: $time, Arrived: $arrived");

        if (!$this->conn) {
            logMessage("Database connection is not valid.");
            return false;
        }
        logMessage("1");

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
        logMessage("2");
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

    public function countDailyAttendance()
    {
        logMessage("Counting today's attendance...");

        $attendanceRecords = $this->getTodayAttendance();
        if ($attendanceRecords === false) {
            logMessage("Failed to fetch today's attendance.");
            return false;
        }

        $query = "SELECT config_value FROM " . $this->configtable . " WHERE config_key = 'gym_capacity'";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement to fetch gym capacity: " . $this->conn->error);
            return false;
        }

        if (!$stmt->execute()) {
            logMessage("Error fetching gym capacity: " . $stmt->error);
            return false;
        }

        $result = $stmt->get_result();
        if ($result && $result->num_rows > 0) {
            $config = $result->fetch_assoc();
            $gymCapacity = (int) $config['config_value'];
        } else {
            logMessage("Gym capacity not found in configuration.");
            return false;
        }

        $count = 0;

        foreach ($attendanceRecords as $record) {
            $arrived = ($record['Arrived'] < 0) ? 0 : $record['Arrived'];
            if ($arrived == 1) {
                $count++;
            }
        }

        logMessage("Today's attendance count: $count");

        $percentage = ($gymCapacity > 0) ? ($count / $gymCapacity) * 100 : 0;
        logMessage("Today's attendance percentage: $percentage%");

        return ['count' => $count, 'percentage' => $percentage];
    }
}
