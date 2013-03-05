var CatalogWidget = function(){
    var self = this;
    self.widgetName = 'CatalogWidget';
    self.settings = {
        containerId : null,
        tmplPath : null,
        tmplId : null,
        inputParameters : {},
        styleCatalog : null
    };
    self.InitWidget = function(){
        self.settings.containerId = Config.Containers.catalog;
        self.settings.tmplPath = Config.Catalog.tmpl.path;
        self.settings.tmplId = Config.Catalog.tmpl.tmplId;
        self.settings.styleCatalog = Config.Catalog.style;
        self.RegisterEvents();
        self.SetInputParameters();
        self.SetPosition();
    };
    self.SetInputParameters = function(){
        self.settings.inputParameters = JSCore.ParserInputParameters(/CatalogWidget.js/);
    };
    self.RegisterEvents = function(){

        if(JSLoader.loaded){
            self.BaseLoad.Tmpl(self.settings.tmplPath, function(){
                EventDispatcher.DispatchEvent('catalogWidget.onload.tmpl')
            });
        }
        else{
            EventDispatcher.AddEventListener('onload.scripts', function (data){ 
                self.BaseLoad.Tmpl(self.settings.tmplPath, function(){
                    EventDispatcher.DispatchEvent('catalogWidget.onload.tmpl')
                });
            });
        }
        
        EventDispatcher.AddEventListener('catalogWidget.onload.tmpl', function (data){
            if(Routing.IsSection()){
                self.Update();
            }
            else{
                self.WidgetLoader(true);
                $("#wrapper").removeClass("with_sidebar").addClass("with_top_border");
            }
        });
        
        EventDispatcher.AddEventListener('catalogWidget.fill.section', function(data){
            self.Render.Tree(data);
        });
        
        EventDispatcher.AddEventListener('widget.change.route', function (){
            if(Routing.route == 'catalog'){
                if(Routing.IsSection())
                    self.WidgetLoader(false);
                else
                    self.WidgetLoader(true);

                self.Update();
            }
        });
    };
    self.Update = function(){
        if(Routing.IsSection() && !Parameters.cache.catalogs[Routing.GetActiveCategory()]){
                $("#wrapper").removeClass("with_top_border").addClass("with_sidebar");
                $("#" + self.settings.containerId).show();
                self.BaseLoad.Section(Routing.GetActiveCategory(), function(data){
                    
                    self.BaseLoad.Path(Routing.GetActiveCategory(), function(path){
                        if(path[path.length-1]){
                            var parent = []
                            parent[0] = {
                                id : path[path.length-1].id,
                                name_category : path[path.length-1].name_category,
                                type_category : 'section',
                                back : 'return',
                                children : JSON.parse(Parameters.cache.childrenCategory[Routing.GetActiveCategory()])
                            }
                            self.Fill.Tree(parent);
                        }
                        else{
                            self.Fill.Tree(data);
                        }
                    });
                })
            }
            else if(Routing.IsSection() || Parameters.cache.catalogs[Routing.GetActiveCategory()]){
                $("#wrapper").removeClass("with_top_border").addClass("with_sidebar");
                $("#" + self.settings.containerId).show();
                self.Fill.Tree(JSON.parse(Parameters.cache.roots));
            }
            else{
                $("#" + self.settings.containerId).empty();
                self.WidgetLoader(true);
            }
    }
    self.Fill = {
        Tree : function(data){
            var catalog = new CatalogViewModel();
            for(var i = 0; i <= data.length - 1; i++){
                catalog.AddItem(data[i]);
            }
            EventDispatcher.DispatchEvent('catalogWidget.fill.section', catalog);
        }
    };
    self.Render = {
        Tree : function(data){
            if($("#" + self.settings.containerId).length > 0){
                $("#" + self.settings.containerId).empty();
                $("#" + self.settings.containerId).append($('script#' + self.settings.tmplId).html());
                ko.applyBindings(data, $('#' + self.settings.containerId )[0]);
            }
            self.WidgetLoader(true);
        }
    }
    self.SetPosition = function(){
        if(self.settings.inputParameters['position'] == 'absolute'){
            for(var key in self.settings.inputParameters){
                if(self.settings.styleCatalog[key])
                    self.settings.styleCatalog[key] = self.settings.inputParameters[key];
            }
            $().ready(function(){
                $('#' + self.settings.containerId).css(self.settings.styleCatalog);
            });
        }
    }
}

