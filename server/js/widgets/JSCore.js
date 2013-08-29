var JSSettings = {
    protocolHTTP : 'http://',
    protocolHTTPS : 'https://',
    host : "dev.pokupo.ru/",
    pathToJS : "server/js/",
    pathToTmpl : "server/tmpl/",
    pathToData : "server/services/DataProxy.php?query=",
    pathToPostData : "server/services/DataPostProxy.php",
    pathToCore: "server/index.html",
    pathToPostCore : 'server/postData.html',

    scripts : [
        'jquery-ui-1.10.2.custom.min.js',
        'easyXDM.min.js',
        'knockout-2.2.0.js',
        'jquery.livequery.js',
        'DD_roundies_0.0.2a-min.js',
        'select.js',
        'jquery.jcarousel.min.js',
        'jquery.cookie.js',
        'jquery.dynatree.min.js',
        'jquery.maskedinput.min.js',
        'jquery.textchange.min.js',
        'lightbox.js',
        'widgets/Config.js',
        'widgets/Routing.js',
        'widgets/Paging.js',
        'widgets/ContentViewModel.js',
        'widgets/Widget.js',
        'widgets/AnimateSlider.js',
        'widgets/AnimateCarousel.js',
        'widgets/AnimateAddToCart.js',
        'widgets/AnimateSelectList.js',
        'widgets/AnimateBreadCrumb.js',
        'widgets/AnimateTab.js'],
    inputParameters : {}
}

var EventDispatcher = {
    events : [],
    
    AddEventListener : function (event, callback) {
        this.events[event] = this.events[event] || [];
        if (this.events[event]) {
            this.RemoveEventListener(event, callback);
            this.events[event].push(callback);
        }
    },

    RemoveEventListener : function (event, callback) {
        if (this.events[event]) {
            var listeners = this.events[event];
            var callbackHash = EventDispatcher.HashCode(callback.toString());
            for (var i = listeners.length - 1; i >= 0; --i) {
                if (EventDispatcher.HashCode(listeners[i].toString()) === callbackHash) {
                    listeners.splice(i, 1);
                    return true;
                }
            }
        }
        return false;
    },

    DispatchEvent: function (event, data) {
        if (this.events[event]) {
            var listeners = this.events[event], len = listeners.length;
            while (len--) {
                listeners[len](data);   //callback with self
            }
        }
    },
    
    HashCode : function(str){
        var hash = 0, i, ch;
        if (str.length == 0) return hash;
        for (i = 0; i < str.length; i++) {
            ch = str.charCodeAt(i);
            hash = ((hash<<5)-hash)+ch;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    }
}

var JSLoader = { 
    loaded : false,
    loadedCount : 0,
    pathToJs : null,
    Init : function(scripts, pathToJs){
        this.pathToJs = pathToJs;
        JSLoader.Load(scripts, function(){JSLoader.RegisterLoaded(scripts);});
    },
    RegisterLoaded: function(scripts){
        JSLoader.loadedCount = JSLoader.loadedCount + 1;
        if (JSLoader.loadedCount == scripts.length){
            JSLoader.OnReady();
        }
    },
    OnReady : function(){
        JSLoader.loaded = true;
        EventDispatcher.DispatchEvent('onload.scripts');
    },
    Load : function(scripts, callback){
        for(var i in scripts){
            $.getScript(this.pathToJs + scripts[i], function(){
                if(callback)
                    callback();
            });
        }
    }
}

var JSCore = {
    isReady : false,
    shopId : null,
    Init : function(){
        JSLoader.Init(JSSettings.scripts, JSSettings.protocolHTTP + JSSettings.host + JSSettings.pathToJS);
        JSCore.SetInputParameters();
        JSCore.shopId = JSSettings.inputParameters['shopId'];
        XDMTransport.Init(JSSettings.host + JSSettings.pathToCore);
        JSCore.isReady = true;
    },
    
    ParserInputParameters : function(scriptName){
        var obj = {};
        
        var attr = $('script').filter(function(){
            return scriptName.test($(this).attr('src'));
        }).attr('src');
        
        if(attr){
            var string = attr.split('?');
            if(string.length > 1){
                var parameters = string[1].split('&');

                for(var i = 0; i <= parameters.length-1; i++){
                    var parameter = parameters[i].split('=');
                    obj[parameter[0]] = parameter[1];
                }
            }
        }
        
        return obj;
    },
    SetInputParameters : function(){
        JSSettings.inputParameters = JSCore.ParserInputParameters(/JSCore.js/);
    }
};

var XDMTransport = {
    remote : "",
    Init: function(url){
        XDMTransport.remote = url;
    },
    GetProtocol : function(data){
       if( data )
           return JSSettings.protocolHTTPS;
       else
           return JSSettings.protocolHTTP;
    },
    LoadTmpl: function(data, callback){
        XDMTransport.Load(JSSettings.pathToTmpl + data, callback);
    },
    LoadData: function(data, callback, protocol){
        XDMTransport.Load(JSSettings.pathToData + data, callback, protocol);
    },
    Load : function(data, callback, protocol){
        if(typeof easyXDM !== 'undefined'){
            var socket = new  easyXDM.Socket({
                remote: XDMTransport.GetProtocol(protocol) + XDMTransport.remote,
                onMessage: function(msg) {
                    if(callback)callback(msg);
                }
            });
            socket.postMessage(data);
        }
        else{
            setTimeout(function(){XDMTransport.Load(data, callback)}, 1000);
        }
    },
    LoadPost : function(data, protocol){
        if(typeof easyXDM !== 'undefined'){
            var remote = new easyXDM.Rpc({
                remote: XDMTransport.GetProtocol(protocol) + JSSettings.host + JSSettings.pathToPostCore,
                onReady: function(){
                    data.attr('action', XDMTransport.GetProtocol(protocol) + JSSettings.host + JSSettings.pathToPostData);
                    data.submit(); 
                }
            }, {
                local: {
                    returnUploadResponse: function(response){
                        EventDispatcher.DispatchEvent(EventDispatcher.HashCode(data.toString()), response.msg);
                    }
                }
            });
        }
        else{
            setTimeout(function(){XDMTransport.LoadPost(data, callback)}, 1000);
        }
    }
}

$().ready(function(){
   JSCore.Init();
})