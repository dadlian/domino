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
