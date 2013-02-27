var SearchResultWidget = function(){
    var self = this;
    self.widgetName = 'SearchResultWidget';
    self.settings = {
        containerIdForSearchResult : Config.Containers.searchResult[1],
        containerIdForAdvancedSearch : Config.Containers.searchResult[0],
        tmplPath : Config.SearchResult.tmpl.path,
        advancedSearchFormTmpl : Config.SearchResult.tmpl.advancedSearchFormTmpl,
        contentTableTmpl : Config.SearchResult.tmpl.contentTableTmpl,
        contentListTmpl : Config.SearchResult.tmpl.contentListTmpl,
        contentTileTmpl : Config.SearchResult.tmpl.contentTileTmpl,
        noResultsTmpl : Config.SearchResult.tmpl.noResultsTmpl,
        idAdvancedSearchForm : Config.SearchResult.idAdvancedSearchForm,
        idTreeCategoriesForAdvancedSearchForm : 'tree_categories_for_advanced_search',
        inputParameters : {},
        listPerPage : Config.SearchResult.listPerPage,
        listTypeSearch : Config.SearchResult.listTypeSearch,
        listTypeSeller : Config.SearchResult.listTypeSeller,
        styleSearchResult : Config.SearchResult.style,
        paging : Config.Paging
    };
    self.InitWidget = function(){
        self.RegisterEvents();
        self.SetInputParameters();
        self.SetPosition();
    };
    self.SetInputParameters = function(){
        self.settings.inputParameters = JSCore.ParserInputParameters(/SearchResultWidget.js/);
        if(self.settings.inputParameters.content){
            var content = JSON.parse(self.settings.inputParameters.content)
            if(content.defaultCount)
                self.settings.paging.itemsPerPage = content.defaultCount;
            if(content.list)
                self.settings.listPerPage = content.list;
        }
    };
    self.CheckRouting = function(){
        if(Routing.route == 'search'){
            for(var key in Routing.params){
                if(key == 'idSelectCategories'){
                    var categories = [];
                    var ids = decodeURIComponent(Routing.params[key]).split(",");
                    if(Routing.params[key]){
                        var j = 0;
                        for(var i in ids){
                            var id = parseInt(ids[i]);
                            if(id && !isNaN(id))
                               categories[j++] = id; 
                        }

                        Parameters.filter[key] = categories;
                        Parameters.filter.idCategories = categories;
                    }
                }
                else
                    Parameters.filter[key] = decodeURIComponent(Routing.params[key]);
            }
            EventDispatcher.DispatchEvent('widget.change.route')
        }
        else{
            self.WidgetLoader(true);  
        }
    };
    self.RegisterEvents = function(){
        if(JSLoader.loaded){
            new Dyn();
            self.BaseLoad.Tmpl(self.settings.tmplPath, function(){
                EventDispatcher.DispatchEvent('searchResultWidget.onload.tmpl')
            });
        }
        else{
            EventDispatcher.AddEventListener('onload.scripts', function (data){ 
                new Dyn();
                self.BaseLoad.Tmpl(self.settings.tmplPath, function(){
                    EventDispatcher.DispatchEvent('searchResultWidget.onload.tmpl')
                });
            });
        }
        
        EventDispatcher.AddEventListener('searchResultWidget.onload.tmpl', function(){
            self.CheckRouting();
        });
        
        EventDispatcher.AddEventListener('searchResultWidget.show.form', function(){
            if($("#" + self.settings.containerIdForAdvancedSearch).text() == ""){
                self.WidgetLoader(false);
                self.BaseLoad.Roots(function(){
                    EventDispatcher.DispatchEvent('searchResultWidget.onload.roots.show.form')
                })
            }
            else{
                $("#" + self.settings.containerIdForAdvancedSearch).html("");
            }
        });
        
        EventDispatcher.AddEventListener('searchResultWidget.onload.roots.show.form', function (data){
            self.InsertContainer.AdvancedSearchForm();
            if(Routing.route != 'search')
                Parameters.SetDefaultFilterParameters();
            self.Fill.AdvancedSearchForm();
            self.WidgetLoader(true);
        });
        
        EventDispatcher.AddEventListener('searchResultWidget.submit.form', function (data){
            var paging = self.settings.paging;
            var start = (Routing.GetCurrentPage()-1) * paging.itemsPerPage;
            var query = start + '/' + paging.itemsPerPage + '/' + Parameters.filter.orderBy + '/' + (Parameters.filter.filterName ? Parameters.filter.filterName : '') + '?';
            var keys = ['keyWords', 'typeSearch', 'idCategories', 'startCost', 'endCost', 'exceptWords', 'typeSeller'];
            
            for(var i = 0; i <= keys.length-1; i++){
                if(Parameters.filter[keys[i]])
                     query = query + '&' + keys[i] + '=' + encodeURIComponent(Parameters.filter[keys[i]]);
            }
            
            self.BaseLoad.SearchContent(Parameters.shopId, query, function(data){
                EventDispatcher.DispatchEvent('searchResultWidget.onload.searchResult', data);
            })
        });
        
        EventDispatcher.AddEventListener('searchResultWidget.onload.searchResult', function (data){ 
            self.Fill.SearchResult(data);
        });
        
        EventDispatcher.AddEventListener('searchResultWidget.fill.searchResult', function(data){
            self.InsertContainer.SearchResult(data.typeView);
            self.Render.SearchResult(data);
            
            $(Parameters.sortingBlockContainer + ' .sort select').sSelect({
                defaultText: Parameters.listSort[Parameters.filter.orderBy]
            }).change(function(){
                Parameters.filter.orderBy = $(Parameters.sortingBlockContainer + ' .sort select').getSetSSValue();
                EventDispatcher.DispatchEvent('searchResultWidget.submit.form')
            });
        });
        
        EventDispatcher.AddEventListener('searchResultWidget.fill.categories', function (data){ 
            self.Render.AdvancedSearchForm(data);
        });
        
        EventDispatcher.AddEventListener('widget.change.route', function (data){
            if(Routing.route == 'search'){
                self.WidgetLoader(false);
                self.InsertContainer.AdvancedSearchForm();
                self.Fill.AdvancedSearchForm();

                EventDispatcher.DispatchEvent('searchResultWidget.submit.form');
            }
            else{
                self.WidgetLoader(true);
                $("#" + self.settings.containerIdForAdvancedSearch).html("");
            }
        });
    };
    self.InsertContainer = {
        AdvancedSearchForm : function(){
            $("#" + self.settings.containerIdForAdvancedSearch).html("");
            $("#" + self.settings.containerIdForAdvancedSearch).append($('script#' + self.settings.tmpl.advancedSearchFormTmpl).html()).children().hide();
        },
        SearchResult : function(type){
            $("#" + self.settings.containerIdForSearchResult).html('');
            if(type == 'table'){ 
                $("#" + self.settings.containerIdForSearchResult).append($('script#' + self.settings.tmpl.contentTableTmpl).html());
            }
            if(type == 'list'){
                $("#" + self.settings.containerIdForSearchResult).append($('script#' + self.settings.tmpl.contentListTmpl).html());
            }
            if(type == 'tile'){
                $("#" + self.settings.containerIdForSearchResult).append($('script#' + self.settings.tmpl.contentTileTmpl).html());
            }
            if(type == 'error'){
                $("#" + self.settings.containerIdForSearchResult).append($('script#' + self.settings.tmpl.noResultsTmpl).html());
            }
        }
    };
    self.Fill = {
        AdvancedSearchForm : function(){
            var searchForm = new AdvancedSearchFormViewModel(self.settings);
            searchForm.AddCategories(JSON.parse(Parameters.cache.roots));
        },
        SearchResult : function(data){
            var searchResult = new ListSearchResultViewModel(self.settings);
            searchResult.AddContent(data);
        }
    };
    self.Render = {
        AdvancedSearchForm : function(data){
            if($("#" + self.settings.containerIdForAdvancedSearch).length){
                ko.applyBindings(data, $("#" + self.settings.containerIdForAdvancedSearch)[0]);

                $("#" + self.settings.idTreeCategoriesForAdvancedSearchForm).dynatree({
                    checkbox: true,
                    selectMode: 3,
                    children: data.categories,
                    onSelect: function(select, node) {
                        var selKeys = $.map(node.tree.getSelectedNodes(), function(node){
                            return node.data.key;
                        });

                        Parameters.filter.idSelectCategories = selKeys;
                    }
                });

                $('.' + data.cssTypeSearch).sSelect({
                    defaultText: self.settings.listTypeSearch[data.typeSearch]
                }).change(function(){
                    var id = $('.' + data.cssTypeSearch).getSetSSValue();
                    $('.' + data.cssTypeSearch + ' option').removeAttr('selected');
                    $('.' + data.cssTypeSearch + ' option[value=' + id + ']').attr('selected', true);
                    $('#' + self.settings.idAdvancedSearchForm + ' input:submit').focus();
                });

                $('.' + data.cssTypeSeller).sSelect({
                    defaultText: self.settings.listTypeSeller[data.typeSeller]
                }).change(function(){
                    var id = $('.' + data.cssTypeSeller).getSetSSValue();
                    $('.' + data.cssTypeSeller + ' option').removeAttr('selected');
                    $('.' + data.cssTypeSeller + ' option[value=' + id + ']').attr('selected', true);
                    $('#' + self.settings.idAdvancedSearchForm + ' input:submit').focus();
                });
            }
        },
        SearchResult : function(data){
            if($("#" + self.settings.containerIdForSearchResult).length > 0){
                $("#" + Config.Containers.catalog).hide();
                $("#wrapper").removeClass("with_sidebar").addClass("with_top_border");
                ko.applyBindings(data, $("#" + self.settings.containerIdForSearchResult)[0]);
            }
            delete data;
            self.WidgetLoader(true);
        }
    };
    self.SetPosition = function(){

        if(self.settings.inputParameters['position'] == 'absolute'){
            for(var key in self.settings.inputParameters){
                if(self.settings.styleSearchResult[key])
                    self.settings.styleSearchResult[key] = self.settings.inputParameters[key];
            }
            $().ready(function(){
                 $("#" + self.settings.containerIdForAdvancedSearch).css(self.settings.styleSearchResult);
            });
        }
    };
}


