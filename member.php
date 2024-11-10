<?php 
include 'db.php';
if(isset($_POST['submit'])) {
    $member_id = $_POST['member_id'];
    $name = $_POST['name'];
    $email = $_POST['email'];
    $password = $_POST['password'];
    $phone = $_POST['phone'];
    $join_date = $_POST['Join_date'];
    $membership_type_id = $_POST['membership_type_id'];

    $sql = "INSERT INTO `members` (member_id,name,email,password,phone,join_date,membership_type_id) 
            values('$member_id','$name','$email','$password','$phone','$join_date','$membership_type_id')";

if ($conn->query($sql) === TRUE) {
        echo "New member registered successfully";
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
            <h2>Member registration form</h2>
            <form method = "post">
            <div class="from-group">
                <label>member id</label>
                <input type="number" class="form-control" placeholder="Enter your member id" name="member_id" autocomplete="off" min="1" required pattern="^[1-9]\d*$">
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
                <input type="tel" class="form-control" placeholder="Enter your mobile No" name="phone" autocomplete="off" required pattern="^\d{10}$" title="Please enter a 10-digit mobile number">
            </div>
            <div class="from-group">
                <label>Join date</label>
                <input type="date" class="form-control" placeholder="Enter you joined date" name = "Join_date" autocomplete="off">
            </div>
            <div class="from-group">
                <label>Membership type id</label>
                <input type="number" class="form-control" placeholder="Enter your membership type id" name="membership_type_id" autocomplete="off" min="1" required pattern="^[1-9]\d*$">
            </div>

             <button type="submit" class="btn btn-primary" name = "submit">Submit</button>
        </form>
        </div>
        

    </body>

</html>