<?php
  use Wadapi\Http\CollectionController;
  use Wadapi\Http\ResponseHandler;
  use Wadapi\Persistence\SQLGateway;
  use Wadapi\Persistence\Searcher;
  use Wadapi\Persistence\Criterion;

  class PlayerCollection extends CollectionController{
    protected function getInvalidQueryParameters($parameters){
      $invalidParameters = array();

      if(array_key_exists("active",$parameters) && !in_array($parameters["active"],array("true","false"))){
        $invalidParameters[] = "active";
      }

      return $invalidParameters;
    }

    protected function countResources($parameters, $game){
      $sqlGateway = new SQLGateway();
      $searcher = new Searcher();
      $searcher->addCriterion("Game","players",$game->getId());
      $players = $sqlGateway->find("Player",$searcher);
      $filteredPlayers = [];

      foreach($players as $player){
        if(array_key_exists("active",$parameters)){
          $lastUpdate = (time() - $player->getLastPing());
          if($parameters["active"] == "true" && $lastUpdate <= 30){
            $filteredPlayers[] = $player;
          }

          if($parameters["active"] == "false" && $lastUpdate > 30){
            $filteredPlayers[] = $player;
          }
        }else{
          $filteredPlayers[] = $player;
        }
      }

      return sizeof($filteredPlayers);
    }

    protected function retrieveResources($start, $records, $parameters, $game){
      $sqlGateway = new SQLGateway();
      $searcher = new Searcher();
      $searcher->addCriterion("Game","players",$game->getId());
      $players = $sqlGateway->find("Player",$searcher);
      $filteredPlayers = [];

      foreach($players as $player){
        if(array_key_exists("active",$parameters)){
          $lastUpdate = (time() - $player->getLastPing());
          if($parameters["active"] == "true" && $lastUpdate <= 30){
            $filteredPlayers[] = $player;
          }

          if($parameters["active"] == "false" && $lastUpdate > 30){
            $filteredPlayers[] = $player;
          }
        }else{
          $filteredPlayers[] = $player;
        }
      }

      return array_slice($filteredPlayers,$start,$records);
    }

    protected function createResource($data, $game){
      $player = new Player();
      $data["lastPing"] = strval(time());

      //Attempt to initialise the player
      $player->build($data);
      if(!$player->hasBuildErrors()){
        $sqlGateway = new SQLGateway();
        $sqlGateway->save($player);
      }

      return $player;
    }
  }
?>
