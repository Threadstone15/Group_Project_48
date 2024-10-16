<?php
// middleware/authMiddleware.php

function checkAuth() {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(["error" => "Unauthorized"]);
        exit();
    }
}

function checkRole($allowedRoles) {
    if (!in_array($_SESSION['role'], $allowedRoles)) {
        echo json_encode(["error" => "Forbidden"]);
        exit();
    }
}
?>