var CatalogViewModel = function(){
    var self = this;
    self.isActive = Routing.GetActiveCategory();
    self.children = ko.observableArray();
    self.AddItem = function(data){
        var section = new SectionViewModel(data);
        if(data.children){
            for(var i = 0; i <= data.children.length-1; i++){
                var item1 = new ItemViewModel(data.children[i], data.id);
                if(data.children[i].children){
                    for(var j = 0; j <= data.children[i].children.length-1; j++){
                        var item2 = new ItemViewModel(data.children[i].children[j], data.children[i].id);
                        item1.children.push(item2);
                    }
                }
                section.children.push(item1);
            }
        }
        self.children.push(section);
    }
}

var SectionViewModel = function(data){
    var self = this;
    self.id = data.id;
    self.title = ko.computed(function() {
        if(data.back)
            return 'Вверх';
        return data.name_category;
    }, this);
    self.type_category = data.type_category;
    self.listClass = 'catalogCategories_' + data.id;
    self.tabClass = ko.computed(function() {
        if(Routing.GetActiveCategory() == data.id){
            if(data.back)
                return 'listCategories_' + data.id + ' return active'
            else
                return 'listCategories_' + data.id + ' active'
        }
        else
            return 'listCategories_' + data.id;
    }, this);
    self.countGoods = data.count_goods;
    self.children = ko.observableArray();
    self.TextItem = ko.computed(function(){
        var text = data.name_category;
        if(data.count_goods && data.count_goods > 0)
            text = text + ' <span>' + data.count_goods + '</span>';
        return text;
    }, this);
    
    self.ClickSection = function() {
        if(Parameters.cache.catalogs[self.id]){
            var tabTag = $('.listCategories_' + self.id)[0].tagName;
            $(tabTag + '[class^=listCategories]').removeClass('active');
            $('.listCategories_' + self.id).addClass('active');
            var listTag = $('.catalogCategories_' + data.id)[0].tagName; 
            $(listTag + '[class*=catalogCategories]').hide();
            $('.catalogCategories_' + data.id).show();

            params = {section : data.id};
            Routing.SetHash('catalog', data.name_category, params);
        }
        else{
            var path = JSON.parse(Parameters.cache.path[self.id]).path;
            params = {section : path[path.length-2].id};
            Routing.SetHash('catalog', path[path.length-2].name_category, params);
        }
        
    }
}

var ItemViewModel = function(data, parent) {
    var self = this;
    self.id = data.id;
    self.title = data.name_category;
    self.countGoods = data.count_goods;
    self.children = ko.observableArray();
    
    self.TextItem = ko.computed(function(){
        var text = data.name_category;
        if(data.count_goods && data.count_goods > 0)
            text = text + ' <span>' + data.count_goods + '</span>';
        return text;
    }, this);
    self.ClickItem = function() {
        var params;
        if(data.type_category == 'category')
           params = {section : parent, category : data.id};
        else
           params = {section : data.id};

        Routing.SetHash('catalog', self.title, params);
    }
}

var TestCatalog = {
    Init : function(){
        if(typeof Widget == 'function'){
            CatalogWidget.prototype = new Widget();
            var catalog = new CatalogWidget();
            catalog.Init(catalog);
        }
        else{
            setTimeout(function(){TestCatalog.Init()}, 100);
        }
    }
}

TestCatalog.Init();


