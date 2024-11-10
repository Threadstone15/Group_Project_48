<?php 
include 'db.php';

?>

<!doctype html>
<html>
  <head>
    <title>payment_display</title>
    <link rel = "stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
  </head>
  <body>
    
    <div class="container">
      <button class ="btn btn-primary my-5"><a href ="payment.php" class="text-light">Add payment</a></button>
    </div>

    <table class="table">
  <thead>
    <tr>
      <th scope="col">payment id</th>
      <th scope="col">member id</th>
      <th scope="col">amount</th>
      <th scope="col">payment date</th>
      <th scope="col">payment method</th>
      <th scope="col">status</th>
      <th scope="col">operations</th>
    </tr>
  </thead>


<?php 
  $sql = "SELECT * FROM `payments`";
  $result = mysqli_query($conn,$sql);
  if($result) {
    while($row = mysqli_fetch_assoc($result)) {
      $payment_id = $row['payment_id'];
      $member_id = $row['member_id'];
      $amount = $row['amount'];
      $payment_date = $row['payment_date'];
      $payment_method = $row['payment_method'];
      $status = $row['status'];
      echo ' <tr>
      <th scope="row">'.$payment_id.'</th>
      <td>'.$member_id.'</td>
      <td>'.$amount.'</td>
      <td>'.$payment_date.'</td>
      <td>'.$payment_method.'</td>
      <td>'.$status.'</td>

      <td>
      <button class  ="btn btn-primary"><a href="update_payment.php?update_id='.$payment_id.'" class="text-light text-decoration-none">Update</a></button>
      <button class  ="btn btn-danger"><a href="delete_payment.php?delete_id='.$payment_id.'" class="text-light text-decoration-none">Delete</a></button>
      </td>
      <tr>';
    }
  }



?>

</table>
  </body>
</html>