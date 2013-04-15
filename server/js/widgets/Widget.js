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
        searchContent : {},
        roots: [],
        infoCategory : {},
        goodsInfo : {},
        relatedGoods : {},
        cart : 0,
        typeView : '',
        pageId: 1,
        searchPageId : 1,
        scripts : {},
        tmpl : {},
        lastPage : {},
        https : null
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
console.log(this.widgets);
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
    ShowLoading : function(){
        if(this.countAll != this.readyCount){
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
        catalogPathApi : null,
        goodsPathApi : null,
        userPathApi : null,
        cartPathApi : null,
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
            self.settings = {
                hostApi : Config.Base.hostApi,
                httpsHostApi : Config.Base.httpsHostApi,
                catalogPathApi : Config.Base.catalogPathApi,
                goodsPathApi : Config.Base.goodsPathApi,
                userPathApi : Config.Base.userPathApi,
                cartPathApi : Config.Base.cartPathApi,
                favPathApi : Config.Base.favPathApi,
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
        
        EventDispatcher.AddEventListener('widgets.favorites.add', function(data){
            console.log(Parameters.cache.userInformation.err);
            if(Parameters.cache.userInformation && !JSON.parse(Parameters.cache.userInformation).err){
                self.WidgetLoader(false);
                self.BaseLoad.AddToFavorite(data.goodsId, data.count, function(data){
                    self.WidgetLoader(true);
                    if(data.result == 'ok'){
                        self.WidgetLoader(true);
                        alert('Выбранные товары добавлены в избранное.');
                    }
                    else{
                        alert('Произошла ошибка при добавлении товара в избранное. Попробуйте еще раз.');
                        self.WidgetLoader(true);
                    }
                });
            }
            else{
                alert('Необходимо авторизоваться.')
                self.WidgetLoader(true);
            }
        });
        
        EventDispatcher.AddEventListener('widgets.cart.addGoods', function(data){
            var sellerId = data.sellerId ? data.sellerId : false;
            var count = data.count ? data.count : false;
            self.WidgetLoader(false);
            self.BaseLoad.AddGoodsToCart(data.goodsId, sellerId, count, function(data){
                if(data.err){
                    self.WidgetLoader(true);
                    alert(data.err);
                }
                else{
                    self.WidgetLoader(true);
                    EventDispatcher.DispatchEvent('widgets.cart.infoUpdate', data);
                }
            });
        });
    };
    this.WidgetLoader = function(test){
        Loader.Indicator(this.widgetName, test);
    };
    this.BaseLoad  = {
        Roots : function(callback){
            if(Parameters.cache.roots.length == 0){
                XDMTransport.LoadData(encodeURIComponent(self.settings.hostApi + self.settings.catalogPathApi + Parameters.shopId + '/root/noblock/active/5/'), function(data){
                    Parameters.cache.roots = data;
                    var roots = JSON.parse(data);
                    for(var i = 0; i <= roots.length-1; i++){
                        Parameters.cache.catalogs[roots[i].id] = roots[i].id;
                    }
                    if(callback)
                        callback(roots);
                });
            }
            else{
                if(callback)
                    callback(JSON.parse(Parameters.cache.roots));
            }
        },
        Section : function(parentId, callback){
            if(!Parameters.cache.childrenCategory[parentId]){
                XDMTransport.LoadData(encodeURIComponent(self.settings.hostApi + self.settings.catalogPathApi + parentId + '/children/noblock/active'), function(data){
                    Parameters.cache.childrenCategory[parentId] = data;
                    if(callback)
                        callback({
                            'data' : JSON.parse(data), 
                            'parentId' : parentId
                        });
                });
            }
            else{
                if(callback)
                    callback({
                        'data' : JSON.parse(Parameters.cache.childrenCategory[parentId]), 
                        'parentId' : parentId
                    });
            }
        },
        Blocks : function(parentId, callback){
            if(!Parameters.cache.block[parentId]){
                XDMTransport.LoadData(encodeURIComponent(self.settings.hostApi + self.settings.catalogPathApi + parentId + '/children/block/active'), function(data){
                    Parameters.cache.block[parentId] = data;
                    if(callback)
                        callback(JSON.parse(data));
                });
            }
            else{
                if(callback)
                    callback(JSON.parse(Parameters.cache.block[parentId]));
            }
        },
        Content : function(categoryId, query, callback){
            var queryHash = categoryId + EventDispatcher.HashCode(query);
            if(!Parameters.cache.content[queryHash]){
                XDMTransport.LoadData(encodeURIComponent(self.settings.hostApi + self.settings.catalogPathApi + categoryId + '/goods/' + query), function(data){
                    Parameters.cache.content[queryHash] = {"categoryId" : categoryId , "content" : JSON.parse(data)};
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
                    Parameters.cache.searchContent[queryHash] = JSON.parse(data);
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
                        callback(JSON.parse(data));
                });
            }
            else{
                if(callback)
                    callback(JSON.parse(Parameters.cache.infoCategory[id]));
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
                            callback(JSON.parse(data)['path']);
                    });
                }
                else{
                    if(callback)
                        callback(JSON.parse(Parameters.cache.path[categoryId])['path']);
                }
            }
        },
        GoodsInfo : function(id, infoBlock, callback){
            if(!Parameters.cache.goodsInfo[id]){
                XDMTransport.LoadData(encodeURIComponent(self.settings.hostApi + self.settings.goodsPathApi+ id +'/info/' + infoBlock + '/'), function(data){
                    Parameters.cache.goodsInfo[id] = data;
                    if(callback)
                        callback(JSON.parse(data));
                });
            }
            else{
                if(callback)
                    callback(JSON.parse(Parameters.cache.goodsInfo[id]));
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
                        callback(JSON.parse(data));
                });
            }
            else{
                if(callback)
                    callback(JSON.parse(Parameters.cache.relatedGoods[queryHash]));
            }
        },
        Login : function(username, password, remember_me, callback){
            var host = self.settings.hostApi;
            if(Parameters.cache.https == "always" || Parameters.cache.https == "login")
                host = self.settings.httpsHostApi;
            
            var str = "";
            if(username && password)
                str = '?username=' + username + '&password=' + password +'&remember_me=' + remember_me;
            XDMTransport.LoadData(encodeURIComponent(host + self.settings.userPathApi + 'login/' + str), function(data){
                Parameters.cache.userInformation = data;
                if(callback)
                    callback(JSON.parse(data));
            });
        },
        Logout : function(callback){
            XDMTransport.LoadData(encodeURIComponent(self.settings.hostApi + self.settings.userPathApi + 'logout'), function(data){
                Parameters.cache.userInformation = null;
                if(callback)
                    callback(JSON.parse(data));
            });
        },
        Registration : function( str, callback){
             XDMTransport.LoadData(encodeURIComponent(self.settings.hostApi + self.settings.userPathApi + 'reg/' + Parameters.shopId + '/' + str), function(data){
                if(callback)
                    callback(JSON.parse(data));
            });
        },
        CartInfo : function(seller, callback){
            var host = self.settings.hostApi;
            if(Parameters.cache.https == "always")
                host = self.settings.httpsHostApi;
            XDMTransport.LoadData(host + self.settings.cartPathApi + 'calc/' + Parameters.shopId + '/' + seller, function(data){
                if(callback)
                    callback(JSON.parse(data));
            });
        },
        CartGoods : function(seller, callback){
            var host = self.settings.hostApi;
            if(Parameters.cache.https == "always")
                host = self.settings.httpsHostApi;
            XDMTransport.LoadData(host + self.settings.cartPathApi + 'info/' + Parameters.shopId + '/' + seller, function(data){
                if(callback)
                    callback(JSON.parse(data));
            });
        },
        AddGoodsToCart : function(idGoods, sellerId, count, callback){
            var host = self.settings.hostApi;
            if(Parameters.cache.https == "always")
                host = self.settings.httpsHostApi;
            
            var str = '';
            if(sellerId){
                str = sellerId + '/';
//                if(count)
//                    str = str + count;
            }
            XDMTransport.LoadData(host + self.settings.cartPathApi + 'add/' + Parameters.shopId + '/' + idGoods + '/' + str, function(data){
                if(callback)
                    callback(JSON.parse(data));
            });
        },
        AddToFavorite : function(goodId, count, callback){
            var host = self.settings.hostApi;
            if(Parameters.cache.https == "always")
                host = self.settings.httpsHostApi;
            
            XDMTransport.LoadData(host + self.settings.favPathApi + 'add/' + Parameters.shopId + '/' + goodId, function(data){
                if(callback)
                    callback(JSON.parse(data));
            });
        },
        ClearCart : function(sellerId, goodsId, callback){
            var host = self.settings.hostApi;
            if(Parameters.cache.https == "always")
                host = self.settings.httpsHostApi;
            
            var str = '';
            if(sellerId){
                str = sellerId + '/';
                if(goodsId){
                    str = str + '?idGoods=' + goodsId;
                }
            }
            XDMTransport.LoadData(host + self.settings.cartPathApi + 'clear/' + Parameters.shopId + '/' + str, function(data){
                if(callback)
                    callback(JSON.parse(data));
            });
        }
    };
};