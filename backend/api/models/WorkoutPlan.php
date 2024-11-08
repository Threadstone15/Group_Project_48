<?php

include_once "../../logs/save.php";

class WorkoutPlan{
    private $conn;
    private $workout_plan_table = "workout_plan";
    private $workout_planDetails_table = "workout_planDetails";

    public function __construct($db) {
        $this->conn = $db;
        logMessage("wokrout plan model initialized");
    }

    private function generateWorkoutPlanID() {
        $query = "SELECT COUNT(*) AS count FROM " . $this->workout_plan_table;
        $result = $this->conn->query($query);

        if ($result && $row = $result->fetch_assoc()) {
            $count = (int)$row['count'] + 1;  // Increment count for the new ID
            return 'W' . $count;  // Format as W1, W2, etc., without leading zeros
        } else {
            logMessage("Failed to generate workout plan ID: " . $this->conn->error);
            return false;
        }
    }

    public function createWorkoutPlan($trainer_id, $name, $description){
        //generate workout_plan_id
        $workout_plan_id = $this->generateWorkoutPlanID();
        if (!$workout_plan_id) {
            logMessage("workout_plan_id generation failed");
            return false;
        }
        $query = "INSERT INTO ". $this->workout_plan_table . "
                    (workout_plan_id, trainer_id, name, description)
                    VALUES (?,?,?,?)";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("ssss", $workout_plan_id, $trainer_id,$name, $description );

        if($stmt->execute()){
            logMessage("Workout plan created successfully");
            return $workout_plan_id;
        }else{
            logMessage("Workout plan couldn't be created");
            return false;
        }
    }

    public function saveWorkoutPlanDetails($workout_plan_id, $day, $exercise_name, $sets, $reps){
        logMessage("saving workout plan details for the id : $workout_plan_id");

        $query = "INSERT INTO ". $this->workout_planDetails_table . "
                    (workout_plan_id, day, exercise_name, sets, reps)
                    VALUES (?,?,?,?,?)";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("sssii", $workout_plan_id, $day, $exercise_name, $sets, $reps);
        
        if($stmt->execute()){
            logMessage("Workout plan details saved for the workout plan id : $workout_plan_id");
            return true;
        }else{
            logMessage("Workout plan details couldn;t be ssaved for the workout plan id : $workout_plan_id");
            return false;
        }
    }


    public function getWorkoutPlans(){
        $query = "SELECT * FROM ". $this->workout_plan_table ;
        $stmt = $this->conn->prepare($query);

        if($stmt->execute()){
            $result = $stmt->get_result();
            $workoutPlans = array();
            while($row = $result->fetch_assoc()){
                $workoutPlans[] = $row;
            }
            return $workoutPlans;
        }else{
            logMessage("Error executing getWorkoutPlans" . $stmt->error);
            return false;
        }
    }

    public function getWorkoutPlanById($workout_plan_id){}
}