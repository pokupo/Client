Parameters = {
    catalogs : [],
    crumbsTitle : [],
    activeSection : 0,
    activeItem : 0,
    activeCatalog : 0,
    defaultCatalog : 0,
    lastItem : 0,
    typeCategory : "",
    shopId : 0,
    cache : {
        'path' : {},
        'childrenCategory' : {},
        'block' : {},
        'contentBlock' : {},
        'roots': {},
        'infoCategory' : {}
    }
}

function Widget(){
    this.isReady = false;
    this.settings = {
        dataForCatalog : "getCatalogData",
        dataForSection : "getSectionData",
        dataPathForItem : "getPath",
        dataForContent : "getContent",
        dataBlocksForCatalog : "getBlock",
        dataCategoryInfo : 'getCategoryInfo',
        containerIdForTmpl : "container_tmpl",
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
                if(data.type_category == "section"){
                    Parameters.activeSection = data.id;
                    Parameters.activeItem = 0;
                    var href = "/catalog=" + Parameters.activeCatalog + "&section=" + Parameters.activeSection
                }
                else{
                    Parameters.activeItem = data.id;
                    var href = "/catalog=" + Parameters.activeCatalog + "&section=" + Parameters.activeSection + "&category=" + Parameters.activeItem;
                }

                Parameters.lastItem = data.id;
                Parameters.typeCategory = data.type_category;
                title = data.name_category;

                if(Parameters.typeCategory == 'section')
                    EventDispatcher.DispatchEvent('widget.change.section', data.id);
                else if(Parameters.typeCategory == 'category')
                    EventDispatcher.DispatchEvent('widget.change.category', data.id);
            }
            else{
                Parameters.activeSection = 0;
                Parameters.activeItem = 0;
                Parameters.lastItem = 0;
                Parameters.typeCategory = "";
                href = '';
            }

            window.location.hash = href;
            document.title = title;
            EventDispatcher.DispatchEvent('widget.changeHash')
        });
        
        EventDispatcher.AddEventListener('widget.click.content', function(data){
            alert('click product');
        });
    };
    this.CreateContainer = function(){
        if($('#' + this.settings.containerIdForTmpl).length == 0)
            $('body').append("<div id='" + this.settings.containerIdForTmpl + "'></div>");
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
    this.LoadTmpl = function(tmpl, callback){
        var self = this;
        XDMTransport.LoadTmpl(tmpl,function(data){
            $("#" + self.settings.containerIdForTmpl).append(data);
            if(callback)callback();
        })
    };
    this.LoadPath = function(callback){
        if(Parameters.lastItem){
            if(!Parameters.cache.path[Parameters.lastItem]){
                XDMTransport.LoadData(this.settings.dataPathForItem + '&category=' + Parameters.lastItem, function(data){
                    var path = JSON.parse(data)['path'];
                    Parameters.cache.path[Parameters.lastItem] = path;
                    EventDispatcher.DispatchEvent('onload.data.path', path);
                })
            }
            else{
                EventDispatcher.DispatchEvent('onload.data.path', Parameters.cache.path[Parameters.lastItem]);
            }
        }
    };
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
    };
}