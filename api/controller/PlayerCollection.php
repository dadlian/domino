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
      $searcher->addCriterion("Game",$game->getId(),"players");
      $players = $sqlGateway->find("Player",$searcher);
      $filteredPlayers = [];

      foreach($players as $player){
        if(array_key_exists("active",$parameters)){
          $lastUpdate = (time() - $player->getLastPing());
          if($parameters["active"] == "true" && $lastUpdate <= 10){
            $filteredPlayers[] = $player;
          }

          if($parameters["active"] == "false" && $lastUpdate > 10){
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
      $searcher->addCriterion("Game",$game->getId(),"players");
      $players = $sqlGateway->find("Player",$searcher);
      $filteredPlayers = [];

      foreach($players as $player){
        if(array_key_exists("active",$parameters)){
          $lastUpdate = (time() - $player->getLastPing());
          if($parameters["active"] == "true" && $lastUpdate <= 10){
            $filteredPlayers[] = $player;
          }

          if($parameters["active"] == "false" && $lastUpdate > 10){
            $filteredPlayers[] = $player;
          }
        }else{
          $filteredPlayers[] = $player;
        }
      }

      return array_slice($filteredPlayers,$start,$records);
    }

    protected function createResource($data, $game){
      //Check for available seats in this game
      $sqlGateway = new SQLGateway();
      $searcher = new Searcher();
      $searcher->addCriterion("Game",$game->getId(),"players");
      $players = $sqlGateway->find("Player",$searcher);
      $takenSeats = [];

      foreach($players as $player){
        //if((time() - $player->getLastPing()) <= 10){
          $takenSeats[] = $player->getPosition();
        //}
      }

      if(sizeof($takenSeats) == 4){
        ResponseHandler::conflict("Player could not be added. The game is already full.");
      }

      for($i=0; $i < 4; $i++){
        if(!in_array($i,$takenSeats)){
          $data["position"] = $i;
          break;
        }
      }

      //Attempt to initialise the player
      $player = new Player();
      $data["lastPing"] = strval(time());

      $player->build($data);
      if(!$player->hasBuildErrors()){
        $players[] = $player;
        $game->setPlayers($players);
        $sqlGateway->save($game);
      }

      return $player;
    }
  }
?>
