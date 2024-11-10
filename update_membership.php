<?php 
include 'db.php';

$update_id = $_GET['update_id'] ?? null;

if ($update_id) {
$sql = "SELECT * FROM `memberships` WHERE membership_type_id = $update_id";
$result = mysqli_query($conn,$sql);
$row = mysqli_fetch_assoc($result);
    $membership_type_id = $row['membership_type_id'];
      $type_name = $row['type_name'];
      $description = $row['description'];
      $price = $row['price'];
} else {
        echo "No record found with ID $update_id";
    }

if(isset($_POST['submit'])) {
    $membership_type_id = $_POST['membership_type_id'];
    $type_name = $_POST['type_name'];
    $description = $_POST['description'];
    $price = $_POST['price'];

    $sql = "UPDATE `memberships` SET membership_type_id = '$membership_type_id',type_name = '$type_name',description = '$description',price = '$price' WHERE membership_type_id = $membership_type_id";

if ($conn->query($sql) === TRUE) {
        //echo "updated successfully";
        header('location:membership_display.php');
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
                <label>membership type id</label>
                <input type="text" class="form-control" placeholder="Enter your membership type id" name = "membership_type_id" autocomplete="off">
            </div>
            <div class="from-group">
                <label>type name</label>
                <input type="text" class="form-control" placeholder="Enter your type name" name = "type_name" autocomplete="off">
            </div>
            <div class="from-group">
                <label>description</label>
                <input type="text" class="form-control" placeholder="Enter description " name = "description" autocomplete="off">
            </div>
            <div class="from-group">
                <label>price</label>
                <input type="number" class="form-control" placeholder="Enter price" name="price" step="0.01" min="0" autocomplete="off" onblur="formatToTwoDecimals(this)">
                <script>
                    function formatToTwoDecimals(input) {
                        // Convert the input value to a float, then fix it to two decimal places
                        input.value = parseFloat(input.value).toFixed(2);
                    }
                </script>

            </div>
             <button type="submit" class="btn btn-primary" name = "submit">Update</button>
        </form>
        </div>
        

    </body>

</html>