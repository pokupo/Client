<?php
require_once('settings.php');

class Datas{ 

    static function GetSection($shopId){
        $sectionJson = file_get_contents(Settings::HostApi . Settings::CatalogPathApi . $shopId .'/root/noblock/active');
        $sections = json_decode($sectionJson, true);
        $items = array();
        if(!key_exists('message_error', $sections)){
            foreach($sections as $one){
                 $items[] = array('id' => $one['id'], 'title' =>$one['name_category']);
            }
        }
        return $items;
    }
    
    static function GetCategoriesForRoot($id){
        $categoryJson = file_get_contents(Settings::HostApi . Settings::CatalogPathApi . $id.'/children/noblock/active');
        $category = json_decode($categoryJson, true);

        if(key_exists('message_error', $category)){
            return array();
        }
        
        $items = array();
        foreach($category as $one){
            $items[] = array('id' => $one['id'], 'title' =>$one['name_category']);
        }
        
        return array('parentId' => $id,'items' => $items);
    }
}

if($catalog = $_GET['query']){
    if($catalog == 'getSectionData')
        echo json_encode(Datas::GetSection($_GET['shopId']));
    elseif($catalog == 'getCatalogData' )
        echo json_encode(Datas::GetCategoriesForRoot($_GET['parentId']));
    exit;
}
echo json_encode(array());

