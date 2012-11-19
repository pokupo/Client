<?php

require_once('settings.php');
require_once('IProxy.php');

class DataProxy implements IProxy {

    private $shopId;
    private $query;
    private $parentId;
    private $responseData;
    private $host;
    private $path;

    public function DataProxy($host, $path, $params) {
        $this->host = $host;
        $this->path = $path;
        $this->parseRequestParams($params);
    }
    
    private function parseRequestParams($params){
        $this->shopId = $params['shopId'];
        $this->query = $params['query'];
        $this->parentId = $params['parentId'];
    }

    private function Route() {
        switch ($this->query) {
            case 'getSectionData':
                $this->GetSection();
                break;
            case 'getCatalogData':
                $this->GetCategoriesForRoot();
                break;
            default :
                throw new Exception("Wrong url");
        }
    }
    
    public function Query(){
        $this->Route();
        $this->PrintResult($this->responseData);
    }

    private function GetData($url) {
        $jsonData = file_get_contents($url);
        $data = json_decode($jsonData, true);
        if (key_exists('message_error', $data)) {
            return array();
        }
        return $data;
    }

    private function FillData($data) {
        $items = array();
        foreach ($data as $one) {
            $countGoods = 0;
            if (key_exists('count_goods', $one))
                $countGoods = $one['count_goods'];
            $items[] = array('id' => $one['id'], 'title' => $one['name_category'], 'countGoods' => $countGoods);
        }

        return $items;
    }

    private function GetSection() {
        $sections = $this->GetData(Settings::HostApi . Settings::CatalogPathApi . $this->shopId . '/root/noblock/active');
        $this->responseData = $this->FillData($sections);
    }

    private function GetCategoriesForRoot() {
        $category = $this->GetData(Settings::HostApi . Settings::CatalogPathApi . $this->parentId . '/children/noblock/active');
        $this->responseData = array('parentId' => $this->parentId, 'items' => $this->FillData($category));
    }

    private function PrintResult($data) {
        echo json_encode($data);
    }
}
$proxy = new DataProxy(Settings::HostApi , Settings::CatalogPathApi, $_GET);
$proxy->Query();
