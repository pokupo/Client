Parameters = {
    pathToImages : null,
    routIconAuction : null,
    sortingBlockContainer : null,
    loading : null,
    listSort : {
        name : 'названию', 
        rating : 'рейтингу', 
        cost : 'цене'
    },
    shopId : 0,
    cache : {
        catalogs : [],
        crumbsTitle : [],
        history : [],
        path : {},
        childrenCategory : {},
        block : {},
        contentBlock : {},
        content : {},
        favorite : [],
        searchContent : {},
        searchWidget : {},
        roots: [],
        infoCategory : {},
        infoSeller : {},
        goodsInfo : {},
        relatedGoods : {},
        cart : 0,
        typeView : '',
        pageId: 1,
        searchPageId : 1,
        scripts : {},
        tmpl : {},
        reg : {
            step1 : {},
            step2 : {},
            step3 : {},
            step4 : {}
        },
        order : {
            step1 : {
                login : {},
                reg : {},
                confirm : {},
                profile : {}
            },
            step2 : {},
            step3 : {},
            step4 : {},
            step5 : {},
            list : {}
        },
        profile : {
            personal : {},
            delivery : {},
            security : {},
            info : {}
        },
        message : {
            topicList : {},
            topicCount : {},
            topicInfo : {},
            messageInfo : {}
        },
        lastPage : {},
        https : null,
        userInformation : null,
        country : null,
        payment : null,
        shipping : null
    },
    filter : {},
    catalog : {
        section : 0,
        category : 0,
        page : 1
    },
    SetDefaultFilterParameters : function(){
        this.filter.filterName = '';
        this.filter.idCategories = [];
        this.filter.idSelectCategories = [];
        this.filter.keyWords = '';
        this.filter.typeSearch = 'any';
        this.filter.exceptWords = '';
        this.filter.startCost = '';
        this.filter.endCost = '';
        this.filter.typeSeller = '';
        this.filter.orderBy = 'name';
        this.filter.page = 1;
    }
};

var Loader = {
    readyCount : 0,
    countAll : 0,
    containers : [],
    widgets : {},
    action : null,
    Indicator : function(widget, isReady, container){
        if(widget){
            this.widgets[widget] = isReady;
            this.countAll = 0;
            this.readyCount = 0;

            for(var key in this.widgets){
                this.RegisterReady(key);
            }
            if(container)
                this.containers.push({container: container, widgetName: widget});
            if(JSCore.dev)
                Logger.Console.VarDump('Loader', 'widgets', this.widgets);
            this.ShowLoading();
        }
    },
    RegisterReady : function(key){
        this.countAll++;
        if(this.widgets[key] == true){
            this.readyCount = this.readyCount + 1;
        }
    },
    IsReady : function(){
        if(this.countAll == this.readyCount)
            return true;
        return false;
    },
    SetNotReady : function(){
        for(var key in this.widgets){
            this.widgets[key] = false;
        }
    },
    ShowLoading : function(){
        if(!this.IsReady()){
            this.HideContent();
            if(!Routing.IsDefault())
                if($('#loadingContainer').length == 0)
                    $("body").append('<div id="loadingContainer"><img src="' + Parameters.pathToImages + Parameters.loading + '"/></div>');
        }
        else{
            this.ShowContent();
            $('#loadingContainer').remove();
        }
    },
    InsertContainer : function(container){
        $(container).append('<div style="width: 100%;text-align: center;padding: 15px 0;"><img src="' + Parameters.pathToImages + Parameters.loading + '"/></div>');
    },
    HideContent : function(){
        if(this.action != 'hide'){
            this.action = 'hide';
            for(var key in Config.Containers){
                if(!Config.Containers[key].widget){
                    for(var i in Config.Containers[key]){
                        $("#" + Config.Containers[key][i].widget).children().hide();
                    }
                }
                else{
                    $("#" + Config.Containers[key].widget).children().hide();
                }
            }
        }
    },
    ShowContent : function(){
        $.each(this.containers, function(i){
            $('#' + Loader.containers[i].container).children().not(Loader.SelectCustomContent().join(', ')).show();
            Loader.ShowCustomContent(Loader.containers[i]);
        });
        this.containers = [];
        this.action = 'show';
    },
    AddShowContainer : function(widget, id){
        this.containers.push({container: id, widgetName: widget});
    },
    SelectCustomContent : function(){
        var customContent = [];
        for(var name in Config.Containers){
            if(!Config.Containers[name].customClass){
                for(var i in Config.Containers[name]){
                    if($('#' + Config.Containers[name][i].widget).find('.' + Config.Containers[name][i].customClass).length > 0)
                        customContent[customContent.length] = '.' + Config.Containers[name][i].customClass;
                }
            }
            else{
                if($('#' + Config.Containers[name].widget).find('.' + Config.Containers[name].customClass).length > 0)
                    customContent[customContent.length] = '.' + Config.Containers[name].customClass;
            }
        }
        return customContent;
    },
    ShowCustomContent : function(block){
        var name = block.widgetName.charAt(0).toLowerCase() + block.widgetName.slice(1);
        name = name.replace(/Widget/, '');
        if(Config.Base.showCustomBlockOnDefault ||  Routing.IsDefault()){
            if(!Config.Containers[name].customClass){
                for(var i in Config.Containers[name]){
                    var t = $('#' + block.container).find('.' + Config.Containers[name][i].customClass);
                    if(t.length > 0){
                        t.show();
                    }
                }
            }
            else{
                var t = $('#' + block.container).find('.' + Config.Containers[name].customClass);
                if(t.length > 0){
                    t.show();
                }
            }
        }
    },
    ViewDefaultContent : function(){
        for(var key in Config.Containers){
            if(!Config.Containers[key].def){
                for(var key2 in Config.Containers[key]){
                    if(Config.Containers[key][key2].def){
                        if($("#" + Config.Containers[key][key2].def).length > 0){
                            if(key == 'content'){
                                for(var key3 in Config.Containers[key]){
                                    $("#" + Config.Containers[key][key3].def).children().show();
                                    $("#" + Config.Containers[key][key3].widget).children().hide();
                                }
                            }
                            else{
                                $("#" + Config.Containers[key][key2].def).children().show();
                                $("#" + Config.Containers[key][key2].widget).children().hide();
                            }
                        }
                    }
                }
            }
            else{
                if($("#" + Config.Containers[key].def).length > 0){
                    $("#" + Config.Containers[key].def).children().show();
                    $("#" + Config.Containers[key].widget).children().hide();
                }
            }
        }
    },
    HideDefaultContent : function(){
        for(var key in Config.Containers){
            if(!Config.Containers[key].def){
                for(var key2 in Config.Containers[key]){    
                    if(Config.Containers[key][key2].def){
                        if($("#" + Config.Containers[key][key2].def).length > 0){
                            $("#" + Config.Containers[key][key2].def).children().hide();
                        }
                    }
                }
            }
            else{
                if($("#" + Config.Containers[key].def).length > 0){
                    $("#" + Config.Containers[key].def).children().hide();
                }
            }
            
            if(!Config.Containers[key].customClass){
                for(var key2 in Config.Containers[key]){    
                    if(Config.Containers[key][key2].customClass){
                        if($("." + Config.Containers[key][key2].customClass).length > 0){
                            $("." + Config.Containers[key][key2].customClass).hide();
                        }
                    }
                }
            }
            else{
                if($("." + Config.Containers[key].customClass).length > 0){
                    $("." + Config.Containers[key].customClass).hide();
                }
            }
        }
    }
};

