<?php
$server_name = "localhost";
$username = "root";
$password = "";
$databse = "pos";

$conn = new mysqli($server_name, $username, $password, $databse);

if ($conn->connect_error) {
    die(json_encode([
        "error" => "db_connection_failed",
        "message" => $conn->connect_error
    ]));
}
?>
