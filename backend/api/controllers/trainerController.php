<?php

// api/controllers/trainerController.php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json'); // Set content type to JSON

session_start();
include_once "../models/User.php";
include_once "../models/Trainer.php"; // Include Trainer model
include_once "../../middleware/authMiddleware.php";
include_once "../../logs/save.php";
include_once "../models/WorkoutPlan.php";

$conn = include_once "../../config/database.php";
$user = new User($conn);
$trainer = new Trainer($conn);
$workoutPlan = new WorkoutPlan($conn);

$request_method = $_SERVER['REQUEST_METHOD'];
logMessage("Running: $request_method");

//extracting user_id from token
// $token = $_POST['token'];
// $user_id = getUserIdFromToken($token);

// save trainer details
if ($request_method == 'POST' && isset($_POST['save_trainerDetails'])) {

    logMessage("Running Trainer Details Saving Process");

    // Get the user data from the request
    $user_id = $_POST['user_id'];
    $firstName = filter_var($_POST['firstName'], FILTER_SANITIZE_STRING);
    $lastName = filter_var($_POST['lastName'], FILTER_SANITIZE_STRING);
    $NIC = $_POST['NIC']; 
    $DOB_date = $_POST['DOB_date'];
    $DOB_month = $_POST['DOB_month'];
    $DOB_year = $_POST['DOB_year'];
    $address = $_POST['address'];
    $mobile_number = $_POST['mobile_number'];
    $years_of_experience = $_POST['years_of_experience'];
    $specialties = $_POST['specialties'];

    //checknig whether user exists
    $userData = $user->getUserByUserID($user_id);
    if($userData){
        //user exists
        //Now, check whether trainer record already exists or nt
        $trainerData = $trainer->checkTrainerExists($user_id);
        if($trainerData){
            //trainer record exists
            logMessage("Trainer record already exists");
            echo json_encode(["error"=> "trainer record already exists"]);
            return;
        }
        //else... save trainer details
        if ($trainer->saveTrainerDetails($user_id, $firstName, $lastName, $NIC, $DOB_date, $DOB_month, $DOB_year, $address, $mobile_number, $years_of_experience, $specialties)) {
            logMessage("Trainer details saved successfully with user ID: $user_id");
            echo json_encode(["message" => "Trainer details saved successfully"]);
        } else {
            logMessage("Trainer details saving failed for user ID: $user_id");
            echo json_encode(["error" => "Trainer details saving failed failed"]);
        }
    }else{
        //user doesn;t exists
        logMessage("User doesn't exists for the user_id : $user_id");
        echo json_encode(["error"=> "user doesn't exist"]);
    }
}

// update trainer details
if ($request_method == 'POST' && isset($_POST['update_trainerDetails'])) {

    logMessage("Running Trainer Details Updating Process");

    // Get the user data from the request
    $user_id = $_POST['user_id'];
    $firstName = filter_var($_POST['firstName'], FILTER_SANITIZE_STRING);
    $lastName = filter_var($_POST['lastName'], FILTER_SANITIZE_STRING);
    $NIC = $_POST['NIC']; 
    $DOB_date = $_POST['DOB_date'];
    $DOB_month = $_POST['DOB_month'];
    $DOB_year = $_POST['DOB_year'];
    $address = $_POST['address'];
    $mobile_number = $_POST['mobile_number'];
    $years_of_experience = $_POST['years_of_experience'];
    $specialties = $_POST['specialties'];

    //checknig whether user exists
    $userData = $user->getUserByUserID($user_id);
    if($userData){
        //user exists
        //Now, check whether trainer record already exists or nt
        $trainerData = $trainer->checkTrainerExists($user_id);
        if(!$trainerData){
            //trainer record exists
            logMessage("Trainer record doesn't exist");
            echo json_encode(["error"=> "trainer record not found"]);
            return;
        }
        //else... update trainer details
        if ($trainer->updateTrainerDetails($user_id, $firstName, $lastName, $NIC, $DOB_date, $DOB_month, $DOB_year, $address, $mobile_number, $years_of_experience, $specialties)) {
            logMessage("Trainer details updated successfully with user ID: $user_id");
            echo json_encode(["message" => "Trainer details updated successfully"]);
        } else {
            logMessage("Trainer details updating failed for user ID: $user_id");
            echo json_encode(["error" => "Trainer details updating failed"]);
        }
    }else{
        //user doesn;t exists
        logMessage("User doesn't exists for the user_id : $user_id");
        echo json_encode(["error"=> "user doesn't exist"]);
    }
}

