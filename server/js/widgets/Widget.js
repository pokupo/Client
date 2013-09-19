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
            step5 : {}
        },
        profile : {
            personal : {},
            delivery : {},
            security : {},
            info : {}
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
    widgets : {},
    Indicator : function(widget, isReady){
        this.widgets[widget] = isReady;
        this.countAll = 0;
        this.readyCount = 0;
        
        for(var key in this.widgets){
            this.RegisterReady(key);
        }
        this.ShowLoading();
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
    ShowLoading : function(){
        if(!this.IsReady()){
            this.HideContent();
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
        for(var key in Config.Containers){
            if($.isArray(Config.Containers[key])){
                for(var i in Config.Containers[key]){
                    $("#" + Config.Containers[key][i]).children().hide();
                }
            }
            else
                $("#" + Config.Containers[key]).children().hide();
        }
    },
    ShowContent : function(){
        for(var key in Config.Containers){
            $("#" + Config.Containers[key]).children().show();
        }
    }
};

function Widget(){
    var self = this;
    this.isReady = false;
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
        containerIdForTmpl : null
    };
    this.Init = function(widget, noindicate){
        if ( typeof JSCore !== 'undefined' && JSCore.isReady && typeof Loader !== 'undefined' && typeof Config !== 'undefined' && typeof Routing !== 'undefined' && typeof ko !== 'undefined'){
            this.SelfInit();
            if(!noindicate)
                Loader.Indicator(widget.widgetName, false);
            this.BaseLoad.Roots(function(){
                widget.InitWidget();
            });
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
                containerIdForTmpl : Config.Base.containerIdForTmpl
            };
            Parameters.pathToImages = Config.Base.pathToImages;
            Parameters.routIconAuction = Config.Base.routIconAuction;
            Parameters.sortingBlockContainer = Config.Base.sortingBlockContainer;
            Parameters.loading = Config.Base.loading;
            
            this.RegistrCustomBindings();
            Routing.ParserHash(true);
            this.Events();
            Parameters.shopId = JSSettings.inputParameters['shopId'];
        }
    };
    this.Events = function(){       
        EventDispatcher.AddEventListener('widget.onload.script', function(data){
            window[data.options.widget].prototype = new Widget();
            var embed = new window[data.options.widget]();
            embed.SetParameters(data);
            embed.Init(embed, true);
        });
        
        EventDispatcher.AddEventListener('widget.onload.menuPersonalCabinet', function(opt){
            MenuPersonalCabinetWidgetWidget.prototype = new Widget();
            var menu = new MenuPersonalCabinetWidgetWidget();
            menu.Init(menu);
            menu.AddMenu(opt);
        });
        
        EventDispatcher.AddEventListener('widgets.favorites.add', function(data){
            var inputDate = data;
            if(Parameters.cache.userInformation && !Parameters.cache.userInformation.err){
                self.BaseLoad.AddToFavorite(data.goodsId, data.comment, function(data){
                    self.WidgetLoader(true);
                    if(data.result == 'ok'){
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
                    EventDispatcher.DispatchEvent('widget.onload.script', {element:element, options:options});
                });
            }
        };
    };
    this.WidgetLoader = function(test){
        Loader.Indicator(this.widgetName, test);
    };
    this.ScrollTop = function(elementId, speed){
        if(Loader.countAll == Loader.readyCount){
            $('html, body').animate({scrollTop: $("#" + elementId).offset().top}, speed); 
        }
        else{
            setTimeout(function() {self.ScrollTop(elementId);}, 100); 
        }
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
        if(!hide)
            button.push({ text: "Закрыть", click: function() { 
                    $( this ).dialog( "close" );
                    if(callback)
                        callback();
                }});
        
        $( "#" + Config.Base.containerIdMessageWindow ).dialog({
            modal: false,
            buttons: button
        });
        $('.ui-dialog-titlebar-close').hide();
        
        setTimeout(function() {
            $( "#" + Config.Base.containerIdMessageWindow ).dialog( "close" );
            if(callback)
                callback();
        }, Config.Base.timeMessage);
    },
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
    },
    this.BaseLoad  = {
        Roots : function(callback){
            if(Parameters.cache.roots.length == 0){
                XDMTransport.LoadData(encodeURIComponent(self.settings.hostApi + self.settings.catalogPathApi + Parameters.shopId + '/root/noblock/active/5/'), function(data){
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
                XDMTransport.LoadData(encodeURIComponent(self.settings.hostApi + self.settings.catalogPathApi + parentId + '/children/noblock/active'), function(data){
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
                XDMTransport.LoadData(encodeURIComponent(self.settings.hostApi + self.settings.catalogPathApi + parentId + '/children/block/active'), function(data){
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
                XDMTransport.LoadData(encodeURIComponent(self.settings.hostApi + self.settings.catalogPathApi + categoryId + '/goods/' + query), function(data){
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
                XDMTransport.LoadData(encodeURIComponent(self.settings.hostApi + self.settings.goodsPathApi + shopId + '/search/' + query), function(data){
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
                XDMTransport.LoadData(encodeURIComponent(self.settings.hostApi + self.settings.catalogPathApi + id + '/info/'), function(data){
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
            if(!Parameters.cache.tmpl[EventDispatcher.HashCode(tmpl)]){
                self.CreateContainer();
                XDMTransport.LoadTmpl(tmpl,function(data){
                    $("#" + self.settings.containerIdForTmpl).append(data);
                    if(callback)callback();
                });
            }
            else{
                if(callback)callback();
            }
        },
        Path : function(categoryId, callback){
            if(categoryId){
                if(!Parameters.cache.path[categoryId]){
                    XDMTransport.LoadData(encodeURIComponent(self.settings.hostApi + self.settings.catalogPathApi + categoryId + '/path'), function(data){
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
                XDMTransport.LoadData(encodeURIComponent(self.settings.hostApi + self.settings.goodsPathApi+ id +'/info/' + infoBlock + '/'), function(data){
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
                XDMTransport.LoadData(encodeURIComponent(self.settings.hostApi + self.settings.goodsPathApi+ id +'/link/' + query + '/'), function(data){
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
        Login : function(username, password, remember_me, callback){
            if(Parameters.cache.userInformation == null || Parameters.cache.userInformation.err){
                var host = self.settings.hostApi;
                var protokol = false;
                if(Parameters.cache.https == "always" || Parameters.cache.https == "login"){
                    host = self.settings.httpsHostApi;
                    protokol = true;
                }

                var str = "";
                if(username && password)
                    str = '?username=' + encodeURIComponent(username) + '&password=' + encodeURIComponent(password) +'&remember_me=' + remember_me;
                XDMTransport.LoadData(encodeURIComponent(host + self.settings.userPathApi + 'login/' + str), function(data){
                    Parameters.cache.userInformation = data;
                    if(callback)
                        callback(data);
                }, protokol);
            }
            else{
                if(callback)
                    callback(Parameters.cache.userInformation);
            }
        },
        Logout : function(callback){
            XDMTransport.LoadData(encodeURIComponent(self.settings.hostApi + self.settings.userPathApi + 'logout'), function(data){
                Parameters.cache.userInformation = null;
                if(callback)
                    callback(data);
            });
        },
        CartInfo : function(seller, callback){
            var host = self.settings.hostApi;
            var protokol = false;
            if(Parameters.cache.https == "always"){
                protokol = true;
                host = self.settings.httpsHostApi;
            }
            XDMTransport.LoadData(host + self.settings.cartPathApi + 'calc/' + Parameters.shopId + '/' + seller, function(data){
                if(callback)
                    callback(data);
            }, protokol);
        },
        CartGoods : function(seller, callback){
            var host = self.settings.hostApi;
            var protokol = false;
            if(Parameters.cache.https == "always"){
                host = self.settings.httpsHostApi;
                protokol = true;
            }
            XDMTransport.LoadData(host + self.settings.cartPathApi + 'info/' + Parameters.shopId + '/' + seller, function(data){
                if(callback)
                    callback(data);
            }, protokol);
        },
        AddGoodsToCart : function(idGoods, sellerId, count, callback){
            var host = self.settings.hostApi;
            var protokol = false;
            if(Parameters.cache.https == "always"){
                host = self.settings.httpsHostApi;
                protokol = true;
            }
            
            var str = '';
            if(sellerId){
                str = sellerId + '/';
                if(count >= 0)
                    str = str + count;
            }
            
            XDMTransport.LoadData(host + self.settings.cartPathApi + 'add/' + Parameters.shopId + '/' + idGoods + '/' + str, function(data){
                if(callback)
                    callback(data);
            }, protokol);
        },
        AddToFavorite : function(goodId, comment, callback){
            var host = self.settings.hostApi;
            var protokol = false;
            if(Parameters.cache.https == "always"){
                host = self.settings.httpsHostApi;
                protokol = true;
            }
            var str = '';
            if(comment)
               str = '/' + encodeURIComponent(comment);
            str = str + '/?idGoods=' + goodId
            XDMTransport.LoadData(encodeURIComponent(host + self.settings.favPathApi + 'add/' + Parameters.shopId + str), function(data){
                if(callback)
                    callback(data);
            }, protokol);
        },
        ClearFavorite : function(str, callback){
            XDMTransport.LoadData(encodeURIComponent(self.settings.httpsHostApi + self.settings.favPathApi + 'clear/' + Parameters.shopId + '/' + str), function(data){
                if(callback)
                    callback(data);
            }, true);
        },
        InfoFavorite : function(fully, callback){
            var host = self.settings.hostApi;
            var protokol = false;
            if(Parameters.cache.https == "always"){
                host = self.settings.httpsHostApi;
                protokol = true;
            }
            XDMTransport.LoadData(host + self.settings.favPathApi + 'info/' + Parameters.shopId + '/' + fully + '/' , function(data){
                if(callback)
                    callback(data);
            }, protokol);
        },
        ClearCart : function(sellerId, goodsId, callback){
            var host = self.settings.hostApi;
            var protokol = false;
            if(Parameters.cache.https == "always"){
                host = self.settings.httpsHostApi;
                protokol = true;
            }
            
            var str = '';
            if(sellerId){
                str = sellerId + '/';
                if(goodsId){
                    str = str + '?idGoods=' + goodsId;
                }
            }
            XDMTransport.LoadData(host + self.settings.cartPathApi + 'clear/' + Parameters.shopId + '/' + str, function(data){
                if(callback)
                    callback(data);
            }, protokol);
        },
        UniqueUser : function(str, callback){ 
            XDMTransport.LoadData(encodeURIComponent(self.settings.httpsHostApi + self.settings.userPathApi + 'unique/' + str), function(data){
                if(callback)
                    callback(data);
            }, true);
        },
        Registration : function( str, callback){
            XDMTransport.LoadData(encodeURIComponent(self.settings.httpsHostApi + self.settings.userPathApi + 'reg/' + Parameters.shopId + '/' + str), function(data){
                if(callback)
                    callback(data);
            }, true);
        },
        ActivateUser : function(str, callback){
            XDMTransport.LoadData(encodeURIComponent(self.settings.httpsHostApi + self.settings.userPathApi + 'rega/' + str), function(data){
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
            XDMTransport.LoadPost(form, true);
        },
        ProfileInfo : function(callback){
            if($.isEmptyObject(Parameters.cache.profile.info)){
                XDMTransport.LoadData(encodeURIComponent(self.settings.httpsHostApi + self.settings.userPathApi + 'info/'), function(data){
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
                XDMTransport.LoadData(encodeURIComponent(self.settings.httpsHostApi + self.settings.userPathApi + 'profile/'), function(data){
                    Parameters.cache.profile.personal = data;
                    if(callback)
                        callback(data);
                }, true);
            }
            else
                callback(Parameters.cache.profile.personal);
        },
        EditContacts : function(str, callback){
            XDMTransport.LoadData(encodeURIComponent(self.settings.httpsHostApi + self.settings.userPathApi + 'edit/contact/' + Parameters.shopId + '/' + str), function(data){
                if(callback)
                    callback(data);
            }, true);
        },
        SendToken : function(type, callback){
            XDMTransport.LoadData(encodeURIComponent(self.settings.httpsHostApi + self.settings.userPathApi + 'code/' + Parameters.shopId + '/' + type), function(data){
                if(callback)
                    callback(data);
            }, true);
        },
        Country : function(shopId, callback){
            if(!Parameters.cache.country){
                XDMTransport.LoadData(encodeURIComponent(self.settings.httpsHostApi + self.settings.geoPathApi + shopId  + '/country'), function(data){
                    Parameters.cache.country = data;
                    if(callback)
                        callback(data);
                }, true);
            }
            else
                callback(Parameters.cache.country);
        },
        Region: function(str, callback){
            XDMTransport.LoadData(encodeURIComponent(self.settings.httpsHostApi + self.settings.geoPathApi + Parameters.shopId  + '/region/' + str), function(data){
                if(callback)
                    callback(data);
            }, true);
        },
        City : function(str, callback){
            XDMTransport.LoadData(encodeURIComponent(self.settings.httpsHostApi + self.settings.geoPathApi + Parameters.shopId  + '/city/' + str), function(data){
                if(callback)
                    callback(data);
            }, true);
        },
        Street : function(str, callback){
            XDMTransport.LoadData(encodeURIComponent(self.settings.httpsHostApi + self.settings.geoPathApi + Parameters.shopId  + '/street/' + str), function(data){
                if(callback)
                    callback(data);
            }, true);
        },
        EditAddress : function(str, callback){
            XDMTransport.LoadData(encodeURIComponent(self.settings.httpsHostApi + self.settings.userPathApi + 'edit/address/' + str), function(data){
                if(callback)
                    callback(data);
            }, true);
        },
        DeliveryAddressList : function(callback){
            if(!Parameters.cache.delivery){
                XDMTransport.LoadData(encodeURIComponent(self.settings.httpsHostApi + self.settings.userPathApi  + 'geo/info'), function(data){
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
            XDMTransport.LoadPost(form, true);
        },
        AddDelivaryAddress : function(str, callback){
            XDMTransport.LoadData(encodeURIComponent(self.settings.httpsHostApi + self.settings.userPathApi + 'geo/add/' + str), function(data){
                if(callback)
                    callback(data);
            }, true);
        },
        EditDelivaryAddress : function(str, callback){
            XDMTransport.LoadData(encodeURIComponent(self.settings.httpsHostApi + self.settings.userPathApi + 'geo/edit/' + str), function(data){
                if(callback)
                    callback(data);
            }, true);
        },
        SetDefaultDelivaryAddress : function(str, callback){
            XDMTransport.LoadData(encodeURIComponent(self.settings.httpsHostApi + self.settings.userPathApi + 'geo/default/' + str), function(data){
                if(callback)
                    callback(data);
            }, true);
        },
        DeleteDeliveryAddress : function(str, callback){
            XDMTransport.LoadData(encodeURIComponent(self.settings.httpsHostApi + self.settings.userPathApi + 'geo/del/' + str), function(data){
                if(callback)
                    callback(data);
            }, true);
        },
        Shipping : function(str, callback){
            if(!Parameters.cache.shipping){
                XDMTransport.LoadData(encodeURIComponent(self.settings.httpsHostApi + self.settings.shopPathApi + 'shipping/' + Parameters.shopId + '/' + str), function(data){
                    Parameters.cache.shipping = data;
                    if(callback)
                        callback(data);
                }, true);
            }
            else
                callback(Parameters.cache.shipping);
        },
        NewOrder : function(str, callback){
            XDMTransport.LoadData(encodeURIComponent(self.settings.httpsHostApi + self.settings.orderPathApi + 'add/' + Parameters.shopId + '/' + str), function(data){
                if(callback)
                    callback(data);
            }, true);
        },
        EditOrder : function(str, callback){
            XDMTransport.LoadData(encodeURIComponent(self.settings.httpsHostApi + self.settings.orderPathApi + 'edit/' + str), function(data){
                if(callback)
                    callback(data);
            }, true);
        },
        Payment : function(str, callback){
            if(!Parameters.cache.payment){
                XDMTransport.LoadData(encodeURIComponent(self.settings.httpsHostApi + self.settings.shopPathApi + 'payment/' + Parameters.shopId + '/' + str), function(data){
                    Parameters.cache.payment = data;
                    if(callback)
                        callback(data);
                }, true);
            }
            else
                callback(Parameters.cache.payment);
        },
        OrderInfo : function(str, callback){
            XDMTransport.LoadData(encodeURIComponent(self.settings.httpsHostApi + self.settings.orderPathApi + 'info/' + str), function(data){
                if(callback)
                    callback(data);
            }, true);
        },
        ConfirmOrder : function(str, callback){
            XDMTransport.LoadData(encodeURIComponent(self.settings.httpsHostApi + self.settings.orderPathApi + 'confirm/' + str), function(data){
                if(callback)
                    callback(data);
            }, true);
        }
    };
};