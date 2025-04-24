<?php
// api/models/attendanceOverviewModel.php

include_once "../../logs/save.php"; 
require_once "../../config/database.php";

class AttendanceOverviewModel{
    private $conn;
    private $table = "Attendance_History";

    public function __construct(){
        $this->conn = DatabaseConnection::getInstance()->getConnection();
        logMessage("AttendanceOverviewModel initialized with database connection.");
    }

    //Fetch total attendance count for a day
    public function getTotalAttendance(){
        $query = "SELECT COUNT(*) AS total FROM $this->table";
        $result = $this->conn->query($query);
        return $result->fetch_assoc();
    }

    //Fetch attendance count grouped by day/week/month
    public function getAttendanceByPeriod($periodType){
        switch($periodType){
            case "today":
                $query = "SELECT DATE(date) AS label, COUNT(*) AS count 
                          FROM $this->table 
                          WHERE date >= CURDATE()
                          GROUP BY DATE(date)
                          ORDER BY DATE(date)";
                break;
            case "week":
                $query = "SELECT YEARWEEK(date) AS label, COUNT(*) AS count 
                          FROM $this->table 
                          WHERE date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
                          GROUP BY YEARWEEK(date)
                          ORDER BY YEARWEEK(date)";
                break;
            case "month":
                $query = "SELECT DATE_FORMAT(date, '%Y-%m') AS label, COUNT(*) AS count 
                          FROM $this->table 
                          WHERE date >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
                          GROUP BY DATE_FORMAT(date, '%Y-%m')
                          ORDER BY DATE_FORMAT(date, '%Y-%m')";
                break;
            default:
                logMessage("Invalid period type provided: $periodType");
                return false;
        }

        $result = $this->conn->query($query);
        return $result->fetch_all(MYSQLI_ASSOC);
    }
}