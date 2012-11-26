var CatalogWidget = function(conteiner){
    var self = this;
    self.sections = null;
    self.items = null;
    self.settingsCatalog = {
        containerIdForCatalog : "", //"catalog",
        tmplForCatalog : "catalog/catalogTmpl.html",
        inputParameters : {},
        styleCatalog : {
            'position' : 'absolute', 
            'top' : '100px', 
            'left' : '5%', 
            'width' : '20%', 
            'height' : '200px', 
            'background' : '#ddd'
        }
    };
    self.InitWidget = function(){
        self.settingsCatalog.containerIdForCatalog = conteiner;
        self.CreateContainer();
        self.RegisterEvents();
        self.SetParametersFromHash();
        self.SetInputParameters();
        self.SetPosition();
    };
    self.Load = {
        SectionData : function(){
            if(Parameters.cache.roots){
                XDMTransport.LoadData(self.settings.dataForSection + '&shopId=' + Parameters.shopId, function(data){
                    Parameters.cache.roots = data;
                    EventDispatcher.DispatchEvent('onload.data.sectionCatalog', JSON.parse(data));
                })
            }
            else{
                EventDispatcher.DispatchEvent('onload.data.sectionCatalog', JSON.parse(Parameters.cache.roots));
            }
        },
        CatalogData : function(id){
            if(Parameters.cache.childrenCategory){
                XDMTransport.LoadData(self.settings.dataForCatalog + "&parentId=" + id, function(data){
                    Parameters.cache.childrenCategory[id] = data;
                    EventDispatcher.DispatchEvent('onload.data.catalog%%' + id, JSON.parse(data));
                })
            }
            else{
                EventDispatcher.DispatchEvent('onload.data.catalog%%' + id, JSON.parse(Parameters.cache.childrenCategory[id]));
            }
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
            $("#" + self.settingsCatalog.containerIdForCatalog).append($('script#catalogTmpl').html());
        ko.applyBindings(self.sections, $('.catalogSection')[0]);
    };
    self.Render = function(parentBlock,id){
        var ulId = 'catalogCategories_' + id;
        $(parentBlock).append($('script#catalogUlTmpl').html());
        $(parentBlock + ' .sectionCategories:last').attr('id', ulId).hide();
        if(id == Parameters.activeCatalog)
            $('#catalogCategories_' + Parameters.activeCatalog).show();
            
        ko.applyBindings(self.items, document.getElementById(ulId));
        $(parentBlock).filter('li').addClass('menuparent');
    };
    self.RegisterEvents = function(){

        if(JSLoader.loaded){
            self.LoadTmpl(self.settingsCatalog.tmplForCatalog, function(){ EventDispatcher.DispatchEvent('onload.catalog.tmpl')});
        }
        else{
            EventDispatcher.AddEventListener('onload.scripts', function (data){ 
                self.LoadTmpl(self.settingsCatalog.tmplForCatalog, function(){EventDispatcher.DispatchEvent('onload.catalog.tmpl')});
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
                Parameters.activeCatalog = id;
                Parameters.lastItem = id;
                Parameters.typeCategory = data.type_category;
                $(this).addClass('active');
                $(blockMenu + ' ul').hide();
                $(blockMenu + ' #catalogCategories_' + id).show();
                var href = "/catalog=" + Parameters.activeCatalog;
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
    };
    self.FillDataSection = function(data){
        var sections = [];
        for(var i = 0; i <= data.length-1; i++){
            var active = '';
            if(Parameters.activeCatalog == data[i].id || (i == 0 && Parameters.activeCatalog == null)){
                Parameters.activeCatalog = data[i].id;
                Parameters.typeCategory = 'section';
                active = ' active';
            }
            sections[i] = (new Section(data[i], active));
        }

        self.sections =  SectionViewModel(sections);
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
    self.SetInputParameters = function(){
        self.settingsCatalog.inputParameters = JSCore.ParserInputParameters(/CatalogWidget.js/);
    };
    self.SetPosition = function(){
        if(self.settingsCatalog.inputParameters['position'] == 'absolute'){
            for(var key in self.settingsCatalog.inputParameters){
                if(self.settingsCatalog.styleCatalog[key])
                    self.settingsCatalog.styleCatalog[key] = self.settingsCatalog.inputParameters[key];
            }
            $().ready(function(){
                $('#catalog').css(self.settingsCatalog.styleCatalog);
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
        EventDispatcher.DispatchEvent('widget.click.item', data)
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
    self.sectionCss = 'catalogSection';
    self.sections = ko.observableArray(sections); 
}

var TestCatalog = {
    Init : function(){
        if(typeof Widget == 'function' && JSCore !== undefined){
            CatalogWidget.prototype = new Widget();
            var catalog = new CatalogWidget('catalog');
            catalog.Init();
        }
        else{
            window.setTimeout(TestCatalog.Init, 100);
        }
    }
}

TestCatalog.Init();


