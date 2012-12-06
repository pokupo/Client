var CatalogWidget = function(conteiner){
    var self = this;
    self.settingsCatalog = {
        isFirst : true,
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
        self.RegisterEvents();
        self.SetInputParameters();
        self.SetPosition();
    };
    self.SetInputParameters = function(){
        self.settingsCatalog.inputParameters = JSCore.ParserInputParameters(/CatalogWidget.js/);
    };
    self.Load = {
        CatalogData : function(id){
            if(!Parameters.cache.childrenCategory[id]){
                XDMTransport.LoadData(self.settings.dataForCatalog + "&parentId=" + id, function(data){
                    Parameters.cache.childrenCategory[id] = data;
                    if(JSON.parse(data))
                    EventDispatcher.DispatchEvent('catalogWidget.onload.catalog%%' + id, {'parentId' : id , 'items' : JSON.parse(data)});
                })
            }
            else{
                EventDispatcher.DispatchEvent('catalogWidget.onload.catalog%%' + id, {'parentId' : id , 'items' : JSON.parse(Parameters.cache.childrenCategory[id])});
            }
        },
        ChildrenCategory : function(section){
            for(var j = 0; j <= section.items().length-1; j++){
                var id = section.items()[j].id;
                self.Load.CatalogData(id);
                EventDispatcher.AddEventListener('catalogWidget.onload.catalog%%' + id, function (data){
                    if(data.items.err === undefined){
                        self.Fill.Item(data);
                    }
                });
            };
        }
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
            if(Parameters.typeCategory != 'category'){
                if(Parameters.lastItem == 0)
                    self.BaseLoad.Roots(function(data){
                        EventDispatcher.DispatchEvent('catalogWidget.onload.sectionCatalog', data)
                        })
                else{
                    self.Update();
                }
            }
        });
        
        EventDispatcher.AddEventListener('catalogWidget.onload.sectionCatalog', function (data){
            self.Fill.Section(data, function(data){
                var blockMenu = '.sidebar_block_menu';
                $(blockMenu + ' .top_tabs span').removeClass('active');
                Parameters.activeCatalog = data.id;
                Parameters.lastItem = data.id;
                Parameters.typeCategory = "section";
                $('.listCategories_' + data.id).addClass('active');
                $(blockMenu + ' ul').hide();
                $(blockMenu + ' .catalogCategories_' + data.id).show();
                var href = "/catalog=" + Parameters.activeCatalog;
                window.location.hash = href;
                EventDispatcher.DispatchEvent('widget.click.item', data);
            });
            EventDispatcher.DispatchEvent('catalogWidget.onload.catalog', data);
        });
        
        EventDispatcher.AddEventListener('catalogWidget.fill.section', function(data){
            if(Parameters.activeCatalog == 0){
                Parameters.activeCatalog = data.sections()[0].id;
                Parameters.lastItem = data.sections()[0].id;
            }
            self.Render.Section(data);
        });

        EventDispatcher.AddEventListener('catalogWidget.onload.catalog', function (sections){
            for(var i = 0; i <= sections.length-1; i++){
                self.Load.CatalogData(sections[i].id);
                EventDispatcher.AddEventListener('catalogWidget.onload.catalog%%' + sections[i].id, function (data){
                    if(data.items.err === undefined){
                        self.Fill.Item(data);
                    }
                });
            }
        });
        
        EventDispatcher.AddEventListener('catalogWidget.fill.item', function(data){
            self.Render.Item(data)
        });
        
        EventDispatcher.AddEventListener('catalogWidget.rendered.item', function(data){
            self.Load.ChildrenCategory(data);
        });
        
        EventDispatcher.AddEventListener('widget.changeHash', function (data){
            self.Update();
        });
        
        EventDispatcher.AddEventListener('catalogWidget.update.catalog', function(){
            if(Parameters.typeCategory == 'section' && !Parameters.cache.catalogs[Parameters.lastItem]){
                self.BaseLoad.Path(Parameters.lastItem, function(data){
                    if(data[data.length-1]){
                        data[data.length-1].name_category = 'Вверх';
                        self.Fill.Section(data[data.length-1], function(){
                            if(data[data.length-2]){
                                if(Parameters.cache.catalogs[data[data.length-2].id]){
                                    self.BaseLoad.Roots(function(data){
                                        EventDispatcher.DispatchEvent('catalogWidget.onload.sectionCatalog', data)
                                    })
                                }
                                EventDispatcher.DispatchEvent('widget.click.item', data[data.length-2])
                            }
                            else{
                                self.BaseLoad.Roots(function(data){
                                    EventDispatcher.DispatchEvent('catalogWidget.onload.sectionCatalog', data)
                                })
                                EventDispatcher.DispatchEvent('widget.click.item', data[data.length-1])
                            }
                        });
                        EventDispatcher.DispatchEvent('catalogWidget.onload.catalog', [data[data.length-1]]);
                    }
                    else{
                        self.BaseLoad.Roots(function(data){
                            EventDispatcher.DispatchEvent('catalogWidget.onload.sectionCatalog', data)
                        })
                        EventDispatcher.DispatchEvent('widget.click.item', data[0])
                    }
                });
            }
            else if(Parameters.typeCategory == 'homepage' || Parameters.cache.catalogs[Parameters.lastItem]){
                self.BaseLoad.Roots(function(data){
                    if(self.settingsCatalog.isFirst || Parameters.typeCategory == 'homepage'){
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
        Section : function(data, callback){
            var section = new SectionViewModel();
            section.AddSection(data, callback);
        },
        Item : function(data){
            var items = new CatalogViewModel();
            items.AddItem(data);
        }
    };
    self.Render = {
        Section : function(data){
            $("#" + self.settingsCatalog.containerIdForCatalog).empty();
            $("#" + self.settingsCatalog.containerIdForCatalog).append($('script#catalogTmpl').html());
            ko.applyBindings(data, $('#catalog')[0]);
            if(data.sections().length > 1)
                $('.sidebar_block_menu .listCategories_' + Parameters.activeCatalog).addClass('active');
            else
                $('.sidebar_block_menu span[class^=listCategories]').addClass('active');
            delete data;
        },
        Item : function(data){
            if($('.listCategories_' + data.parentId).length > 0){
                $('.sidebar_block_menu').append($('script#catalogUlTmpl').html());
                var conteiner = $('.sidebar_block_menu  .sectionCategories:last');
                conteiner.hide();
                ko.applyBindings(data, conteiner[0]);
                delete data;
                EventDispatcher.DispatchEvent('catalogWidget.rendered.item', data);
            }
            else{
                $('.' + data.cssUl).append($('script#catalogUlTmpl').html());
                ko.applyBindings(data, $('.' + data.cssUl + ' .sectionCategories')[0]);
                delete data;
            }

            if($('.sidebar_block_menu span[class^=listCategories]').length == 1)
                $('.sidebar_block_menu > ul').show();
            else
                $('.catalogCategories_' + Parameters.activeCatalog).show();
            $('.' + data.cssUl).filter('li').addClass('menuparent');
        }
    }
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
    self.cssli = 'catalogCategories_' + data.id;
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

var CatalogViewModel = function() {
    var self = this;
    self.parentId = 0;
    self.cssUl = '';
    self.items = ko.observableArray();
    self.AddItem = function(data){
        self.parentId = data.parentId;
        self.cssUl = 'catalogCategories_' + data.parentId;
        for(var i = 0; i <= data.items.length-1; i++){
            self.items.push(new CatalogItem(data.items[i]));
        }
        EventDispatcher.DispatchEvent('catalogWidget.fill.item', self);
    }
}

var Section = function(data, callback){
    var self = this;
    self.id = data.id;
    self.callback = callback;
    self.title = data.name_category;
    self.type_category = data.type_category;
    self.cssBlock = 'catalogCategories_' + data.id;
    self.cssSpan = 'listCategories_' + data.id;
    self.ClickSection = function() {
        if(self.callback)
            self.callback(self);
    }
}

var SectionViewModel = function() {
    var self = this;
    self.sectionCss = 'catalogSection';
    self.sections = ko.observableArray();
    self.AddSection = function(data, callback){
        if(data && data.length){
            for(var i = 0; i <= data.length-1; i++){
                Parameters.cache.catalogs[data[i].id] = data[i].id;
                self.sections.push(new Section(data[i], callback));
            }
        }
        else if(data){
            Parameters.lastItem = data.id;
            Parameters.typeCategory = 'section';
            self.sections.push(new Section(data,  callback));
        }
        EventDispatcher.DispatchEvent('catalogWidget.fill.section', self);
    };
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


