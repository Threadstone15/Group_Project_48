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
    $mail->setFrom('services@gymverse.com', 'GymVerse Services');

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

function account_deactivation($email)
{
    logMessage("Account deactivation email function invoked.");
    $email = filter_var($email, FILTER_SANITIZE_EMAIL);

    try {
        $mail = configureMailer();
        $mail->addAddress($email);
        $mail->Subject = "Account Deactivation Confirmation";
        $mail->Body = "Hello,\n\nYour account has been deactivated by the GymVerse team. \n\nIf you want to reactivate your account, please contact support immediately.\n\nBest Regards,\nGymVerse Team";

        logMessage("Sending account deactivation email to: $email");
        $mail->send();
        logMessage("Account deactivation email sent successfully to: $email");
    } catch (Exception $e) {
        logMessage("Failed to send account deactivation email to: $email. PHPMailer Error: " . $e->getMessage());
    }
}

function password_change($email)
{
    logMessage("Password change email function invoked.");
    $email = filter_var($email, FILTER_SANITIZE_EMAIL);

    try {
        $mail = configureMailer();
        $mail->addAddress($email);
        $mail->Subject = "Password Change Confirmation";
        $mail->Body = "Hello,\n\nYour password has been changed successfully. \n\nIf you did not request this change, please contact support immediately.\n\nBest Regards,\nGymVerse Team";

        logMessage("Sending password change email to: $email");
        $mail->send();
        logMessage("Password change email sent successfully to: $email");
    } catch (Exception $e) {
        logMessage("Failed to send password change email to: $email. PHPMailer Error: " . $e->getMessage());
    }
}

//Trainer Application Rejection Mail
function trainer_application_rejection($email)
{
    logMessage("Trainer application rejection email function invoked.");
    $email = filter_var($email, FILTER_SANITIZE_EMAIL);

    try {
        $mail = configureMailer();
        $mail->addAddress($email);
        $mail->Subject = "Trainer Application Rejection Notification";
        $mail->Body = "Hello,\n\nYour trainer application has been rejected by the GymVerse team. \n\nPlease contact support if you have any questions.\n\nBest Regards,\nGymVerse Team";

        logMessage("Sending trainer application rejection email to: $email");
        $mail->send();
        logMessage("Trainer application rejection email sent successfully to: $email");
    } catch (Exception $e) {
        logMessage("Failed to send trainer application rejection email to: $email. PHPMailer Error: " . $e->getMessage());
    }
}

//Trainer Application Acceptance Mail

function trainer_application_acceptance($email, $password)
{
    logMessage("Trainer application acceptance email function invoked.");
    $email = filter_var($email, FILTER_SANITIZE_EMAIL);

    try {
        $mail = configureMailer();
        $mail->addAddress($email);
        $mail->Subject = "Trainer Application Acceptance Notification";
        $mail->Body = "Hello,\n\nYour trainer application has been accepted by the GymVerse team. \n\nBelow are your login details (Please change your password once you log in):\n\nUsername: $email\nPassword: $password\n\nPlease keep this information secure. \n\nPlease contact support if you have any questions.\n\nBest Regards,\nGymVerse Team";

        logMessage("Sending trainer application acceptance email to: $email");
        $mail->send();
        logMessage("Trainer application acceptance email sent successfully to: $email");
    } catch (Exception $e) {
        logMessage("Failed to send trainer application acceptance email to: $email. PHPMailer Error: " . $e->getMessage());
    }
}

function account_reactivation($email)
{
    logMessage("Account reactivation email function invoked.");
    $email = filter_var($email, FILTER_SANITIZE_EMAIL);

    try {
        $mail = configureMailer();
        $mail->addAddress($email);
        $mail->Subject = "Account Reactivation Confirmation";
        $mail->Body = "Hello,\n\nYour account has been reactivated by the GymVerse team. \n\nPlease contact support if you have any questions.\n\nBest Regards,\nGymVerse Team";

        logMessage("Sending account reactivation email to: $email");
        $mail->send();
        logMessage("Account reactivation email sent successfully to: $email");
    } catch (Exception $e) {
        logMessage("Failed to send account reactivation email to: $email. PHPMailer Error: " . $e->getMessage());
    }
}
