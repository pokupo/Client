<?php
require_once('IProxy.php');

class DataProxy implements IProxy {

    private $query;

    public function DataProxy($params) {
        $this->ParseRequestParams($params);
    }
    
    private function ParseRequestParams($params){
        $this->query = $params['query'];
    }

    private function Route() {
        if ($this->query)
            $this->GetData($this->query);
        else  
            throw new Exception("Wrong url");
    }
    
    public function Query(){
        $this->Route();
        print $this->responseData;
    }

    private function GetData($url) {
        $opts = array(
            'http'=>array(
              'method'=>"GET",
              'header'=>"Cookie: PHPSESSID=".$_COOKIE['PHPSESSID']."\r\n"
            )
        );
        $context = stream_context_create($opts);
        $this->responseData = file_get_contents($url, false , $context);
        foreach($http_response_header as $value){
            if (preg_match('/^Set-Cookie:/i', $value)) {
                header($value, false);
            }
        }
    }
}
$proxy = new DataProxy($_GET);
$proxy->Query();