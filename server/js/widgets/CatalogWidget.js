var CatalogWidget = function(conteiner){
    var self = this;
    self.widgetName = 'CatalogWidget';
    self.settingsCatalog = {
        isFirst : true,
        containerIdForCatalog : "", //"catalog",
        tmplForCatalog : Config.Catalog.tmpl,
        inputParameters : {},
        styleCatalog : Config.Catalog.style
    };
    self.InitWidget = function(){
        self.settingsCatalog.containerIdForCatalog = conteiner;
        self.RegisterEvents();
        self.SetInputParameters();
        self.SetPosition();
    };
    self.SetInputParameters = function(){
        self.settingsCatalog.inputParameters = JSCore.ParserInputParameters(/CatalogWidget.js/);
    };
    self.RegisterEvents = function(){

        if(JSLoader.loaded){
            self.BaseLoad.Tmpl(self.settingsCatalog.tmplForCatalog, function(){
                EventDispatcher.DispatchEvent('catalogWidget.onload.tmpl')
            });
        }
        else{
            EventDispatcher.AddEventListener('onload.scripts', function (data){ 
                self.BaseLoad.Tmpl(self.settingsCatalog.tmplForCatalog, function(){
                    EventDispatcher.DispatchEvent('catalogWidget.onload.tmpl')
                });
            });
        }
        
        EventDispatcher.AddEventListener('catalogWidget.onload.tmpl', function (data){
            if(Route.IsSection()){
                self.Update();
            }
            else{
                ReadyWidgets.Indicator('CatalogWidget', true);
                $("#wrapper").removeClass("with_sidebar").addClass("with_top_border");
            }
        });
        
        EventDispatcher.AddEventListener('catalogWidget.fill.section', function(data){
            self.Render.Catalog(data);
        });
        
        EventDispatcher.AddEventListener('widget.change.route', function (){
            if(Route.route == 'catalog'){
                if(Route.IsSection())
                    ReadyWidgets.Indicator('CatalogWidget', false);
                else
                    ReadyWidgets.Indicator('CatalogWidget', true);

                self.Update();
            }
        });
    };
    self.Update = function(){
        if(Route.IsSection() && !Parameters.cache.catalogs[Route.GetActiveCategory()]){
                $("#wrapper").removeClass("with_top_border").addClass("with_sidebar");
                $("#" + self.settingsCatalog.containerIdForCatalog).show();
                self.BaseLoad.Section(Route.GetActiveCategory(), function(data){
                    
                    self.BaseLoad.Path(Route.GetActiveCategory(), function(path){
                        if(path[path.length-1]){
                            var parent = []
                            parent[0] = {
                                id : path[path.length-1].id,
                                name_category : 'Вверх',
                                type_category : 'section',
                                back : 'return',
                                children : JSON.parse(Parameters.cache.childrenCategory[Route.GetActiveCategory()])
                            }
                            self.Fill.Tree(parent);
                        }
                        else{
                            self.Fill.Tree(data);
                        }
                    });
                })
            }
            else if(Route.IsSection() || Parameters.cache.catalogs[Route.GetActiveCategory()]){
                $("#wrapper").removeClass("with_top_border").addClass("with_sidebar");
                $("#" + self.settingsCatalog.containerIdForCatalog).show();
                self.Fill.Tree(JSON.parse(Parameters.cache.roots));
            }
            else{
                $("#" + self.settingsCatalog.containerIdForCatalog).empty();
                ReadyWidgets.Indicator('CatalogWidget', true);
            }
    }
    self.Fill = {
        Tree : function(data){
            var catalog = new Catalog();
            for(var i = 0; i <= data.length - 1; i++){
                catalog.AddItem(data[i]);
            }
            EventDispatcher.DispatchEvent('catalogWidget.fill.section', catalog);
        }
    };
    self.Render = {
        Catalog : function(data){
            if($("#" + self.settingsCatalog.containerIdForCatalog).length > 0){
                $("#" + self.settingsCatalog.containerIdForCatalog).empty();
                $("#" + self.settingsCatalog.containerIdForCatalog).append($('script#catalogTmpl').html());
                ko.applyBindings(data, $('#' + self.settingsCatalog.containerIdForCatalog )[0]);
            }
            ReadyWidgets.Indicator('CatalogWidget', true);
        }
    }
    self.SetPosition = function(){
        if(self.settingsCatalog.inputParameters['position'] == 'absolute'){
            for(var key in self.settingsCatalog.inputParameters){
                if(self.settingsCatalog.styleCatalog[key])
                    self.settingsCatalog.styleCatalog[key] = self.settingsCatalog.inputParameters[key];
            }
            $().ready(function(){
                $('#' + self.settingsCatalog.containerIdForCatalog).css(self.settingsCatalog.styleCatalog);
            });
        }
    }
}

var Catalog = function(){
    var self = this;
    self.isActive = Route.GetActiveCategory();
    self.children = ko.observableArray();
    self.AddItem = function(data){
        var section = new Section(data);
        if(data.children){
            for(var i = 0; i <= data.children.length-1; i++){
                var item1 = new CatalogItem(data.children[i], data.id);
                if(data.children[i].children){
                    for(var j = 0; j <= data.children[i].children.length-1; j++){
                        var item2 = new CatalogItem(data.children[i].children[j], data.children[i].id);
                        item1.children.push(item2);
                    }
                }
                section.children.push(item1);
            }
        }
        self.children.push(section);
    }
}

var Section = function(data){
    var self = this;
    self.id = data.id;
    self.title = data.name_category;
    self.type_category = data.type_category;
    self.listClass = 'catalogCategories_' + data.id;
    self.tabClass = ko.computed(function() {
        if(Route.GetActiveCategory() == data.id){
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
        var params;
        if(Parameters.cache.catalogs[self.id]){
            var tabTag = $('.listCategories_' + self.id)[0].tagName;
            $(tabTag + '[class^=listCategories]').removeClass('active');
            $('.listCategories_' + self.id).addClass('active');
            var listTag = $('.catalogCategories_' + data.id)[0].tagName; 
            $(listTag + '[class*=catalogCategories]').hide();
            $('.catalogCategories_' + data.id).show();

            params = {section : data.id};
        }
        else{
            var path = JSON.parse(Parameters.cache.path[self.id]).path;
            
            params = {section : path[path.length-2].id};
        }
        Route.SetHash('catalog', self.title, params);
    }
}

var CatalogItem = function(data, parent) {
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

        Route.SetHash('catalog', self.title, params);
    }
}

var TestCatalog = {
    Init : function(){
        if(typeof Widget == 'function'){
            CatalogWidget.prototype = new Widget();
            var catalog = new CatalogWidget(Config.Conteiners.catalog);
            catalog.Init(catalog);
        }
        else{
            window.setTimeout(TestCatalog.Init, 100);
        }
    }
}

TestCatalog.Init();


