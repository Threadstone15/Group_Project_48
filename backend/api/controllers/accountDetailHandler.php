<?php

include_once "../models/User.php";
include_once "../../logs/save.php";
include_once "./accountMail.php";


function getProfileDetails($user_id)
{
    logMessage("Running get_profile....in handler");
    $user = new User();
    echo $user->getProfile($user_id);
}

function updateProfileDetails($user_id)
{
    $address = $_POST['address'] ?? $_GET['address'] ?? null;
    $dob = $_POST['dob'] ?? $_GET['dob'] ?? null;
    $gender = $_POST['gender'] ?? $_GET['gender'] ?? null;
    $phone = $_POST['phone'] ?? $_GET['phone'] ?? null;
    logMessage("Running update_profile....in handler");

    $user = new User();
    echo $user->updateProfile($user_id, $address, $dob, $gender, $phone);
}

function changePassword($user_id)
{
    $old_password = $_POST['oldPassword'] ?? $_GET['oldPassword'] ?? null;
    $new_password = $_POST['newPassword'] ?? $_GET['newPassword'] ?? null;
    logMessage("Running change_password....in handler");

    $user = new User();
    if ($user->changePassword($user_id, $old_password, $new_password)) {
        $email = $user->getEmailById($user_id);
        if ($email) {
            password_change($email);
        }
        logMessage("Password changed successfully for user ID: $user_id");
    } else {
        logMessage("Error executing changePassword query for user ID: $user_id");
    }
}
