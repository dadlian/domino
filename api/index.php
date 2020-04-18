<?php
  require 'vendor/autoload.php';

  use Wadapi\Utility\FileUtility;
  use Wadapi\Routing\Dispatcher;

  define('PROJECT_PATH', dirname(__FILE__));
	define('SCRIPT_START', microtime(true));

	//Include User Created Files
	FileUtility::require_all(PROJECT_PATH."/controller");
	FileUtility::require_all(PROJECT_PATH."/model");

  Dispatcher::dispatchRequest();
?>
