var JSSettings = {
    host : "http://pokupo-server.asmsoft.ru/",
    pathToJS : "js/",
    pathToTmpl : "tmpl/",
    pathToData : "services/data.php?query=",
    pathToCore: "index.html",
    containerIdForTmpl : "container_tmpl",
    containerIdForCatalog : "catalog",
    scripts : ['easyXDM.min.js', 'knockout-2.2.0.js', 'Widget.js', 'jquery.livequery.js', 'DD_roundies_0.0.2a-min.js', 'giz.js', 'select.js'],
    tmplForCatalog : "catalogTmpl.html",
    dataForCatalog : "getCatalogData",
    dataForSection : "getSectionData",
    inputParameters : {},
    hashParameters : {},
    styleCatalog : {'position' : 'absolute', 'top' : '100px', 'left' : '5%', 'width' : '20%', 'height' : '200px', 'background' : '#ddd'}
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
                if($('#' + JSSettings.containerIdForTmpl).length == 0)
                    $('body').append("<div id='" + JSSettings.containerIdForTmpl + "'></div>");
                $("#" + JSSettings.containerIdForTmpl).append(msg);
                EventDispatcher.dispatchEvent('onload.tmpl');
            }
        });
        socket.postMessage(JSSettings.pathToTmpl + tmpl);
    },
    LoadJson : function(data, id){
        var socket = new  easyXDM.Socket({
            remote: JSSettings.host + JSSettings.pathToCore,
            onMessage: function(msg) {
                var t = JSON.parse(msg);
                EventDispatcher.dispatchEvent('onload.data.catalog%%' + id, t);
            }
        });
        socket.postMessage(JSSettings.pathToData + data + "&parentId=" + id);
    },
    LoadSectionJson : function(data){
        var socket = new  easyXDM.Socket({
            remote: JSSettings.host + JSSettings.pathToCore,
            onMessage: function(msg) {
                var t = JSON.parse(msg);
                EventDispatcher.dispatchEvent('onload.data.sectionCatalog', t);
            }
        });
        socket.postMessage(JSSettings.pathToData + data + '&shopId=' + JSSettings.inputParameters['shopId']);
    }
}

var JSCore = {
    InitLoader : function(){
        JSLoader.Init();
        JSCore.ParserPath();
        JSCore.ParserInputParameters();
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
    ParserInputParameters : function(){
        var parameters = $('script').filter(function(){
            var reg = /JSCore.js/;
            return reg.test($(this).attr('src'));
        }).attr('src').split('?')[1].split('&');
        for(var i = 0; i <= parameters.length-1; i++){
            var parameter = parameters[i].split('=');
            JSSettings.inputParameters[parameter[0]] = parameter[1];
        }
    }
}


