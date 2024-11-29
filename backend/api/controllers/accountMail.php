<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . '/../../vendor/autoload.php';
include_once "../../middleware/authMiddleware.php";

// Utility function to configure PHPMailer
function configureMailer()
{
    logMessage("Configuring PHPMailer.");
    $mail = new PHPMailer(true);

    // SMTP configuration
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com'; // Gmail SMTP server
    $mail->SMTPAuth = true;
    $mail->Username = 'gymverse.services@gmail.com'; // Replace with your SMTP username
    $mail->Password = 'tizz sjfn wrwl gayt'; // Replace with your SMTP password
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;
    $mail->setFrom('no-reply@yourwebsite.com', 'GymVerse Services');

    return $mail;
}

// Account creation email function
function account_creation($email, $password)
{
    logMessage("Account creation email function invoked.");
    $email = filter_var($email, FILTER_SANITIZE_EMAIL);

    try {
        $mail = configureMailer();
        $mail->addAddress($email);
        $mail->Subject = "Account Created Successfully";
        $mail->Body = "Hello,\n\nYour account has been successfully created. Below are your login details:\n\nUsername: $email\nPassword: $password\n\nPlease keep this information secure.\n\nBest Regards,\nGymVerse Team";

        logMessage("Sending account creation email to: $email");
        $mail->send();
        logMessage("Account creation email sent successfully to: $email");

    } catch (Exception $e) {
        logMessage("Failed to send account creation email to: $email. PHPMailer Error: " . $e->getMessage());
    }
}

// Account update email function
function account_update($email)
{
    logMessage("Account update email function invoked.");
    $email = filter_var($email, FILTER_SANITIZE_EMAIL);

    try {
        $mail = configureMailer();
        $mail->addAddress($email);
        $mail->Subject = "Account Updated Successfully";
        $mail->Body = "Hello,\n\nYour account details have been updated successfully. \n\nIf you did not request this change, please contact support immediately.\n\nBest Regards,\nGymVerse Team";

        logMessage("Sending account update email to: $email");
        $mail->send();
        logMessage("Account update email sent successfully to: $email");

    } catch (Exception $e) {
        logMessage("Failed to send account update email to: $email. PHPMailer Error: " . $e->getMessage());
    }
}

// Account deletion email function
function account_deletion($email)
{
    logMessage("Account deletion email function invoked.");
    $email = filter_var($email, FILTER_SANITIZE_EMAIL);

    try {
        $mail = configureMailer();
        $mail->addAddress($email);
        $mail->Subject = "Account Deletion Confirmation";
        $mail->Body = "Hello,\n\nYour account associated with this email ($email) has been successfully deleted.\n\nIf you did not request this deletion or believe this is a mistake, please contact support immediately.\n\nBest Regards,\nGymVerse Team";

        logMessage("Sending account deletion email to: $email");
        $mail->send();
        logMessage("Account deletion email sent successfully to: $email");

    } catch (Exception $e) {
        logMessage("Failed to send account deletion email to: $email. PHPMailer Error: " . $e->getMessage());
    }
}

?>
