<?php

include_once "../models/User.php";

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
