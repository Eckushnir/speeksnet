<?php
// save_json.php
$json = file_get_contents('php://input');
if (file_put_contents('../json/process_documents.json', $json)) {
    echo json_encode(['status' => 'success']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Failed to write file']);
}
?>