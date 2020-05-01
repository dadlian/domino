<?php
  use Wadapi\Http\RestController;
  use Wadapi\Http\RequestHandler;
  use Wadapi\Http\ResponseHandler;
  use Wadapi\Persistence\SQLGateway;

  class PlayCollection extends RestController{
    protected function get(){
      $game = $this->_retrieveResource();

      $plays = [];
      foreach($game->getPlays()?explode(";",$game->getPlays()):[] as $play){
        $turn = explode(",",$play)[0];
        $plays[$turn] = [
          "turn" => $turn,
          "play" => array_slice(explode(",",$play),1)
        ];
      }

      $parameters = RequestHandler::getQueryParameters();
      if(array_key_exists("turn",$parameters)){
        $payload = array_key_exists($parameters["turn"],$plays)?$plays[$parameters["turn"]]:["turn"=>0,"play"=>""];
      }else{
        $payload = [
          "total" => sizeof($plays),
          "entries" => $plays
        ];
      }

      ResponseHandler::retrieved($payload,"/game/{$game->getId()}/plays");
    }

    protected function post(){
      $game = $this->_retrieveResource();
      $play = RequestHandler::getContent()["play"];

      if(!$play){
        ResponseHandler::bad("You must specify a play to add.");
      }

      if(!preg_match("/^[0-9]+,[0-9],[0-9],(left|right|pass)$/",$play)){
        ResponseHandler::bad("Please specify your play in a valid format.");
      }

      $plays = $game->getPlays();

      //Check domino has not already been played
      $playParts = preg_split("/,/",$play);
      foreach(preg_split("/;/",$plays) as $existingPlay){
        $existingPlayParts = preg_split("/,/",$existingPlay);
        if($playParts[0] == $existingPlayParts[0]){
          ResponseHandler::conflict("Play {$playParts[0]} has already been recorded.");
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
