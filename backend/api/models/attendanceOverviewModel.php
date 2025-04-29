<?php
// api/models/attendanceOverviewModel.php

include_once "../../logs/save.php";
require_once "../../config/database.php";

class AttendanceOverviewModel
{
    private $conn;
    private $table = "Attendance_History";
    private $table2 = "today_attendance";

    public function __construct()
    {
        $this->conn = DatabaseConnection::getInstance()->getConnection();
        logMessage("AttendanceOverviewModel initialized with database connection.");
    }

    //Fetch total attendance count for a day
    public function getTotalAttendance()
    {
        $query = "SELECT COUNT(*) AS total FROM $this->table2 WHERE Arrived = 1";
        $result = $this->conn->query($query);
        return $result->fetch_assoc();
    }

    //Fetch attendance count grouped by day/week/month
    public function getAttendanceByPeriod($periodType)
    {
        switch ($periodType) {
            case "today":
                $query = "SELECT DATE_FORMAT(Time, '%H:00') AS label, COUNT(*) AS count 
                          FROM $this->table2 
                          WHERE DATE(date) = CURDATE()
                          GROUP BY HOUR(Time)
                          ORDER BY HOUR(Time)";
                break;
            case "week":
                $query = "SELECT DATE(date) AS label, COUNT(*) AS count 
                          FROM $this->table 
                          WHERE date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
                          GROUP BY DATE(date)
                          ORDER BY DATE(date)";
                break;
            case "month":
                $query = "SELECT DATE(date) AS label, COUNT(*) AS count 
                          FROM $this->table 
                          WHERE MONTH(date) = MONTH(CURDATE()) AND YEAR(date) = YEAR(CURDATE())
                          GROUP BY DATE(date)
                          ORDER BY DATE(date)";
                break;
            default:
                logMessage("Invalid period type provided: $periodType");
                return false;
        }

        $result = $this->conn->query($query);
        return $result->fetch_all(MYSQLI_ASSOC);
    }
}