// remove trainer details
if ($request_method == 'POST' && isset($_POST['remove_trainerDetails'])) {

    logMessage("Running Trainer Details removing Process");

    // Get the user data from the request
    $user_id = $_POST['user_id'];

    //checknig whether user exists
    $userData = $user->getUserByUserID($user_id);
    if($userData){
        //user exists
        //Now, check whether trainer record already exists or nt
        $trainerData = $trainer->checkTrainerExists($user_id);
        if(!$trainerData){
            //trainer record doesn't exist
            logMessage("Trainer record not found");
            echo json_encode(["error"=> "trainer record not found"]);
            return;
        }
        //else... save trainer details
        if ($trainer->removeTrainerDetails($user_id)) {
            logMessage("Trainer details removed successfully for user ID: $user_id");
            echo json_encode(["message" => "Trainer details removed successfully"]);
        } else {
            logMessage("Trainer details couldn't be deleted for user ID: $user_id");
            echo json_encode(["error" => "Trainer details couldn't be deleted"]);
        }
    }else{
        //user doesn;t exists
        logMessage("User doesn't exists for the user_id : $user_id");
        echo json_encode(["error"=> "user doesn't exist"]);
    }
}

// get trainer details
if ($request_method == 'POST' && isset($_POST['get_trainerDetails'])) {

    logMessage("Running get Trainer Details Process");

    // Get the user data from the request
    $user_id = $_POST['user_id'];

    //checknig whether user exists
    $userData = $user->getUserByUserID($user_id);
    if($userData){
        //user exists
        //Now, check whether trainer record already exists or nt
        $trainerData = $trainer->checkTrainerExists($user_id);
        if(!$trainerData){
            //trainer record doesn't exist
            logMessage("Trainer record not found");
            echo json_encode(["error"=> "trainer record not found"]);
            return;
        }
        //else... get trainer details
        $trainerDetails = $trainer->getTrainerDetails($user_id);
        if ($trainerDetails) {
            logMessage("Trainer details retrieved successfully for user ID: $user_id");
            echo json_encode(["trainerDetails" => $trainerDetails]);
        } else {
            logMessage("Trainer details couldn't be retrived for user ID: $user_id");
            echo json_encode(["error" => "Trainer details couldn't be retrieved"]);
        }
    }else{
        //user doesn;t exists
        logMessage("User doesn't exists for the user_id : $user_id");
        echo json_encode(["error"=> "user doesn't exist"]);
    }
}

// create workout plan
if ($request_method == 'POST' && isset($_POST['create_workoutPlan'])) {

    logMessage("Running workout plan creating process");

    // Get the user data from the request
    $user_id = $_POST['user_id'];
    $name = $_POST['name'];
    $description = $_POST['description'];

    //getting trainer_id from the user_id
    $trainer_id = $trainer->checkTrainerExists($user_id);

    if(!$trainer_id){
        echo json_encode(["error" => "Trainer doesn't exist"]);
        return;
    }

    //ccreating workout plan record
    $workout_plan_id = $workoutPlan->createWorkoutPlan($trainer_id,$name, $description);
    if($workout_plan_id){
        logMessage("Workout plan successfully created for the plan id : $workout_plan_id");
        echo json_encode(["workoutPlanId"=> $workout_plan_id, "message" => "workout plan created successfuly"]);
    }else{
        logMessage("Workout plan couldn't be created");
        echo json_encode(["error"=> "workut plan couldn't be created"]);
    }

}
?>
