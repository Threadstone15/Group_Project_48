<?php 
include 'db.php';
if(isset($_POST['submit'])) {
    $payment_id = $_POST['payment_id'];
    $member_id = $_POST['member_id'];
    $amount = $_POST['amount'];
    $payment_date = $_POST['payment_date'];
    $payment_method = $_POST['payment_method']; 
    $status = $_POST['status'];  

    $sql = "INSERT INTO `payments` (payment_id,member_id,amount,payment_date,payment_method,status) 
            values('$payment_id','$member_id','$amount','$payment_date','$payment_method','$status')";





if ($conn->query($sql) === TRUE) {
        echo " payment successfully";
       //header('location:payment_display.php');
    } else {
        echo "Error: " . $sql . "<br>" . $conn->error;
    }
} else {
        echo "Error: Member ID does not exist in the members table.";

}

?>

<!DOCTYPE html>
<html>
    <head>
        <title>payment</title>
        <link rel = "stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
    </head>

    <body>
        
    <div class="container">
        <h2>Payment Form</h2>
        <form method="post">
            <div class="form-group">
                <label>Payment ID</label>
                <input type="number" class="form-control" placeholder="Enter your payment ID" name="payment_id" autocomplete="off" min="1" required>
            </div>

            <div class="form-group">
                <label>Member ID</label>
                <input type="number" class="form-control" placeholder="Enter member ID" name="member_id" autocomplete="off" min="1" required>
            </div>

            <div class="form-group">
                <label>Amount</label>
                <input type="number" class="form-control" placeholder="Enter amount" name="amount" min="0"autocomplete="off" required>
            </div>

            <div class="form-group">
                <label>Payment Date</label>
                <input type="date" class="form-control" placeholder="select payment date" name="payment_date" autocomplete="off" >
            </div>

            <div class="form-group">
                <label>Payment Method</label>
                <select class="form-control" name="payment_method" require>
                    <option value="Cash">Cash</option>
                    <option value="Credit">Credit card</option>
                </select>
            </div>

            <div class="form-group">
                <label>Status</label>
                <input type="text" class="form-control" placeholder="Enter payment status" name="status" autocomplete="off" required>
            </div>

            <button type="submit" class="btn btn-primary" name="submit">Submit</button>
        </form>
    </div>

</body>
</html>