<?php 
include 'db.php';

?>

<!doctype html>
<html>
  <head>
    <title>membership_display</title>
    <link rel = "stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
  </head>
  <body>
    
    <div class="container">
      <button class ="btn btn-primary my-5"><a href ="membership.php" class="text-light">Add Membership</a></button>
    </div>

    <table class="table">
  <thead>
    <tr>
      <th scope="col">membership type id</th>
      <th scope="col">type name</th>
      <th scope="col">description</th>
      <th scope="col">price</th>
      <th scope="col">operations</th>
    </tr>
  </thead>


<?php 
  $sql = "SELECT * FROM `memberships`";
  $result = mysqli_query($conn,$sql);
  if($result) {
    while($row = mysqli_fetch_assoc($result)) {
      $membership_type_id = $row['membership_type_id'];
      $type_name = $row['type_name'];
      $description = $row['description'];
      $price = $row['price'];
      echo ' <tr>
      <th scope="row">'.$membership_type_id.'</th>
      <td>'.$type_name.'</td>
      <td>'.$description.'</td>
      <td>'.$price.'</td>
      <td>
      <button class  ="btn btn-primary"><a href="update_membership.php?update_id='.$membership_type_id.'" class="text-light text-decoration-none">Update</a></button>
      <button class  ="btn btn-danger"><a href="delete_membership.php?delete_id='.$membership_type_id.'" class="text-light text-decoration-none">Delete</a></button>
      </td>
      <tr>';
    }
  }



?>

</table>
  </body>
</html>