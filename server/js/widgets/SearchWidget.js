var SearchWidget = function(){
    var self = this;
    self.widgetName = 'SearchWidget';
    self.settings = {
        containerId : null, 
        tmplPath : null,
        tmplId : null,
        inputParameters : {},
        style : null
    };
    self.InitWidget = function(){
        self.settings.containerId = Config.Containers.search.widget; 
        self.settings.tmplPath = Config.Search.tmpl.path;
        self.settings.tmplId = Config.Search.tmpl.tmplId;
        self.settings.style = Config.Search.style;
        self.RegisterEvents();
        self.SetInputParameters();
        self.SetPosition();
    };
    self.SetInputParameters = function(){
        var input = {};
        if(Config.Base.sourceParameters == 'string'){
            var temp = JSCore.ParserInputParameters(/SearchWidget.js/);
            if(temp.search){
                input = temp.search;
            }
        }
        if(Config.Base.sourceParameters == 'object' && typeof WParameters !== 'undefined' && WParameters.search){
            input = WParameters.search;
        }
        
        if(!$.isEmptyObject(input)){
            if(input.container && input.container.widget)
                self.settings.containerId = input.container.widget;
        }
        self.settings.inputParameters = input;
    };
    self.InsertContainer = function(){
        $("#" + self.settings.containerId).html($('script#' + self.settings.tmplId).html()).show();
    };
    self.CheckRoute = function(){
        if(Routing.IsDefault() && self.HasDefaultContent()){
            self.WidgetLoader(true);
        }
        else{
            self.BaseLoad.Section(Routing.GetActiveCategory(), function(data){
                EventDispatcher.DispatchEvent('searchWidget.onload.section', data)
            });
        }
    };
    self.RegisterEvents = function(){
        if(JSLoader.loaded){
            self.BaseLoad.Tmpl(self.settings.tmplPath, function(){
                EventDispatcher.DispatchEvent('searchWidget.onload.tmpl')
            });
        }
        else{
            EventDispatcher.AddEventListener('onload.scripts', function (data){ 
                self.BaseLoad.Tmpl(self.settings.tmplPath, function(){
                    EventDispatcher.DispatchEvent('searchWidget.onload.tmpl')
                });
            });
        }
        
        EventDispatcher.AddEventListener('searchWidget.onload.tmpl', function (data){
            self.CheckRoute();
        });
        
        EventDispatcher.AddEventListener('searchWidget.onload.section', function (data){
            self.BaseLoad.Info(Routing.GetActiveCategory(), function(data){
                EventDispatcher.DispatchEvent('searchWidget.onload.categoryInfo', data)
            })
        });
        
        EventDispatcher.AddEventListener('searchWidget.onload.categoryInfo', function (data){
            self.Fill(data)
        });
        
        EventDispatcher.AddEventListener('searchWidget.fill.listCategory', function (data){
            self.InsertContainer();
            self.Render(data);
        });
        
        EventDispatcher.AddEventListener('widget.change.route', function (data){
            self.CheckRoute(); 
        });
    };
    self.Fill = function(data){
        var search = Parameters.cache.searchWidget;
        if ($.isEmptyObject(search)) {
            SearchViewModel.prototype = new Widget();
            search = new SearchViewModel();
            Parameters.cache.searchWidget = search;
        }
        search.selectedCategory = data.name_category;
        if(Parameters.cache.childrenCategory[data.id])
            search.AddListCategory(Parameters.cache.childrenCategory[data.id], data);
    };
    self.Render = function(data){
        if($("#" + self.settings.containerId).length > 0){
            ko.applyBindings(data, $("#" + self.settings.containerId)[0]);

            $('.' + data.cssSelectList).sSelect({
                defaultText: data.selectedCategory
            }).change(function(){
                var id = $('.' + data.cssSelectList).getSetSSValue();
                $('.' + data.cssSelectList + ' option').removeAttr('selected');
                $('.' + data.cssSelectList + ' option[value=' + id + ']').attr('selected', true);
            });
            $('.' + data.cssSelectList).getSetSSValue(data.id);
        }
        self.WidgetLoader(true, self.settings.containerId);
    };
    self.SetPosition = function(){
        if(self.settings.inputParameters.position == 'absolute'){
            for(var key in self.settings.inputParameters){
                if(self.settings.style[key])
                    self.settings.style[key] = self.settings.inputParameters[key];
            }
            $().ready(function(){
                $("#" + self.settings.containerId).css(self.settings.style);
            });
        }
    };
}

