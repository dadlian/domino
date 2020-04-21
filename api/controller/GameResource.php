<?php
  use Wadapi\Http\ResourceController;
  use Wadapi\Http\ResponseHandler;
  use Wadapi\Persistence\SQLGateway;

  class GameResource extends ResourceController{
    public function retrieveResource($game){
      return $game;
    }

    public function modifyResource($game, $data){
      //Initialise default values for event updates, making fields read-only
      $data["code"] = $game->getCode();
      $data["type"] = $game->getType();
      $data["players"] = $game->getPlayers();
      $data["deck"] = $game->getDeck();

      $oldStatus = $game->getStatus();
      $newStatus = $data["status"];

      //Reset deck if game has gone to intermission
      if($oldStatus == "Playing" && $newStatus == "Intermission"){
        //Shuffle Deck
        $deck = [];
        for($i = 0; $i < 7; $i++){
          for($j = $i; $j < 7; $j++){
            $deck[] = "$i,$j";
          }
        }

        shuffle($deck);
        $data["deck"] = $deck;
      }

      $game->build($data);

      if(!$game->hasBuildErrors()){
        $sqlGateway = new SQLGateway();
        $sqlGateway->save($game);
      }

      return $game;
    }

    public function deleteResource($game){
      return null;
    }
  }
?>
