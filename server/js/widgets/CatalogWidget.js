var CatalogWidget = function(conteiner){
    var self = this;
    self.sections = null;
    self.items = null;
    self.activeSection = null;
    self.activeItem = null;
    self.settings = {
        containerIdForCatalog : conteiner, //"catalog",
        tmplForCatalog : "catalog/catalogTmpl.html",
        dataForCatalog : "getCatalogData",
        dataForSection : "getSectionData",
        inputParameters : {},
        containerIdForTmpl : "container_tmpl",
        shopId : '',
        styleCatalog : {
            'position' : 'absolute', 
            'top' : '100px', 
            'left' : '5%', 
            'width' : '20%', 
            'height' : '200px', 
            'background' : '#ddd'
        }
    };
    self.Init = function(){
        if ( JSCore !== undefined && JSCore.isReady){
                self.InitWidget();
        }else{
            window.setTimeout(self.Init, 100);
        }
    };
    self.InitWidget = function(){
        self.RegisterEvents();
        self.SetParametersFromHash();
        self.SetInputParameters();
        self.SetPosition();
    };
    self.Load = {
        Tmpl : function(){ 
            XDMTransport.LoadTmpl(self.settings.tmplForCatalog,function(data){ 
                if($('#' + self.settings.containerIdForTmpl).length == 0)
                    $('body').append("<div id='" + self.settings.containerIdForTmpl + "'></div>");
                $("#" + self.settings.containerIdForTmpl).append(data);
                EventDispatcher.DispatchEvent('onload.catalog.tmpl');
            })
        },
        SectionData : function(){
            XDMTransport.LoadData(self.settings.dataForSection + '&shopId=' + self.settings.shopId, function(data){
                EventDispatcher.DispatchEvent('onload.data.sectionCatalog', JSON.parse(data));
            })
        },
        CatalogData : function(id){
            XDMTransport.LoadData(self.settings.dataForCatalog + "&parentId=" + id, function(data){
                EventDispatcher.DispatchEvent('onload.data.catalog%%' + id, JSON.parse(data));
            })
        },
        ChildrenCategory : function(data){
            for(var j = 0; j <= data.items.length-1; j++){
                self.Load.CatalogData(data.items[j].id);
                EventDispatcher.AddEventListener('onload.data.catalog%%' + data.items[j].id, function (data){
                    if(data.items.message_error === undefined){
                        self.FillData(data.items, data.parentId);
                        self.Render('.catalogCategories_' + data.parentId, data.parentId)
                    }
                });
            };
        }
    };
    self.RenderSection = function(){
        if($('.sidebar_block_menu').length == 0)
            $("#" + self.settings.containerIdForCatalog).append($('script#catalogTmpl').html());
        ko.applyBindings(self.sections, document.getElementById('catalogSection'));
    };
    self.Render = function(parentBlock,id){
        var ulId = 'catalogCategories_' + id;
        $(parentBlock).append($('script#catalogUlTmpl').html());
        $(parentBlock + ' .sectionCategories:last').attr('id', ulId);
        if(id == self.activeSection)
            $('#' + ulId).show();
            
        ko.applyBindings(self.items, document.getElementById(ulId));
        $(parentBlock).filter('li').addClass('menuparent');
    };
    self.RegisterEvents = function(){

        if(JSLoader.loaded){
            self.Load.Tmpl();
        }
        else{
            EventDispatcher.AddEventListener('onload.scripts', function (data){ 
                self.Load.Tmpl();
            });
        }
        
        EventDispatcher.AddEventListener('onload.catalog.tmpl', function (data){
            self.Load.SectionData();
        });
        
        EventDispatcher.AddEventListener('catalog.section.rendering.ready', function (data){
            var blockMenu = '.sidebar_block_menu';
            $(blockMenu + ' .top_tabs span').click(function(){
                $(blockMenu + ' .top_tabs span').removeClass('active');
                var id = $(this).attr('class').split('_')[1];
                self.activeSection = id;
                $(this).addClass('active');
                $(blockMenu + ' ul').hide();
                $(blockMenu + ' #catalogCategories_' + id).show();
                var href = "/section=" + self.activeSection;
                window.location.hash = href;
            });
        });
        
        EventDispatcher.AddEventListener('onload.data.sectionCatalog', function (data){
            self.FillDataSection(data);
            EventDispatcher.DispatchEvent('onload.data.catalog', data);
            self.RenderSection();
            EventDispatcher.DispatchEvent('catalog.section.rendering.ready', data);
        });

        EventDispatcher.AddEventListener('onload.data.catalog', function (sections){
            self.ViewModelItems = ko.observableArray;
            for(var i = 0; i <= sections.length-1; i++){
                self.Load.CatalogData(sections[i].id);
                EventDispatcher.AddEventListener('onload.data.catalog%%' + sections[i].id, function (data){
                    data.items.message_error
                    if(data.items.message_error === undefined){
                        self.FillData(data.items, data.parentId);
                        self.Render('.sidebar_block_menu', data.parentId)

                        self.Load.ChildrenCategory(data);
                    }
                });
            }
        });
        
        EventDispatcher.AddEventListener('catalog.click.item', function (data){
            self.activeItem = data.id;
            var href = "/section=" + self.activeSection + "&category=" + self.activeItem;
            window.location.hash = href;
            document.title = data.title;
        });
        
    };
    self.FillDataSection = function(data){
        var sections = [];
        for(var i = 0; i <= data.length-1; i++){
            var active = '';
            if(self.activeSection == data[i].id || (i == 0 && self.activeSection == null)){
                self.activeSection = data[i].id;
                active = ' active';
            }
            sections[i] = (new Section(data[i], active));
        }

        self.Section =  SectionViewModel(sections);
    };
    self.FillData = function(data, id){
        var items = [];
        for(var i = 0; i <= data.length-1; i++){
            items[i] = (new CatalogItem(data[i]));
        }
 
        if(!self.items)
            self.items = ko.observableArray();
        self.items.push = CatalogViewModel(id, items);
    };
    self.SetParametersFromHash = function(){
        self.activeSection = JSSettings.hashParameters['section'];
        self.activeItem = JSSettings.hashParameters['category'];
    };
    self.SetInputParameters = function(){
        self.settings.inputParameters = JSCore.ParserInputParameters(/CatalogWidget.js/);
        self.settings.shopId = JSSettings.inputParameters['shopId'];
    };
    self.SetPosition = function(){
        if(self.settings.inputParameters['position'] == 'absolute'){
            for(var key in self.settings.inputParameters){
                if(self.settings.styleCatalog[key])
                    self.settings.styleCatalog[key] = self.settings.inputParameters[key];
            }
            $().ready(function(){
                $('#catalog').css(self.settings.styleCatalog);
            });
        }
    }
}

var CatalogItem = function(data) {
    var self = this;
    self.id = data.id;
    self.title = data.name_category;
    self.countGoods = data.count_goods;
    self.TextItem = ko.computed(function(){
        var text = data.name_category;
        if(data.count_goods && data.count_goods > 0)
            text = text + ' <span>' + data.count_goods + '</span>';
        return text;
    }, this);
    self.cssli = 'catalogCategories_' + data.id;
    self.ClickItem = function() {
        EventDispatcher.DispatchEvent('catalog.click.item', data)
    }
}

var CatalogViewModel = function(id, items) {
    var self = this;
    self.parentId = id;
    self.cssUl = 'catalogCategories_' + id;
    self.items = ko.observableArray(items); 
}

var Section = function(data, active){
    var self = this;
    self.id = data.id;
    self.title = data.name_category;
    self.cssUl = 'catalogCategories_' + data.id;
    self.cssSpan = 'listCategories_' + data.id + active;
}

var SectionViewModel = function(sections) {
    var self = this;
    self.sections = ko.observableArray(sections); 
}

var catalog = new CatalogWidget('catalog');
catalog.Init();


