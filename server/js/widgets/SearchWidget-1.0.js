var SearchWidget = function(){
    var self = this;
    self.widgetName = 'SearchWidget';
    self.version = 1.0;
    self.minWidgetVersion = 1.0;
    self.maxWidgetVersion = 2.0;
    self.minTmplVersion = 1.0;
    self.maxTmplVersion = 2.0;
    self.InitWidget = InitWidget;

    var settings = {
        container: {widget: 'searchWidgetId', def: 'defaultSearchWidgetId'},
        showCatalog: true,
        tmpl : {
            path : "searchTmpl.html", // путь к шаблонам
            id : "searchTmpl" // id шаблона формы поиска по умолчанию
        },
        message : {
            empty : 'Введите название товара для его поиска.'
        },
        animate: typeof AnimateSearch == 'function' ? AnimateSearch : null,
    };
    function InitWidget(){
        RegisterEvents();
        SetInputParameters();
        CheckRoute();
    }
    function SetInputParameters(){
        var input = self.GetInputParameters('search');

        if(!$.isEmptyObject(input))
            settings = self.UpdateSettings1(settings, input);

        Config.Search = settings;
    }
    function InsertContainerEmptyWidget(){
        self.ClearContainer(settings);
    }
    function InsertContainerContent(){
        self.InsertContainer(settings);
    }
    function CheckRoute(){
        if(Routing.IsDefault() && self.HasDefaultContent()){
            self.WidgetLoader(true, settings.container.widget);
        }
        else{
            GetData();
        }
    }
    function GetData(){
        self.BaseLoad.Tmpl(settings.tmpl, function(){
            self.BaseLoad.Roots(function(){
                self.BaseLoad.Section(Routing.GetActiveCategory(), function(data){
                    self.BaseLoad.Info(Routing.GetActiveCategory(), function(data){
                        Fill(data)
                    })
                });
            });
        });
    }
    function RegisterEvents(){
        self.AddEvent('Search.fill.categories', function (data){
            InsertContainerContent();
            Render(data);
        });
        
        self.AddEvent('w.change.route', function (data){
            CheckRoute();
        });
    }
    function Fill(data){
        SearchViewModel.prototype = new Widget();
        var search = new SearchViewModel(settings);

        search.AddListCategory(data);
    }
    function Render(data){
        self.RenderTemplate(data, settings, null,
            function(data){
                InsertContainerContent();
                Render(data);
            },
            function(){
                InsertContainerEmptyWidget();
            }
        );
    }
}

var SearchCategoryItem = function(data, level, select){
    var self = this;
    self.id = data.id;
    self.title = Array(level).join(" - ") + data.name_category;
    self.typeCategory = data.type_category;
    self.isSelected = ko.computed(function(){
        if(select.selectedCatigoriesId() == self.id)
            return true;
        return false;
    }, this);
    
    self.ClickItem = function(){
        select.selectedCatigoriesId(self.id);
        select.selectedCatigory(self.title);
    }
}

var SearchCategoryItemForTree = function(data, level, select){
    var self = this;
    self.id = data.id;
    self.title = data.name_category;
    self.typeCategory = data.type_category;
    self.children = ko.observableArray();
    self.isSelected = ko.computed(function(){
        if(select.selectedCatigoriesId() == self.id){
            select.selectedCatigory(self.title);
            return true;
        }
        return false;
    }, this);
    
    self.ClickItem = function(){
        select.selectedCatigoriesId(self.id);
        select.selectedCatigory(self.title);
    }
}

