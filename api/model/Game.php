<?php
  use Wadapi\Http\Resource;

  class Game extends Resource{
    /** @WadapiString(required=true,pattern="[0-9A-Z]{6}") */
    public $code;

    /** @WadapiString(required=true,values={'Pending','Playing','Intermission','Completed'}) */
    public $status;

    /** @WadapiString(required=true,values={'push','jail'}) */
    public $type;

    /** @Integer(required=true,default=6) */
    public $playTo;

    /** @Collection(type=@WadapiObject(class='Player',hidden=true)) */
    public $players;

    /** @WadapiString(pattern="^([0-9],[0-9];?){28}$") */
    public $deck;

    /** @WadapiString(pattern="^([0-9]+,[0-9],[0-9],(left|right|pass);?)*$") */
    public $plays;

    /** @Integer(required=true) */
    public $shield;

    public static function getURITemplate(){
      return "/games/{id}";
    }

    protected function getCustomFields(){
      $customFields = [];
      $customFields["multiplayer"] = true;
      return $customFields;
    }

    protected function assertsConsistency(){
      return false;
    }
  }
?>
