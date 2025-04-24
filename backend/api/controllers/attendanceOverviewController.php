<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

require_once __DIR__ . '/../models/attendanceOverviewModel.php';
require_once __DIR__ . '/../../logs/save.php';

class AttendanceOverviewController{
    private $model;

    public function __construct() {
        $this->model = new attendanceOverviewModel();
        logMessage("AttendanceOverviewController initialized with model.");
    }

    //Get attendance overview data for charts
    public function getOverviewData($request) {
        try {
            logMessage('Controller: Fetching attendance overview data.');
            $period = $this->validatePeriod($request['period'] ?? 'Today');
            $rawData = $this->model->getAttendanceByPeriod(strtolower($period));

            if ($rawData === false) {
                throw new Exception("Failed to fetch attendance overview data.");
            }

            // Fetch total attendance count
            $totalAttendance = $this->model->getTotalAttendance();

            header('Content-Type: application/json');
            echo json_encode([
                "status" => "success",
                "data" => $this->processOverviewData($rawData),
                "total" => $totalAttendance['total'] ?? 0 // Add total count here
            ]);
        } catch (Exception $e) {
            $this->handleError($e->getMessage());
        }
    }

    //process attendance data for front end
    private function processOverviewData($rawData) {
        $processed = [
            'labels' => [],
            'attendance_count' => [],
        ];

        foreach ($rawData as $row) {
            $processed['labels'][] = $row['label'];
            $processed['attendance_count'][] = (int)$row['count'];
        }

        return $processed;
    }

    //validate period type - accepts "Today", "Week", "Month" only
    private function validatePeriod($period) {
        $validPeriods = ['today', 'week', 'month'];
        $period = strtolower($period);   // Normalize to lowercase
        if (!in_array($period, $validPeriods)) {
            logMessage("Invalid period type provided: $period");
            throw new Exception("Invalid period type provided: $period");
        }
        return $period;
    }

    //handle error response
    private function handleError($message) {
        logMessage("Error: $message");
        header('Content-Type: application/json');
        echo json_encode([
            "status" => "error",
            "message" => "Something went wrong with the period parameter.",
        ]);
        http_response_code(500);
        exit();
    }
}

// Handle GET request directly
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['period'])) {
    $controller = new attendanceOverviewController();
    $controller->getOverviewData($_GET);
} else {
    // Optional: output a debug message if period is missing or method is incorrect
    header('Content-Type: application/json');
    echo json_encode([
        "status" => "error",
        "message" => "Invalid request. Missing 'period' or not a GET request."
    ]);
    http_response_code(400);
}