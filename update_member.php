<?php 
include 'db.php';

$update_id = $_GET['update_id'] ?? null;

if ($update_id) {
$sql = "SELECT * FROM `members` WHERE member_id = $update_id";
$result = mysqli_query($conn,$sql);
$row = mysqli_fetch_assoc($result);
    $member_id = $row['member_id'];
      $name = $row['name'];
      $email = $row['email'];
      $password = $row['password'];
      $phone = $row['phone'];
      $join_date = $row['join_date'];
      $membership_type_id = $row['membership_type_id'];
} else {
        echo "No record found with ID $update_id";
    }

if(isset($_POST['submit'])) {
    $member_id = $_POST['member_id'];
    $name = $_POST['name'];
    $email = $_POST['email'];
    $password = $_POST['password'];
    $phone = $_POST['phone'];
    $join_date = $_POST['Join_date'];
    $membership_type_id = $_POST['membership_type_id'];

    $sql = "UPDATE `members` SET member_id = '$member_id',name = '$name',email = '$email',password = '$password',
    phone = '$phone',join_date = '$join_date',membership_type_id = '$membership_type_id' WHERE member_id = $member_id";

if ($conn->query($sql) === TRUE) {
        //echo "updated successfully";
        header('location:member_display.php');
    } else {
        echo "Error: " . $sql . "<br>" . $conn->error;
    }
}




?>

<!DOCTYPE html>
<html>
    <head>
        <title>member_registration</title>
        <link rel = "stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
    </head>

    <body>
        <div class ="container my-5">
            <form method = "post">
            <div class="from-group">
                <label>member id</label>
                <input type="text" class="form-control" placeholder="Enter your member id" name = "member_id" autocomplete="off">
            </div>
            <div class="from-group">
                <label>Name</label>
                <input type="text" class="form-control" placeholder="Enter your name" name = "name" autocomplete="off">
            </div>
            <div class="from-group">
                <label>Email address</label>
                <input type="text" class="form-control" placeholder="Enter your email " name = "email" autocomplete="off">
            </div>
            <div class="from-group">
                <label>Password</label>
                <input type="text" class="form-control" placeholder="Enter your Password" name = "password" autocomplete="off">
            </div>
            <div class="from-group">
                <label>phone</label>
                <input type="text" class="form-control" placeholder="Enter your mobile No" name = "phone" autocomplete="off">
            </div>
            <div class="from-group">
                <label>Join date</label>
                <input type="date" class="form-control" placeholder="Enter you joined date" name = "Join_date" autocomplete="off">
            </div>
            <div class="from-group">
                <label>Membership type id</label>
                <input type="text" class="form-control" placeholder="Enter your membershop type id" name = "membership_type_id" autocomplete="off">
            </div>
             <button type="submit" class="btn btn-primary" name = "submit">Update</button>
        </form>
        </div>
        

    </body>

</html>