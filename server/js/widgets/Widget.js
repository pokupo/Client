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
    activeSection : 0,
    activeItem : 0,
    activeCatalog : 0,
    lastItem : 0,
    typeCategory : "",
    shopId : 0,
    cache : {
        catalogs : [],
        crumbsTitle : [],
        path : {},
        childrenCategory : {},
        block : {},
        contentBlock : {},
        content : {},
        searchContent : {},
        roots: [],
        infoCategory : {},
        typeView : '',
        pageId: 1,
        searchPageId : 1
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

var Route = {
    route : '',
    params : {},
    more : {},
    SetHash : function(route, title, data){
        this.route = route;
        var params = [];
        this.more = {};
        for(var key in data){
            if(data[key] && key != 'idCategories'){
                if(key != 'page')
                    params.push(key + '=' + decodeURIComponent(data[key]));
                else if(data[key] != 1)
                    params.push(key + '=' + data[key]);
            }
        }
        var href = '/' + route + '/' + params.join("&");

        window.location.hash = href;
        document.title = title;
        
        this.ParserHash();
        EventDispatcher.DispatchEvent('widget.change.route');
    },
    ParserHash: function(){
        var hash = window.location.hash;
        hash = hash.split("/");
        
        if(hash[1])
           Route.route = hash[1];
        else
           Route.route = 'catalog';
       
        Route.params = {};
            
        if(hash[2]){
            var parameters = hash[2].split('&');
            for(var i = 0; i <= parameters.length-1; i++){
                var parameter = parameters[i].split('='); 
                Route.params[parameter[0]] = parameter[1];
            }
        }
    },
    GetActiveCategory : function(){
        if(Route.route == 'catalog'){
            if(Route.params.category)
                return Route.params.category;
            if(Route.params.section)
                return Route.params.section;
        }
        if(Route.route == 'search'){
            if(Route.params.idCategories && Route.params.idCategories.split(",").length == 1)
                return parseInt(Route.params.idCategories);
        }
        
        return this.GetDefaultSection();
    },
    GetDefaultSection : function(){
        if(Config.Base.defaultSection == null){
            for(var key in Parameters.cache.catalogs){
                return Parameters.cache.catalogs[key];
                break;
            }
        }
        return Config.Base.defaultSection;
    },
    IsCategory : function(){
        if(Route.route == 'catalog'){
            if(Route.params.category)
                return true;
        }
        return false;
    },
    GetCategory : function(){
        if(Route.route == 'catalog'){
            if(Route.params.category)
                return Route.params.category;
        }
        return 0;
    },
    IsSection : function(){
        if(Route.route == 'catalog'){
            if(!Route.params.category)
                return true;
        }
        return false;
    },
    GetSection : function(){
        if(Route.route == 'catalog'){
            if(Route.params.section)
                return Route.params.section;
        }
        return 0;
    },
    GetPath : function(data){
        if(data[data.length-1].type_category == 'category'){
           return {section : data[data.length-2].id, category : data[data.length-1].id};
        }
        return {section : data[data.length-1].id};
    },
    UpdateHash : function(opt){
        for(var key in opt){
            this.params[key] = opt[key];
        }
        
        var params = [];
        for(var key in this.params){
            if(key != 'page')
                params.push(key + '=' + decodeURIComponent(this.params[key]));
            else if(this.params[key] != 1)
                params.push(key + '=' + this.params[key]);
        }
        var href = '/' + this.route + '/' + params.join("&");
        
        window.location.hash = href;
        
        this.ParserHash();
        EventDispatcher.DispatchEvent('widget.change.route');
    },
    UpdateMoreParameters : function(opt){
        for(var key in opt){
            this.more[key] = opt[key];
        }
    },
    SetMoreParameters : function(opt){
        this.more = opt;
    },
    GetMoreParameter : function(name){
        if(this.more[name])
            return this.more[name];
        return '';
    },
    GetCurrentPage : function(){
        if(this.params.page)
            return parseInt(this.params.page);
        return 1;
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
        for(var key in Config.Conteiners){
            if($.isArray(Config.Conteiners[key])){
                for(var i in Config.Conteiners[key]){
                    $("#" + Config.Conteiners[key][i]).children().hide();
                }
            }
            else
                $("#" + Config.Conteiners[key]).children().hide();
        }
    },
    ShowContent : function(){
        for(var key in Config.Conteiners){
            $("#" + Config.Conteiners[key]).children().show();
        }
    }
}

function Widget(){
    var self = this;
    this.isReady = false;
    this.settings = {
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
        if ( JSCore !== undefined && JSCore.isReady && ReadyWidgets !== undefined){
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
            Route.ParserHash();
            this.Events();
            Parameters.shopId = JSSettings.inputParameters['shopId']
            this.isReady = true;
        }
    };
    this.Events = function(){       
        
    };
    this.CreateContainer = function(){
        if($('#' + self.settings.containerIdForTmpl).length == 0)
            $('body').append("<div id='" + Parameters.containerIdForTmpl + "'></div>");
    };
    this.BaseLoad  = {
        Roots : function(callback){
            if(Parameters.cache.roots.length == 0){
                XDMTransport.LoadData(self.settings.dataForSection + '&shopId=' + Parameters.shopId, function(data){
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
                XDMTransport.LoadData(self.settings.dataForCatalog + "&parentId=" + parentId, function(data){
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
                XDMTransport.LoadData(self.settings.dataBlocksForCatalog + "&parentId=" + parentId, function(data){
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
        Content : function(query, categoryId, callback){
            var queryHash = EventDispatcher.hashCode(query);
            
            if(!Parameters.cache.content[queryHash]){
                XDMTransport.LoadData(self.settings.dataForContent + "&" + query, function(data){
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
        SearchContent : function(query, callback){
            var queryHash = EventDispatcher.hashCode(query);
            if(!Parameters.cache.searchContent[queryHash]){
                XDMTransport.LoadData(self.settings.dataSearchContent + query, function(data){
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
                XDMTransport.LoadData(self.settings.dataCategoryInfo + "&categoryId=" + id, function(data){
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
            self.CreateContainer();
            XDMTransport.LoadTmpl(tmpl,function(data){
                $("#" + Parameters.containerIdForTmpl).append(data);
                if(callback)callback(data);
            })
        },
        Path : function(categoryId, callback){
            if(categoryId){
                if(!Parameters.cache.path[categoryId]){
                    XDMTransport.LoadData(self.settings.dataPathForItem + '&categoryId=' + categoryId, function(data){
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
        }
    };
}