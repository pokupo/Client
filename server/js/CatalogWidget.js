var CatalogWidget = {
    Sections : null,
    Items : null,
    ActiveSection : null,
    ActiveItem : null,
    Init : function(){
        CatalogWidget.InitEvent();
        CatalogWidget.SetParametersFromHash();
        CatalogWidget.Positioning();
    },
    LoadTmpl : function(){
        if($('#' + JSSettings.containerIdForTmpl).length == 0)
            $('body').append("<div id='" + JSSettings.containerIdForTmpl + "'></div>");  
        JSLoader.LoadTmpl(JSSettings.tmplForCatalog);
    },
    RenderSection : function(){
        if($('.sidebar_block_menu').length == 0)
            $("#" + JSSettings.containerIdForCatalog).html('<div class="sidebar_block_menu" data-bind="template: { name: \'catalogTmpl\' }"></div>');

        ko.applyBindings(CatalogWidget.Sections, document.getElementById('catalogSection'));
    },
    Render : function(parentBlock,id){
        var ulId = 'catalogCategories_' + id;
        $(parentBlock).append('<ul id="' + ulId + '" style="display: none" data-bind="template: { name: \'catalogListTmpl\', foreach: items }"></ul>');
        if(id == CatalogWidget.ActiveSection)
            $('#' + ulId).show();
            
        ko.applyBindings(CatalogWidget.Items, document.getElementById(ulId));
        $(parentBlock).filter('li').addClass('menuparent');
    },
    InitEvent : function(){
        EventDispatcher.addEventListener('onload.scripts', function (data){ 
            CatalogWidget.LoadTmpl();
            JSLoader.LoadSectionJson(JSSettings.dataForSection);
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
            CatalogWidget.FilingDataSection(data);
            EventDispatcher.dispatchEvent('onload.data.catalog', data);
            CatalogWidget.RenderSection();
            EventDispatcher.dispatchEvent('catalog.section.rendering.ready', data);
        });

        EventDispatcher.addEventListener('onload.data.catalog', function (sections){
            CatalogWidget.ViewModelItems = ko.observableArray;
            for(var i = 0; i <= sections.length-1; i++){
                JSLoader.LoadJson(JSSettings.dataForCatalog, sections[i].id);
                
                EventDispatcher.addEventListener('onload.data.catalog%%' + sections[i].id, function (data){
                    CatalogWidget.FilingData(data.items, data.parentId);
                    CatalogWidget.Render('.sidebar_block_menu', data.parentId)
                    
                    for(var j = 0; j <= data.items.length-1; j++){
                        JSLoader.LoadJson(JSSettings.dataForCatalog, data.items[j].id);
                        EventDispatcher.addEventListener('onload.data.catalog%%' + data.items[j].id, function (data){
                            if(data.length != 0){
                                CatalogWidget.FilingData(data.items, data.parentId);
                                CatalogWidget.Render('.catalogCategories_' + data.parentId, data.parentId)
                            }
                        });
                    };
                });
            }
        });
        
        EventDispatcher.addEventListener('catalog.click.item', function (data){
            CatalogWidget.ActiveItem = data.id;
            var href = "/section=" + CatalogWidget.ActiveSection + "&category=" + CatalogWidget.ActiveItem;
            window.location.hash = href;
            document.title = data.title;
        });
        
//        $(window).resize(function(){
//            var heightWindow = $()
//            alert('Размеры окна браузера изменены.');
//        });
    },
    FilingDataSection : function(data){
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
    FilingData : function(data, id){
        var ItemCatalog = function(data) {
            var self = this;
            self.id = data.id;
            self.title = data.title;
            self.type = data.type;
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
    Positioning : function(){
        if(JSSettings.inputParameters['pos'] == 'absolute'){
            if(JSSettings.inputParameters['top'])
                JSSettings.styleCatalog['top'] = JSSettings.inputParameters['top'];
            if(JSSettings.inputParameters['left'])
                JSSettings.styleCatalog['left'] = JSSettings.inputParameters['left'];
            if(JSSettings.inputParameters['width'])
                JSSettings.styleCatalog['width'] = JSSettings.inputParameters['width'];
            if(JSSettings.inputParameters['hight'])
                JSSettings.styleCatalog['hight'] = JSSettings.inputParameters['hight'];
            
            $().ready(function(){
                $('#catalog').css(JSSettings.styleCatalog);
            });
        }
    }
}
    
JSCore.InitLoader();
CatalogWidget.Init();


