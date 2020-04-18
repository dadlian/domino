<?php
  use Wadapi\Http\RestController;
  use Wadapi\Http\ResponseHandler;
  
  class HelloWorldController extends RestController{
    public function get(){
      ResponseHandler::retrieved(["message"=>"Hello World"],"");
    }
  }
?>
