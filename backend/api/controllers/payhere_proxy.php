<?php
$data = json_decode(file_get_contents("php://input"), true);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "https://sandbox.payhere.lk/pay/checkoutJ");
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Content-Type: application/json"
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
curl_close($ch);

echo $response;
