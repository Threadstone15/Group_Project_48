<?php

include_once "../models/systemHistory.php";

function getHistory()
{
    logMessage("Running get_history....in controller");

    if (!isset($_GET['type'])) {
        logMessage("Missing 'type' in request.");
        http_response_code(400);
        echo json_encode(["error" => "Missing 'type' parameter."]);
        return;
    }

    $type = strtolower($_GET['type']);
    logMessage("Fetching history for type: $type");

    $systemHistory = new SystemHistory();

    switch ($type) {
        case 'attendance':
            logMessage("Fetching attendance history...");
            $result = $systemHistory->getAttendanceHistory();
            break;
        case 'maintenance':
            $result = $systemHistory->getMaintenanceHistory();
            break;
        case 'applications':
            $result = $systemHistory->getApplicationsHistory();
            break;
        case 'jobs':
            $result = $systemHistory->getJobsHistory();
            break;
        case 'equipments':
            $result = $systemHistory->getEquipmentsHistory();
            break;
        default:
            logMessage("Invalid history type: $type");
            http_response_code(400);
            echo json_encode(["error" => "Invalid 'type' value."]);
            return;
    }

    if ($result === false) {
        http_response_code(500);
        echo json_encode(["error" => "Failed to fetch history."]);
    } else {
        echo json_encode($result);

        //logMessage("History fetched successfully. json: " . json_encode($result));
    }
}
