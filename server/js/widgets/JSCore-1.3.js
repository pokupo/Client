var JSSettings = {
    shopId: 0,
    protocolHTTP : 'https://',
    protocolHTTPS : 'https://',

    host : "server.pokupo.ru/prod/server/",
    pathToJS : "js/",
    pathToTmpl : "pokupo.ru/themes/",
    theme: 'default',
    pathToData : "prod/server/services/DataProxy.php?query=",
    pathToPostData : "prod/server/services/DataPostProxy.php",
    pathToCore: "index.html",
    pathToPostCore : 'postData.html',
    hostApi : "api.pokupo.ru/", // урл API
    catalogPathApi : "catalog/", // префикс API каталога 
    goodsPathApi : "goods/", // префикс API товаров
    userPathApi : "user/", // префикс API пользователя
    cartPathApi : "cart/", // префикс API корзины
    favPathApi : "fav/", // префикс API избранное
    geoPathApi : "geo/", // префикс API гео локации
    shopPathApi : "shop/", // префикс API магазина
    orderPathApi : "order/", // префикс API заказов
    paymentPathApi : "payment/", // префикс API оплаты
    messagePathApi : "message/", // префикс API сообщений
    loadThema: true,
    dev: false,
    
    sourceData : 'api', //варианты api, proxy
    devScripts : [
        'easyXDM.min.js',
        'knockout-3.2.0.js',
        'jquery.cookie.js',
        'jquery.textchange.min.js',
        'widgets/Config-1.1.js',
        'widgets/Routing-1.0.js',
        'widgets/Paging-1.0.js',
        'widgets/Widget-1.1.js'
    ],
    scripts: [
        'widgets/pokupo.widgets.lib.min.js',
    ],
    themeFiles: {
        'default': {
            styles: [
                'https://pokupo.ru/styles/theme.min.css',
            ],
            scripts: [
                'promo/pokupo.components.min.js',
                'promo/pokupo.widgets.animate.min.js'
            ]
        },
        payment_dark: {
            styles: [
                'https://pokupo.ru/styles/payment_dark.css'
            ],
            scripts: [
                'promo/pokupo.components.min.js',
                'promo/pokupo.widgets.animate.min.js'
            ]
        },
        payment_company: {
            styles: [
                'https://pokupo.ru/styles/payment_company.css'
            ],
            scripts: [
                'promo/pokupo.components.min.js',
                'promo/pokupo.widgets.animate.min.js'
            ]
        },
        payment_company_white: {
            styles: [
                'https://pokupo.ru/styles/payment_company_white.css'
            ],
            scripts: [
                'promo/pokupo.components.min.js',
                'promo/pokupo.widgets.animate.min.js'
            ]
        }
    },

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
        if(typeof ko == 'object'){
            JSLoader.loaded = true;
            EventDispatcher.DispatchEvent('onload.scripts');
        }
        else{
            setTimeout(function(){JSLoader.OnReady()}, 100);
        }
    },
    Load : function(scripts, callback, pathToJs){
        var head = document.getElementsByTagName("head")[0] || document.documentElement;

        for(var i in scripts){
            var script = document.createElement("script");
            script.async = true;
            script.type = 'text/javascript';
            if(pathToJs)
                script.src = pathToJs + scripts[i];
            else
                script.src = this.pathToJs + scripts[i];
            script.async = true;

            if (script.readyState) { //IE
                script.onreadystatechange = function () {
                    if (script.readyState == "loaded" || script.readyState == "complete") {
                        script.onreadystatechange = null;
                        callback();
                    }
                };
            } else { // Non IE
                script.onload = function () {
                    if(callback)
                        script.onload = callback();
                };
            }


            head.appendChild(script);
        }
    },
    LoadCss: function(css){
        var head = document.getElementsByTagName("head")[0] || document.documentElement;
        for(var i in css){
            var link = document.createElement("link");
            link.type = "text/css";
            link.rel = "stylesheet";
            link.href = css[i];

            head.appendChild(link);
        }
    }
}

