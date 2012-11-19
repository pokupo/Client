var CatalogWidget = {
    sections : null,
    items : null,
    activeSection : null,
    activeItem : null,
    Settings: {
        containerIdForCatalog : "catalog",
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
    },
    Init : function(){
        CatalogWidget.RegisterEvents();
        CatalogWidget.SetParametersFromHash();
        CatalogWidget.SetInputParameters();
        CatalogWidget.SetPosition();
    },
    Load:{
        Tmpl : function(){ 
            XDMTransport.LoadTmpl(CatalogWidget.Settings.tmplForCatalog,function(data){ 
                if($('#' + CatalogWidget.Settings.containerIdForTmpl).length == 0)
                    $('body').append("<div id='" + CatalogWidget.Settings.containerIdForTmpl + "'></div>");
                $("#" + CatalogWidget.Settings.containerIdForTmpl).append(data);
                EventDispatcher.DispatchEvent('onload.catalog.tmpl');
            })
        },
        SectionData : function(){
            XDMTransport.LoadData(CatalogWidget.Settings.dataForSection + '&shopId=' + CatalogWidget.Settings.shopId, function(data){
                EventDispatcher.DispatchEvent('onload.data.sectionCatalog', JSON.parse(data));
            })
        },
        CatalogData : function(id){
            XDMTransport.LoadData(CatalogWidget.Settings.dataForCatalog + "&parentId=" + id, function(data){
                EventDispatcher.DispatchEvent('onload.data.catalog%%' + id, JSON.parse(data));
            })
        }
    },
    RenderSection : function(){
        if($('.sidebar_block_menu').length == 0)
            $("#" + CatalogWidget.Settings.containerIdForCatalog).html('<div class="sidebar_block_menu" data-bind=\'template: { name: "catalogTmpl" }\'></div>');

        ko.applyBindings(CatalogWidget.sections, document.getElementById('catalogSection'));
    },
    Render : function(parentBlock,id){
        var ulId = 'catalogCategories_' + id;
        $(parentBlock).append('<ul id="' + ulId + '" style="display: none" data-bind=\'template: { name: "catalogListTmpl", foreach: items }\'></ul>');
        if(id == CatalogWidget.activeSection)
            $('#' + ulId).show();
            
        ko.applyBindings(CatalogWidget.items, document.getElementById(ulId));
        $(parentBlock).filter('li').addClass('menuparent');
    },
    RegisterEvents : function(){
        EventDispatcher.AddEventListener('onload.scripts', function (data){ 
            CatalogWidget.Load.Tmpl();
        });
        
        EventDispatcher.AddEventListener('onload.catalog.tmpl', function (data){
            CatalogWidget.Load.SectionData();
        });
        
        EventDispatcher.AddEventListener('catalog.section.rendering.ready', function (data){
            var blockMenu = '.sidebar_block_menu';
            $(blockMenu + ' .top_tabs span').click(function(){
                $(blockMenu + ' .top_tabs span').removeClass('active');
                var id = $(this).attr('class').split('_')[1];
                CatalogWidget.activeSection = id;
                $(this).addClass('active');
                $(blockMenu + ' ul').hide();
                $(blockMenu + ' #catalogCategories_' + id).show();
                var href = "/section=" + CatalogWidget.activeSection;
                window.location.hash = href;
            });
        });
        
        EventDispatcher.AddEventListener('onload.data.sectionCatalog', function (data){
            CatalogWidget.FillDataSection(data);
            EventDispatcher.DispatchEvent('onload.data.catalog', data);
            CatalogWidget.RenderSection();
            EventDispatcher.DispatchEvent('catalog.section.rendering.ready', data);
        });

        EventDispatcher.AddEventListener('onload.data.catalog', function (sections){
            CatalogWidget.ViewModelItems = ko.observableArray;
            for(var i = 0; i <= sections.length-1; i++){
                CatalogWidget.Load.CatalogData(sections[i].id);
                EventDispatcher.AddEventListener('onload.data.catalog%%' + sections[i].id, function (data){
                    if(data.length != 0){
                        CatalogWidget.FillData(data.items, data.parentId);
                        CatalogWidget.Render('.sidebar_block_menu', data.parentId)

                        for(var j = 0; j <= data.items.length-1; j++){
                            CatalogWidget.Load.CatalogData(data.items[j].id);
                            EventDispatcher.AddEventListener('onload.data.catalog%%' + data.items[j].id, function (data){
                                if(data.length != 0){
                                    CatalogWidget.FillData(data.items, data.parentId);
                                    CatalogWidget.Render('.catalogCategories_' + data.parentId, data.parentId)
                                }
                            });
                        };
                    }
                });
            }
        });
        
        EventDispatcher.AddEventListener('catalog.click.item', function (data){
            CatalogWidget.activeItem = data.id;
            var href = "/section=" + CatalogWidget.activeSection + "&category=" + CatalogWidget.activeItem;
            window.location.hash = href;
            document.title = data.title;
        });
        
    },
    FillDataSection : function(data){
        var sections = [];
        for(var i = 0; i <= data.length-1; i++){
            var active = '';
            if(CatalogWidget.activeSection == data[i].id || (i == 0 && CatalogWidget.activeSection == null)){
                CatalogWidget.activeSection = data[i].id;
                active = ' active';
            }
            sections[i] = (new Section(data[i], active));
        }

        CatalogWidget.Section =  SectionViewModel(sections);
    },
    FillData : function(data, id){
        var items = [];
        for(var i = 0; i <= data.length-1; i++){
            items[i] = (new CatalogItem(data[i]));
        }
 
        if(!CatalogWidget.items)
            CatalogWidget.items = ko.observableArray();
        CatalogWidget.items.push = CatalogViewModel(id, items);
    },
    SetParametersFromHash : function(){
        CatalogWidget.activeSection = JSSettings.hashParameters['section'];
        CatalogWidget.activeItem = JSSettings.hashParameters['category'];
    },
    SetInputParameters : function(){
        CatalogWidget.Settings.inputParameters = JSCore.ParserInputParameters(/CatalogWidget.js/);
        CatalogWidget.Settings.shopId = JSSettings.inputParameters['shopId'];
    },
    SetPosition : function(){
        if(CatalogWidget.Settings.inputParameters['position'] == 'absolute'){
            for(var key in CatalogWidget.Settings.inputParameters){
                if(CatalogWidget.Settings.styleCatalog[key])
                    CatalogWidget.Settings.styleCatalog[key] = CatalogWidget.Settings.inputParameters[key];
            }
            $().ready(function(){
                $('#catalog').css(CatalogWidget.Settings.styleCatalog);
            });
        }
    }
}

var CatalogItem = function(data) {
    var self = this;
    self.id = data.id;
    self.title = data.title;
    self.countGoods = data.countGoods;
    self.textItem = ko.computed(function(){
        var text = data.title;
        if(data.countGoods && data.countGoods > 0)
            text = text + ' <span>' + data.countGoods + '</span>';
        return text;
    }, this);
    self.cssli = 'catalogCategories_' + data.id;
    self.clickItem = function() {
        EventDispatcher.DispatchEvent('catalog.click.item', data)
    }
}

var CatalogViewModel = function(id, items) {
    var self = this;
    self.parentId = id;
    self.items = ko.observableArray(items); 
}

var Section = function(data, active){
    var self = this;
    self.id = data.id;
    self.title = data.title;
    self.cssUl = 'catalogCategories_' + data.id;
    self.cssSpan = 'listCategories_' + data.id + active;
}

var SectionViewModel = function(sections) {
    var self = this;
    self.sections = ko.observableArray(sections); 
}

JSCore.Init();
CatalogWidget.Init();


