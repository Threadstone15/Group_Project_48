<?php
// markAttendanceHandler.php

include_once "../models/Attendance.php";
include_once "../../logs/save.php";

function markAttendance($userid, $jsonData)
{
    logMessage("Running markAttendanceHandler...");

    $attendance = new Attendance();

    $date = $jsonData['date'];
    $time = $jsonData['time'];
    $arrived = $jsonData['arrived'];

    if ($attendance->markAttendance($userid, $date, $time, $arrived)) {
        logMessage("Attendance marked successfully for User ID: $userid");
        echo json_encode(["message" => "Attendance marked successfully"]);
    } else {
        logMessage("Failed to mark attendance for User ID: $userid");
        echo json_encode(["error" => "Failed to mark attendance"]);
    }
}

function getDailyAttendance()
{
    logMessage("Running getDailyAttendance...");

    $attendance = new Attendance();
    $result = $attendance->countDailyAttendance();  // Fetch count and percentage

    if ($result !== false) {
        // Access count and percentage
        $count = $result['count'];
        $percentage = $result['percentage'];

        logMessage("Today's attendance count: $count, percentage: $percentage%");

        // Return both count and percentage in the response
        echo json_encode(["count" => $count, "percentage" => $percentage]);
    } else {
        logMessage("Failed to fetch today's attendance percentage");
        echo json_encode(["error" => "Failed to fetch today's attendance percentage"]);
    }
}
