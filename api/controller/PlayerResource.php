<?php
  use Wadapi\Http\ResourceController;
  use Wadapi\Http\ResponseHandler;
  use Wadapi\Persistence\SQLGateway;

  class PlayerResource extends ResourceController{
    public function retrieveResource($player){
      return $player;
    }

    public function modifyResource($player, $data){
      //Initialise default values for event updates, making fields read-only
      $data["position"] = $player->getPosition();
      $data["name"] = $player->getName();
      $data["lastPing"] = strval(time());

      $player->build($data);

      if(!$player->hasBuildErrors()){
        $sqlGateway = new SQLGateway();
        $sqlGateway->save($player);
      }

      return $player;
    }

    public function deleteResource($player){
      return null;
    }
  }
?>
