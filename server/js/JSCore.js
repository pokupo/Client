var JSSettings = {
    host : "http://pokupo-server.asmsoft.ru/",
    //host : "http://test-server.ru/",
    pathToJS : "js/",
    pathToTmpl : "tmpl/",
    pathToCore: "index.html",
    containerIdForTmpl : "container_tmpl",
    containerIdForCatalog : "catalog",
    scripts : ['easyXDM.debug.js', 'knockout-2.2.0.js', 'Widget.js', 'jquery.livequery.js', 'DD_roundies_0.0.2a-min.js', 'giz.js', 'select.js'],
    tmplForCatalog : "getTmplForCatalog",
    dataForCatalog : "getCatalogData",
    dataForSection : "getSectionData",
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
                listeners[len](data);   //callback with self
            }
        }
    }	
}

var JSLoader = {
    
    Init : function(){
        
        var loadedCount = 0;
        
        this.loaded = false;

        function registerLoaded(){
            loadedCount ++;
            if (loadedCount == JSSettings.scripts.length){
                onReady();
            }
        }
        
        function onReady(){
            EventDispatcher.dispatchEvent('onload.scripts');
            this.loaded = true;
        }
        
        for(var i in JSSettings.scripts){
            $.getScript(JSSettings.host + JSSettings.pathToJS + JSSettings.scripts[i], function(){
                registerLoaded();
            });
        }
    },
    
    LoadTmpl : function(tmpl){
        var socket = new  easyXDM.Socket({
            remote: JSSettings.host + JSSettings.pathToCore,
            onMessage: function(msg) {
                $("#" + JSSettings.containerIdForTmpl).append(msg);
            }
        });
        socket.postMessage(tmpl);
    },
    
    LoadJson : function(data, id){
        var socket = new  easyXDM.Socket({
            remote: JSSettings.host + JSSettings.pathToCore,
            onMessage: function(msg) {
                var t = JSON.parse(msg);
                EventDispatcher.dispatchEvent('onload.data.catalog%%' + id, t);
            }
        });
        socket.postMessage(data + "%%" + id);
    },
    
    LoadSectionJson : function(data){
        var socket = new  easyXDM.Socket({
            remote: JSSettings.host + JSSettings.pathToCore,
            onMessage: function(msg) {
                var t = JSON.parse(msg);
                EventDispatcher.dispatchEvent('onload.data.sectionCatalog', t);
            }
        });
        socket.postMessage(data);
    }
}

var JSCore = {
    
    InitLoader : function(){
        JSLoader.Init();
        JSCore.ParserPath();
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
    }
}


