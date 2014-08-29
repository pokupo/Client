var JSSettings = {
    protocolHTTP : 'http://',
    protocolHTTPS : 'https://',
    
    host : "pokupo-server.asmsoft.ru/",    
    pathToJS : "js/",
    pathToTmpl : "tmpl/",
    pathToData : "services/DataProxy.php?query=",
    pathToPostData : "services/DataPostProxy.php",
    pathToCore: "index.html",
    pathToPostCore : 'postData.html',

//    host : "dev.pokupo.ru/",
//    pathToJS : "server/js/",
//    pathToTmpl : "server/tmpl/",
//    pathToData : "server/services/DataProxy.php?query=",
//    pathToPostData : "server/services/DataPostProxy.php",
//    pathToCore: "server/index.html",
//    pathToPostCore : 'server/postData.html',
    
    sourceData : 'api', //варианты api, proxy
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
        'jquery.hoverIntent.minified.js',
        'jquery.colorbox-min.js',
        'widgets/Config-1.1.js',
        'widgets/Routing-1.0.js',
        'widgets/Paging-1.0.js',
        'widgets/ContentViewModel-1.0.js',
        'widgets/OrderViewModel-1.0.js',
        'widgets/RegistrationViewModel-1.0.js',
        'widgets/AuthenticationViewModel-1.0.js',
        'widgets/Widget-1.1.js',
        'widgets/AnimateSlider-1.0.js',
        'widgets/AnimateCarousel-1.0.js',
        'widgets/AnimateAddToCart-1.0.js',
        'widgets/AnimateSelectList-1.0.js',
        'widgets/AnimateBreadCrumb-1.0.js',
        'widgets/AnimateTab-1.0.js',
        'widgets/AnimateOrderList-1.0.js'],
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
    },
    GetUUID : function(){
        var t = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
        return t;
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
    version : 1.2,
    isReady : false,
    shopId : null,
    dev : false,
    Init : function(){
        if(document.location.protocol == 'https:')
            JSSettings.protocolHTTP = JSSettings.protocolHTTPS;
        JSLoader.Init(JSSettings.scripts, JSSettings.protocolHTTP + JSSettings.host + JSSettings.pathToJS);
        JSCore.SetInputParameters();
        JSCore.shopId = JSSettings.inputParameters['shopId'];
        if(JSSettings.inputParameters['dev'])
            JSCore.dev = true;
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

        if(obj)
            return obj;
        return null;
    },
    SetInputParameters : function(){
        var input = {};
        var temp = JSCore.ParserInputParameters(/JSCore/);
        if(temp && temp.core){
            input = JSON.parse(temp.core);
        }
        if(typeof WParameters !== 'undefined' && WParameters.core){
            input = WParameters.core;
        }

        JSSettings.inputParameters = input;
    }
};

var XDMTransport = {
    remote : "",
    event : {},
    Init: function(url){
        XDMTransport.remote = url;
    },
    GetProtocol : function(data){
       if( data )
           return JSSettings.protocolHTTPS;
       else
           return JSSettings.protocolHTTP;
    },
    EventExecute : function(msg, hash){
       $.each(XDMTransport.event[hash], function(i){
           XDMTransport.event[hash][i](msg);
       })
           
       delete XDMTransport.event[hash];
    },
    Load : {
        FromProxy : function(opt){
            if(typeof easyXDM !== 'undefined'){
                var socket = new  easyXDM.Socket({
                    remote: XDMTransport.GetProtocol(opt.protocol) + XDMTransport.remote,
                    onMessage: function(msg) {
                        if(opt.callback)opt.callback(msg);
                    }
                });
                socket.postMessage(JSSettings.pathToData + opt.url);
            }
            else{
                setTimeout(function(){XDMTransport.Load.FromProxy(opt)}, 1000);
            }
        },
        FromApi : function(opt){
            $.ajax({
                type: "GET",
                async : true,
                url: decodeURIComponent(opt.url),
                dataType: opt.type,
                success: function(msg) {
                     if(opt.callback)opt.callback(msg);
                }
            })
        },
        Tmpl : function(data, callback){
            var url = XDMTransport.GetProtocol() +  JSSettings.host +  JSSettings.pathToTmpl + data;
            if(/^(https?|ftp)\:\/\/(www\.)?([a-zA-Z0-9\.\-]+\.[a-z]{2,})(\/.+)$/.test(data))
                url = data;
            if(JSSettings.sourceData == 'api'){
                XDMTransport.Load.FromApi({
                    type: 'html',
                    url : url,
                    callback : callback
                })
            }
            if(JSSettings.sourceData == 'proxy'){
                XDMTransport.Load.FromProxy({
                    url : url,
                    callback : callback,
                    protocol : null
                })
            }
        },
        Data: function(data, callback, protocol){
            var hash = EventDispatcher.HashCode(data + callback.toString());

            if(XDMTransport.event[hash] == undefined)
                XDMTransport.event[hash] = [];
            XDMTransport.event[hash].push(callback);

            if(XDMTransport.event[hash].length == 1){
                if(JSSettings.sourceData == 'api'){
                    XDMTransport.Load.FromApi({
                        type: 'jsonp',
                        url : decodeURIComponent(data),
                        callback : function(msg){
                            XDMTransport.EventExecute(msg, hash)
                        }
                    })
                }
                if(JSSettings.sourceData == 'proxy'){
                    XDMTransport.Load.FromProxy({
                        url : data,
                        protocol : protocol,
                        callback : function(msg){
                            XDMTransport.EventExecute(JSON.parse(msg), hash);
                        }
                    })
                }
            }
        },
        DataPost : function(data, protocol){
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
                            EventDispatcher.DispatchEvent(EventDispatcher.HashCode(data.toString()), JSON.parse(response.msg));
                        }
                    }
                });
            }
            else{
                setTimeout(function(){XDMTransport.Load.DataPost(data, protocol)}, 1000);
            }
        }
    }
}

var Logger = {
    Console : {
        Exeption : function(widget, text){
            console && console.log('Exeption : ' + new Date() + ' : ' + widget + ' : ' + text);
        },
        Info : function(widget, text){
            console && console.log('Info : ' + new Date() + ' : ' + widget + ' : ' + text);
        },
        VarDump : function(widget, name, obj){
            console && console.log('Var Dump : ' + widget + ' : ' + name)
            console && console.log(obj);
        }
    }
}

$().ready(function(){
   JSCore.Init();
})