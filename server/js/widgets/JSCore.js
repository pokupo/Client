var JSSettings = {
    host : "http://pokupo-server.asmsoft.ru/",
    pathToJS : "js/",
    pathToTmpl : "tmpl/",
    pathToData : "services/DataProxy.php?query=",
    pathToCore: "index.html",
    scripts : ['widgets/md5.js', 'easyXDM.min.js', 'widgets/Widget.js', 'knockout-2.2.0.js', 'jquery.livequery.js', 'DD_roundies_0.0.2a-min.js', 'select.js', 'jquery.jcarousel.min.js', 'widgets/Slider.js', 'widgets/Carousel.js'],
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
            var callbackHash = MD5(callback.toString());
            for (var i = listeners.length - 1; i >= 0; --i) {
                if (MD5(listeners[i].toString()) === callbackHash) {
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
    }
}

var JSLoader = { 
    loaded : false,
    loadedCount : 0,
    Init : function(sripts, pathToJs){
        JSLoader.Load(sripts, pathToJs);
    },
    RegisterLoaded: function(scripts){
        JSLoader.loadedCount = JSLoader.loadedCount + 1;
        if (JSLoader.loadedCount == scripts.length){
            JSLoader.OnReady();
        }
    },
    OnReady : function(){
        if(typeof MD5 === 'function'){
            JSLoader.loaded = true;
            EventDispatcher.DispatchEvent('onload.scripts');
        }
        else{
            JSLoader.OnReady();
        }
    },
    Load : function(scripts, pathToJs){
        for(var i in scripts){
            $.getScript(pathToJs + scripts[i], function(){
                JSLoader.RegisterLoaded(scripts);
            });
        }
    }
}

var JSCore = {
    isReady : false,
    shopId : null,
    Init : function(){
        JSLoader.Init(JSSettings.scripts, JSSettings.host + JSSettings.pathToJS);
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
}

var XDMTransport = {
    remote : "",
    Init: function(url){
        XDMTransport.remote = url;
    },
    LoadTmpl: function(data, callback){
        XDMTransport.Load(JSSettings.pathToTmpl + data, callback);
    },
    LoadData: function(data, callback){
        XDMTransport.Load(JSSettings.pathToData + data, callback);
    },
    Load : function(data, callback){
        var socket = new  easyXDM.Socket({
            remote: XDMTransport.remote,
            onMessage: function(msg) {
                if(callback)callback(msg);
            }
        });
        socket.postMessage(data);
    }
}
$().ready(function(){
   JSCore.Init();
})