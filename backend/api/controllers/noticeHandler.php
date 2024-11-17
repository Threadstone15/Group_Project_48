<?php
// noticeHandler.php

include_once "../models/Notice.php";
include_once "../../logs/save.php";

function addNotice($conn) {
    $notice = new Notice($conn);
    $publisher_id = intval($_POST['publisher_id']);
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

function getNotices($conn) {
    $notice = new Notice($conn);
    $notice_id = isset($_GET['notice_id']) ? intval($_GET['notice_id']) : null;

    $notices = $notice->getNotices($notice_id);
    if ($notices) {
        echo json_encode($notices);
    } else {
        echo json_encode(["error" => "No notices found"]);
    }
}

function updateNotice($conn) {
    $notice = new Notice($conn);
    $notice_id = intval($_POST['notice_id']);
    $title = filter_var($_POST['title'], FILTER_SANITIZE_STRING);
    $description = filter_var($_POST['description'], FILTER_SANITIZE_STRING);

    if ($notice->updateNotice($notice_id, $title, $description)) {
        logMessage("Notice updated successfully: $notice_id");
        echo json_encode(["message" => "Notice updated successfully"]);
    } else {
        logMessage("Failed to update notice: $notice_id");
        echo json_encode(["error" => "Notice update failed"]);
    }
}

function deleteNotice($conn) {
    $notice = new Notice($conn);
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
