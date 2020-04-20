<?php
  use Wadapi\Http\Resource;

  class Domino extends Resource{
    /** @Integer(required=true) */
    public $first;

    /** @Integer(required=true) */
    public $second;

    public static function getURITemplate(){
      return "/dominos/{id}";
    }
  }
?>
