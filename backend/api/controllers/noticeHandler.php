<?php
// noticeHandler.php

include_once "../models/Notice.php";
include_once "../../logs/save.php";

function addNotice($publisher_id) {
    logMessage("add notice function running...");

    $notice = new Notice();
    $title = filter_var($_POST['title'], FILTER_SANITIZE_STRING);
    $description = filter_var($_POST['description'], FILTER_SANITIZE_STRING);

    if ($notice->addNotice($publisher_id, $title, $description)) {
        logMessage("Notice added successfully: $title");
        echo json_encode(["message" => "Notice added successfully"]);
    } else {
        logMessage("Failed to add notice: $title");
        echo json_encode(["error" => "Notice addition failed"]);
    }
}

function getNotices() {
    logMessage("get notices function running...");

    $notice = new Notice();
    $notice_id = isset($_GET['notice_id']) ? intval($_GET['notice_id']) : null;

    $notices = $notice->getNotices($notice_id);
    if ($notices) {
        logMessage("Notices fetched successfully");
        echo json_encode($notices);
    } else {
        logMessage("No notices found");
        echo json_encode(["error" => "No notices found"]);
    }
}

function updateNotice($publisher_id) {
    logMessage("update notice function running...");

    $notice = new Notice();
    $notice_id = intval($_POST['notice_id']);
    $title = filter_var($_POST['title'], FILTER_SANITIZE_STRING);
    $description = filter_var($_POST['description'], FILTER_SANITIZE_STRING);

    if ($notice->updateNotice($notice_id, $publisher_id, $title, $description)) {
        logMessage("Notice updated successfully: $notice_id");
        echo json_encode(["message" => "Notice updated successfully"]);
    } else {
        logMessage("Failed to update notice: $notice_id");
        echo json_encode(["error" => "Notice update failed"]);
    }
}

function deleteNotice() {
    logMessage("delete notice function running...");

    $notice = new Notice();
    $notice_id = intval($_POST['notice_id']);

    if ($notice->deleteNotice($notice_id)) {
        logMessage("Notice deleted successfully: $notice_id");
        echo json_encode(["message" => "Notice deleted successfully"]);
    } else {
        logMessage("Failed to delete notice: $notice_id");
        echo json_encode(["error" => "Notice deletion failed"]);
    }
}
?>