var JSCore = {
    version : 1.2,
    isReady : false,
    shopId : null,
    dev : false,
    Init : function(params){
        if(document.location.protocol == 'https:')
            JSSettings.protocolHTTP = JSSettings.protocolHTTPS;
        JSCore.SetInputParameters(params);
        JSLoader.pathToJs = JSSettings.protocolHTTP + JSSettings.host + JSSettings.pathToJS;
        JSCore.shopId = JSSettings.shopId;
        XDMTransport.Init(JSSettings.host + JSSettings.pathToCore);
        JSCore.isReady = true;
    },
    
    ParserInputParameters : function(scriptName){
        var obj = {};
        var list = document.getElementsByTagName("script");
        var attr = '';
        for(var i=0; i <= list.length-1; i++){
            if(list[i].hasAttribute("src")) {
                attr = list[i].getAttributeNode("src").value;
                if (scriptName.test(attr))
                    break;
            }
        }
        
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
    SetInputParameters : function(params){
        var input = JSCore.ParserInputParameters(/JSCore/);
        if(Object.keys(input).length == 0)
            input = JSCore.ParserInputParameters(/pokupo.widgets.[a-z0-9]{32}.min.js/);
        if(input){
            for(var key in input){
                if(JSSettings.hasOwnProperty(key)){
                    JSSettings[key] = input[key];
                }
            }
        }
        if(typeof WParameters !== 'undefined' && WParameters.core){
            for(var key in WParameters.core){
                if(JSSettings.hasOwnProperty(key)){
                    JSSettings[key] = WParameters.core[key];
                }
            }
        }
        if(params){
            for(var key in params.core){
                if(JSSettings.hasOwnProperty(key)){
                    JSSettings[key] = params.core[key];
                }
            }
        }

        JSSettings.inputParameters = params;

        JSSettings.inputParameters['shopId'] = JSSettings.shopId;
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
            var url = XDMTransport.GetProtocol() + JSSettings.pathToTmpl + JSSettings.theme + '/tmpl/' + data;
            if(/^(https?|ftp)\:\/\/(www\.)?([a-zA-Z0-9\.\-]+\.[a-z]{2,})(\/.+)$/.test(data))
                url = data;
            XDMTransport.Load.FromProxy({
                url : url,
                callback : callback,
                protocol : null
            })
        },
        Data: function(data, callback, protocol){
            protocol = JSSettings.protocolHTTPS;
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
        Exception : function(widget, text, e){
            console && console.log('Exception : ' + new Date() + ' : ' + widget + ' : ' + text);
            if(e) {
                var exmsg = "";
                if (e.message) {
                    exmsg += e.message;
                }
                if (e.stack) {
                    exmsg += ' | stack: ' + e.stack;
                }
                console && console.log(exmsg);
            }
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

var PokupoWidgets = {
    model: {
        order: 'widgets/OrderViewModel-1.0.min.js',
        auth: 'widgets/AuthenticationViewModel-1.1.min.js',
        menu: 'widgets/MenuPersonalCabinetWidget-1.1.js',
        content: 'widgets/ContentViewModel-1.0.min.js',
        goods: 'widgets/GoodsViewModel-1.0.min.js',
        registration: 'widgets/RegistrationViewModel-1.0.min.js'
    },
    list: {
        all: 'widgets/pokupo.widgets.min.js',
        authentication: 'widgets/AuthenticationWidget-1.1.min.js',
        cart: 'widgets/CartWidget-1.0.min.js',
        catalog: 'widgets/CatalogWidget-1.0.min.js',
        breadCrumb: 'widgets/BreadCrumbWidget-1.0.min.js',
        buttonPayment: 'widgets/ButtonPaymentWidget-1.1.min.js',
        content: 'widgets/ContentWidget-1.1.min.js',
        cartGoods: 'widgets/CartGoodsWidget-1.0.min.js',
        cabinetCartGoods: 'widgets/CabinetCartGoodsWidget-1.0.min.js',
        favorites: 'widgets/FavoritesWidget-1.0.min.js',
        goods: 'widgets/GoodsWidget-1.2.min.js',
        infoSeller: 'widgets/InfoSellerWidget-1.0.min.js',
        menuPersonalCabinet: 'widgets/MenuPersonalCabinetWidget-1.1.min.js',
        message: 'widgets/MessageWidget-1.0.min.js',
        order: 'widgets/OrderWidget-1.1.min.js',
        orderList: 'widgets/OrderListWidget-1.0.min.js',
        profile: 'widgets/ProfileWidget-1.0.min.js',
        registration: 'widgets/RegistrationWidget-1.0.min.js',
        registrationSeller: 'widgets/RegistrationSellerWidget-1.0.min.js',
        relatedGoods: 'widgets/RelatedGoodsWidget-1.0.min.js',
        search: 'widgets/SearchWidget-1.0.min.js',
        searchResult: 'widgets/SearchResultWidget-1.1.min.js',
        userInformation: 'widgets/UserInformationWidget-1.1.min.js',
        standaloneGoods: 'widgets/StandaloneGoodsWidget-1.0.min.js',
        standalonePayment: 'widgets/StandalonePaymentWidget-1.0.min.js',
        statusPayment: 'widgets/StatusPaymentWidget-1.0.min.js',
        modalMessage: 'widgets/ModalMessageWidget-1.0.min.js',
        shopInfo: 'widgets/ShopInfoWidget-1.0.min.js'
    },
    libs: {
        ya: {
            path: '//yandex.st/share/',
            name: 'share.js'
        }
    },
    Init: function(widgets, params){
        JSCore.Init(params);

        JSLoader.Load(
            [PokupoWidgets.libs.ya.name],
            function(){
                if (typeof jQuery == 'undefined'){
                    JSLoader.Load(["jquery-1.11.2.js"], function(){
                        PokupoWidgets.Load(widgets);
                    })
                }
                else{
                    PokupoWidgets.Load(widgets);
                }
            },
            PokupoWidgets.libs.ya.path
        );
    },
    Load: function(widgets){
        var scripts = JSSettings.scripts;
        if(JSSettings.dev)
            scripts = JSSettings.devScripts;

        if(JSSettings.loadThema){
            if(JSSettings.themeFiles[JSSettings.theme]) {
                JSLoader.LoadCss(JSSettings.themeFiles[JSSettings.theme].styles);

                var themeScripts = JSSettings.themeFiles[JSSettings.theme].scripts;
                for (var key in themeScripts) {
                    JSLoader.Load([themeScripts[key]]);
                }
            }
            else{
                var css = [];
                css[0] = JSSettings.theme;
                JSLoader.LoadCss(css);

                var themeScripts = JSSettings.themeFiles.default.scripts;
                for (var key in themeScripts) {
                    JSLoader.Load([themeScripts[key]]);
                }
            }
        }

        EventDispatcher.AddEventListener('onload.scripts', function(){
            if(PokupoWidgets.TestAll(widgets))
                JSLoader.Load([PokupoWidgets.list.all]);
            else {
                for (var key in widgets) {
                    var path = PokupoWidgets.list[widgets[key]];
                    if (path)
                        JSLoader.Load([path]);
                }
            }
        })

        for(var key in scripts){
            JSLoader.Load([scripts[key]], JSLoader.RegisterLoaded(scripts));
        }
    },
    TestAll: function(widgets){
        for(var i = 0; i <= widgets.length - 1; i++ ){
            if(widgets[i] == 'all')
                return true;
        }
        return false;
    }
}