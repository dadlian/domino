<?php
  use Wadapi\Http\RestController;
  use Wadapi\Http\RequestHandler;
  use Wadapi\Http\ResponseHandler;
  use Wadapi\Persistence\SQLGateway;

  class PlayCollection extends RestController{
    protected function get(){
      $game = $this->_retrieveResource();
      $plays = explode(";",$game->getPlays());
      $payload = [
        "total" => sizeof($plays),
        "entries" => $plays
      ];

      ResponseHandler::retrieved($payload,"/game/{$game->getId()}/plays");
    }

    protected function post(){
      $game = $this->_retrieveResource();
      $play = RequestHandler::getContent()["play"];

      if(!$play){
        ResponseHandler::bad("You must specify a play to add.");
      }

      if(!preg_match("/^[0-9],[0-9],(left|right|pass)$/",$play)){
        ResponseHandler::bad("Please specify your play in a valid format.");
      }

      $game->setPlays($game->getPlays().";$play");

      $sqlGateway = new SQLGateway();
      $sqlGateway->save($game);

      $plays = explode(";",$game->getPlays());
      $payload = [
        "total" => sizeof($plays),
        "entries" => $plays
      ];

      ResponseHandler::created($payload,"/game/{$game->getId()}/plays");
    }
  }
?>
