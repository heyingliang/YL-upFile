<?php
$fn = (isset($_SERVER['HTTP_FILENAME']) ? $_SERVER['HTTP_FILENAME'] : false);
var_dump($_SERVER);
if ($fn) {
	file_put_contents(
		$fn,
		file_get_contents('php://input')
	);
	echo "$fn uploaded";
	exit();
}
else {
	echo "not";
}
?>