Parameters = {
    pathToImages : "http://dev.pokupo.ru/images",
    routIconAuction : "http://dev.pokupo.ru/images/ico_30.png",
    sortingBlockContainer : '.sorting_block',
    containerIdForTmpl : "container_tmpl",
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
        roots: [],
        infoCategory : {},
        typeView : '',
        pageId: 1
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
        hashParameters : {
    }
    };
    this.Init = function(){
        if ( JSCore !== undefined && JSCore.isReady){
            this.SelfInit();
            this.InitWidget();
        }else{
            window.setTimeout(this.Init, 100);
        }
    };
    this.SelfInit = function(){
        if(!this.isReady){
            this.ParserPath();
            this.SetParametersFromHash();
            this.Events();
            Parameters.shopId = JSSettings.inputParameters['shopId']
            this.isReady = true;
        }
    };
    this.Events = function(){
        EventDispatcher.AddEventListener('widget.click.item', function (data){
            var title = 'Домашняя';
            if(data){
                Parameters.activeSection = 0;
                Parameters.activeItem = 0;
                Parameters.typeCategory = data.type_category;
                Parameters.lastItem = data.id;
                title = data.name_category;
                if(data.type_category == "section" && Parameters.cache.catalogs[data.id]){
                    var href = "/catalog=" + Parameters.activeCatalog;
                }
                else if(data.type_category == "section" && !Parameters.cache.catalogs[data.id]){
                    Parameters.activeSection = data.id;
                    var href = "/catalog=" + Parameters.activeCatalog + "&section=" + Parameters.activeSection
                }
                else{
                    Parameters.activeItem = data.id;
                    Parameters.typeCategory = 'category';
                    if(Parameters.activeSection != 0)
                        var href = "/catalog=" + Parameters.activeCatalog + "&section=" + Parameters.activeSection + "&category=" + Parameters.activeItem;
                    else
                        var href = "/catalog=" + Parameters.activeCatalog + "&category=" + Parameters.activeItem;
                }
            }
            else{
                Parameters.activeSection = 0;
                Parameters.activeItem = 0;
                Parameters.lastItem = 0;
                Parameters.typeCategory = "homepage";
                href = '';
            }

            window.location.hash = href;
            document.title = title;
            EventDispatcher.DispatchEvent('widget.changeHash');
        });
    };
    this.CreateContainer = function(){
        if($('#' + self.settings.containerIdForTmpl).length == 0)
            $('#main').append("<div id='" + Parameters.containerIdForTmpl + "'></div>");
    };
    this.RegistrCustomBindings = function(){
        ko.bindingHandlers.UpdateId = {
            update: function(element, valueAccessor) {
                var id = $(element).attr('id');
                var value = valueAccessor();
                $(element).attr('id', id + '_' + value);
            }
        }
    };
    this.BaseLoad  = {
        Roots : function(callback){
            if(Parameters.cache.roots){
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
        Content : function(categoryId, startContent, countGoodsPerPage, orderByContent, filterName, callback){
            var queryHash = MD5(categoryId + startContent + countGoodsPerPage + orderByContent + filterName);
            if(!Parameters.cache.content[queryHash]){
                XDMTransport.LoadData(self.settings.dataForContent + "&categoryId=" + categoryId + "&start=" + startContent + "&count=" + countGoodsPerPage + "&orderBy=" + orderByContent + "&filterName=" + filterName, function(data){
                    Parameters.cache.content[queryHash] = data;
                    if(callback)
                        callback(JSON.parse(data));
                })
            }
            else{
                if(callback)
                    callback(JSON.parse(Parameters.cache.content[queryHash]));
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
    }
    this.ParserPath = function(){
        var hash = window.location.hash;
        hash = hash.replace(/(^#\/)/g, '')
        var parameters = hash.split('&');
        for(var i = 0; i <= parameters.length-1; i++){
            var parameter = parameters[i].split('='); 
            this.settings.hashParameters[parameter[0]] = parameter[1];
        }
    };
    this.SetParametersFromHash = function(){
        if(this.settings.hashParameters['catalog']){
            Parameters.activeCatalog = this.settings.hashParameters['catalog'];
            Parameters.lastItem = Parameters.activeCatalog;
            Parameters.typeCategory = 'section';
        }
        if(this.settings.hashParameters['section']){
            Parameters.activeSection = this.settings.hashParameters['section'];
            Parameters.lastItem = Parameters.activeSection;
            Parameters.typeCategory = 'section';
        }
        if(this.settings.hashParameters['category']){
            Parameters.activeItem = this.settings.hashParameters['category'];
            Parameters.lastItem = Parameters.activeItem;
            Parameters.typeCategory = 'category';
        }
        if(this.settings.hashParameters['page']){
            Parameters.cache.pageId = this.settings.hashParameters['page'];
        }
    };
}