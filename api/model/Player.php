<?php
  use Wadapi\Http\Resource;

  class Player extends Resource{
    /** @Integer(required=true) */
    public $position;

    /** @WadapiString(required=true) */
    public $name;

    /** @WadapiString(required=true) */
    public $role;

    /** @Integer(required=true) */
    public $score;

    /** @WadapiString(hidden=true) */
    public $lastPing;

    public static function getURITemplate(){
      return "/games/{Game:players}/players/{id}";
    }

    protected function getCustomFields(){
      $customFields = [];
      $customFields["id"] = $this->getId();
      return $customFields;
    }

    protected function assertsConsistency(){
      return false;
    }


  }
?>
