var Parameters = {
    pathToImages : null,
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
        infoSellerCollection: {},
        infoShop: {},
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
        regSeller : {
            step1 : {},
            step2 : {},
            step3 : {}
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
        orderList : {},
        profile : {
            personal : {},
            delivery : {},
            security : {},
            info : {}
        },
        profileMenu : null,
        message : {
            topicList : {},
            topicCount : {},
            topicInfo : {},
            messageInfo : {},
            countNewMessage : null
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
            if(JSSettings.dev)
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
                    $("body").addClass('loading').append('<div id="loadingContainer"></div>');
        }
        else{
            this.ShowContent();
            $('#loadingContainer').remove();
            $("body").removeClass('loading');
            EventDispatcher.DispatchEvent('w.ready');
        }
    },
    InsertContainer : function(container){
        $(container).append('<div style="width: 100%;text-align: center;padding: 15px 0;"><img src="' + Parameters.loading + '"/></div>');
    },
    HideContent : function(){
        if(this.action != 'hide'){
            this.action = 'hide';
            for(var key in Config.Containers){
                if(!Config.Containers[key].widget){
                    for(var i in Config.Containers[key]){
                        if(!Config.Containers[key][i].widget){
                            for(var j in Config.Containers[key][i]){
                                $("#" + Config.Containers[key][i][j].widget).children().hide();
                            }
                        }
                        else
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
            var children =  $('#' + Loader.containers[i].container).children();
            if(children)
                children.show();
            Loader.ShowCustomContent(Loader.containers[i]);
        });
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
        if ( typeof JSCore == 'object' && JSCore.isReady && typeof Loader == 'object' && typeof Config == 'object' && typeof Routing == 'object' && typeof ko == 'object'){
            if(JSCore.version >= self.minCoreVersion && JSCore.version <= self.maxCoreVersion){
                if(self.version >= widget.minWidgetVersion && self.version <= widget.maxWidgetVersion){
                    this.SelfInit();
                    if(!noindicate)
                        Loader.Indicator(widget.widgetName, false);
                        widget.InitWidget();
                        self.widgetName = widget.widgetName;
                        self.minTmplVersion = widget.minTmplVersion;
                        self.maxTmplVersion = widget.maxTmplVersion;
                }
                else{
                    Loader.Indicator(widget.widgetName, true);
                    delete Loader.widgets[widget.widgetName];
                    Logger.Console.Exception(widget.widgetName, 'Widget version = [' + self.version + ']. For correct work of the widget required version: min - [' + widget.minWidgetVersion + '] max - [' + widget.maxWidgetVersion + ']');
                }
            }
            else{
                Loader.Indicator(widget.widgetName, true);
                Logger.Console.Exception('Widget', 'JSCore version = [' + JSCore.version + ']. For correct work of the widgets required version: min - [' + self.minCoreVersion + '] max - [' + self.maxCoreVersion + ']');
            }
        }else{
            setTimeout(function(){self.Init(widget, noindicate)}, 100);
        }
    };
    this.SelfInit = function(){
        if(!this.isReady){
            this.isReady = true;
            self.settings = {
                hostApi : JSSettings.protocolHTTPS + JSSettings.hostApi,
                httpsHostApi : JSSettings.protocolHTTPS + JSSettings.hostApi,
                catalogPathApi : JSSettings.catalogPathApi,
                goodsPathApi : JSSettings.goodsPathApi,
                userPathApi : JSSettings.userPathApi,
                cartPathApi : JSSettings.cartPathApi,
                favPathApi : JSSettings.favPathApi,
                geoPathApi : JSSettings.geoPathApi,
                shopPathApi : JSSettings.shopPathApi,
                orderPathApi : JSSettings.orderPathApi,
                paymentPathApi : JSSettings.paymentPathApi,
                messagePathApi : JSSettings.messagePathApi,
                containerIdForTmpl : Config.Base.containerIdForTmpl
            };
            Parameters.cache.message.countNewMessage = ko.observable();
            Parameters.sortingBlockContainer = Config.Base.sortingBlockContainer;
            
            Parameters.loading = Config.Base.loading;
            if(JSSettings.inputParameters['imgLoader'])
                Parameters.loading = JSSettings.inputParameters['imgLoader'];
            
            this.RegistrCustomBindings();
            this.UpdateSettings();
            Routing.ParserHash(true);
            this.Events();
            Parameters.shopId = JSSettings.inputParameters['shopId'];
        }
    };
    this.CheckNameConfigParameter = function(config, name){
        try{
            var parameter = config[name];
            return parameter;
        }
        catch(e){
            this.Exception('Error. Non-existent parameter [' + config.toString() + '[' + name + ']]');
            return false;
        }
    };
    this.UpdateSettings = function(){
        if(typeof WParameters !== 'undefined'){
            for(var key in WParameters){
                if(WParameters[key].hasOwnProperty('tmpl')){
                    var parameter = this.CheckNameConfigParameter(Config, key.charAt(0).toUpperCase() + key.slice(1));
                    if(parameter)
                        parameter.tmpl.custom = WParameters[key].tmpl;
                }
                else{
                    for(var key2 in WParameters[key]){
                        if(WParameters[key][key2].hasOwnProperty('tmpl')){
                            var parameter = this.CheckNameConfigParameter(Config, key.charAt(0).toUpperCase() + key.slice(1));
                            if(parameter){
                                var parameter = this.CheckNameConfigParameter(parameter.tmpl, key2);
                                if(parameter)
                                    parameter.custom = WParameters[key][key2].tmpl;
                            }
                        }
                    }
                }
                
                if(WParameters[key].hasOwnProperty('container')){
                    var parameter = this.CheckNameConfigParameter(Config.Containers, key);
                    if(parameter){
                        if(WParameters[key].container.widget)
                            parameter.widget = WParameters[key].container.widget;
                        if(WParameters[key].container.def)
                            parameter.def = WParameters[key].container.def;
                        if(WParameters[key].container.customClass)
                            parameter.customClass = WParameters[key].container.customClass;
                    }
                }
                else{
                    for(var key2 in WParameters[key]){
                        if(WParameters[key][key2].hasOwnProperty('container')){
                            var parameter = this.CheckNameConfigParameter(Config.Containers, key);
                            if(parameter){
                                var parameter = this.CheckNameConfigParameter(parameter, key2);
                                if(WParameters[key][key2].container.widget)
                                    parameter.widget = WParameters[key][key2].container.widget;
                                if(WParameters[key][key2].container.def)
                                    parameter.def = WParameters[key][key2].container.def;
                                if(WParameters[key][key2].container.customClass)
                                    parameter.customClass = WParameters[key][key2].container.customClass;
                            }
                        }
                    }
                }
            }
        }
    };
    this.Events = function(){
        EventDispatcher.AddEventListener('w.ready', function(){
            Routing.CheckRoute();
        });

        EventDispatcher.AddEventListener('w.onload.script', function(data){
            window[data.options.widget].prototype = new Widget();
            var embed = new window[data.options.widget]();
            data.options.params['uniq'] = EventDispatcher.GetUUID();
            embed.SetParameters(data);
            embed.Init(embed, true);
        });
        
        EventDispatcher.AddEventListener('w.onload.menu', function(opt){
            if(!Parameters.cache.profileMenu){
                MenuPersonalCabinetWidget.prototype = new Widget();
                Parameters.cache.profileMenu = new MenuPersonalCabinetWidget();
                Parameters.cache.profileMenu.Init(Parameters.cache.profileMenu);
            }
            Parameters.cache.profileMenu.CheckRouteMenuProfile();
            Parameters.cache.profileMenu.AddMenu(opt);
        });
        
        EventDispatcher.AddEventListener('w.fav.add', function(data){
            var inputDate = data;
            if(Parameters.cache.userInformation && !Parameters.cache.userInformation.err){
                self.BaseLoad.AddToFavorite(data.goodsId, data.comment, function(data){
                    self.WidgetLoader(true);
                    if(data.result == 'ok'){
                        if($.isArray(inputDate.data)){
                            $.each(inputDate.data, function(i){
                                inputDate.data[i].IsFavorite(true);
                            });
                        }
                        else
                            inputDate.data.IsFavorite(true);
                        self.ShowMessage(Config.CartGoods.message.addFavorites, false, false);
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
        
        EventDispatcher.AddEventListener('w.cart.add', function(data){
            var sellerId = data.sellerId ? data.sellerId : false;
            var count = data.count ? data.count : false;
            var goodsId = data.goodsId;
            self.BaseLoad.AddGoodsToCart(goodsId, sellerId, count, function(data){
                if(data.err){
                    self.ShowError(data.err, false, false);
                }
                else{
                    self.ShowMessage('Товар успешно добавлен в корзину', function(){
                        EventDispatcher.DispatchEvent('widgets.cart.infoUpdate', data);
                    }, false);
                }
            });
        });
        
        EventDispatcher.AddEventListener('w.change.count.mess', function() {
            self.BaseLoad.MessageCountUnread(
                function(data){
                    Parameters.cache.message.countNewMessage(data.count_unread_topic);
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
                var widgetName = options.widget.split('-');
                if(typeof(window[widgetName[0]]) == 'function'){
                    options.widget = widgetName[0];
                    EventDispatcher.DispatchEvent('w.onload.script', {element: element, options: options});
                }
                else {
                    self.BaseLoad.Script('widgets/' + options.widget + '.js', function () {
                        options.widget = options.widget.split('-')[0];
                        EventDispatcher.DispatchEvent('w.onload.script', {element: element, options: options});
                    });
                }
            }
        };
        ko.global = {
            route : Routing.route
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
    this.Exception = function(text, exeption){
        Logger.Console.Exception(this.widgetName, text, exeption);
    };
    this.NewModal = function(type, message, callback, callbackFail, hide){
        self.BaseLoad.Script('widgets/ModalMessageWidget-1.0.js', function() {
            var information = new ModalMessageWidget(type, message, callback, callbackFail, hide);
            information.Init(information);
        });
    };
    this.QueryError = function(data, callback, callbackPost){
        if (data.err) {
            var text = '';
            if(data.msg)
                text = data.msg;
            else
                text = data.err;
            this.NewModal('error', text, callbackPost);
            self.WidgetLoader(true);
            return false;
        }
        return true;
    };
    this.ShowError = function(message, callback, hide){
        this.NewModal('error', message, callback, false, hide);
    };
    this.ShowMessage = function(message, callback, hide){
        this.NewModal('success',  message, callback, false, hide);
    };
    this.ShowCommentForm = function(message, callback, hide){
        this.NewModal('message', message, callback, false, hide);
    };
    this.Confirm = function(message, callbackOk, callbackFail){
        this.NewModal('confirm', message, callbackOk, callbackFail);
    };
    this.ErrorVertionTmpl = function(tmpl, hash, temp){
        var version = /<!--\s*version ([\d.]*)\s*-->/;
        var result = temp.find('script#' + tmpl).html();
        if(result){
            result = result.match(version);
            if(result){
                if(parseFloat(result[1]) >= self.minTmplVersion && parseFloat(result[1]) <= self.maxTmplVersion)
                    return false;
            }
        }
        else{
            self.Exception('Шаблон [' + tmpl + '] не найден!');
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
            if(parentId){
                if(!Parameters.cache.childrenCategory[parentId]){
                    XDMTransport.Load.Data(encodeURIComponent(self.settings.hostApi + self.settings.catalogPathApi + parentId + '/children/noblock/active/'), function(data){
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
            }
            else{
                if(callback)
                    callback({
                        err : 'categoriesNotCreated'
                    });
            }
        },
        Blocks : function(parentId, callback){
            if(parentId){
                if(!Parameters.cache.block[parentId]){
                    XDMTransport.Load.Data(encodeURIComponent(self.settings.hostApi + self.settings.catalogPathApi + parentId + '/children/block/active/'), function(data){
                        Parameters.cache.block[parentId] = data;
                        if(callback)
                            callback(data);
                    });
                }
                else{
                    if(callback)
                        callback(Parameters.cache.block[parentId]);
                }
            }
            else{
                if(callback)
                    callback({
                        err : 'categoriesNotCreated'
                    });
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
            if(id){
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
            }
            else{
                if(callback)
                    callback({});
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
                                        Logger.Console.Exception(self.widgetName, 'Error of the template - [' + tmpl.path + ']. No valid version for [' + key + '] - [' + tmpl.id[key] + ']. Required min [' + self.minTmplVersion + '] max [' + self.maxTmplVersion+ ']');
                                        temp.remove();
                                        return false;
                                        break;
                                    }
                                }
                            }
                            else{
                               if(self.ErrorVertionTmpl(tmpl.id, hash, temp)){
                                    Logger.Console.Exception(self.widgetName, 'Error of the template - [' + tmpl.path + ']. No valid version - [' + tmpl.id + ']. Required min [' + self.minTmplVersion + '] max [' + self.maxTmplVersion+ ']');
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
                                                Logger.Console.Exception(self.widgetName, 'Settings id for tmpl - [' + tmpl.custom.path + ']. No search template for [' + key + '] - [' + tmpl.custom.id[key] + ']');
                                                temp.remove();
                                                delete tmpl.custom;
                                                Default ();
                                                return false;
                                                break;
                                            }
                                            if(self.ErrorVertionTmpl(tmpl.custom.id[key], hash, temp)){
                                                Logger.Console.Exception(self.widgetName, 'Error of the template - [' + tmpl.custom.path + ']. No valid version for [' + key + '] - [' + tmpl.custom.id[key] + ']. Required min [' + self.minTmplVersion + '] max [' + self.maxTmplVersion+ ']');
                                                return false;
                                                break;
                                            }
                                        }
                                    }
                                    else{
                                        Logger.Console.Exception(self.widgetName, 'Settings id for tmpl - [' + tmpl.custom.path + ']');
                                        temp.remove();
                                        delete tmpl.custom;
                                        Default ();
                                        return false;
                                    }
                                }   
                                else{
                                    if($(data).find('script#' + tmpl.custom.id).length != 1){
                                        Logger.Console.Exception(self.widgetName,'Settings id for tmpl - [' + tmpl.custom.path + ']. No search template with id [' + tmpl.custom.id + ']');
                                        temp.remove();
                                        delete tmpl.custom;
                                        Default ();
                                        return false;
                                    }
                                    if(self.ErrorVertionTmpl(tmpl.custom.id, hash, temp)){
                                        Logger.Console.Exception(self.widgetName, 'Error of the template - [' + tmpl.custom.path + ']. No valid version - [' + tmpl.custom.id + ']. Required min [' + self.minTmplVersion + '] max [' + self.maxTmplVersion+ ']');
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
                                            Logger.Console.Exception(self.widgetName,'Settings id for tmpl - [' + tmpl.custom.path + ']. No search template with id [' + tmpl.id[key] + ']');
                                            temp.remove();
                                            delete tmpl.custom;
                                            Default ();
                                            return false;
                                            break;
                                        }
                                        if(self.ErrorVertionTmpl(tmpl.id[key], hash, temp)){
                                            Logger.Console.Exception(self.widgetName, 'Error of the template - [' + tmpl.custom.path + ']. No valid version for [' + key + '] - [' + tmpl.id[key] + ']. Required min [' + self.minTmplVersion + '] max [' + self.maxTmplVersion+ ']');
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
                                        Logger.Console.Exception(self.widgetName,'Settings id for tmpl - [' + tmpl.path + ']. No search template with id [' + tmpl.id + ']');
                                        temp.remove();
                                        Default ();
                                        return false;
                                    }
                                    if(self.ErrorVertionTmpl(tmpl.id, hash, temp)){
                                        Logger.Console.Exception(self.widgetName, 'Error of the template - [' + tmpl.custom.path + ']. No valid version - [' + tmpl.id + ']. Required min [' + self.minTmplVersion + '] max [' + self.maxTmplVersion+ ']');
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
                            Logger.Console.Exception(self.widgetName,'Error load file template - ' + tmpl.custom.path);
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
                    XDMTransport.Load.Data(encodeURIComponent(self.settings.hostApi + self.settings.catalogPathApi + categoryId + '/path/'), function(data){
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
            var hash = EventDispatcher.HashCode(script);
            if(!Parameters.cache.scripts[hash]){
                if(!$.isArray(script))
                    script = [script];
                JSLoader.Load(script, callback);
                Parameters.cache.scripts[hash] = true;
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
        LoginForProxy : function(username, password, remember_me, callback){
            var opt = self.ProtocolPreparation();
            var str = "";
            if(username && password)
                str = '?username=' + encodeURIComponent(username) + '&password=' + encodeURIComponent(password) +'&remember_me=' + remember_me;
            XDMTransport.Load.FromProxy({
                url : encodeURIComponent(opt.host + self.settings.userPathApi + 'login/' + str),
                protocol :  opt.protocol,
                callback : function(data){
                    if(callback)
                        callback(JSON.parse(data));
                }
            })
        },
        Login : function(username, password, remember_me, callback){
            if(Parameters.cache.userInformation == null || Parameters.cache.userInformation.err){
                self.BaseLoad.LoginForProxy(username, password, remember_me, function(data1){
                    Parameters.cache.userInformation = data1;
                    if(!data1.err) {
                        var opt = self.ProtocolPreparation();
                        var str = "";
                        if (username && password)
                            str = '?username=' + encodeURIComponent(username) + '&password=' + encodeURIComponent(password) + '&remember_me=' + remember_me;
                        XDMTransport.Load.Data(encodeURIComponent(opt.host + self.settings.userPathApi + 'login/' + str), function (data) {
                            Parameters.cache.userInformation = data;
                            if (callback)
                                callback(data);
                        }, opt.protocol);
                    }
                    else if(callback)
                        callback(Parameters.cache.userInformation);
                });
            }
            else{
                if(callback)
                    callback(Parameters.cache.userInformation);
            }
        },
        LogoutForProxy : function(callback){
            var opt = self.ProtocolPreparation();
            XDMTransport.Load.FromProxy({
                url : encodeURIComponent(opt.host + self.settings.userPathApi + 'logout/'),
                protocol :  opt.protocol,
                callback : function(data){
                    if(callback)
                        callback(data);
                }
            })
        },
        Logout : function(callback){
            var opt = self.ProtocolPreparation();
            XDMTransport.Load.Data(encodeURIComponent(opt.host + self.settings.userPathApi + 'logout/'), function(data){
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
                    str = str + count + '/';
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
               str = '/' + encodeURIComponent(comment) + '/';
            str = str + '?idGoods=' + goodId
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
            }
            if(goodsId){
                str = str + '?idGoods=' + goodsId;
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
        RegistrationSeller : function( str, callback){
            XDMTransport.Load.Data(encodeURIComponent(self.settings.httpsHostApi + self.settings.userPathApi + 'reg/seller/' + str), function(data){
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
        ActivateSeller : function(str, callback){
            XDMTransport.Load.Data(encodeURIComponent(self.settings.httpsHostApi + self.settings.userPathApi + 'rega/seller/' + str), function(data){
                if(callback)
                    callback(data);
            }, true);
        },
        EditProfile : function(form, callback){
            if(form.find('#registration_data_query').length == 0)
                form.append('<input type="text" id="registration_data_query" style="display: none" name="query" value="' + self.settings.httpsHostApi + self.settings.userPathApi + 'edit/profile/"/>');
            EventDispatcher.AddEventListener(EventDispatcher.HashCode(form.toString()), function(data){
                callback(data)
            });
            XDMTransport.Load.DataPost(form, true);
        },
        ProfileInfo : function(callback){
            XDMTransport.Load.Data(encodeURIComponent(self.settings.httpsHostApi + self.settings.userPathApi + 'info/'), function(data){
                Parameters.cache.profile.info = data;
                if(callback)
                    callback(data);
            }, true);
        },
        Profile : function(callback){
            XDMTransport.Load.Data(encodeURIComponent(self.settings.httpsHostApi + self.settings.userPathApi + 'profile/'), function(data){
                Parameters.cache.profile.personal = data;
                if(callback)
                    callback(data);
            }, true);
        },
        EditContacts : function(str, callback){
            XDMTransport.Load.Data(encodeURIComponent(self.settings.httpsHostApi + self.settings.userPathApi + 'edit/contact/' + Parameters.shopId + '/' + str), function(data){
                if(callback)
                    callback(data);
            }, true);
        },
        SendToken : function(type, callback){
            XDMTransport.Load.Data(encodeURIComponent(self.settings.httpsHostApi + self.settings.userPathApi + 'code/' + Parameters.shopId + '/' + type + '/'), function(data){
                if(callback)
                    callback(data);
            }, true);
        },
        Country : function(shopId, callback){
            if(!Parameters.cache.country){
                XDMTransport.Load.Data(encodeURIComponent(self.settings.httpsHostApi + self.settings.geoPathApi + shopId  + '/country/'), function(data){
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
            XDMTransport.Load.Data(encodeURIComponent(self.settings.httpsHostApi + self.settings.userPathApi  + 'geo/info/'), function(data){
                Parameters.cache.delivery = data;
                if(callback)
                    callback(data);
            }, true);
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
            XDMTransport.Load.Data(encodeURIComponent(self.settings.httpsHostApi + self.settings.userPathApi + 'geo/del/' + str + '/'), function(data){
                if(callback)
                    callback(data);
            }, true);
        },
        ShopInfo : function(callback){
            if($.isEmptyObject(Parameters.cache.infoShop)){
                XDMTransport.Load.Data(encodeURIComponent(self.settings.httpsHostApi + self.settings.shopPathApi + 'info/' + Parameters.shopId + '/1000000/'), function(data){
                    Parameters.cache.infoShop = data;
                    if(callback)
                        callback(data);
                }, true);
            }
            else
                callback(Parameters.cache.infoShop);
        },
        Shipping : function(str, callback){
            XDMTransport.Load.Data(encodeURIComponent(self.settings.httpsHostApi + self.settings.shopPathApi + 'shipping/' + str), function(data){
                Parameters.cache.shipping = data;
                if(callback)
                    callback(data);
            }, true);
        },
        Payment : function(str, callback){
            XDMTransport.Load.Data(encodeURIComponent(self.settings.httpsHostApi + self.settings.shopPathApi + 'payment/' + str), function(data){
                Parameters.cache.payment = data;
                if(callback)
                    callback(data);
            }, true);
        },
        NewOrder : function(str, callback){
            XDMTransport.Load.Data(encodeURIComponent(self.settings.httpsHostApi + self.settings.orderPathApi + 'add/' + Parameters.shopId + '/' + str), function(data){
                Parameters.cache.orderList = {};
                if(callback)
                    callback(data);
            }, true);
        },
        EditOrder : function(str, callback){
            XDMTransport.Load.Data(encodeURIComponent(self.settings.httpsHostApi + self.settings.orderPathApi + 'edit/' + str), function(data){
                Parameters.cache.orderList = {};
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
            XDMTransport.Load.Data(encodeURIComponent(self.settings.httpsHostApi + self.settings.orderPathApi + 'confirm/' + str + '/'), function(data){
                Parameters.cache.orderList = {};
                if(callback)
                    callback(data);
            }, true);
        },
        DeleteOrder : function(str, callback){
            XDMTransport.Load.Data(encodeURIComponent(self.settings.httpsHostApi + self.settings.orderPathApi + 'delete/' + str + '/'), function(data){
                Parameters.cache.orderList = {};
                if(callback)
                    callback(data);
            }, true);
        },
        OrderList : function(query, callback){
            var queryHash = EventDispatcher.HashCode(query);
            if(!(queryHash in Parameters.cache.orderList)){
                XDMTransport.Load.Data(encodeURIComponent(self.settings.httpsHostApi + self.settings.orderPathApi + 'user/' + Parameters.shopId + query), function(data){
                    Parameters.cache.orderList[queryHash] = data;
                    if(callback)
                        callback(data);
                }, true);
            }
            else
                callback(Parameters.cache.orderList[queryHash]);
        },
        RepeatOrder : function(str, callback){
            XDMTransport.Load.Data(encodeURIComponent(self.settings.httpsHostApi + self.settings.orderPathApi + 'repeat/' + str + '/'), function(data){
                Parameters.cache.orderList = {};
                if(callback)
                    callback(data);
            }, true);
        },
        ReturnOrder : function(str, callback){
            XDMTransport.Load.Data(encodeURIComponent(self.settings.httpsHostApi + self.settings.orderPathApi + 'return/' + str + '/'), function(data){
                Parameters.cache.orderList = {};
                if(callback)
                    callback(data);
            }, true);
        },
        CancelOrder : function(str, callback){
            XDMTransport.Load.Data(encodeURIComponent(self.settings.httpsHostApi + self.settings.orderPathApi + 'cancel/' + str + '/'), function(data){
                Parameters.cache.orderList = {};
                if(callback)
                    callback(data);
            }, true);
        },
        StatusPayment: function(str, callback){
            XDMTransport.Load.Data(encodeURIComponent(self.settings.httpsHostApi + self.settings.paymentPathApi + 'status/' + str), function(data){
                Parameters.cache.orderList = {};
                if(callback)
                    callback(data);
            }, true);
        },
        InvoicesOrder : function(str, callback){
            XDMTransport.Load.Data(encodeURIComponent(self.settings.httpsHostApi + self.settings.paymentPathApi + 'order/' + str), function(data){
                Parameters.cache.orderList = {};
                if(callback)
                    callback(data);
            }, true);
        },
        InvoicesGoods : function(str, callback){
            XDMTransport.Load.Data(encodeURIComponent(self.settings.httpsHostApi + self.settings.paymentPathApi + 'goods/' + str), function(data){
                Parameters.cache.orderList = {};
                if(callback)
                    callback(data);
            }, true);
        },
        InvoicesPartnerGoods: function(str, callback){
            XDMTransport.Load.Data(encodeURIComponent(self.settings.httpsHostApi + self.settings.paymentPathApi + 'goods_partner/' + str), function(data){
                Parameters.cache.orderList = {};
                if(callback)
                    callback(data);
            }, true);
        },
        InvoicesService: function(str, callback){
            XDMTransport.Load.Data(encodeURIComponent(self.settings.httpsHostApi + self.settings.paymentPathApi + 'service/' + str), function(data){
                Parameters.cache.orderList = {};
                if(callback)
                    callback(data);
            }, true);
        },
        InvoicesAmount : function(str, callback){
            XDMTransport.Load.Data(encodeURIComponent(self.settings.httpsHostApi + self.settings.paymentPathApi + 'amount/' + str), function(data){
                Parameters.cache.orderList = {};
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
            XDMTransport.Load.Data(encodeURIComponent(self.settings.httpsHostApi + self.settings.messagePathApi + 'topic/count/' + str), function(data){
                Parameters.cache.message.topicCount = null;
                if(callback)
                    callback(data);
            }, true);
        },
        TopicInfo : function(id, fullInfo, callback){
            if(!fullInfo)
                fullInfo = 'unread';
            XDMTransport.Load.Data(encodeURIComponent(self.settings.httpsHostApi + self.settings.messagePathApi + 'topic/info/' + id + '/' + fullInfo), function(data){
                Parameters.cache.message.topicInfo = null;
                if(callback)
                    callback(data);
            }, true);
        },
        TopicRead : function(id, callback){
            XDMTransport.Load.Data(encodeURIComponent(self.settings.httpsHostApi + self.settings.messagePathApi + 'topic/read/' + id + '/'), function(data){
                if(callback)
                    callback(data);
            }, true);
        },
        TopicDelete : function(id, callback){
            XDMTransport.Load.Data(encodeURIComponent(self.settings.httpsHostApi + self.settings.messagePathApi + 'topic/delete/' + id + '/'), function(data){
                if(callback)
                    callback(data);
            }, true);
        },
        MessageInfo : function(id, callback){
            XDMTransport.Load.Data(encodeURIComponent(self.settings.httpsHostApi + self.settings.messagePathApi + 'info/' + id + '/'), function(data){
                Parameters.cache.message.messageInfo = null;
                if(callback)
                    callback(data);
            }, true);
        },
        MessageSetRead : function(id, callback){
            XDMTransport.Load.Data(encodeURIComponent(self.settings.httpsHostApi + self.settings.messagePathApi + 'read/' + id + '/'), function(data){
                if(callback)
                    callback(data);
            }, true);
        },
        MessageSetUnread : function(id, callback){
            XDMTransport.Load.Data(encodeURIComponent(self.settings.httpsHostApi + self.settings.messagePathApi + 'unread/' + id + '/'), function(data){
                if(callback)
                    callback(data);
            }, true);
        },
        MessageAdd : function(form, callback){
            if(form.find('#add_message_query').length == 0)
                form.append('<input type="text" id="add_message_query" style="display: none" name="query" value="' + self.settings.httpsHostApi + self.settings.messagePathApi + 'add/"/>');
            EventDispatcher.AddEventListener(EventDispatcher.HashCode(form.toString()), function(data){
                if(callback)
                    callback(data)
            });
            XDMTransport.Load.DataPost(form, true);
        },
        MessageDelete : function(id, callback){
            XDMTransport.Load.Data(encodeURIComponent(self.settings.httpsHostApi + self.settings.messagePathApi + 'delete/' + id + '/'), function(data){
                if(callback)
                    callback(data);
            }, true);
        },
        MessageCountUnread : function(callback){
            XDMTransport.Load.Data(encodeURIComponent(self.settings.httpsHostApi + self.settings.messagePathApi + 'unread/count/'), function(data){
                if(callback)
                    callback(data);
            }, true);
        }
        
    };
};

var CountryListViewModel = function(data) {
    var self = this;
    self.id = data.id;
    self.name = data.name;
    self.fullName = data.full_name;
    self.partWorld = data.part_world;
    self.location = data.location;
};
