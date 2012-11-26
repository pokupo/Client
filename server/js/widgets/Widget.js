Parameters = {
    activeSection : null,
    activeItem : null,
    activeCatalog : null,
    lastItem : null,
    typeCategory : "",
    shopId : null,
    cache : {
        'path' : {},
        'childrenCategory' : {},
        'block' : {},
        'contentBlock' : {},
        'roots': {}
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
            if(data.type_category == "section"){
                Parameters.activeSection = data.id;
                Parameters.activeItem = null;
                var href = "/catalog=" + Parameters.activeCatalog + "&section=" + Parameters.activeSection
            }
            else{
                Parameters.activeItem = data.id;
                 var href = "/catalog=" + Parameters.activeCatalog + "&section=" + Parameters.activeSection + "&category=" + Parameters.activeItem;
            }
            
            Parameters.lastItem = data.id;
            Parameters.typeCategory = data.type_category;
            
            if(Parameters.typeCategory == 'section')
                EventDispatcher.DispatchEvent('widget.change.section', data.id);
            else if(Parameters.typeCategory == 'category')
                EventDispatcher.DispatchEvent('widget.change.category', data.id);

            window.location.hash = href;
            document.title = data.name_category;
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
        Parameters.activeCatalog = this.settings.hashParameters['catalog'];
        if(Parameters.activeCatalog){
            Parameters.lastItem = Parameters.activeCatalog;
            Parameters.typeCategory = 'section';
        }
        Parameters.activeSection = this.settings.hashParameters['section'];
        if(Parameters.activeSection){
            Parameters.lastItem = Parameters.activeSection;
            Parameters.typeCategory = 'section';
        }
        Parameters.activeItem = this.settings.hashParameters['category'];
        if(Parameters.activeItem){
            Parameters.lastItem = Parameters.activeItem;
            Parameters.typeCategory = 'category';
        }
    };
}