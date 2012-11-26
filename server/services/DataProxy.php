<?php

require_once('settings.php');
require_once('IProxy.php');

class DataProxy implements IProxy {

    private $shopId;
    private $query;
    private $parentId;
    private $category;
    private $responseData;
    private $host;
    private $path;
    private $typeCategory;

    public function DataProxy($host, $path, $params) {
        $this->host = $host;
        $this->path = $path;
        $this->ParseRequestParams($params);
    }
    
    private function ParseRequestParams($params){
        $this->shopId = $params['shopId'];
        $this->query = $params['query'];
        $this->parentId = $params['parentId'];
        $this->category = $params['category'];
        $this->typeCategory = $params['typeCategory'];
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
        $sections = $this->GetData(Settings::HostApi . Settings::CatalogPathApi . $this->shopId . '/root/noblock/active');
        $this->responseData = $sections;
    }
    
    private function GetPath() {
        $sections = $this->GetData(Settings::HostApi . Settings::CatalogPathApi . $this->category . '/path');
        $this->responseData = $sections;
    }
    
    private function GetCategoryInfo(){
        $category = $this->GetData(Settings::HostApi . Settings::CatalogPathApi . $this->parentId . '/info/');
        if($this->parentId == 888){
            $category = '{
                "id":888,
                "name_category":"Рекомендуем",
                "type_category":"block",
                "type_goods":"fisical",
                "type_view" : "slider",
                "default_act" : "",
                "status":"active",
                "count_goods":445
            }';
        }
        $this->responseData = $category;
    }
    
    private function GetBlocks(){
        //$category = $this->GetData(Settings::HostApi . Settings::CatalogPathApi . $this->parentId . '/children/block/active');
        $category = array();
                
        $category[] = array(
                "id" => 887,
                "name_category" => "Рекомендуем",
                "type_category" => "block",
                "type_goods" => "fisical",
                "type_view"  => "slider",
                "status" => "active",
                "count_goods" => 445);
        $category[] = array(
                "id" => 888,
                "name_category" => "Товары со скидкой",
                "type_category" => "block",
                "type_goods" => "fisical",
                "type_view"  => "carousel",
                "status" => "active",
                "count_goods" => 445);
        $category[] = array(
                "id" => 889,
                "name_category" => "Лидеры продаж",
                "type_category" => "block",
                "type_goods" => "fisical",
                "type_view"  => "table",
                "status" => "active",
                "count_goods" => 445);
        $this->responseData = json_encode($category);
    }
    
    private function GetContent() {
        $goods = $this->GetData(Settings::HostApi . Settings::CatalogPathApi . $this->category . '/goods');
        $goods = array();
        for($i = 1; $i <= 10; $i++){
            $goods[] = array(
                'id' => $i,
                'chort_name' => 'Товар',
                'full_name' => 'Полное название товара',
                'route_image' => 'http://pokupo-client.smartos.ru/images/img_'.$i.'.png',
                'count' => 12,
                'sell_cost' => '12 000',
                'key_words' => '',
                
                'short_description' => 'Тип устройства: смартфон; GSM; 3G; ОС: Windows Mobile; Кол-во SIM-карт: нет данных; Режим работы SIM-карт: нет данных; Тип SIM-карты: нет данных',
                'description' => 'Тип устройства: смартфон; GSM; 3G; ОС: Windows Mobile; Кол-во SIM-карт: нет данных; Режим работы SIM-карт: нет данных; Тип SIM-карты: нет данных; Корпус: моноблок; Материал: пластик; Аппаратная часть; Процессор (МГц): 520; Ядер процессора: нет данных; ОЗУ (Мб): 128; Память (Мб): 256; Слот для карт; GSM 850; GSM 900; GSM 1800; GSM 1900; HSDPA; Дисплей ("): 2.8; Разрешение (пикс): 320x240; Глубина цвета: 65 000 цветов; Технология исполнения: TFT; Тип сенсорного дисплея: нет данных; Разрешение (пикс): нет данных; Глубина цвета: нет данных; Камера; Мегапикселей: 3.15; Макс. разрешение (пикс): 2048x1536; Запись HD-видео: нет данных; Автофокус; Коммуникации; GPRS; EDGE; Wi-Fi; Bluetooth; Навигация; aGPS; GPS-модуль; Карта: нет данных; Медиаплеер; FM-приемник; Диктофон; JAVA; Ввод данных; Цифровая клавиатура; Аккумулятор: Li-Ion; Ёмкость (мАч): 1600; Время в режиме ожидания (ч): 250; Время в режиме разговора (ч): 4; Размеры (мм): 117x60x18; Вес (г): 145;',
                'discount' => '10%',
                'rating' => 1*$i,
                'shop_id' => 1,
                'shop_name' => 'Магазин_1',
                'shop_rating' => 2*$i,
                'reviews' => '10/15',
                'id_auction' => $i
            );
        }
        
        $this->responseData = json_encode($goods);
    }

    private function GetCategoriesForRoot() {
        $category = $this->GetData(Settings::HostApi . Settings::CatalogPathApi . $this->parentId . '/children/noblock/active');
        $category = '{"parentId" : "'.$this->parentId.'", "items": '.$category.'}';
        $this->responseData = $category;
    }
}
$proxy = new DataProxy(Settings::HostApi , Settings::CatalogPathApi, $_GET);
$proxy->Query();
