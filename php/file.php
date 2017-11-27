<?php
$fn = (isset($_SERVER['HTTP_FILENAME']) ? $_SERVER['HTTP_FILENAME'] : false);
$src = realpath("../upFile/");
$file_name = urldecode($fn);

if ($fn) {
	file_put_contents(
		$src."\\".$fn,
		file_get_contents('php://input')
	);
	echo "$file_name uploaded";
	exit();
}
else {
	echo "not";
}
?>