var AdvancedSearchFormViewModel = function(params){
    var self = this;
    self.keyWords = Parameters.filter.keyWords;
    self.idCategories = Parameters.filter.idCategories;
    self.typeSearch = Parameters.filter.typeSearch;
    self.startCost = Parameters.filter.startCost;
    self.endCost = Parameters.filter.endCost;
    self.exceptWords = Parameters.filter.exceptWords;
    self.typeSeller = Parameters.filter.typeSeller;
    
    self.categories = [];
    self.typesSearch = ko.observableArray();
    self.typesSellers = ko.observableArray();
    self.typeCategories = [];
    self.cssTypeSearch = 'advancedSearchTypeSearch';
    self.cssTypeSeller = 'advancedSearchTypeSeller';
    self.cachData = {};
    
    self.FillSelectList = function(options, list){
        for(var key in options){
            list.push({key : key, text : options[key]})
        }
    };
    
    self.FillSelectList(params.listTypeSearch, self.typesSearch);
    self.FillSelectList(params.listTypeSeller, self.typesSellers);
    
    self.AddCategories = function(data){
        self.cachData = data;
        if(self.idCategories.length == 1){
            self.FindSelectedSection(data, self.idCategories);
        }
        
        self.categories = self.AddChildren(data).children;
        EventDispatcher.DispatchEvent('searchResultWidget.fill.categories', self);
    };
    self.AddChildren = function(data, select){
        var children = [];
        var active = false;
        for(var j = 0; j <= data.length-1; j++){
            var node = {};
            if($.inArray(data[j].id, Parameters.filter.idSelectCategories) >=0 || select == true){
                node.select = true;
                active = true;
            }
            
            if(data[j].children){
                var ch = self.AddChildren(data[j].children, node.select);
                node.children = ch.children;
                node.expand = ch.active;
                node.isFolder = true;
            }
            
            node.key = data[j].id;
            node.title = data[j].name_category;
            children.push(node);
            
            self.typeCategories[data[j].id] = data[j].type_category;
        }
        return {children : children, active : active };
    };
    self.SubmitAdvancedSearchForm = function(data){
        Loader.Indicator('SearchResultWidget', false);
        self.keyWords = $(data.keyWords).val();
        var selectedTypeSearch = $(data.typeSearch).find('option:selected');
        self.typeSearch = $(selectedTypeSearch[selectedTypeSearch.length-1]).val();
        self.startCost = $(data.startCost).val();
        self.endCost = $(data.endCost).val();
        self.exceptWords = $(data.exceptWords).val();
        var selectedTypeSeller = $(data.typeSeller).find('option:selected');
        self.typeSeller = $(selectedTypeSeller[selectedTypeSeller.length-1]).val();

        Parameters.filter.idCategories = self.idCategories = [];
        self.FindSelectedSection(self.cachData, Parameters.filter.idSelectCategories);
        
        if(self.idCategories.length > 0)
           Parameters.filter.idCategories = self.idCategories.join(",");
        Parameters.filter.keyWords = self.keyWords;
        Parameters.filter.typeSearch = self.typeSearch;
        Parameters.filter.startCost = self.startCost;
        Parameters.filter.endCost = self.endCost;
        Parameters.filter.exceptWords = self.exceptWords;
        Parameters.filter.typeSeller = self.typeSeller;
        Parameters.filter.page = 1;
        
        Routing.SetHash('search', 'Расширенный поиск', Parameters.filter);
    };
    self.FilterCategories = function(data){
        var test = [];
        var j = 0;
        for(var i = 0; i <= data.length-1; i++){
            if(self.typeCategories[data[i]] && self.typeCategories[data[i]] == 'category'){
                test[j] = data[i];
                j++;
            }
        }
        return test;
    };
    self.FindSelectedSection = function(data, selected){
        for(var i = 0; i <= data.length - 1; i++){
            for(var j = 0; j <= selected.length; j++){
                if(data[i].id == selected[j] && data[i].children){
                    self.FindChildrenCategory(data[i].children);
                    break;
                }
                else if(data[i].children)
                    self.FindSelectedSection(data[i].children, selected)
                else if(data[i].id == selected[j]){
                    if($.inArray(data[i].id, self.idCategories) < 0)
                        self.idCategories.push(data[i].id);
                }
            }
        }
    }
    self.FindChildrenCategory = function(data){
        for(var i = 0; i <= data.length - 1; i++){
            if(data[i].type_category == 'category'){
                if($.inArray(data[i].id, self.idCategories) < 0)
                   self.idCategories.push(data[i].id);
            }
            if(data[i].children){
                self.FindChildrenCategory(data[i].children)
            }
        }
    }
}

