<?php
// jobHandler.php

include_once "../models/jobs.php";
include_once "../../logs/save.php";

function addJob($publisher_id) {
    logMessage("Add job function running...");

    $job = new Job();

    // Get the raw input data and decode JSON
    $data = json_decode(file_get_contents("php://input"), true);

     // Validate that required fields exist
     if (
        isset($data['title']) &&
        isset($data['description'])
    ) {
        $title = $data['title'];
        $description = $data['description'];

        if ($job->addJob($publisher_id, $title, $description)) {
            logMessage("Job added successfully: $title");
            echo json_encode(["message" => "Job added successfully"]);
        } else {
            logMessage("Failed to add job: $title");
            echo json_encode(["error" => "Job addition failed"]);
        }
    } else {
        logMessage("Invalid input data for membership plan");
        echo json_encode(["error" => "Invalid input data"]);
    }
}


function getJobs() {
    logMessage("Get jobs function running...");

    $job = new Job();
    $job_id = isset($_GET['job_id']) ? intval($_GET['job_id']) : null;

    $jobs = $job->getJobs($job_id);
    if ($jobs) {
        logMessage("Jobs fetched successfully");
        echo json_encode($jobs);
    } else {
        logMessage("No jobs found");
        echo json_encode(["error" => "No jobs found"]);
    }
}

function updateJob($publisher_id) {
    logMessage("Update job function running...");

    $job = new Job();
    $data = json_decode(file_get_contents("php://input"), true);

    if (isset($data['job_id']) && 
        isset($data['title']) && 
        isset($data['description']))

    $job_id = $data['job_id'];
    $title = $data['title'];
    $description = $data['description'];

    if ($job->updateJob($job_id, $publisher_id, $title, $description)) {
        logMessage("Job updated successfully: $job_id");
        echo json_encode(["message" => "Job updated successfully"]);
    } else {
        logMessage("Failed to update job: $job_id");
        echo json_encode(["error" => "Job update failed"]);
    }
    {/*$job_id = intval($data['job_id']);
    $title = filter_var($data['title'], FILTER_SANITIZE_STRING);
    $description = filter_var($data['description'], FILTER_SANITIZE_STRING);

    if ($job->updateJob($job_id, $publisher_id, $title, $description)) {
        logMessage("Job updated successfully: $job_id");
        echo json_encode(["message" => "Job updated successfully"]);
    } else {
        logMessage("Failed to update job: $job_id");
        echo json_encode(["error" => "Job update failed"]);
    }*/}
}

function deleteJob() {
    logMessage("Delete job function running...");

    $job = new Job();
    $job_id = intval($_GET['job_id']);

    if ($job->deleteJob($job_id)) {
        logMessage("Job deleted successfully: $job_id");
        echo json_encode(["message" => "Job deleted successfully"]);
    } else {
        logMessage("Failed to delete job: $job_id");
        echo json_encode(["error" => "Job deletion failed"]);
    }
}
?>
<?php