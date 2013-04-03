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
        $this->responseData = file_get_contents($url);
    }
}
$proxy = new DataProxy($_GET);
$proxy->Query();