/* Content List*/
var ListSearchResultViewModel = function(settings){
    var self = this;
    self.id       = 0;
    self.titleBlock    = 'Расширенный поиск';
    self.typeView      = 'tile';
    self.countGoods    = 0;

    self.content  = ko.observableArray();
    self.paging = ko.observableArray();
    self.filters = {
        typeView : self.typeView,
        orderBy : Parameters.filter.orderBy,
        filterName : Parameters.filter.filterName,
        itemsPerPage : settings.paging.itemsPerPage,
        listPerPage : settings.listPerPage,
        countOptionList : ko.observable(settings.listPerPage.length-1),
        FilterNameGoods : function(data){
            Loader.Indicator('SearchResultWidget', false);
            Parameters.filter.filterName = $(data.text).val();

            Routing.UpdateHash({page : 1, filterName : $(data.text).val()});
        },
        SelectCount : function(count){
            Loader.Indicator('SearchResultWidget', false);
            self.filters.itemsPerPage = settings.paging.itemsPerPage = count;

            Routing.UpdateHash({page : 1});
        },
        selectTypeView : {
            ClickTile : function(){
                self.typeView = 'tile';
                self.filters.typeView = 'tile';
                Parameters.cache.typeView = 'tile';
                self.AddContent(Parameters.cache.searchContent[self.GetQueryHash()]);
                EventDispatcher.DispatchEvent('searchResultWidget.fill.searchResult', self);
            },
            ClickTable : function(){
                self.typeView = 'table';
                self.filters.typeView = 'table';
                Parameters.cache.typeView = 'table';
                self.AddContent(Parameters.cache.searchContent[self.GetQueryHash()]);
                EventDispatcher.DispatchEvent('searchResultWidget.fill.searchResult', self);
            },
            ClickList : function(){
                self.typeView = 'list';
                self.filters.typeView = 'list';
                Parameters.cache.typeView = 'list';
                self.AddContent(Parameters.cache.searchContent[self.GetQueryHash()]);
                EventDispatcher.DispatchEvent('searchResultWidget.fill.searchResult', self);
            }
        }
    };
    self.AddContent = function(data){
        self.content  = ko.observableArray();
        if(Parameters.cache.typeView){
            self.typeView = Parameters.cache.typeView;
            self.filters.typeView = Parameters.cache.typeView;
        }
        if(data && data.length > 1){
            var last = data.shift();
            self.countGoods = last.count_goods;
            var f = 0;
            for(var i = 0; i <= data.length-1; i++){
                if(self.typeView == 'tile'){
                    var str = new BlockTrForTableViewModel();
                    for(var j = 0; j <= 3; j++){
                        if(data[f]){
                            str.AddStr(new ContentViewModel(data[f], f));
                            f++;
                        }
                        else
                            break;
                    }
                    if(str.str().length > 0)
                        self.content.push(str);
                    delete str;
                }
                else{
                    self.content.push(new ContentViewModel(data[i], i));
                }
            }
            self.AddPages();
            data.unshift(last);
        }
        
        if(self.countGoods == 0)
            self.typeView = 'error';

        EventDispatcher.DispatchEvent('searchResultWidget.fill.searchResult', self);
    };
    self.GetQueryHash = function(){
        var start = (Routing.GetCurrentPage()-1) * settings.paging.itemsPerPage;       
        var query = start + '/' + settings.paging.itemsPerPage + '/' + Parameters.filter.orderBy + '/' + (Parameters.filter.filterName ? Parameters.filter.filterName : '') + '?';
        var keys = ['keyWords', 'typeSearch', 'idCategories', 'startCost', 'endCost', 'exceptWords', 'typeSeller'];
        for(var i = 0; i <= keys.length-1; i++){
            if(Parameters.filter[keys[i]])
                 query = query + '&' + query + '=' + encodeURIComponent(Parameters.filter[keys[i]]);
        }
        return Parameters.shopId + EventDispatcher.HashCode(query);
    };
    self.AddPages = function(){
        var ClickLinkPage = function(){
            Loader.Indicator('SearchResultWidget', false);

            Routing.UpdateHash({page : this.pageId});
        }
        self.paging = Paging.GetPaging(self.countGoods, settings, ClickLinkPage);
    }
}

var TestSearchResult = {
    Init : function(){
        if(typeof Widget == 'function'){
            SearchResultWidget.prototype = new Widget();
            var searchResult = new SearchResultWidget();
            searchResult.Init(searchResult);
        }
        else{
            window.setTimeout(TestSearchResult.Init, 100);
        }
    }
}

TestSearchResult.Init();
