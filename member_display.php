<?php 
include 'db.php';

?>

<!doctype html>
<html>
  <head>
    <title>member_display</title>
    <link rel = "stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
  </head>
  <body>
    
    <div class="container">
      <button class ="btn btn-primary my-5"><a href ="member.php" class="text-light">Add Member</a></button>
    </div>

    <table class="table">
  <thead>
    <tr>
      <th scope="col">member id</th>
      <th scope="col">name</th>
      <th scope="col">email</th>
      <th scope="col">password</th>
      <th scope="col">phone</th>
      <th scope="col">Join date</th>
      <th scope="col">membership type id</th>
      <th scope="col">operations</th>
    </tr>
  </thead>


<?php 
  $sql = "SELECT * FROM `members`";
  $result = mysqli_query($conn,$sql);
  if($result) {
    while($row = mysqli_fetch_assoc($result)) {
      $member_id = $row['member_id'];
      $name = $row['name'];
      $email = $row['email'];
      $password = $row['password'];
      $phone = $row['phone'];
      $join_date = $row['join_date'];
      $membership_type_id = $row['membership_type_id'];
      echo ' <tr>
      <th scope="row">'.$member_id.'</th>
      <td>'.$name.'</td>
      <td>'.$email.'</td>
      <td>'.$password.'</td>
      <td>'.$phone.'</td>
      <td>'.$join_date.'</td>
      <td>'.$membership_type_id.'</td>
      <td>
      <button class  ="btn btn-primary"><a href="update_member.php?update_id='.$member_id.'" class="text-light text-decoration-none">Update</a></button>
      <button class  ="btn btn-danger"><a href="delete_member.php?delete_id='.$member_id.'" class="text-light text-decoration-none">Delete</a></button>
      </td>
    </tr>';
    }
  }



?>

</table>
  </body>
</html>

