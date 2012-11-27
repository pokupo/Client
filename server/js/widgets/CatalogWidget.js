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
        self.SetInputParameters();
        self.SetPosition();
    };
    self.SetInputParameters = function(){
        self.settingsCatalog.inputParameters = JSCore.ParserInputParameters(/CatalogWidget.js/);
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
        ChildrenCategory : function(section){
            for(var j = 0; j <= section.items().length-1; j++){
                var id = section.items()[j].id;
                self.Load.CatalogData(id);
                EventDispatcher.AddEventListener('onload.data.catalog%%' + id, function (data){
                    if(data.items.message_error === undefined){
                        self.FillData(data);
                    }
                });
            };
        }
    };
    self.RegisterEvents = function(){

        if(JSLoader.loaded){
            self.LoadTmpl(self.settingsCatalog.tmplForCatalog, function(){
                EventDispatcher.DispatchEvent('onload.catalog.tmpl')
                });
        }
        else{
            EventDispatcher.AddEventListener('onload.scripts', function (data){ 
                self.LoadTmpl(self.settingsCatalog.tmplForCatalog, function(){
                    EventDispatcher.DispatchEvent('onload.catalog.tmpl')
                });
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
                $(blockMenu + ' .catalogCategories_' + id).show();
                var href = "/catalog=" + Parameters.activeCatalog;
                window.location.hash = href;
                EventDispatcher.DispatchEvent('widget.changeHash');
            });
        });
        
        EventDispatcher.AddEventListener('onload.data.sectionCatalog', function (data){
            self.FillDataSection(data);
            EventDispatcher.DispatchEvent('onload.data.catalog', data);
        });
        
        EventDispatcher.AddEventListener('catalogWidget.fill.section', function(data){
            self.RenderSection(data);
            EventDispatcher.DispatchEvent('catalog.section.rendering.ready', data);
        });

        EventDispatcher.AddEventListener('onload.data.catalog', function (sections){
            for(var i = 0; i <= sections.length-1; i++){
                self.Load.CatalogData(sections[i].id);
                EventDispatcher.AddEventListener('onload.data.catalog%%' + sections[i].id, function (data){
                    if(data.items.message_error === undefined){
                        self.FillData(data);
                    }
                });
            }
        });
        
        EventDispatcher.AddEventListener('catalogWidget.fill.item', function(data){
            self.Render(data)
        });
        
        EventDispatcher.AddEventListener('catalogWidget.rendered.item', function(data){
            self.Load.ChildrenCategory(data);
        });
        
        EventDispatcher.AddEventListener('widget.changeHash', function (data){
            self.Update();
        });
        
        EventDispatcher.AddEventListener('onload.data.path', function(data){
            self.RenderBackToTop()
        });
    };
    self.Update = function(){
        if(Parameters.typeCategory == 'section'){
            self.LoadPath();
        }
    }
    self.FillDataSection = function(data){
        var section = new SectionViewModel();
        section.AddSection(data);
    };
    self.FillData = function(data){
        var items = new CatalogViewModel();
        items.AddItem(data);
    };
    self.RenderSection = function(data){
        if($('.sidebar_block_menu').length == 0)
            $("#" + self.settingsCatalog.containerIdForCatalog).append($('script#catalogTmpl').html());
        ko.applyBindings(data, $('#catalog')[0]);
        delete data;
    };
    self.RenderBackToTop = function(){
        
    }
    self.Render = function(data){
        if(Parameters.catalogs[data.parentId]){    
            $('.sidebar_block_menu').append($('script#catalogUlTmpl').html());
            var conteiner = $('.sidebar_block_menu  .sectionCategories:last');
            conteiner.hide();
            ko.applyBindings(data, conteiner[0]);
            delete data;
            
            EventDispatcher.DispatchEvent('catalogWidget.rendered.item', data);
        }
        else{
            $('.' + data.cssUl).append($('script#catalogUlTmpl').html());
            $('.' + data.cssUl + ' .sectionCategories').hide();
            ko.applyBindings(data, $('.' + data.cssUl + ' .sectionCategories')[0]);
        }
        if(data.parentId == Parameters.activeCatalog){
            $('.' + data.cssUl).show();
        }
        $('.' + data.cssUl).filter('li').addClass('menuparent');
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

var CatalogViewModel = function() {
    var self = this;
    self.parentId = 0;
    self.cssUl = '';
    self.items = ko.observableArray();
    self.ReturnTop = function(){
        alert('back to top');
        //EventDispatcher.DispatchEvent('widget.click.item', data)
    }
    self.AddItem = function(data){
        self.parentId = data.parentId;
        self.cssUl = 'catalogCategories_' + data.parentId;
        for(var i = 0; i <= data.items.length-1; i++){
            self.items.push(new CatalogItem(data.items[i]));
        }
        EventDispatcher.DispatchEvent('catalogWidget.fill.item', self);
    }
}

var Section = function(data, active){
    var self = this;
    self.id = data.id;
    self.title = data.name_category;
    self.active = '';
    self.cssUl = 'catalogCategories_' + data.id;
    self.cssSpan = 'listCategories_' + data.id + active;
    self.ClickSection = function() {
        self.active = true;
        EventDispatcher.DispatchEvent('widget.click.item', data)
    }
}

var SectionViewModel = function() {
    var self = this;
    self.sectionCss = 'catalogSection';
    self.sections = ko.observableArray();
    self.AddSection = function(data){
        for(var i = 0; i <= data.length-1; i++){
            var active = '';
            if(i == 0)
                Parameters.defaultCatalog = data[i].id;
            if(Parameters.activeCatalog == data[i].id || (i == 0 && Parameters.activeCatalog == 0)){
                Parameters.activeCatalog = data[i].id;
                Parameters.typeCategory = 'section';
                active = ' active';
            }
            Parameters.catalogs[data[i].id] = data[i].id;
            self.sections.push(new Section(data[i], active));
        }
        EventDispatcher.DispatchEvent('catalogWidget.fill.section', self);
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


