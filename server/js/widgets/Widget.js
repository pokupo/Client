Parameters = {
    pathToImages : Config.Base.pathToImages,
    routIconAuction : Config.Base.routIconAuction,
    sortingBlockContainer : Config.Base.sortingBlockContainer,
    containerIdForTmpl : Config.Base.containerIdForTmpl,
    loading : Config.Base.loading,
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
        tmpl : {}
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
}

var ReadyWidgets = {
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
}

function Widget(){
    var self = this;
    this.isReady = false;
    this.settings = {
        hostApi : Config.Base.hostApi,
        catalogPathApi : Config.Base.catalogPathApi,
        goodsPathApi : Config.Base.goodsPathApi,
        
        dataForCatalog : "getCatalogData",
        dataForSection : "getSectionData",
        dataPathForItem : "getPath",
        dataForContent : "getContent",
        dataBlocksForCatalog : "getBlock",
        dataCategoryInfo : 'getCategoryInfo',
        dataSearchContent : 'getSearchContent',
        hashParameters : {
    }
    };
    this.Init = function(widget){
        if ( JSCore !== undefined && JSCore.isReady && ReadyWidgets !== undefined && Config !== undefined && Route !== undefined && ko !== undefined){
            ReadyWidgets.Indicator(widget.widgetName, false);
            this.SelfInit();
            this.BaseLoad.Roots(function(){
                widget.InitWidget();
            });
        }else{
            window.setTimeout(this.Init, 100);
        }
    };
    this.SelfInit = function(){
        if(!this.isReady){
            this.isReady = true;
            this.RegistrCustomBindings();
            Route.ParserHash(true);
            this.Events();
            Parameters.shopId = JSSettings.inputParameters['shopId']
        }
    };
    this.Events = function(){       
        EventDispatcher.AddEventListener('widget.onload.script', function(data){
            window[data.options.widget].prototype = new Widget();
            var embed = new window[data.options.widget]();
            embed.SetParameters(data);
            embed.Init(embed); 
        });
    };
    this.CreateContainer = function(){
        if($('#' + self.settings.containerIdForTmpl).length == 0)
            $('body').append("<div id='" + Parameters.containerIdForTmpl + "'></div>");
    };
    this.RegistrCustomBindings = function(){
        ko.bindingHandlers.embedWidget = {
            init: function(element, valueAccessor) {
                var options = valueAccessor() || {};
                self.BaseLoad.Script('widgets/' + options.widget + '.js', function(){
                    EventDispatcher.DispatchEvent('widget.onload.script', {element:element, options:options});
                })
            }
        }
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
                })
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
                        })
                })
            }
            else{
                if(callback)
                    callback({
                        'data' : JSON.parse(Parameters.cache.childrenCategory[parentId]), 
                        'parentId' : parentId
                    })
            }
        },
        Blocks : function(parentId, callback){
            if(!Parameters.cache.block[parentId]){
                XDMTransport.LoadData(encodeURIComponent(self.settings.hostApi + self.settings.catalogPathApi + parentId + '/children/block/active'), function(data){
                    Parameters.cache.block[parentId] = data;
                    if(callback)
                        callback(JSON.parse(data))
                })
            }
            else{
                if(callback)
                    callback(JSON.parse(Parameters.cache.block[parentId]))
            }
        },
        Content : function(categoryId, query, callback){
            var queryHash = categoryId + EventDispatcher.hashCode(query);
            if(!Parameters.cache.content[queryHash]){
                XDMTransport.LoadData(encodeURIComponent(self.settings.hostApi + self.settings.catalogPathApi + categoryId + '/goods/' + query), function(data){
                    Parameters.cache.content[queryHash] = {"categoryId" : categoryId , "content" : JSON.parse(data)};
                    if(callback)
                        callback(Parameters.cache.content[queryHash]);
                })
            }
            else{
                if(callback)
                    callback(Parameters.cache.content[queryHash]);
            }
        },
        SearchContent : function(shopId, query, callback){
            var queryHash = shopId + EventDispatcher.hashCode(query);
            if(!Parameters.cache.searchContent[queryHash]){
                XDMTransport.LoadData(encodeURIComponent(self.settings.hostApi + self.settings.goodsPathApi + shopId + '/search/' + query), function(data){
                    Parameters.cache.searchContent[queryHash] = JSON.parse(data);
                    if(callback)
                        callback(Parameters.cache.searchContent[queryHash]);
                })
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
                })
            }
            else{
                if(callback)
                    callback(JSON.parse(Parameters.cache.infoCategory[id]))
            }
        },
        Tmpl : function(tmpl, callback){
            if(!Parameters.cache.tmpl[EventDispatcher.hashCode(tmpl)]){
                self.CreateContainer();
                XDMTransport.LoadTmpl(tmpl,function(data){
                    $("#" + Parameters.containerIdForTmpl).append(data);
                    if(callback)callback();
                })
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
                    })
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
                })
            }
            else{
                if(callback)
                    callback(JSON.parse(Parameters.cache.goodsInfo[id]));
            }
        },
        Script : function(script, callback){
            if(!Parameters.cache.scripts[EventDispatcher.hashCode(script)]){
                if(!$.isArray(script))
                    script = [script];
                JSLoader.Load(script, callback);
            }
            else{
                if(callback)callback();
            }
        },
        RelatedGoods : function(id, query, callback){
            var queryHash = id + EventDispatcher.hashCode(query);
            if(!Parameters.cache.relatedGoods[queryHash]){
                XDMTransport.LoadData(encodeURIComponent(self.settings.hostApi + self.settings.goodsPathApi+ id +'/link/' + query + '/'), function(data){
                    Parameters.cache.relatedGoods[queryHash] = data;
                    if(callback)
                        callback(JSON.parse(data));
                })
            }
            else{
                if(callback)
                    callback(JSON.parse(Parameters.cache.relatedGoods[queryHash]));
            }
        }
    };
}