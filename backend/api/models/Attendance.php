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

        // Step 1: Get existing date in today_attendance
        $existingDateQuery = "SELECT `Date` FROM " . $this->todayTable . " LIMIT 1";
        $result = $this->conn->query($existingDateQuery);

        if ($result && $result->num_rows > 0) {
            $row = $result->fetch_assoc();
            $existingDate = $row['Date'];
            logMessage("Existing date in today_attendance: $existingDate");

            // Step 2: If date is different, archive and clear
            if ($existingDate !== $date) {
                logMessage("New date is different. Archiving old records...");

                // Insert old records into history
                $archiveQuery = "INSERT INTO " . $this->historyTable . " (user_id, `Date`, `Time`, Arrived)
                             SELECT user_id, `Date`, `Time`, Arrived FROM " . $this->todayTable;
                if (!$this->conn->query($archiveQuery)) {
                    logMessage("Error archiving attendance: " . $this->conn->error);
                    return false;
                }

                // Delete old records
                $clearQuery = "DELETE FROM " . $this->todayTable;
                if (!$this->conn->query($clearQuery)) {
                    logMessage("Error clearing today's attendance: " . $this->conn->error);
                    return false;
                }

                logMessage("Archiving and clearing done.");
            } else {
                logMessage("Same date as existing. No need to archive.");
            }
        } else {
            logMessage("No existing records. Proceeding to insert.");
        }
        logMessage("Inserting new attendance record...");
        // Step 3: Insert the new attendance record
        $insertQuery = "INSERT INTO " . $this->todayTable . " (user_id, Date, Time, Arrived) 
                    VALUES (?, ?, ?, ?)";
        $stmt = $this->conn->prepare($insertQuery);

        if ($stmt === false) {
            logMessage("Error preparing insert statement: " . $this->conn->error);
            return false;
        }

        if (!$stmt->bind_param("issi", $userid, $date, $time, $arrived)) {
            logMessage("Error binding insert params: " . $stmt->error);
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

    public function getUniqueUsersArrived()
    {
        logMessage("Fetching number of unique users with latest arrival marked as 1...");

        if (!$this->conn) {
            logMessage("Database connection is not valid.");
            return false;
        }

        $query = "CALL GetUniqueUsersWithArrived()";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing stored procedure call: " . $this->conn->error);
            return false;
        }

        if ($stmt->execute()) {
            $result = $stmt->get_result();

            if ($result && $result->num_rows > 0) {
                $row = $result->fetch_assoc();
                $count = $row['total_users_arrived'];
                logMessage("Total users with latest Arrived=1: $count");
                return $count;
            } else {
                logMessage("No result returned from stored procedure.");
                return 0;
            }
        } else {
            logMessage("Error executing stored procedure: " . $stmt->error);
            return false;
        }
    }
    public function getGymCapacity()
    {
        logMessage("Fetching gym capacity from configuration...");

        if (!$this->conn) {
            logMessage("Database connection is not valid.");
            return false;
        }

        $query = "SELECT config_value FROM " . $this->configtable . " WHERE config_key = 'gym_capacity'";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement to fetch gym capacity: " . $this->conn->error);
            return false;
        }

        if (!$stmt->execute()) {
            logMessage("Error executing statement to fetch gym capacity: " . $stmt->error);
            return false;
        }

        $result = $stmt->get_result();
        if ($result && $result->num_rows > 0) {
            $config = $result->fetch_assoc();
            $gymCapacity = (int) $config['config_value'];
            logMessage("Gym capacity fetched successfully: $gymCapacity");
            return $gymCapacity;
        } else {
            logMessage("Gym capacity not found in configuration.");
            return false;
        }
    }
    public function getLatestArrivedStatus($userId)
    {
        logMessage("Fetching latest Arrived status for User ID: $userId");

        if (!$this->conn) {
            logMessage("Database connection is not valid.");
            return false;
        }

        $query = "CALL GetLatestArrivedStatus(?)";
        $stmt = $this->conn->prepare($query);

        if ($stmt === false) {
            logMessage("Error preparing statement: " . $this->conn->error);
            return false;
        }

        if (!$stmt->bind_param("i", $userId)) {
            logMessage("Error binding parameter: " . $stmt->error);
            return false;
        }

        if (!$stmt->execute()) {
            logMessage("Error executing stored procedure: " . $stmt->error);
            return false;
        }

        $result = $stmt->get_result();
        if ($result && $row = $result->fetch_assoc()) {
            $arrived = $row['Arrived'];
            logMessage("Latest Arrived status for User ID $userId: $arrived");
            return $arrived;
        } else {
            logMessage("No records found for User ID: $userId");
            return null;
        }
    }
}
