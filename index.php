<?php
	if (isset($_REQUEST['dist'])) {
		define('ENV', 'live');
	} else {
		define('ENV', 'development');
	}
	
?>


<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<title>Test Grunt</title>
	<meta name="description" content="">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<!-- Place favicon.ico and apple-touch-icon.png in the root directory -->
	<link rel="shortcut icon" href="/favicon.ico">
	
	<link rel="stylesheet" type="text/css" href="css/main.css">
	<link rel="stylesheet" type="text/css" href="bower_components/leaflet/dist/leaflet.css">

</head>

<body>
	<div class="container">
		<!-- <div id="twitgreen-map" class="twitgreen-map" data-project="1" data-status="5"> -->
		<!-- <div id="twitgreen-map" class="twitgreen-map" data-project="1" data-status="7"> -->
		<div id="twitgreen-map" class="twitgreen-map" data-project="1">
			<span class="percentage">Loading</span>
		</div>
	</div>
</body>












<!-- Load JavaScript Vendors and plugins in the Gruntfile.js file -->
<!-- Edit Main JavaScript file in the main.js file -->
<?php if (ENV === 'development'): ?>
	<script type="text/javascript" src="js/vendors.js"></script>
	<script type="text/javascript" src="js/plugins.js"></script>
	<script type="text/javascript" src="js/main.js"></script>
<?php else: ?>
	<script type="text/javascript" src="js/vendors.min.js"></script>
	<script type="text/javascript" src="js/plugins.min.js"></script>
	<script type="text/javascript" src="js/main.min.js"></script>
<?php endif ?>	

</html>