var SearchCategoryItem = function(data, level){
    var self = this;
    self.id = data.id;
    self.title = Array(level).join(" - ") + data.name_category;
    self.typeCategory = data.type_category;
}

var SearchViewModel = function(){
    var self = this;
    self.text = '';
    self.selectedCategory = "";
    self.cssSelectList = 'searchSelectList';
    self.categories =  ko.observableArray();
    self.idCategories = Parameters.filter.idCategories;
    self.typeCategories = [];
    self.cachData = {};
    
    self.ClickAdvancedSearch = function(){
        EventDispatcher.DispatchEvent('searchResultWidget.show.form');
    };
    self.AddListCategory = function(data, parent){
        self.categories =  ko.observableArray();
        self.typeCategories = [];

        self.cachData = [{id : parent.id, type_category : parent.type_category, children : data}];
        
        self.typeCategories[parent.id] = parent.type_category;
        self.categories.push(new SearchCategoryItem(parent, 0));
        
        for(var i = 0; i <= data.length - 1; i++){
            self.categories.push(new SearchCategoryItem(data[i], 1))
            self.typeCategories[data[i].id] = data[i].type_category;
            if(data[i].children){
                for(var j = 0; j <= data[i].children.length - 1; j++){
                    self.categories.push(new SearchCategoryItem(data[i].children[j], 2));
                    self.typeCategories[data[i].id] = data[i].type_category;
                }
            }
        }
        EventDispatcher.DispatchEvent('searchWidget.fill.listCategory', self);
    };
    self.SubmitSearchForm = function(data){
        self.idCategories = [];
        var keyWords = $(data.text).val();
        if(keyWords){
            var selected = parseInt($(data.category).find('option:selected').val());
            if(self.typeCategories[selected] != 'category')
                self.FindSelectedSection(self.cachData, selected);
            else 
                self.idCategories.push(selected);

            Parameters.SetDefaultFilterParameters();
            Parameters.filter.idSelectCategories = [selected];
            Parameters.filter.keyWords = keyWords;
            if(self.idCategories.length == 0)
                self.idCategories = [selected];
            Parameters.filter.idCategories = self.idCategories;

            Routing.SetHash('search','Расширенный поиск', Parameters.filter);
            
            EventDispatcher.DispatchEvent('widget.route.change.breadCrumb', selected);
            $(data.text).val('');
        }
        else{
            self.ShowMessage(Config.Search.message.empty, false, false);
        }
    };
    self.FindSelectedSection = function(data, selected){
        for(var i = 0; i <= data.length - 1; i++){
            if(data[i].id == selected && data[i].children){
                self.FindChildrenCategory(data[i].children);
                break;
            }
            else if(data[i].children)
                self.FindSelectedSection(data[i].children, selected)
        }
    }
    self.FindChildrenCategory = function(data){
        for(var i = 0; i <= data.length - 1; i++){
            if(data[i].type_category == 'category'){
                self.idCategories.push(data[i].id);
            }
            if(data[i].children){
                self.FindChildrenCategory(data[i].children)
            }
        }
    }
}

var TestSearch = {
    Init : function(){
        if(typeof Widget == 'function'){
            SearchWidget.prototype = new Widget();
            var search = new SearchWidget();
            search.Init(search);
        }
        else{
            setTimeout(function(){TestSearch.Init()}, 100);
        }
    }
}

TestSearch.Init();