var Widget = function (){
    var self = this;
    self.version = 1.1;
    self.minCoreVersion = 1.0;
    self.maxCoreVersion = 2.0;
    this.isReady = false;
    this.widgetName = false;
    this.minTmplVersion = false;
    this.maxTmplVersion = false;
    this.settings = {
        hostApi : null,
        httpsHostApi : null,
        catalogPathApi : null,
        goodsPathApi : null,
        userPathApi : null,
        cartPathApi : null,
        favPathApi : null,
        geoPathApi : null,
        shopPathApi : null,
        orderPathApi : null,
        paymentPathApi : null,
        containerIdForTmpl : null
    };
    this.Init = function(widget, noindicate){
        if ( typeof JSCore !== 'undefined' && JSCore.isReady && typeof Loader !== 'undefined' && typeof Config !== 'undefined' && typeof Routing !== 'undefined' && typeof ko !== 'undefined'){
            
            if(JSCore.version >= self.minCoreVersion && JSCore.version <= self.maxCoreVersion){
                if(self.version >= widget.minWidgetVersion && self.version <= widget.maxWidgetVersion){
                    this.SelfInit();
                    if(!noindicate)
                        Loader.Indicator(widget.widgetName, false);
                    this.BaseLoad.Roots(function(){
                        widget.InitWidget();
                        self.widgetName = widget.widgetName;
                        self.minTmplVersion = widget.minTmplVersion;
                        self.maxTmplVersion = widget.maxTmplVersion;
                    });
                }
                else{
                    Loader.Indicator(widget.widgetName, true);
                    delete Loader.widgets[widget.widgetName];
                    Logger.Console.Exeption(widget.widgetName, 'Widget version = [' + self.version + ']. For correct work of the widget required version: min - [' + widget.minWidgetVersion + '] max - [' + widget.maxWidgetVersion + ']');
                }
            }
            else{
                Loader.Indicator(widget.widgetName, true);
                Logger.Console.Exeption('Widget', 'JSCore version = [' + JSCore.version + ']. For correct work of the widgets required version: min - [' + self.minCoreVersion + '] max - [' + self.maxCoreVersion + ']');
            }
        }else{
            setTimeout(function(){self.Init(widget, noindicate)}, 100);
        }
    };
    this.SelfInit = function(){
        if(!this.isReady){
            this.isReady = true;
            if(document.location.protocol == 'https:')
                Config.Base.hostApi = Config.Base.httpsHostApi;
            self.settings = {
                hostApi : Config.Base.hostApi,
                httpsHostApi : Config.Base.httpsHostApi,
                catalogPathApi : Config.Base.catalogPathApi,
                goodsPathApi : Config.Base.goodsPathApi,
                userPathApi : Config.Base.userPathApi,
                cartPathApi : Config.Base.cartPathApi,
                favPathApi : Config.Base.favPathApi,
                geoPathApi : Config.Base.geoPathApi,
                shopPathApi : Config.Base.shopPathApi,
                orderPathApi : Config.Base.orderPathApi,
                paymentPathApi : Config.Base.paymentPathApi,
                messagePathApi : Config.Base.messagePathApi,
                containerIdForTmpl : Config.Base.containerIdForTmpl
            };
            Parameters.pathToImages = Config.Base.pathToImages;
            Parameters.routIconAuction = Config.Base.routIconAuction;
            Parameters.sortingBlockContainer = Config.Base.sortingBlockContainer;
            Parameters.loading = Config.Base.loading;
            
            this.RegistrCustomBindings();
            this.UpdateSettings();
            Routing.ParserHash(true);
            this.Events();
            Parameters.shopId = JSSettings.inputParameters['shopId'];
        }
    };
    this.UpdateSettings = function(){
        if(typeof WParameters !== 'undefined'){
            for(var key in WParameters){
                if(WParameters[key].hasOwnProperty('tmpl')){
                    Config[key.charAt(0).toUpperCase() + key.slice(1)].tmpl.custom = WParameters[key].tmpl;
                }
                else{
                    for(var key2 in WParameters[key]){
                        if(WParameters[key][key2].hasOwnProperty('tmpl')){
                            Config[key.charAt(0).toUpperCase() + key.slice(1)].tmpl[key2].custom = WParameters[key][key2].tmpl;
                        }
                    }
                }
                
                if(WParameters[key].hasOwnProperty('container')){
                    if(WParameters[key].container.widget)
                        Config.Containers[key].widget = WParameters[key].container.widget;
                    if(WParameters[key].container.def)
                        Config.Containers[key].def = WParameters[key].container.def;
                    if(WParameters[key].container.customClass)
                        Config.Containers[key].customClass = WParameters[key].container.customClass;
                }
                else{
                    for(var key2 in WParameters[key]){
                        if(WParameters[key][key2].hasOwnProperty('container')){
                            if(WParameters[key][key2].container.widget)
                                Config.Containers[key][key2].widget = WParameters[key][key2].container.widget;
                            if(WParameters[key][key2].container.def)
                                Config.Containers[key][key2].def = WParameters[key][key2].container.def;
                            if(WParameters[key][key2].container.customClass)
                                Config.Containers[key][key2].customClass = WParameters[key][key2].container.customClass;
                        }
                    }
                }
            }
        }
    };
    this.Events = function(){       
        EventDispatcher.AddEventListener('widget.onload.script', function(data){
            window[data.options.widget].prototype = new Widget();
            var embed = new window[data.options.widget]();
            data.options.params['uniq'] = EventDispatcher.GetUUID();
            embed.SetParameters(data);
            embed.Init(embed, true);
        });
        
        EventDispatcher.AddEventListener('widget.onload.menuPersonalCabinet', function(opt){
            MenuPersonalCabinetWidget.prototype = new Widget();
            var menu = new MenuPersonalCabinetWidget();
            menu.AddMenu(opt);
            menu.Init(menu);
        });
        
        EventDispatcher.AddEventListener('widgets.favorites.add', function(data){
            var inputDate = data;
            if(Parameters.cache.userInformation && !Parameters.cache.userInformation.err){
                self.BaseLoad.AddToFavorite(data.goodsId, data.comment, function(data){
                    self.WidgetLoader(true);
                    if(data.result == 'ok'){
                        inputDate.data.IsFavorite(true);
                        self.ShowMessage(Config.CartGoods.message.addFavorites, false, false);
                        inputDate.data.Remove();
                    }
                    else{
                        self.ShowMessage(Config.CartGoods.message.failAddFavorites, false, false);
                    }
                });
            }
            else{
                self.ShowMessage(Config.Authentication.message.pleaseLogIn , false, false);
            }
        });
        
        EventDispatcher.AddEventListener('widgets.cart.addGoods', function(data){
            var sellerId = data.sellerId ? data.sellerId : false;
            var count = data.count ? data.count : false;
            var goodsId = data.goodsId;
            var hash = data.hash;
            self.BaseLoad.AddGoodsToCart(goodsId, sellerId, count, function(data){
                if(data.err){
                    self.ShowMessage(data.err, false, false);
                }
                else{
                    if(typeof AnimateAddToCart !== 'undefined')
                        new AnimateAddToCart(hash);
                    EventDispatcher.DispatchEvent('widgets.cart.infoUpdate', data);
                }
            });
        });
    };
    this.CreateContainer = function(){
        if($('#' + self.settings.containerIdForTmpl).length == 0)
            $('body').append("<div id='" + self.settings.containerIdForTmpl + "'></div>");
    };
    this.RegistrCustomBindings = function(){
        ko.bindingHandlers.embedWidget = {
            init: function(element, valueAccessor) {
                var options = valueAccessor() || {};
                self.BaseLoad.Script('widgets/' + options.widget + '.js', function(){
                    options.widget = options.widget.split('-')[0];
                    EventDispatcher.DispatchEvent('widget.onload.script', {element:element, options:options});
                });
            }
        };
    };
    this.WidgetLoader = function(test, container){
        Loader.Indicator(this.widgetName, test, container);
    };
    this.ShowContainer = function(id){
        Loader.AddShowContainer(this.widgetName, id);
    };
    this.HasDefaultContent = function(name, block){
        if(!name){
            name = this.widgetName.charAt(0).toLowerCase() + this.widgetName.slice(1);
            name = name.replace(/Widget/, '');
        }
        if(!Config.Containers[name].def){
            if(!block){
                for(var block in Config.Containers[name]){
                    if($('#' + Config.Containers[name][block].def).length > 0){
                        return true;
                        break;
                    }
                }
            }
            else{
                if($('#' + Config.Containers[name][block].def).length > 0)
                return true;
            }
        }
        else{
            if($('#' + Config.Containers[name].def).length > 0)
                return true;
        }
        return false;
    };
    this.SelectCustomContent = function(){
        var customContent = [];
        for(var name in Config.Containers){
            if(!Config.Containers[name].customClass){
                for(var i in Config.Containers[name]){
                    if($('#' + Config.Containers[name][i].widget).find('.' + Config.Containers[name][i].customClass).length > 0)
                        customContent[customContent.length] = '.' + Config.Containers[name][i].customClass;
                }
            }
            else{
                if($('#' + Config.Containers[name].widget).find('.' + Config.Containers[name].customClass).length > 0)
                    customContent[customContent.length] = '.' + Config.Containers[name].customClass;
            }
        }
        return customContent;
    };
    this.ScrollTop = function(elementId, speed){
        if(Loader.countAll == Loader.readyCount){
            $('html, body').animate({scrollTop: $("#" + elementId).offset().top}, speed); 
        }
        else{
            setTimeout(function() {self.ScrollTop(elementId);}, 100); 
        }
    };
    this.GetTmplName = function(name, block){
        var tmplName = '';
        if(name){
            if(!block){
                tmplName = this.settings.tmpl.id[name];
                if(this.settings.tmpl.custom && this.settings.tmpl.custom.id && this.settings.tmpl.custom.id[name])
                    tmplName = this.settings.tmpl.custom.id[name];
            }
            else{
                tmplName = this.settings.tmpl[block].id[name];
                if(this.settings.tmpl[block].custom && this.settings.tmpl[block].custom.id && this.settings.tmpl[block].custom.id[name])
                    tmplName = this.settings.tmpl[block].custom.id[name];
            }
        }
        else{
            if(!block){
                tmplName = this.settings.tmpl.id;
                if(this.settings.tmpl.custom && this.settings.tmpl.custom.id)
                    tmplName = this.settings.tmpl.custom.id;
            }
            else{
                tmplName = this.settings.tmpl[block].id;
                if(this.settings.tmpl[block].custom && this.settings.tmpl[block].custom.id)
                    tmplName = this.settings.tmpl[block].custom.id;
            }
        }
        return tmplName;
    };
    this.Exeption = function(text){
        Logger.Console.Exeption(this.widgetName, text);
    };
    this.QueryError = function(data, callback, callbackPost){
        if (data.err) {
            if($('#' + Config.Base.containerIdErrorWindow).length == 0){
                $('body').append(Config.Base.errorWindow);
            }
            
            var text = '';
            if(data.msg)
                text = data.msg;
            else
                text = data.err;
            
            $('#' + Config.Base.containerIdErrorWindow + ' #' + Config.Base.conteinerIdTextErrorWindow).text(text);
            
            $( "#" + Config.Base.containerIdErrorWindow ).dialog({
                modal: true,
                buttons: [
                    { text: "Повторить запрос", click: function(){
                        $( this ).dialog( "close" );
                        callback();
                        self.WidgetLoader(true);
                    }},
                    { text: "Закрыть", click: function() { 
                        $( this ).dialog( "close" ); 
                        if(callbackPost)
                            callbackPost();
                    }}
                ]
            });
            $('.ui-dialog-titlebar-close').hide();
            self.WidgetLoader(true);
            return false;
        }
        return true;
    };
    this.ShowMessage = function(message, callback, hide){
        if($('#' + Config.Base.containerIdMessageWindow).length == 0){
            $('body').append(Config.Base.containerMessage);
        }
        $('#' + Config.Base.containerIdMessageWindow + ' #' + Config.Base.conteinerIdTextMessageWindow).text(message);
            
        var button = [];
        if(!hide){
            button.push({ text: "Закрыть", click: function() { 
                    $( this ).dialog( "close" );
                    if(callback)
                        callback();
                }});
        }
        else{
            setTimeout(function() {
                $( "#" + Config.Base.containerIdMessageWindow ).dialog( "close" );
                if(callback)
                    callback();
            }, Config.Base.timeMessage);
        }
        
        $( "#" + Config.Base.containerIdMessageWindow ).dialog({
            modal: false,
            buttons: button
        });
        $('.ui-dialog-titlebar-close').hide();
    };
    this.Confirm = function(message, callbackOk, callbackFail){
        if($('#' + Config.Base.containerIdConfirmWindow).length == 0){
            $('body').append(Config.Base.containerConfirm);
        }
        $('#' + Config.Base.containerIdConfirmWindow + ' #' + Config.Base.conteinerIdTextConfirmWindow).text(message);
        
        $( "#" + Config.Base.containerIdConfirmWindow ).dialog({
            modal: true,
            buttons: [
                { text: "Ok", click: function(){
                    $( this ).dialog( "close" );
                    if(callbackOk)
                        callbackOk();
                }},
                { text: "Отменить", click: function() { 
                    $( this ).dialog( "close" ); 
                    if(callbackFail)
                        callbackFail();
                }}
            ]
        });
        $('.ui-dialog-titlebar-close').hide();
    };
    this.ErrorVertionTmpl = function(tmpl, hash, temp){
        var version = /<!-- version ([\d.]*) -->/;
        var result = temp.find('script#' + tmpl).html().match(version);
        if(result){
            if(parseFloat(result[1]) >= self.minTmplVersion && parseFloat(result[1]) <= self.maxTmplVersion)
                return false;
        }
        Parameters.cache.tmpl[hash] = 'error';
       
        Loader.Indicator(self.widgetName, true);
        delete Loader.widgets[self.widgetName];
        return true;
    };
    this.ProtocolPreparation = function(){
        var host = self.settings.hostApi;
        var protocol = false;
        if(Parameters.cache.https == "always" || Parameters.cache.https == "login"){
            host = self.settings.httpsHostApi;
            protocol = true;
        }
        return {host:host, protocol:protocol};
    };
    this.BaseLoad  = {
        Roots : function(callback){
            if(Parameters.cache.roots.length == 0){
                XDMTransport.Load.Data(encodeURIComponent(self.settings.hostApi + self.settings.catalogPathApi + Parameters.shopId + '/root/noblock/active/5/'), function(data){
                        Parameters.cache.roots = data;
                        var roots = data;
                        for(var i = 0; i <= roots.length-1; i++){
                            Parameters.cache.catalogs[roots[i].id] = roots[i].id;
                        }
                        if(callback)
                            callback(roots);
                });
            }
            else{
                if(callback)
                    callback(Parameters.cache.roots);
            }
        },
        Section : function(parentId, callback){
            if(!Parameters.cache.childrenCategory[parentId]){
                XDMTransport.Load.Data(encodeURIComponent(self.settings.hostApi + self.settings.catalogPathApi + parentId + '/children/noblock/active'), function(data){
                    Parameters.cache.childrenCategory[parentId] = data;
                    if(callback)
                        callback({
                            'data' : data, 
                            'parentId' : parentId
                        });
                });
            }
            else{
                if(callback)
                    callback({
                        'data' : Parameters.cache.childrenCategory[parentId], 
                        'parentId' : parentId
                    });
            }
        },
        Blocks : function(parentId, callback){
            if(!Parameters.cache.block[parentId]){
                XDMTransport.Load.Data(encodeURIComponent(self.settings.hostApi + self.settings.catalogPathApi + parentId + '/children/block/active'), function(data){
                    Parameters.cache.block[parentId] = data;
                    if(callback)
                        callback(data);
                });
            }
            else{
                if(callback)
                    callback(Parameters.cache.block[parentId]);
            }
        },
        Content : function(categoryId, query, callback){
            var queryHash = categoryId + EventDispatcher.HashCode(query);
            if(!Parameters.cache.content[queryHash]){
                XDMTransport.Load.Data(encodeURIComponent(self.settings.hostApi + self.settings.catalogPathApi + categoryId + '/goods/' + query), function(data){
                    Parameters.cache.content[queryHash] = {"categoryId" : categoryId , "content" : data};
                    if(callback)
                        callback(Parameters.cache.content[queryHash]);
                });
            }
            else{
                if(callback)
                    callback(Parameters.cache.content[queryHash]);
            }
        },
        SearchContent : function(shopId, query, callback){
            var queryHash = shopId + EventDispatcher.HashCode(query);
            if(!Parameters.cache.searchContent[queryHash]){
                XDMTransport.Load.Data(encodeURIComponent(self.settings.hostApi + self.settings.goodsPathApi + shopId + '/search/' + query), function(data){
                    Parameters.cache.searchContent[queryHash] = data;
                    if(callback)
                        callback(Parameters.cache.searchContent[queryHash]);
                });
            }
            else{
                if(callback)
                    callback(Parameters.cache.searchContent[queryHash]);
            }
        },
        Info : function(id, callback){
            if(!Parameters.cache.infoCategory[id]){
                XDMTransport.Load.Data(encodeURIComponent(self.settings.hostApi + self.settings.catalogPathApi + id + '/info/'), function(data){
                    Parameters.cache.infoCategory[id] = data;
                    if(callback)
                        callback(data);
                });
            }
            else{
                if(callback)
                    callback(Parameters.cache.infoCategory[id]);
            }
        },
        Tmpl : function(tmpl, callback){
            function Default (){
                var hash = EventDispatcher.HashCode(tmpl.path);
                if(!Parameters.cache.tmpl[hash]){
                    self.CreateContainer();
                    XDMTransport.Load.Tmpl(tmpl.path,function(data){
                        if(data){
                            var id = 'temp_' + hash;
                            var temp = $('<div id="' + id + '"></div>');
                            temp.append(data);
                            
                            if($.type(tmpl.id) == 'object'){
                                for(var key in tmpl.id){
                                    if(self.ErrorVertionTmpl(tmpl.id[key], hash, temp)){
                                        Logger.Console.Exeption(self.widgetName, 'Error of the template - [' + tmpl.path + ']. No valid version for [' + key + '] - [' + tmpl.id[key] + ']. Required min [' + self.minTmplVersion + '] max [' + self.maxTmplVersion+ ']');
                                        temp.remove();
                                        return false;
                                        break;
                                    }
                                }
                            }
                            else{
                               if(self.ErrorVertionTmpl(tmpl.id, hash, temp)){
                                    Logger.Console.Exeption(self.widgetName, 'Error of the template - [' + tmpl.path + ']. No valid version - [' + tmpl.id + ']. Required min [' + self.minTmplVersion + '] max [' + self.maxTmplVersion+ ']');
                                    temp.remove();
                                    return false;
                                }
                            }
                            Parameters.cache.tmpl[hash] = 'ok';
                            temp.remove();
                            $("#" + self.settings.containerIdForTmpl).append(data);
                            if(callback)callback();
                        }
                    });
                }
                else{
                    if(Parameters.cache.tmpl[hash] != 'error')
                        if(callback)callback();
                }
            };
            function Custom (){
                var hash = EventDispatcher.HashCode(tmpl.custom.path);
                if(!Parameters.cache.tmpl[hash]){
                    self.CreateContainer();
                    XDMTransport.Load.Tmpl(tmpl.custom.path,function(data){
                        if(data){
                            var id = 'temp_' + hash;
                            var temp = $('<div id="' + id + '"></div>');
                            temp.append(data);
                            
                            if(tmpl.custom.id){
                                if($.type(tmpl.id) == 'object'){
                                    if($.type(tmpl.custom.id) == 'object'){
                                        for(var key in tmpl.id){
                                            if(!tmpl.custom.id[key]){
                                                tmpl.custom.id[key] = tmpl.id[key];
                                            }
                                            if((tmpl.custom.id[key] && temp.find('script#' + tmpl.custom.id[key]).length != 1)){
                                                Logger.Console.Exeption(self.widgetName, 'Settings id for tmpl - [' + tmpl.custom.path + ']. No search template for [' + key + '] - [' + tmpl.custom.id[key] + ']');
                                                temp.remove();
                                                delete tmpl.custom;
                                                Default ();
                                                return false;
                                                break;
                                            }
                                            if(self.ErrorVertionTmpl(tmpl.custom.id[key], hash, temp)){
                                                Logger.Console.Exeption(self.widgetName, 'Error of the template - [' + tmpl.custom.path + ']. No valid version for [' + key + '] - [' + tmpl.custom.id[key] + ']. Required min [' + self.minTmplVersion + '] max [' + self.maxTmplVersion+ ']');
                                                return false;
                                                break;
                                            }
                                        }
                                    }
                                    else{
                                        Logger.Console.Exeption(self.widgetName, 'Settings id for tmpl - [' + tmpl.custom.path + ']');
                                        temp.remove();
                                        delete tmpl.custom;
                                        Default ();
                                        return false;
                                    }
                                }   
                                else{
                                    if($(data).find('script#' + tmpl.custom.id).length != 1){
                                        Logger.Console.Exeption(self.widgetName,'Settings id for tmpl - [' + tmpl.custom.path + ']. No search template with id [' + tmpl.custom.id + ']');
                                        temp.remove();
                                        delete tmpl.custom;
                                        Default ();
                                        return false;
                                    }
                                    if(self.ErrorVertionTmpl(tmpl.custom.id, hash, temp)){
                                        Logger.Console.Exeption(self.widgetName, 'Error of the template - [' + tmpl.custom.path + ']. No valid version - [' + tmpl.custom.id + ']. Required min [' + self.minTmplVersion + '] max [' + self.maxTmplVersion+ ']');
                                        temp.remove();
                                        delete tmpl.custom;
                                        Default ();
                                        return false;
                                    }
                                }
                            }
                            else{
                                if($.type(tmpl.id) == 'object'){
                                    for(var key in tmpl.id){
                                        if(temp.find('script#' + tmpl.id[key]).length != 1){
                                            Logger.Console.Exeption(self.widgetName,'Settings id for tmpl - [' + tmpl.custom.path + ']. No search template with id [' + tmpl.id[key] + ']');
                                            temp.remove();
                                            delete tmpl.custom;
                                            Default ();
                                            return false;
                                            break;
                                        }
                                        if(self.ErrorVertionTmpl(tmpl.id[key], hash, temp)){
                                            Logger.Console.Exeption(self.widgetName, 'Error of the template - [' + tmpl.custom.path + ']. No valid version for [' + key + '] - [' + tmpl.id[key] + ']. Required min [' + self.minTmplVersion + '] max [' + self.maxTmplVersion+ ']');
                                            temp.remove();
                                            delete tmpl.custom;
                                            Default ();
                                            return false;
                                            break;
                                        }
                                    }
                                }   
                                else{
                                    if(temp.find('script#' + tmpl.id).length != 1){
                                        Logger.Console.Exeption(self.widgetName,'Settings id for tmpl - [' + tmpl.path + ']. No search template with id [' + tmpl.id + ']');
                                        temp.remove();
                                        Default ();
                                        return false;
                                    }
                                    if(self.ErrorVertionTmpl(tmpl.id, hash, temp)){
                                        Logger.Console.Exeption(self.widgetName, 'Error of the template - [' + tmpl.custom.path + ']. No valid version - [' + tmpl.id + ']. Required min [' + self.minTmplVersion + '] max [' + self.maxTmplVersion+ ']');
                                        temp.remove();
                                        delete tmpl.custom;
                                        Default ();
                                        return false;
                                    }
                                }
                            }
                            Parameters.cache.tmpl[hash] = 'ok';
                            temp.remove();
                            $("#" + self.settings.containerIdForTmpl).append(data);
                            if(callback)callback();
                        }
                        else{
                            Logger.Console.Exeption(self.widgetName,'Error load file template - ' + tmpl.custom.path);
                            delete tmpl.custom;
                            Default ();
                        }
                    });
                }
                else{
                    if(Parameters.cache.tmpl[hash] != 'error')
                        if(callback)callback();
                }
            };
            
            
            if(tmpl.custom && tmpl.custom.path){
                Custom();
            }
            else{
                Default();
            }
        },
        Path : function(categoryId, callback){
            if(categoryId){
                if(!Parameters.cache.path[categoryId]){
                    XDMTransport.Load.Data(encodeURIComponent(self.settings.hostApi + self.settings.catalogPathApi + categoryId + '/path'), function(data){
                        Parameters.cache.path[categoryId] = data;
                        if(callback)
                            callback(data['path']);
                    });
                }
                else{
                    if(callback)
                        callback(Parameters.cache.path[categoryId]['path']);
                }
            }
        },
        GoodsInfo : function(id, infoBlock, callback){
            if(!Parameters.cache.goodsInfo[id]){
                XDMTransport.Load.Data(encodeURIComponent(self.settings.hostApi + self.settings.goodsPathApi+ id +'/info/' + infoBlock + '/'), function(data){
                    Parameters.cache.goodsInfo[id] = data;
                    if(callback)
                        callback(data);
                });
            }
            else{
                if(callback)
                    callback(Parameters.cache.goodsInfo[id]);
            }
        },
        Script : function(script, callback){
            if(!Parameters.cache.scripts[EventDispatcher.HashCode(script)]){
                if(!$.isArray(script))
                    script = [script];
                JSLoader.Load(script, callback);
            }
            else{
                if(callback)callback();
            }
        },
        RelatedGoods : function(id, query, callback){
            var queryHash = id + EventDispatcher.HashCode(query);
            if(!Parameters.cache.relatedGoods[queryHash]){
                XDMTransport.Load.Data(encodeURIComponent(self.settings.hostApi + self.settings.goodsPathApi+ id +'/link/' + query + '/'), function(data){
                    Parameters.cache.relatedGoods[queryHash] = data;
                    if(callback)
                        callback(data);
                });
            }
            else{
                if(callback)
                    callback(Parameters.cache.relatedGoods[queryHash]);
            }
        },
        LoginForProxy : function(){
            var opt = self.ProtocolPreparation();
            XDMTransport.Load.FromProxy({
                url : encodeURIComponent(opt.host + self.settings.userPathApi + 'login/'),
                protocol : opt.protocol,
                callback : function(data){}
            })
        },
        Login : function(username, password, remember_me, callback){
            if(Parameters.cache.userInformation == null || Parameters.cache.userInformation.err){
                var opt = self.ProtocolPreparation();
                var str = "";
                if(username && password)
                    str = '?username=' + encodeURIComponent(username) + '&password=' + encodeURIComponent(password) +'&remember_me=' + remember_me;
                XDMTransport.Load.Data(encodeURIComponent(opt.host + self.settings.userPathApi + 'login/' + str), function(data){
                    Parameters.cache.userInformation = data;
                    if(callback)
                        callback(data);
                }, opt.protocol);
            }
            else{
                if(callback)
                    callback(Parameters.cache.userInformation);
            }
        },
        Logout : function(callback){
            XDMTransport.Load.Data(encodeURIComponent(self.settings.hostApi + self.settings.userPathApi + 'logout'), function(data){
                Parameters.cache.userInformation = null;
                if(callback)
                    callback(data);
            });
        },
        CartInfo : function(seller, callback){
            var opt = self.ProtocolPreparation();
            XDMTransport.Load.Data(opt.host + self.settings.cartPathApi + 'calc/' + Parameters.shopId + '/' + seller, function(data){
                if(callback)
                    callback(data);
            }, opt.protokol);
        },
        CartGoods : function(seller, callback){
            var opt = self.ProtocolPreparation();
            XDMTransport.Load.Data(opt.host + self.settings.cartPathApi + 'info/' + Parameters.shopId + '/' + seller, function(data){
                if(callback)
                    callback(data);
            }, opt.protokol);
        },
        AddGoodsToCart : function(idGoods, sellerId, count, callback){
            var opt = self.ProtocolPreparation();
            
            var str = '';
            if(sellerId){
                str = sellerId + '/';
                if(count >= 0)
                    str = str + count;
            }
            
            XDMTransport.Load.Data(opt.host + self.settings.cartPathApi + 'add/' + Parameters.shopId + '/' + idGoods + '/' + str, function(data){
                if(callback)
                    callback(data);
            }, opt.protokol);
        },
        AddToFavorite : function(goodId, comment, callback){
            var opt = self.ProtocolPreparation();
            var str = '';
            if(comment)
               str = '/' + encodeURIComponent(comment);
            str = str + '/?idGoods=' + goodId
            XDMTransport.Load.Data(encodeURIComponent(opt.host + self.settings.favPathApi + 'add/' + Parameters.shopId + str), function(data){
                if(callback)
                    callback(data);
            }, opt.protokol);
        },
        ClearFavorite : function(str, callback){
            XDMTransport.Load.Data(encodeURIComponent(self.settings.httpsHostApi + self.settings.favPathApi + 'clear/' + Parameters.shopId + '/' + str), function(data){
                if(callback)
                    callback(data);
            }, true);
        },
        InfoFavorite : function(fully, callback){
            var opt = self.ProtocolPreparation();
            XDMTransport.Load.Data(opt.host + self.settings.favPathApi + 'info/' + Parameters.shopId + '/' + fully + '/' , function(data){
                if(callback)
                    callback(data);
            }, opt.protokol);
        },
        ClearCart : function(sellerId, goodsId, callback){
            var opt = self.ProtocolPreparation();
            
            var str = '';
            if(sellerId){
                str = sellerId + '/';
                if(goodsId){
                    str = str + '?idGoods=' + goodsId;
                }
            }
            XDMTransport.Load.Data(opt.host + self.settings.cartPathApi + 'clear/' + Parameters.shopId + '/' + str, function(data){
                if(callback)
                    callback(data);
            }, opt.protokol);
        },
        UniqueUser : function(str, callback){ 
            XDMTransport.Load.Data(encodeURIComponent(self.settings.httpsHostApi + self.settings.userPathApi + 'unique/' + str), function(data){
                if(callback)
                    callback(data);
            }, true);
        },
        Registration : function( str, callback){
            XDMTransport.Load.Data(encodeURIComponent(self.settings.httpsHostApi + self.settings.userPathApi + 'reg/' + Parameters.shopId + '/' + str), function(data){
                if(callback)
                    callback(data);
            }, true);
        },
        ActivateUser : function(str, callback){
            XDMTransport.Load.Data(encodeURIComponent(self.settings.httpsHostApi + self.settings.userPathApi + 'rega/' + str), function(data){
                if(callback)
                    callback(data);
            }, true);
        },
        EditProfile : function(form, callback){
            if(form.find('#registration_data_query').length == 0)
                form.append('<input type="text" id="registration_data_query" style="display: none" name="query" value="' + self.settings.hostApi + self.settings.userPathApi + 'edit/profile/"/>');
            EventDispatcher.AddEventListener(EventDispatcher.HashCode(form.toString()), function(data){
                callback(data)
            });
            XDMTransport.Load.DataPost(form, true);
        },
        ProfileInfo : function(callback){
            if($.isEmptyObject(Parameters.cache.profile.info)){
                XDMTransport.Load.Data(encodeURIComponent(self.settings.httpsHostApi + self.settings.userPathApi + 'info/'), function(data){
                    Parameters.cache.profile.info = data;
                    if(callback)
                        callback(data);
                }, true);
            }
            else
                callback(Parameters.cache.profile.info);
        },
        Profile : function(callback){
            if($.isEmptyObject(Parameters.cache.profile.personal)){
                XDMTransport.Load.Data(encodeURIComponent(self.settings.httpsHostApi + self.settings.userPathApi + 'profile/'), function(data){
                    Parameters.cache.profile.personal = data;
                    if(callback)
                        callback(data);
                }, true);
            }
            else
                callback(Parameters.cache.profile.personal);
        },
        EditContacts : function(str, callback){
            XDMTransport.Load.Data(encodeURIComponent(self.settings.httpsHostApi + self.settings.userPathApi + 'edit/contact/' + Parameters.shopId + '/' + str), function(data){
                if(callback)
                    callback(data);
            }, true);
        },
        SendToken : function(type, callback){
            XDMTransport.Load.Data(encodeURIComponent(self.settings.httpsHostApi + self.settings.userPathApi + 'code/' + Parameters.shopId + '/' + type), function(data){
                if(callback)
                    callback(data);
            }, true);
        },
        Country : function(shopId, callback){
            if(!Parameters.cache.country){
                XDMTransport.Load.Data(encodeURIComponent(self.settings.httpsHostApi + self.settings.geoPathApi + shopId  + '/country'), function(data){
                    Parameters.cache.country = data;
                    if(callback)
                        callback(data);
                }, true);
            }
            else
                callback(Parameters.cache.country);
        },
        Region: function(str, callback){
            XDMTransport.Load.Data(encodeURIComponent(self.settings.httpsHostApi + self.settings.geoPathApi + Parameters.shopId  + '/region/' + str), function(data){
                if(callback)
                    callback(data);
            }, true);
        },
        City : function(str, callback){
            XDMTransport.Load.Data(encodeURIComponent(self.settings.httpsHostApi + self.settings.geoPathApi + Parameters.shopId  + '/city/' + str), function(data){
                if(callback)
                    callback(data);
            }, true);
        },
        Street : function(str, callback){
            XDMTransport.Load.Data(encodeURIComponent(self.settings.httpsHostApi + self.settings.geoPathApi + Parameters.shopId  + '/street/' + str), function(data){
                if(callback)
                    callback(data);
            }, true);
        },
        EditAddress : function(str, callback){
            XDMTransport.Load.Data(encodeURIComponent(self.settings.httpsHostApi + self.settings.userPathApi + 'edit/address/' + str), function(data){
                if(callback)
                    callback(data);
            }, true);
        },
        DeliveryAddressList : function(callback){
            if(!Parameters.cache.delivery){
                XDMTransport.Load.Data(encodeURIComponent(self.settings.httpsHostApi + self.settings.userPathApi  + 'geo/info'), function(data){
                    Parameters.cache.delivery = data;
                    if(callback)
                        callback(data);
                }, true);
            }
            else
                callback(Parameters.cache.delivery);
        },
        ChangePassword : function(form, callback){
            if(form.find('#change_password_query').length == 0)
                form.append('<input type="text" id="change_password_query" style="display: none" name="query" value="' + self.settings.hostApi + self.settings.userPathApi + 'npass/"/>');
            EventDispatcher.AddEventListener(EventDispatcher.HashCode(form.toString()), function(data){
                callback(data)
            });
            XDMTransport.Load.DataPost(form, true);
        },
        AddDelivaryAddress : function(str, callback){
            XDMTransport.Load.Data(encodeURIComponent(self.settings.httpsHostApi + self.settings.userPathApi + 'geo/add/' + str), function(data){
                if(callback)
                    callback(data);
            }, true);
        },
        EditDelivaryAddress : function(str, callback){
            XDMTransport.Load.Data(encodeURIComponent(self.settings.httpsHostApi + self.settings.userPathApi + 'geo/edit/' + str), function(data){
                if(callback)
                    callback(data);
            }, true);
        },
        SetDefaultDelivaryAddress : function(str, callback){
            XDMTransport.Load.Data(encodeURIComponent(self.settings.httpsHostApi + self.settings.userPathApi + 'geo/default/' + str), function(data){
                if(callback)
                    callback(data);
            }, true);
        },
        DeleteDeliveryAddress : function(str, callback){
            XDMTransport.Load.Data(encodeURIComponent(self.settings.httpsHostApi + self.settings.userPathApi + 'geo/del/' + str), function(data){
                if(callback)
                    callback(data);
            }, true);
        },
        Shipping : function(str, callback){
            XDMTransport.Load.Data(encodeURIComponent(self.settings.httpsHostApi + self.settings.shopPathApi + 'shipping/' + Parameters.shopId + '/' + str), function(data){
                Parameters.cache.shipping = data;
                if(callback)
                    callback(data);
            }, true);
        },
        NewOrder : function(str, callback){
            XDMTransport.Load.Data(encodeURIComponent(self.settings.httpsHostApi + self.settings.orderPathApi + 'add/' + Parameters.shopId + '/' + str), function(data){
                Parameters.cache.orderList = null;
                if(callback)
                    callback(data);
            }, true);
        },
        EditOrder : function(str, callback){
            XDMTransport.Load.Data(encodeURIComponent(self.settings.httpsHostApi + self.settings.orderPathApi + 'edit/' + str), function(data){
                Parameters.cache.orderList = null;
                if(callback)
                    callback(data);
            }, true);
        },
        Payment : function(str, callback){
            XDMTransport.Load.Data(encodeURIComponent(self.settings.httpsHostApi + self.settings.shopPathApi + 'payment/' + Parameters.shopId + '/' + str), function(data){
                Parameters.cache.payment = data;
                if(callback)
                    callback(data);
            }, true);
        },
        OrderInfo : function(str, callback){
            XDMTransport.Load.Data(encodeURIComponent(self.settings.httpsHostApi + self.settings.orderPathApi + 'info/' + str), function(data){
                if(callback)
                    callback(data);
            }, true);
        },
        ConfirmOrder : function(str, callback){
            XDMTransport.Load.Data(encodeURIComponent(self.settings.httpsHostApi + self.settings.orderPathApi + 'confirm/' + str), function(data){
                Parameters.cache.orderList = null;
                if(callback)
                    callback(data);
            }, true);
        },
        DeleteOrder : function(str, callback){
            XDMTransport.Load.Data(encodeURIComponent(self.settings.httpsHostApi + self.settings.orderPathApi + 'delete/' + str), function(data){
                Parameters.cache.orderList = null;
                if(callback)
                    callback(data);
            }, true);
        },
        OrderList : function(callback){
            if(!Parameters.cache.orderList){
                XDMTransport.Load.Data(encodeURIComponent(self.settings.httpsHostApi + self.settings.orderPathApi + 'user/' + Parameters.shopId), function(data){
                    Parameters.cache.orderList = data;
                    if(callback)
                        callback(data);
                }, true);
            }
            else
                callback(Parameters.cache.orderList);
        },
        RepeatOrder : function(str, callback){
            XDMTransport.Load.Data(encodeURIComponent(self.settings.httpsHostApi + self.settings.orderPathApi + 'repeat/' + str), function(data){
                Parameters.cache.orderList = null;
                if(callback)
                    callback(data);
            }, true);
        },
        ReturnOrder : function(str, callback){
            XDMTransport.Load.Data(encodeURIComponent(self.settings.httpsHostApi + self.settings.orderPathApi + 'return/' + str), function(data){
                Parameters.cache.orderList = null;
                if(callback)
                    callback(data);
            }, true);
        },
        CancelOrder : function(str, callback){
            XDMTransport.Load.Data(encodeURIComponent(self.settings.httpsHostApi + self.settings.orderPathApi + 'cancel/' + str), function(data){
                Parameters.cache.orderList = null;
                if(callback)
                    callback(data);
            }, true);
        },
        InvoicesOrder : function(str, callback){
            XDMTransport.Load.Data(encodeURIComponent(self.settings.httpsHostApi + self.settings.paymentPathApi + 'order/' + str), function(data){
                Parameters.cache.orderList = null;
                if(callback)
                    callback(data);
            }, true);
        },
        InvoicesGoods : function(str, callback){
            XDMTransport.Load.Data(encodeURIComponent(self.settings.httpsHostApi + self.settings.paymentPathApi + 'goods/' + str), function(data){
                Parameters.cache.orderList = null;
                if(callback)
                    callback(data);
            }, true);
        },
        InvoicesAmount : function(str, callback){
            XDMTransport.Load.Data(encodeURIComponent(self.settings.httpsHostApi + self.settings.paymentPathApi + 'amount/' + str), function(data){
                Parameters.cache.orderList = null;
                if(callback)
                    callback(data);
            }, true);
        },
        
        TopicList : function(str, callback){
            XDMTransport.Load.Data(encodeURIComponent(self.settings.httpsHostApi + self.settings.messagePathApi + 'topic/list/' + str), function(data){
                Parameters.cache.message.topicList = data;
                if(callback)
                    callback(data);
            }, true);
        },
        TopicCount : function(str, callback){
            XDMTransport.Load.Data(encodeURIComponent(self.settings.httpsHostApi + self.settings.messagePathApi + 'topic/count' + str), function(data){
                Parameters.cache.message.topicCount = null;
                if(callback)
                    callback(data);
            }, true);
        },
        TopicInfo : function(id, fullInfo, callback){
            if(!fullInfo)
                fullInfo = 'unread';
            XDMTransport.Load.Data(encodeURIComponent(self.settings.httpsHostApi + self.settings.messagePathApi + 'topic/count/' + id + '/' + fullInfo), function(data){
                Parameters.cache.message.topicInfo = null;
                if(callback)
                    callback(data);
            }, true);
        },
        TopicRead : function(id, callback){
            XDMTransport.Load.Data(encodeURIComponent(self.settings.httpsHostApi + self.settings.messagePathApi + 'topic/read/' + id), function(data){
                if(callback)
                    callback(data);
            }, true);
        },
        TopicDelete : function(id, callback){
            XDMTransport.Load.Data(encodeURIComponent(self.settings.httpsHostApi + self.settings.messagePathApi + 'topic/delete/' + id), function(data){
                if(callback)
                    callback(data);
            }, true);
        },
        MessageInfo : function(id, callback){
            XDMTransport.Load.Data(encodeURIComponent(self.settings.httpsHostApi + self.settings.messagePathApi + 'info/' + id), function(data){
                Parameters.cache.message.messageInfo = null;
                if(callback)
                    callback(data);
            }, true);
        },
        MessageSetRead : function(id, callback){
            XDMTransport.Load.Data(encodeURIComponent(self.settings.httpsHostApi + self.settings.messagePathApi + 'read/' + id), function(data){
                if(callback)
                    callback(data);
            }, true);
        },
        MessageSetUnread : function(id, callback){
            XDMTransport.Load.Data(encodeURIComponent(self.settings.httpsHostApi + self.settings.messagePathApi + 'unread/' + id), function(data){
                if(callback)
                    callback(data);
            }, true);
        },
        MessageAdd : function(str, callback){
            XDMTransport.Load.Data(encodeURIComponent(self.settings.httpsHostApi + self.settings.messagePathApi + 'add/' + str), function(data){
                if(callback)
                    callback(data);
            }, true);
        },
        MessageDelete : function(id, callback){
            XDMTransport.Load.Data(encodeURIComponent(self.settings.httpsHostApi + self.settings.messagePathApi + 'delete/' + id), function(data){
                if(callback)
                    callback(data);
            }, true);
        }
    };
};