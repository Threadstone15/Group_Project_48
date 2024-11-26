<?php
// notification.php

include_once "../models/Notification.php";
include_once "../../logs/save.php";

/**
 * Adds a new notification.
 */
function addNotification() {
    logMessage("Adding a new notification...");

    $notification = new Notification();

    // Get and validate the input data
    $data = json_decode(file_get_contents("php://input"), true);
    if (
        isset($data['user_id']) &&
        isset($data['message']) &&
        isset($data['date_sent']) &&
        isset($data['status'])
    ) {
        $user_id = filter_var($data['user_id'], FILTER_SANITIZE_STRING);
        $message = filter_var($data['message'], FILTER_SANITIZE_STRING);
        $date_sent = filter_var($data['date_sent'], FILTER_SANITIZE_STRING);
        $status = filter_var($data['status'], FILTER_SANITIZE_STRING);

        // Add the notification
        if ($notification->addNotification($user_id, $message, $date_sent, $status)) {
            logMessage("Notification added for user: $user_id");
            echo json_encode(["message" => "Notification added successfully"]);
        } else {
            logMessage("Failed to add notification for user: $user_id");
            echo json_encode(["error" => "Notification addition failed"]);
        }
    } else {
        logMessage("Invalid input data for notification");
        echo json_encode(["error" => "Invalid input data"]);
    }
}

/**
 * Retrieves all notifications.
 */
function getNotifications() {
    logMessage("Fetching all notifications...");
    $notification = new Notification();

    $result = $notification->getNotifications();

    if ($result) {
        logMessage("Notifications fetched successfully");
        echo json_encode($result);
    } else {
        logMessage("No notifications found");
        echo json_encode(["error" => "No notifications found"]);
    }
}

/**
 * Updates an existing notification.
 */
function updateNotification() {
    logMessage("Updating a notification...");

    $notification = new Notification();
    $data = json_decode(file_get_contents("php://input"), true);

    // Validate input data
    if (
        isset($data['notification_id']) &&
        isset($data['user_id']) &&
        isset($data['message']) &&
        isset($data['date_sent']) &&
        isset($data['status'])
    ) {
        $notification_id = intval($data['notification_id']);
        $user_id = filter_var($data['user_id'], FILTER_SANITIZE_STRING);
        $message = filter_var($data['message'], FILTER_SANITIZE_STRING);
        $date_sent = filter_var($data['date_sent'], FILTER_SANITIZE_STRING);
        $status = filter_var($data['status'], FILTER_SANITIZE_STRING);

        // Update the notification
        if ($notification->updateNotification($notification_id, $user_id, $message, $date_sent, $status)) {
            logMessage("Notification updated successfully: ID $notification_id");
            echo json_encode(["message" => "Notification updated successfully"]);
        } else {
            logMessage("Failed to update notification: ID $notification_id");
            echo json_encode(["error" => "Notification update failed"]);
        }
    } else {
        logMessage("Invalid input for notification update");
        echo json_encode(["error" => "Invalid input data"]);
    }
}

/*
 * Deletes an existing notification.
 */
function deleteNotification() {
    logMessage("Deleting a notification...");

    $notification = new Notification();

    if (isset($_GET['notification_id'])) {
        $notification_id = intval($_GET['notification_id']);

        // Delete the notification
        if ($notification->deleteNotification($notification_id)) {
            logMessage("Notification deleted: $notification_id");
            echo json_encode(["message" => "Notification deleted successfully"]);
        } else {
            logMessage("Failed to delete notification: $notification_id");
            echo json_encode(["error" => "Notification deletion failed"]);
        }
    } else {
        logMessage("Invalid input for notification deletion");
        echo json_encode(["error" => "Invalid input data"]);
    }
}
?>
