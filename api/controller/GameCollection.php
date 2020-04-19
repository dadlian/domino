<?php
  use Wadapi\Http\CollectionController;
  use Wadapi\Http\ResponseHandler;
  use Wadapi\Persistence\SQLGateway;
  use Wadapi\Persistence\Searcher;
  use Wadapi\Persistence\Sorter;
  use Wadapi\Persistence\Criterion;

  class GameCollection extends CollectionController{
    protected function getInvalidQueryParameters($parameters){
      $invalidParameters = array();

      if(array_key_exists("code",$parameters) && !$parameters["code"]){
        $invalidParameters[] = "code";
      }

      return $invalidParameters;
    }

    protected function countResources($parameters, $owner){
      $sqlGateway = new SQLGateway();
      $searcher = new Searcher();

      if(array_key_exists("code",$parameters)){
        $searcher->addCriterion("code",Criterion::EQUAL,$parameters["code"]);
      }

      return $sqlGateway->count("Game",$searcher);
    }

    protected function retrieveResources($start, $records, $parameters, $owner){
      $sqlGateway = new SQLGateway();
      $searcher = new Searcher();
      $sorter = new Sorter();

      if(array_key_exists("code",$parameters)){
        $searcher->addCriterion("code",Criterion::EQUAL,$parameters["code"]);
      }

      $sorter->addCriterion("created",Criterion::DESCENDING);
      return $sqlGateway->find("Game",$searcher,$sorter,$records,$start,false);
    }

    protected function createResource($data, $owner){
      $game = new Game();

      //Attempt to initialise the game
      $code="";
      while(strlen($code)<6){
        $randnum = mt_rand(0,61);
        if($randnum < 10){
          $code .= chr($randnum+48);
        }else if($randnum < 36){
          $code .= chr($randnum+55);
        }else{
          $code .= chr($randnum+61);
        }
      }

      $data["code"] = strtoupper($code);
      $data["status"] = "Pending";
      $data["players"] = [];

      $game->build($data);
      if(!$game->hasBuildErrors()){
        $sqlGateway = new SQLGateway();
        $sqlGateway->save($game);
      }

      return $game;
    }
  }
?>
