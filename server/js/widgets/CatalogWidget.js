var CatalogWidget = function(conteiner){
    var self = this;
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
            if(Parameters.typeCategory != 'category' && Route.route == 'catalog'){
                if(Parameters.lastItem == 0)
                    self.BaseLoad.Roots(function(data){
                        EventDispatcher.DispatchEvent('catalogWidget.onload.sectionCatalog', data)
                    })
                else{
                    self.Update();
                }
            }
            else{
                $("#wrapper").removeClass("with_sidebar").addClass("with_top_border");
            }
        });
        
        EventDispatcher.AddEventListener('catalogWidget.onload.sectionCatalog', function (data){
            self.Fill.Tree(data);
        });
        
        EventDispatcher.AddEventListener('catalogWidget.fill.section', function(data){
            self.Render.Catalog(data);
        });
        
        EventDispatcher.AddEventListener('widget.changeHash', function (data){
            if(Parameters.typeCategory != "category")
               self.LoadingIndicator(self.settingsCatalog.containerIdForCatalog);
            self.Update();
        });
        
        EventDispatcher.AddEventListener('catalogWidget.update.catalog', function(){
            if(Parameters.typeCategory == 'section' && !Parameters.cache.catalogs[Parameters.lastItem]){
                $("#wrapper").removeClass("with_top_border").addClass("with_sidebar");
                $("#catalog").show();
                self.BaseLoad.Section(Parameters.lastItem, function(data){
                    
                    self.BaseLoad.Path(Parameters.lastItem, function(path){
                        if(path[path.length-1]){
                            var parent = []
                            parent[0] = {
                                id : path[path.length-1].id,
                                name_category : 'Вверх',
                                type_category : 'section',
                                children : JSON.parse(Parameters.cache.childrenCategory[Parameters.lastItem])
                            }
                            self.Fill.Tree(parent);
                        }
                        else{
                            self.BaseLoad.Roots(function(data){
                                EventDispatcher.DispatchEvent('catalogWidget.onload.sectionCatalog', data)
                            })
                        }
                    });
                })
            }
            else if(Parameters.typeCategory == 'homepage' || Parameters.cache.catalogs[Parameters.lastItem]){
                $("#wrapper").removeClass("with_top_border").addClass("with_sidebar");
                $("#catalog").show();
                self.BaseLoad.Roots(function(data){
                    if(self.settingsCatalog.isFirst || Parameters.typeCategory == 'homepage' || Parameters.cache.catalogs[Parameters.lastItem]){
                        self.settingsCatalog.isFirst = false;
                        EventDispatcher.DispatchEvent('catalogWidget.onload.sectionCatalog', data)
                    }
                })
            }
            else{
                $("#" + self.settingsCatalog.containerIdForCatalog).empty();
            }
        })
    };
    self.Update = function(){
        if(Parameters.cache.roots.length == 0){
            self.BaseLoad.Roots(function(data){
                EventDispatcher.DispatchEvent('catalogWidget.update.catalog');
            });
        }
        else{
            EventDispatcher.DispatchEvent('catalogWidget.update.catalog');
        }
    }
    self.Fill = {
        Tree : function(data){
            if(Parameters.activeCatalog == 0){
                Parameters.activeCatalog = data[0].id;
                Parameters.lastItem = data[0].id;
            }
            var catalog = new Catalog();
            for(var i = 0; i <= data.length - 1; i++){
                catalog.AddItem(data[i]);
            }
        }
    };
    self.Render = {
        Catalog : function(data){
            $("#" + self.settingsCatalog.containerIdForCatalog).empty();
            $("#" + self.settingsCatalog.containerIdForCatalog).append($('script#catalogTmpl').html());
            ko.applyBindings(data, $('#' + self.settingsCatalog.containerIdForCatalog )[0]);
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
    self.isActive = Parameters.lastItem;
    self.children = ko.observableArray();
    self.AddItem = function(data){
        var section = new Section(data);
        if(data.children){
            for(var i = 0; i <= data.children.length-1; i++){
                var item1 = new CatalogItem(data.children[i]);
                if(data.children[i].children){
                    for(var j = 0; j <= data.children[i].children.length-1; j++){
                        var item2 = new CatalogItem(data.children[i].children[j]);
                        item1.children.push(item2);
                    }
                }
                section.children.push(item1);
            }
        }
        self.children.push(section);
        EventDispatcher.DispatchEvent('catalogWidget.fill.section', self);
    }
}

var Section = function(data){
    var self = this;
    self.id = data.id;
    self.title = data.name_category;
    self.type_category = data.type_category;
    self.listClass = 'catalogCategories_' + data.id;
    self.tabClass = ko.computed(function() {
        if(Parameters.lastItem == data.id)
            return 'listCategories_' + data.id + ' active';
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
            Parameters.activeCatalog = data.id;
            Parameters.lastItem = data.id;
            Parameters.typeCategory = "section";

            var href = "/catalog/section=" + Parameters.activeCatalog;
            
            document.title = data.name_category;
            window.location.hash = href;
            EventDispatcher.DispatchEvent('widget.click.item', data);
        }
        else{
            var path = JSON.parse(Parameters.cache.path[self.id]).path;
            EventDispatcher.DispatchEvent('widget.click.item', path[path.length-2])
        }
    }
}

var CatalogItem = function(data) {
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
        EventDispatcher.DispatchEvent('widget.click.item', data)
    }
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


