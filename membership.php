<?php 
include 'db.php';
if(isset($_POST['submit'])) {
    $membership_type_id = $_POST['membership_type_id'];
    $type_name = $_POST['type_name'];
    $description = $_POST['description'];
    $price = $_POST['price'];    

    $sql = "INSERT INTO `memberships` (membership_type_id,type_name,description,price) values('$membership_type_id','$type_name','$description','$price')";

if ($conn->query($sql) === TRUE) {
        echo " membership registered successfully";
       // header('location:membership_display.php');
    } else {
        echo "Error: " . $sql . "<br>" . $conn->error;
    }
}




?>

<!DOCTYPE html>
<html>
    <head>
        <title>membership</title>
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
             <button type="submit" class="btn btn-primary" name = "submit">Submit</button>
        </form>
        </div>
        

    </body>

</html>