<?php
  use Wadapi\Http\RestController;
  use Wadapi\Http\RequestHandler;
  use Wadapi\Http\ResponseHandler;
  use Wadapi\Persistence\SQLGateway;

  class PlayCollection extends RestController{
    protected function get(){
      $game = $this->_retrieveResource();
      $plays = $game->getPlays()?explode(";",$game->getPlays()):[];
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

      if(!preg_match("/^[0-9],[0-9][0-9]?,(left|right|pass)$/",$play)){
        ResponseHandler::bad("Please specify your play in a valid format.");
      }

      $plays = $game->getPlays();

      //Check domino has not already been played
      $playParts = preg_split("/,/",$play);
      foreach(preg_split("/;/",$plays) as $existingPlay){
        $existingPlayParts = preg_split("/,/",$existingPlay);
        if($playParts[0] == $existingPlayParts[0] && $playParts[1] == $existingPlayParts[1] && $playParts[2] == $existingPlayParts[2]){
          ResponseHandler::conflict("This domino has already been played");
        }
      }

      $game->setPlays($plays.($plays?";":"")."$play");

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