var SearchViewModel = function(settings){
    var self = this;
    self.text = ko.observable();
    if(Routing.route == 'search')
        self.text(Parameters.filter.keyWords);
    self.cssSelectList = 'searchSelectList';
    self.categories =  ko.observableArray();
    self.categoriesTree =  ko.observableArray();
    self.selectedCatigoriesId = ko.observable();
    if(Routing.route == 'search' && Parameters.filter.idSelectCategories && Parameters.filter.idSelectCategories.length == 1)
        self.selectedCatigoriesId(Parameters.filter.idSelectCategories[0])
    self.selectedCatigory = ko.observable();
    self.idCategories = Parameters.filter.idCategories;
    self.typeCategories = [];
    self.cachData = {};
    self.showCatalog = settings.showCatalog;
    
    self.ClickAdvancedSearch = function(){
        self.DispatchEvent('SearchR.show.form');
    };
    self.AddListCategory = function(parent){
        if(Parameters.cache.childrenCategory[parent.id]){
            var data = Parameters.cache.childrenCategory[parent.id];
            self.categories =  ko.observableArray();
            self.categoriesTree =  ko.observableArray();
            self.childrenCategories = ko.observableArray();
            self.typeCategories = [];

            self.cachData = [{id : parent.id, type_category : parent.type_category, children : data}];

            self.typeCategories[parent.id] = parent.type_category;
            self.categories.push(new SearchCategoryItem(parent, 0, self));

            for(var i = 0; i <= data.length - 1; i++){
                self.categories.push(new SearchCategoryItem(data[i], 1, self))

                self.typeCategories[data[i].id] = data[i].type_category;
                var category = new SearchCategoryItemForTree(data[i], i+1, self);
                var children = ko.observableArray();

                if(data[i].children){
                    for(var j = 0; j <= data[i].children.length - 1; j++){
                        self.categories.push(new SearchCategoryItem(data[i].children[j], 2, self));
                        self.typeCategories[data[i].id] = data[i].type_category;

                        children.push(new SearchCategoryItemForTree(data[i].children[j], 2, self))
                    }

                    category.children = children;
                }
                self.childrenCategories.push(category);
            }

            var parent = new SearchCategoryItemForTree(parent, 0, self);
            parent.children = self.childrenCategories;
            self.categoriesTree.push(parent);
        }
        
        self.DispatchEvent('Search.fill.categories', self);
    };
    self.SubmitSearchForm = function(data){
        self.idCategories = [];
        var selected = self.selectedCatigoriesId(),
            keyWords = $(data.text).val();
        if(keyWords){
            if(self.typeCategories[selected] != 'category')
                FindSelectedSection(self.cachData, selected);
            else 
                self.idCategories.push(selected);

            Parameters.SetDefaultFilterParameters();
            Parameters.filter.idSelectCategories = [selected];
            Parameters.filter.keyWords = keyWords;
            if(self.idCategories.length == 0)
                self.idCategories = [selected];
            Parameters.filter.idCategories = self.idCategories;

            Routing.SetHash('search','Расширенный поиск', Parameters.filter);

            self.DispatchEvent('w.change.breadCrumb', selected);
        }
        else{
            self.ShowMessage(settings.message.empty, false, false);
        }
    };
    self.ClickSearchForm = function(){
        self.idCategories = [];
        var selected = self.selectedCatigoriesId();
        var keyWords = self.text();
        if(keyWords){
            if(self.typeCategories[selected] != 'category')
                FindSelectedSection(self.cachData, selected);
            else 
                self.idCategories.push(selected);

            Parameters.SetDefaultFilterParameters();
            Parameters.filter.idSelectCategories = [selected];
            Parameters.filter.keyWords = keyWords;
            if(self.idCategories.length == 0)
                self.idCategories = [selected];
            Parameters.filter.idCategories = self.idCategories;

            Routing.SetHash('search','Расширенный поиск', Parameters.filter);

            self.DispatchEvent('w.change.breadCrumb', selected);
        }
        else{
            self.ShowMessage(Config.Search.message.empty, false, false);
        }
    };
    function FindSelectedSection(data, selected){
        for(var i = 0; i <= data.length - 1; i++){
            if(data[i].id == selected && data[i].children){
                FindChildrenCategory(data[i].children);
                break;
            }
            else if(data[i].children)
                FindSelectedSection(data[i].children, selected)
        }
    }
    function FindChildrenCategory(data){
        for(var i = 0; i <= data.length - 1; i++){
            if(data[i].type_category == 'category'){
                self.idCategories.push(data[i].id);
            }
            if(data[i].children){
                FindChildrenCategory(data[i].children)
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


