<?php 
include 'db.php';

if(isset($_GET['delete_id'])) {
    $membership_type_id = $_GET['delete_id'];

    $sql = "DELETE FROM `memberships` WHERE membership_type_id =$membership_type_id";
    $result = mysqli_query($conn,$sql);
    if($result) {
       //echo "Deleted successfully";
       header('location:membership_display.php');
    }else {
         echo "Error: " . $sql . "<br>" . $conn->error;
    }
}

?>