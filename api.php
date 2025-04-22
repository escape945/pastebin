<?php
error_reporting(0);
header('Content-Type: text/plain');

if ($_SERVER['PATH_INFO'] && $_SERVER['PATH_INFO'] != '/index.php' || $_SERVER['HTTP_X_VERIFY'] == '') {
    $key = urldecode($_SERVER['PATH_INFO']);
    $key = preg_replace('/(^\/|index.php$)/', '', $key);
    preg_match('/(.*?)(?:\/)(.*)(?:\/?)/', $key, $parameter);
    // print_r($parameter);
    if (count($parameter) != 3) {
        failed_return();
        return;
    }

    try {
        $json = json_decode(require('data.php'), true);
        if (!$json['ok']) {
            $json = ['ok' => 'true'];
        }
    } catch (Exception $ex) {
        $json = ['ok' => 'true'];
    }

    switch ($parameter[1]) {
        case 'list':
            $list = [];
            foreach ($json as $key => $value) {
                if ($key != 'ok') array_push($list, $key);
            }
            echo json_encode($list, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            break;
        case 'edit':
            if ($parameter[2] && $parameter[2] != 'ok' && file_get_contents("php://input")) {
                // $parameter[2] = preg_replace('/\/$/', '', $parameter[2]);
                $json[$parameter[2]] = file_get_contents("php://input");
                write_datafile($json);
                echo 'ok';
            } else {
                failed_return();
            }
            break;
        case 'delete':
            if ($parameter[2] && $parameter[2] != 'ok') {
                // $parameter[2] = preg_replace('/\/$/', '', $parameter[2]);
                unset($json[$parameter[2]]);
                write_datafile($json);
                echo 'ok';
            } else {
                failed_return();
            }
            break;


        default:
            failed_return();
            break;
    }
} else {
    failed_return();
}

function failed_return()
{
    http_response_code(500);
    echo 'Failed to handle.';
}
function write_datafile($json)
{
    $file = fopen("data.php", "w");
    $data = json_encode($json, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $data = str_replace("\\", "\\\\", $data);
    $data = str_replace("'", "\\'", $data);
    fwrite($file, "<?php return '" . $data . "';");
    fclose($file);
}
