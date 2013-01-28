var SearchWidget = function(conteiner){
    var self = this;
    self.settingsSearch = {
        containerIdForSearch : conteiner, 
        tmplForSearch : Config.Search.tmpl,
        inputParameters : {},
        styleSearch : Config.Search.style
    };
    self.InitWidget = function(){
        self.RegisterEvents();
        self.SetInputParameters();
        self.Route();
        self.SetPosition();
    };
    self.Route = function(){
        if(Route.route == 'search'){
            Parameters.filter.filterName = Route.params['filterName'];
            if(Route.params['idCategories'] && Route.params['idCategories'].split(",").length == 1)
                Parameters.filter.idCategories = parseInt(Route.params['idCategories']);
        }
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
            if(Parameters.lastItem == 0){
                self.BaseLoad.Roots(function(data){
                    EventDispatcher.DispatchEvent('searchWidget.onload.roots', data)
                })
            }
            else{
                self.BaseLoad.Section(Parameters.lastItem, function(data){
                    EventDispatcher.DispatchEvent('searchWidget.onload.section', data)
                });
            }
        });
        
        EventDispatcher.AddEventListener('searchWidget.onload.roots', function (data){
            var def = 0;
            for(var key in Parameters.cache.catalogs){
                def = Parameters.cache.catalogs[key];
                break;
            }
            Parameters.activeSection = def;
            Parameters.activeItem = def;
            Parameters.lastItem = def;
            self.BaseLoad.Section(Parameters.lastItem, function(data){
                EventDispatcher.DispatchEvent('searchWidget.onload.section', data)
            });
        });
        
        EventDispatcher.AddEventListener('searchWidget.onload.section', function (data){
            self.BaseLoad.Info(Parameters.lastItem, function(data){
                EventDispatcher.DispatchEvent('searchWidget.onload.categoryInfo', data)
            })
        });
        
        EventDispatcher.AddEventListener('searchWidget.onload.categoryInfo', function (data){
            self.Fill(data)
        });
        
        EventDispatcher.AddEventListener('searchWidget.fill.listCategory', function (data){
            self.Render(data);
        });
        
        EventDispatcher.AddEventListener('widget.changeHash', function (data){
            $("#" + self.settingsSearch.containerIdForSearch).hide();
            self.BaseLoad.Section(Parameters.lastItem, function(data){
                EventDispatcher.DispatchEvent('searchWidget.onload.section', data)
            }); 
        });
    };
    self.Fill = function(data){
        var search = new SearchViewModel();
        search.selectedCategory = data.name_category;
        search.AddListCategory(JSON.parse(Parameters.cache.childrenCategory[data.id]), data);
    };
    self.Render = function(data){
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
        delete data;
    };
    self.SetPosition = function(){
        if(self.settingsSearch.inputParameters['position'] == 'absolute'){
            for(var key in self.settingsSearch.inputParameters){
                if(self.settingsSearch.styleSearch[key])
                    self.settingsSearch.styleSearch[key] = self.settingsSearch.inputParameters[key];
            }
            $().ready(function(){
                for(var i=0; i<=conteiner.length-1; i++){
                    $("#" + conteiner[i]).css(self.settingsSearch.styleSearch);
                }
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
    self.text = Parameters.filter.filterName;
    self.selectedCategory = "";
    self.cssSelectList = 'searchSelectList';
    self.categories =  ko.observableArray();
    self.idCategories = Parameters.filter.idCategories;
    self.typeCategories = [];
    self.cachData = {};
    
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
        var filterName = $(data.text).val();
        if(filterName){
            var selected = parseInt($(data.category).find('option:selected').val());
            if(self.typeCategories[selected] != 'category')
                self.FindSelectedSection(self.cachData, selected);
            else 
                self.idCategories.push(selected);

            Parameters.filter.idSelectCategories = [selected];
            Parameters.filter.filterName = filterName;
            if(self.idCategories.length == 0)
                self.idCategories = [selected];
            Parameters.filter.idCategories = self.idCategories;
            Parameters.filter.keyWords = filterName;
            Parameters.filter.typeSearch = 'any';
            Parameters.filter.startCost = '';
            Parameters.filter.endCost = '';
            Parameters.filter.exceptWords = '';
            Parameters.filter.typeSeller = '';

            Route.SetHash('search', Parameters.filter);
        
            $("#catalog").hide();
            $("#wrapper").removeClass("with_sidebar").addClass("with_top_border");
            
            EventDispatcher.DispatchEvent('widget.route.change.breadCrumbs', selected);
            EventDispatcher.DispatchEvent('searchWidget.submit.form');
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
        if(typeof Widget == 'function' && JSCore !== undefined){
            SearchWidget.prototype = new Widget();
            var search = new SearchWidget('search_block');
            search.Init();
        }
        else{
            window.setTimeout(TestSearch.Init, 100);
        }
    }
}

TestSearch.Init();


