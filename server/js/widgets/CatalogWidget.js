var CatalogWidget = {
    Sections : null,
    Items : null,
    ActiveSection : null,
    ActiveItem : null,
    Settings: {
        containerIdForCatalog : "catalog",
        tmplForCatalog : "catalogTmpl.html",
        dataForCatalog : "getCatalogData",
        dataForSection : "getSectionData",
        inputParameters : {},
        styleCatalog : {'position' : 'absolute', 'top' : '100px', 'left' : '5%', 'width' : '20%', 'height' : '200px', 'background' : '#ddd'}
    },
    Init : function(){
        CatalogWidget.InitEvent();
        CatalogWidget.SetParametersFromHash();
        CatalogWidget.SetInputParameters();
        CatalogWidget.SetPosition();
    },
    Load:{
        Tmpl : function(){ 
            JSLoader.Load(JSSettings.pathToTmpl + CatalogWidget.Settings.tmplForCatalog, function(data){
                if($('#' + JSSettings.containerIdForTmpl).length == 0)
                    $('body').append("<div id='" + JSSettings.containerIdForTmpl + "'></div>");
                $("#" + JSSettings.containerIdForTmpl).append(data);
                EventDispatcher.dispatchEvent('onload.catalog.tmpl');
            })
        },
        SectionData : function(){
            JSLoader.Load(JSSettings.pathToData + CatalogWidget.Settings.dataForSection + '&shopId=' + JSSettings.inputParameters['shopId'], function(data){
                EventDispatcher.dispatchEvent('onload.data.sectionCatalog', JSON.parse(data));
            })
        },
        CatalogData : function(id){
            JSLoader.Load(JSSettings.pathToData + CatalogWidget.Settings.dataForCatalog + "&parentId=" + id, function(data){
                EventDispatcher.dispatchEvent('onload.data.catalog%%' + id, JSON.parse(data));
            })
        }
    },
    RenderSection : function(){
        if($('.sidebar_block_menu').length == 0)
            $("#" + CatalogWidget.Settings.containerIdForCatalog).html('<div class="sidebar_block_menu" data-bind=\'template: { name: "catalogTmpl" }\'></div>');

        ko.applyBindings(CatalogWidget.Sections, document.getElementById('catalogSection'));
    },
    Render : function(parentBlock,id){
        var ulId = 'catalogCategories_' + id;
        $(parentBlock).append('<ul id="' + ulId + '" style="display: none" data-bind=\'template: { name: "catalogListTmpl", foreach: items }\'></ul>');
        if(id == CatalogWidget.ActiveSection)
            $('#' + ulId).show();
            
        ko.applyBindings(CatalogWidget.Items, document.getElementById(ulId));
        $(parentBlock).filter('li').addClass('menuparent');
    },
    InitEvent : function(){
        EventDispatcher.addEventListener('onload.scripts', function (data){ 
            CatalogWidget.Load.Tmpl();
        });
        
        EventDispatcher.addEventListener('onload.catalog.tmpl', function (data){
            CatalogWidget.Load.SectionData();
        });
        
        EventDispatcher.addEventListener('catalog.section.rendering.ready', function (data){
            var blockMenu = '.sidebar_block_menu';
            $(blockMenu + ' .top_tabs span').click(function(){
                $(blockMenu + ' .top_tabs span').removeClass('active');
                var id = $(this).attr('class').split('_')[1];
                CatalogWidget.ActiveSection = id;
                $(this).addClass('active');
                $(blockMenu + ' ul').hide();
                $(blockMenu + ' #catalogCategories_' + id).show();
                var href = "/section=" + CatalogWidget.ActiveSection;
                window.location.hash = href;
            });
        });
        
        EventDispatcher.addEventListener('onload.data.sectionCatalog', function (data){
            CatalogWidget.FilDataSection(data);
            EventDispatcher.dispatchEvent('onload.data.catalog', data);
            CatalogWidget.RenderSection();
            EventDispatcher.dispatchEvent('catalog.section.rendering.ready', data);
        });

        EventDispatcher.addEventListener('onload.data.catalog', function (sections){
            CatalogWidget.ViewModelItems = ko.observableArray;
            for(var i = 0; i <= sections.length-1; i++){
                CatalogWidget.Load.CatalogData(sections[i].id);
                EventDispatcher.addEventListener('onload.data.catalog%%' + sections[i].id, function (data){
                    if(data.length != 0){
                        CatalogWidget.FilData(data.items, data.parentId);
                        CatalogWidget.Render('.sidebar_block_menu', data.parentId)

                        for(var j = 0; j <= data.items.length-1; j++){
                            CatalogWidget.Load.CatalogData(data.items[j].id);
                            EventDispatcher.addEventListener('onload.data.catalog%%' + data.items[j].id, function (data){
                                if(data.length != 0){
                                    CatalogWidget.FilData(data.items, data.parentId);
                                    CatalogWidget.Render('.catalogCategories_' + data.parentId, data.parentId)
                                }
                            });
                        };
                    }
                });
            }
        });
        
        EventDispatcher.addEventListener('catalog.click.item', function (data){
            CatalogWidget.ActiveItem = data.id;
            var href = "/section=" + CatalogWidget.ActiveSection + "&category=" + CatalogWidget.ActiveItem;
            window.location.hash = href;
            document.title = data.title;
        });
        
    },
    FilDataSection : function(data){
        var Section = function(data, active){
            var self = this;
            self.id = data.id;
            self.title = data.title;
            self.cssUl = 'catalogCategories_' + data.id;
            self.cssSpan = 'listCategories_' + data.id + active;
        }
        
        var sections = [];
        for(var i = 0; i <= data.length-1; i++){
            var active = '';
            if(CatalogWidget.ActiveSection == data[i].id || (i == 0 && CatalogWidget.ActiveSection == null)){
                CatalogWidget.ActiveSection = data[i].id;
                active = ' active';
            }
            sections[i] = (new Section(data[i], active));
        }
        
        function ViewModel() {
            var self = this;
            self.sections = ko.observableArray(sections); 
        }

        CatalogWidget.Section =  ViewModel();
    },
    FilData : function(data, id){
        var ItemCatalog = function(data) {
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
                EventDispatcher.dispatchEvent('catalog.click.item', data)
            }
        }

        var items = [];
        for(var i = 0; i <= data.length-1; i++){
            items[i] = (new ItemCatalog(data[i]));
        }
        
        function ViewModel() {
            var self = this;
            self.parentId = id;
            self.items = ko.observableArray(items); 
        }
        
        if(!CatalogWidget.Items)
            CatalogWidget.Items = ko.observableArray();
        CatalogWidget.Items.push = ViewModel();
    },
    SetParametersFromHash : function(){
        CatalogWidget.ActiveSection = JSSettings.hashParameters['section'];
        CatalogWidget.ActiveItem = JSSettings.hashParameters['category'];
    },
    SetInputParameters : function(){
        CatalogWidget.Settings.inputParameters = JSCore.ParserInputParameters(/CatalogWidget.js/);
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
    
JSCore.InitLoader();
CatalogWidget.Init();


