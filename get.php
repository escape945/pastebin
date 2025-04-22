<?php
error_reporting(0);
header('Content-Type: text/plain');

if ($_SERVER['PATH_INFO'] && $_SERVER['PATH_INFO'] != '/index.php') {
    $json = json_decode(require('data.php'), true);
    $key = urldecode($_SERVER['PATH_INFO']);
    $key = preg_replace('/(^\/|index.php$)/', '', $key);
    echo $json[$key];
} else {
    http_response_code(500);
    echo 'Failed to handle.';
}
