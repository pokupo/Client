var SearchWidget = function(){
    var self = this;
    self.widgetName = 'SearchWidget';
    self.version = 1.0;
    self.minWidgetVersion = 1.0;
    self.maxWidgetVersion = 2.0;
    self.minTmplVersion = 1.0;
    self.maxTmplVersion = 2.0;
    self.settings = {
        containerId : null, 
        tmpl: {
            path : null,
            id : null
        },
        animate: null,
        inputParameters : {},
        style : null,
        customContainer: null
    };
    self.InitWidget = function(){
        self.settings.containerId = Config.Containers.search.widget; 
        self.settings.customContainer = Config.Containers.search.customClass;
        self.settings.tmpl = Config.Search.tmpl;
        self.settings.style = Config.Search.style;
        self.RegisterEvents();
        self.SetInputParameters();
        self.SetPosition();
    };
    self.SetInputParameters = function(){
        var input = {};
        if(Config.Base.sourceParameters == 'string'){
            var temp = JSCore.ParserInputParameters(/SearchWidget/);
            if(temp.search){
                input = temp.search;
            }
        }
        if(Config.Base.sourceParameters == 'object' && typeof WParameters !== 'undefined' && WParameters.search){
            input = WParameters.search;
        }
        if(!$.isEmptyObject(input)){
            if (input.tmpl)
                self.settings.tmplPath = 'search/' + input.tmpl + '.html';
            if(input.animate)
                self.settings.animate = input.animate;
        }

        self.settings.inputParameters = input;
    };
    self.InsertContainer = {
        EmptyWidget : function(){
            var temp = $("#" + self.settings.containerId).find(self.SelectCustomContent().join(', ')).clone();
            $("#" + self.settings.containerId).empty().html(temp);
        },
        Content : function(){
            self.InsertContainer.EmptyWidget();
            $("#" + self.settings.containerId).append($('script#' + self.GetTmplName()).html()).children().hide();
        }
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
    self.LoadTmpl = function(){
        self.BaseLoad.Tmpl(self.settings.tmpl, function(){
            EventDispatcher.DispatchEvent('searchWidget.onload.tmpl')
        });
    };
    self.RegisterEvents = function(){
        if(JSLoader.loaded){
            self.LoadTmpl();
        }
        else{
            EventDispatcher.AddEventListener('onload.scripts', function (data){ 
                self.LoadTmpl();
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
            self.InsertContainer.Content();
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

        if(Parameters.cache.childrenCategory[data.id])
            search.AddListCategory(Parameters.cache.childrenCategory[data.id], data);
    };
    self.Render = function(data){
        if($("#" + self.settings.containerId).length > 0){
            try{
                ko.cleanNode($("#" + self.settings.containerId)[0]);
                ko.applyBindings(data, $("#" + self.settings.containerId)[0]);
                self.WidgetLoader(true, self.settings.containerId);
                if(self.settings.animate)
                    self.settings.animate();
            }
            catch(e){
                self.Exception('Ошибка шаблона [' + self.GetTmplName() + ']');
                if(self.settings.tmpl.custom){
                    delete self.settings.tmpl.custom;
                    self.BaseLoad.Tmpl(self.settings.tmpl, function(){
                        self.InsertContainer.Content();
                        self.Render(data);
                    });
                }
                else{
                    self.InsertContainer.EmptyWidget();
                    self.WidgetLoader(true, self.settings.containerId);
                }
            }
        }
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

var SearchCategoryItem = function(data, level, select){
    var self = this;
    self.id = data.id;
    self.title = Array(level).join(" - ") + data.name_category;
    self.typeCategory = data.type_category;
    
    self.ClickItem = function(){
        select.selectedCatigoriesId(self.id);
    }
}

var SearchCategoryItemForTree = function(data, level, select){
    var self = this;
    self.id = data.id;
    self.title = data.name_category;
    self.typeCategory = data.type_category;
    self.children = ko.observableArray();
    self.isSelected = ko.computed(function(){
        if(select.selectedCatigoriesId() == self.id)
            return true;
        return false;
    }, this);
    
    self.ClickItem = function(){
        select.selectedCatigoriesId(self.id);
    }
}

var SearchViewModel = function(){
    var self = this;
    self.text = ko.observable();
    self.cssSelectList = 'searchSelectList';
    self.categories =  ko.observableArray();
    self.categoriesTree =  ko.observableArray();
    self.selectedCatigoriesId = ko.observable();
    self.idCategories = Parameters.filter.idCategories;
    self.typeCategories = [];
    self.cachData = {};
    
    self.ClickAdvancedSearch = function(){
        EventDispatcher.DispatchEvent('searchResultWidget.show.form');
    };
    self.AddListCategory = function(data, parent){
        self.categories =  ko.observableArray();
        self.categoriesTree =  ko.observableArray();
        self.typeCategories = [];

        self.cachData = [{id : parent.id, type_category : parent.type_category, children : data}];
        
        self.typeCategories[parent.id] = parent.type_category;
        self.categories.push(new SearchCategoryItem(parent, 0, self));
        self.categoriesTree.push(new SearchCategoryItemForTree(parent, 0, self));
        
        for(var i = 0; i <= data.length - 1; i++){
            self.categories.push(new SearchCategoryItem(data[i], 1, self))
            
            self.typeCategories[data[i].id] = data[i].type_category;
            
            if(data[i].children){
                var children = ko.observableArray();
                for(var j = 0; j <= data[i].children.length - 1; j++){
                    self.categories.push(new SearchCategoryItem(data[i].children[j], 2, self));
                    children.push(new SearchCategoryItemForTree(data[i].children[j], 2, self))
                    self.typeCategories[data[i].id] = data[i].type_category;
                }
                var category = new SearchCategoryItemForTree(data[i], 1, self);
                category.children = children;
                self.categoriesTree.push(category);
            }
        }
        EventDispatcher.DispatchEvent('searchWidget.fill.listCategory', self);
    };
    self.SubmitSearchForm = function(data){
        self.idCategories = [];
        var selected = self.selectedCatigoriesId();
        var keyWords = $(data.text).val();
        if(keyWords){
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
    self.ClickSearchForm = function(){
        self.idCategories = [];
        var selected = self.selectedCatigoriesId();
        var keyWords = self.text();
        if(keyWords){
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
            self.text('');
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


