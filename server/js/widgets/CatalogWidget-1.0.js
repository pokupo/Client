var CatalogWidget = function(){
    var self = this;
    self.widgetName = 'CatalogWidget';
    self.version = 1.0;
    self.minWidgetVersion = 1.0;
    self.maxWidgetVersion = 2.0;
    self.minTmplVersion = 1.0;
    self.maxTmplVersion = 2.0;
    self.settings = {
        containerId : null,
        tmpl : { 
            path : null,
            id : null
        },
        animate: null,
        inputParameters : {},
        styleCatalog : null,
        customContainer: null,
        catalogContainerId: null
    };
    self.InitWidget = function(){
        self.settings.containerId = Config.Containers.content.content.widget;
        self.settings.catalogContainerId = Config.Containers.catalog.widget;
        self.settings.customContainer = Config.Containers.catalog.customClass;
        self.settings.tmpl = Config.Catalog.tmpl;
        self.settings.styleCatalog = Config.Catalog.style;
        self.RegisterEvents();
        self.SetInputParameters();
        self.CheckRouteCatalog()
        self.SetPosition();
    };
    self.SetInputParameters = function(){
        var input = {};
        if(Config.Base.sourceParameters == 'string'){
            var temp = JSCore.ParserInputParameters(/CatalogWidget/);
            if(temp.catalog){
                input = temp.catalog;
            }
        }
        if(Config.Base.sourceParameters == 'object' && typeof WParameters !== 'undefined' && WParameters.catalog){
            input = WParameters.catalog;
        }
        if(!$.isEmptyObject(input)){
            if(input.animate)
                self.settings.animate = input.animate;
        }
        self.settings.inputParameters = input;
    };
    self.CheckRouteCatalog = function(){
        if(Routing.route == 'catalog' || Routing.route == 'goods' || (Routing.IsDefault() && !self.HasDefaultContent())){
            self.BaseLoad.Tmpl(self.settings.tmpl, function(){
                self.BaseLoad.Roots(function(){
                    self.Update();
                })
            });
        }
        else
            self.WidgetLoader(true);
    };
    self.RegisterEvents = function(){
        EventDispatcher.AddEventListener('catalogWidget.fill.section', function(data){
            self.Render.Tree(data);
        });
        
        EventDispatcher.AddEventListener('w.change.route', function (){
            self.CheckRouteCatalog();
        });
    };
    self.InsertContainer = {
        EmptyWidget : function(){
            var temp = $("#" + self.settings.catalogContainerId).find(self.SelectCustomContent().join(', ')).clone();
            $("#" + self.settings.catalogContainerId).empty().html(temp);
        },
        Main : function(){
            self.InsertContainer.EmptyWidget();
            $("#" + self.settings.catalogContainerId).append($('script#' + self.GetTmplName()).html()).children().hide();
        }
    },
    self.Update = function(){
        if(!Parameters.cache.catalogs[Routing.GetActiveCategory()]){
            self.InsertContainer.Main();
            self.BaseLoad.Section(Routing.GetActiveCategory(), function(data){

                self.BaseLoad.Path(Routing.GetActiveCategory(), function(path){
                    if(path[path.length-1]){
                        var parent = []
                        parent[0] = {
                            id : path[path.length-1].id,
                            name_category : path[path.length-1].name_category,
                            type_category : 'section',
                            back : 'return',
                            children : Parameters.cache.childrenCategory[Routing.GetActiveCategory()]
                        }
                        self.Fill.Tree(parent);
                    }
                    else{
                        self.Fill.Tree(data);
                    }
                });
            })
        }
        else if(Parameters.cache.catalogs[Routing.GetActiveCategory()]){
            self.InsertContainer.Main();
            self.BaseLoad.Roots(function(data) {
                self.Fill.Tree(data);
            });
        }
        else{
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
            if($("#" + self.settings.catalogContainerId).length > 0){
                try{
                    ko.cleanNode($('#' + self.settings.catalogContainerId )[0]);
                    ko.applyBindings(data, $('#' + self.settings.catalogContainerId )[0]);
                    self.WidgetLoader(true, self.settings.catalogContainerId);
                    if(typeof AnimateCatalog== 'function')
                        new AnimateCatalog();
                    if(self.settings.animate)
                        self.settings.animate();
                }
                catch(e){
                    self.Exception('Ошибка шаблона [' + self.GetTmplName() + ']', e);
                    if(self.settings.tmpl.custom){
                        delete self.settings.tmpl.custom;
                        self.BaseLoad.Tmpl(self.settings.tmpl, function(){
                            self.InsertContainer.Main();
                            self.Render.Tree(data);
                        });
                    }
                    else{
                        self.InsertContainer.EmptyWidget();
                        self.WidgetLoader(true, self.settings.catalogContainerId);
                    }
                }
            }
            else{
                self.Exception('Ошибка. Не найден контейнер [' + self.settings.catalogContainerId + ']');
                self.WidgetLoader(true, self.settings.catalogContainerId);
            }
        }
    }
    self.SetPosition = function(){
        if(self.settings.inputParameters['position'] == 'absolute'){
            for(var key in self.settings.inputParameters){
                if(self.settings.styleCatalog[key])
                    self.settings.styleCatalog[key] = self.settings.inputParameters[key];
            }
            $().ready(function(){
                $('#' + self.settings.catalogContainerId).css(self.settings.styleCatalog);
            });
        }
    }
}

var CatalogViewModel = function(){
    var self = this;
    self.tab = ko.observableArray();
    self.AddItem = function(data){
        var section = new SectionViewModel(data, self.tab());
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
        self.tab.push(section);
    }
}

var SectionViewModel = function(data, parent){
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
        var css = 'listCategories_' + data.id;
        if(parent.length == 1)
            css = css + ' single';
        if(Routing.GetActiveCategory() == data.id){
            if(data.back)
                return css + ' return active'
            else
                return css + ' active'
        }
        else
            return css;
    }, this);
    self.countGoods = data.count_goods;
    self.children = ko.observableArray();
    self.titleWithCount = ko.computed(function(){
        if(data.back)
            return 'Вверх';
        else{
            var text = data.name_category;
            if(data.count_goods && data.count_goods > 0)
                text = text + ' <span>' + data.count_goods + '</span>';
            return text;
        }
    }, this);
    self.isActive = ko.computed(function(){
        if(Routing.GetActiveCategory() == self.id)
            return true;
        return false;
    }, this);
    self.ClickTab = function() {
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
            var path = Parameters.cache.path[self.id].path;
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
    
    self.titleWithCount = ko.computed(function(){
        var text = data.name_category;
        if(data.count_goods && data.count_goods > 0)
            text = text + ' <span>' + data.count_goods + '</span>';
        return text;
    }, this);
    self.hasChildren = ko.computed(function(){
       if(self.children().length > 0)
           return true;
       return false;
    }, this);
    self.liClass = ko.computed(function(){
       if(self.hasChildren())
           return 'menuparent';
       return '';
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


