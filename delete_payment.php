<?php 
include 'db.php';

if(isset($_GET['delete_id'])) {
    $payment_id = $_GET['delete_id'];

    $sql = "DELETE FROM `payments` WHERE payment_id =$payment_id";
    $result = mysqli_query($conn,$sql);
    if($result) {
       //echo "Deleted successfully";
       header('location:payment_display.php');
    }else {
         echo "Error: " . $sql . "<br>" . $conn->error;
    }
}

?>