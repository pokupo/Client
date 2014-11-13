<?php
require_once('IProxy.php');

class DataPostProxy implements IProxy {

    private $query;
    private $params;
    private $error;

    public function DataPostProxy($post, $file) {
        $this->ParseRequestParams($post, $file);
    }
    
    private function ParseRequestParams($post, $file){
        $this->query = $post['query'];
        foreach($file as $i => $one){
            if($one['tmp_name'])
                $post[$i] = '@' . $one['tmp_name'] . ';filename=' . $one['name'];
        }
        unset($post['query']);
        $this->params = $post;
    }

    private function Route() {
        if ($this->query)
            $this->GetData($this->query);
        else  
            throw new Exception("Wrong url");
    }
    
    public function Query(){
        $this->Route();
        return $this->responseData;
    }
    
    public function GetError(){
        return $this->error;
    }
    
    private function SetError($error){
        $this->error = json_encode(array('err' => $error));
    }

    private function GetData($url) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_USERAGENT, "Mozilla/4.0 (compatible;)");
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $this->params); 
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_COOKIE, "PHPSESSID=".$_COOKIE['PHPSESSID']);
        curl_setopt($ch,CURLOPT_RETURNTRANSFER, true);
	$this->responseData = curl_exec ($ch);
        if($this->responseData === false)
            $this->SetError(curl_error($ch));
        
        curl_close($ch);
    }
}   

$proxy = new DataPostProxy($_POST, $_FILES);

$content = $proxy->Query();
if($proxy->GetError())
    $content = $proxy->GetError();
?>

<script type='text/javascript'>
    parent.rpc.returnUploadResponse({
        msg: '<?php echo $content ?>'
    });
</script>
