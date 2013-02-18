<?php

require_once('settings.php');
require_once('IProxy.php');

class DataProxy implements IProxy {

    private $shopId;
    private $query;
    private $parentId;
    private $categoryId;
    private $responseData;
    private $host;
    private $path;
    private $typeCategory;
    private $start;
    private $count;
    private $orderBy;
    private $filterName;
    
    private $idCategories;
    private $keyWords;
    private $typeSearch;
    private $startCost;
    private $endCost;
    private $exceptWords;
    private $typeSeller; 

    public function DataProxy($host, $path, $params) {
        $this->host = $host;
        $this->path = $path;
        $this->ParseRequestParams($params);
    }
    
    private function ParseRequestParams($params){
        $this->shopId = $params['shopId'];
        $this->query = $params['query'];
        $this->parentId = $params['parentId'];
        $this->categoryId = $params['categoryId'];
        $this->typeCategory = $params['typeCategory'];
        $this->start = $params['start'];
        $this->count = $params['count'];
        $this->orderBy = $params['orderBy'];
        $this->filterName = $params['filterName'];
        $this->idCategories = $params['idCategories'];
        $this->keyWords = $params['keyWords'];
        $this->typeSearch = $params['typeSearch'];
        $this->startCost = $params['startCost'];
        $this->endCost = $params['endCost'];
        $this->exceptWords = $params['exceptWords'];
        $this->typeSeller = $params['typeSeller'];
    }

    private function Route() {
        switch ($this->query) {
            case 'getSectionData':
                $this->GetSection();
                break;
            case 'getCatalogData':
                $this->GetCategoriesForRoot();
                break;
            case 'getPath':
                $this->GetPath();
                break;
            case 'getBlock':
                $this->GetBlocks();
                break;
            case 'getCategoryInfo':
                $this->GetCategoryInfo();
                break;
            case 'getContent':
                $this->GetContent();
                break;
            case 'getSearchContent':
                $this->GetSearchContent();
                break;
            default :
                throw new Exception("Wrong url");
        }
    }
    
    public function Query(){
        $this->Route();
        print $this->responseData;
    }

    private function GetData($url) {
        return file_get_contents($url);
    }

    private function GetSection() {
        $sections = $this->GetData(Settings::HostApi . Settings::CatalogPathApi . $this->shopId . '/root/noblock/active/5/');
        $this->responseData = $sections;
    }
    
    private function GetPath() {
        $sections = $this->GetData(Settings::HostApi . Settings::CatalogPathApi . $this->categoryId . '/path');
        $this->responseData = $sections;
    }
    
    private function GetCategoryInfo(){
        $category = $this->GetData(Settings::HostApi . Settings::CatalogPathApi . $this->categoryId . '/info/');
        $this->responseData = $category;
    }
    
    private function GetBlocks(){
        $category = $this->GetData(Settings::HostApi . Settings::CatalogPathApi . $this->parentId . '/children/block/active');
        $this->responseData = $category;
    }
    
    private function GetContent() {
        $goods = $this->GetData(Settings::HostApi . Settings::CatalogPathApi . $this->categoryId . '/goods/'.$this->start.'/'.$this->count.'/'.$this->orderBy.'/'.$this->filterName);
        $this->responseData = $goods;
    }

    private function GetCategoriesForRoot() {
        $category = $this->GetData(Settings::HostApi . Settings::CatalogPathApi . $this->parentId . '/children/noblock/active');
        $this->responseData = $category;
    }
    
    private function GetSearchContent(){
        $str = Settings::HostApi . Settings::GoodsPathApi . $this->shopId .'/search/'.$this->start.'/'.$this->count.'/'.$this->orderBy.'/'.$this->filterName.'?';
        
        if($this->idCategories){
            $params[] = 'idCategories='.$this->idCategories;
        }
        if($this->keyWords){
            $params[] = 'keyWords='.implode('%20', explode(' ', $this->keyWords));
        }
        if($this->typeSearch){
            $params[] = 'typeSearch='.$this->typeSearch;
        }
        if($this->startCost){
            $params[] = 'startCost='.$this->startCost;
        }
        if($this->endCost){
            $params[] = 'endCost='.$this->endCost;
        }
        if($this->exceptWords){
            $params[] = 'exceptWords='.implode('%20', explode(' ', $this->exceptWords));
        }
        if($this->typeSeller){
            $params[] = 'typeSeller='.$this->typeSeller;
        }
        
        $str = $str . implode('&', $params);

        $category = $this->GetData($str);
        $this->responseData = $category;
    }
}
$proxy = new DataProxy(Settings::HostApi , Settings::CatalogPathApi, $_GET);
$proxy->Query();
