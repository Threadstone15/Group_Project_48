<?php
// markAttendanceHandler.php

include_once "../models/Attendance.php";;
include_once "../../logs/save.php";

function mark_attendance($userid)
{
    logMessage("Running markAttendanceHandler...");

    $attendance = new Attendance();

    $date = $_POST['date'] ?? $_GET['date'] ?? null;
    $time = $_POST['time'] ?? $_GET['time'] ?? null;
    $arrived = $_POST['arrived'] ?? $_GET['arrived'] ?? null;

    if ($attendance->markAttendance($userid, $date, $time, $arrived)) {
        logMessage("Attendance marked successfully for User ID: $userid");
        echo json_encode(["message" => "Attendance marked successfully"]);
    } else {
        logMessage("Failed to mark attendance for User ID: $userid");
        echo json_encode(["error" => "Failed to mark attendance"]);
    }
}
