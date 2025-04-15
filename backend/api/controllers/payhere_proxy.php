<?php
$merchant_id = "YOUR_MERCHANT_ID";
$merchant_secret = "YOUR_MERCHANT_SECRET";

// Get the response parameters from PayHere
$response = $_POST;
$checksum = $response['checksum']; // PayHere checksum for validation
$payment_status = $response['status'];

// Check if the payment status is successful
if ($payment_status == '2') { // 2 means payment successful
    // Validate the checksum
    $generated_hash = strtoupper(
        md5(
            $merchant_id .
            $response['order_id'] .
            $response['amount'] .
            $response['currency'] .
            strtoupper(md5($merchant_secret))
        )
    );

    if ($generated_hash == $checksum) {
        // Payment is valid, update your database
        // Example: Update the user's subscription or payment status
        $order_id = $response['order_id'];
        $amount = $response['amount'];

        // Add your code to handle the payment, e.g., store in database, send email, etc.
        // For example:
        // update_subscription($order_id, $amount);
        echo "Payment successful!";
    } else {
        echo "Invalid checksum.";
    }
} else {
    echo "Payment failed or canceled.";
}
?>
