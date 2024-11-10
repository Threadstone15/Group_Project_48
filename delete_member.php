<?php 
include 'db.php';

if(isset($_GET['delete_id'])) {
    $member_id = $_GET['delete_id'];

    $sql = "DELETE FROM `members` WHERE member_id =$member_id";
    $result = mysqli_query($conn,$sql);
    if($result) {
       //echo "Deleted successfully";
       header('location:member_display.php');
    }else {
         echo "Error: " . $sql . "<br>" . $conn->error;
    }
}

?>