var JSSettings = {
    host : "http://pokupo-server.asmsoft.ru/",
    pathToJS : "js/",
    pathToTmpl : "tmpl/",
    pathToData : "services/data.php?query=",
    pathToCore: "index.html",
    scripts : ['easyXDM.min.js', 'widgets/Widget.js', 'knockout-2.2.0.js', 'jquery.livequery.js', 'DD_roundies_0.0.2a-min.js', 'giz.js', 'select.js'],
    inputParameters : {},
    hashParameters : {}
}

var EventDispatcher = {
    eventListeners : [],
    addEventListener : function (event, callback) {
        this.eventListeners[event] = this.eventListeners[event] || [];
        if (this.eventListeners[event]) {
            removeEventListener(event, callback);
            this.eventListeners[event].push(callback);
        }
    },
    removeEventListener : function(event, func){
        for(var i = 0, len = this.eventListeners[event].length; i < len; i+=1){
            if (this.eventListeners[event][i] == func){
                this.eventListeners[event].splice(i, 1);
            }
        }
    },
    dispatchEvent : function(event, data){
        if (this.eventListeners[event]) {
            var listeners = this.eventListeners[event], len = listeners.length;
            while (len--) {
                listeners[len](data);
            }
        }
    }	
}

var JSLoader = {   
    LoadedCount : 0,
    Init : function(sripts, pathToJs){
        JSLoader.Load(sripts, pathToJs);
    },
    RegisterLoaded: function(scripts){
        JSLoader.LoadedCount = JSLoader.LoadedCount + 1;
        if (JSLoader.LoadedCount == scripts.length){
            JSLoader.OnReady();
        }
    },
    OnReady : function(){
        EventDispatcher.dispatchEvent('onload.scripts');
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
    Init : function(){
        JSLoader.Init(JSSettings.scripts, JSSettings.host + JSSettings.pathToJS);
        JSCore.ParserPath();
        JSCore.SetInputParameters();
        JSCore.ShopId = JSSettings.inputParameters['shopId'];
        XDMTransport.Init(JSSettings.host + JSSettings.pathToCore);
    },
    Extend : function (Child, Parent) {
        var F = function() { }
        F.prototype = Parent.prototype
        Child.prototype = new F()
        Child.prototype.constructor = Child
        Child.superclass = Parent.prototype
    },
    ParserPath : function(){
        var hash = window.location.hash;
        hash = hash.replace(/(^#\/)/g, '')
        var parameters = hash.split('&');
        for(var i = 0; i <= parameters.length-1; i++){
            var parameter = parameters[i].split('='); 
            JSSettings.hashParameters[parameter[0]] = parameter[1]; 
        }
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
    Remote : "",
    Init: function(url){
        XDMTransport.Remote = url;
    },
    LoadTmpl: function(data, callback){
        XDMTransport.Load(JSSettings.pathToTmpl + data, callback);
    },
    LoadData: function(data, callback){
        XDMTransport.Load(JSSettings.pathToData + data, callback);
    },
    Load : function(data, callback){
        var socket = new  easyXDM.Socket({
            remote: XDMTransport.Remote,
            onMessage: function(msg) {
                if(callback)callback(msg);
            }
        });
        socket.postMessage(data);
    }
}