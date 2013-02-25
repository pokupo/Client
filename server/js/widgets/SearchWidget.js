var SearchWidget = function(){
    var self = this;
    self.widgetName = 'SearchWidget';
    self.settingsSearch = {
        containerIdForSearch : Config.Containers.search, 
        tmplForSearch : Config.Search.tmpl,
        inputParameters : {},
        style : Config.Search.style
    };
    self.InitWidget = function(){
        self.RegisterEvents();
        self.SetInputParameters();
        self.SetPosition();
    };
    self.SetInputParameters = function(){
        self.settingsSearch.inputParameters = JSCore.ParserInputParameters(/SearchWidget.js/);
    };
    self.RegisterEvents = function(){
        if(JSLoader.loaded){
            self.BaseLoad.Tmpl(self.settingsSearch.tmplForSearch, function(){
                EventDispatcher.DispatchEvent('searchWidget.onload.tmpl')
            });
        }
        else{
            EventDispatcher.AddEventListener('onload.scripts', function (data){ 
                self.BaseLoad.Tmpl(self.settingsSearch.tmplForSearch, function(){
                    EventDispatcher.DispatchEvent('searchWidget.onload.tmpl')
                });
            });
        }
        
        EventDispatcher.AddEventListener('searchWidget.onload.tmpl', function (data){
            self.BaseLoad.Section(Route.GetActiveCategory(), function(data){
                EventDispatcher.DispatchEvent('searchWidget.onload.section', data)
            });
        });
        
        EventDispatcher.AddEventListener('searchWidget.onload.section', function (data){
            self.BaseLoad.Info(Route.GetActiveCategory(), function(data){
                EventDispatcher.DispatchEvent('searchWidget.onload.categoryInfo', data)
            })
        });
        
        EventDispatcher.AddEventListener('searchWidget.onload.categoryInfo', function (data){
            self.Fill(data)
        });
        
        EventDispatcher.AddEventListener('searchWidget.fill.listCategory', function (data){
            self.Render(data);
        });
        
        EventDispatcher.AddEventListener('widget.change.route', function (data){
            ReadyWidgets.Indicator('SearchWidget', false);
            self.BaseLoad.Section(Route.GetActiveCategory(), function(data){
                EventDispatcher.DispatchEvent('searchWidget.onload.section', data)
            }); 
        });
    };
    self.Fill = function(data){
        var search = new SearchViewModel();
        search.selectedCategory = data.name_category;
        if(Parameters.cache.childrenCategory[data.id])
            search.AddListCategory(JSON.parse(Parameters.cache.childrenCategory[data.id]), data);
    };
    self.Render = function(data){
        if($("#" + self.settingsSearch.containerIdForSearch).length > 0){
            $("#" + self.settingsSearch.containerIdForSearch).html("");
            $("#" + self.settingsSearch.containerIdForSearch).append($('script#searchTmpl').html()).show();
            ko.applyBindings(data, $("#" + self.settingsSearch.containerIdForSearch)[0]);

            $('.' + data.cssSelectList).sSelect({
                defaultText: data.selectedCategory
            }).change(function(){
                var id = $('.' + data.cssSelectList).getSetSSValue();
                $('.' + data.cssSelectList + ' option').removeAttr('selected');
                $('.' + data.cssSelectList + ' option[value=' + id + ']').attr('selected', true);
            });
            $('.' + data.cssSelectList).getSetSSValue(data.id);
        }
        ReadyWidgets.Indicator('SearchWidget', true);
        delete data;
    };
    self.SetPosition = function(){
        if(self.settingsSearch.inputParameters.position == 'absolute'){
            for(var key in self.settingsSearch.inputParameters){
                if(self.settingsSearch.style[key])
                    self.settingsSearch.style[key] = self.settingsSearch.inputParameters[key];
            }
            $().ready(function(){
                $("#" + self.settingsSearch.containerIdForSearch).css(self.settingsSearch.style);
            });
        }
    };
}

var SearchCategoryItem = function(data){
    var self = this;
    self.id = data.id;
    self.title = data.name_category;
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
        self.cachData = [{id : parent.id, type_category : parent.type_category, children : data}];
        self.typeCategories[parent.id] = parent.type_category;
        self.categories.push(new SearchCategoryItem(parent));
        for(var i = 0; i <= data.length - 1; i++){
            self.categories.push(new SearchCategoryItem(data[i]))
            self.typeCategories[data[i].id] = data[i].type_category;
            if(data[i].children){
                for(var j = 0; j <= data[i].children.length - 1; j++){
                    data[i].children[j].name_category = " - " + data[i].children[j].name_category;
                    self.categories.push(new SearchCategoryItem(data[i].children[j]));
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

            Route.SetHash('search','Расширенный поиск', Parameters.filter);
            
            EventDispatcher.DispatchEvent('widget.route.change.breadCrumbs', selected);
            $(data.text).val('');
        }
        else{
            alert('Введите название товара для его поиска.');
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
            ReadyWidgets.Indicator('SearchWidget', false);
            SearchWidget.prototype = new Widget();
            var search = new SearchWidget();
            search.Init(search);
        }
        else{
            window.setTimeout(TestSearch.Init, 100);
        }
    }
}

TestSearch.Init();


