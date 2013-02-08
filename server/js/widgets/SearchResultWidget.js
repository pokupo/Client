var SearchResultWidget = function(conteiner){
    var self = this;
    self.settingsSearchResult = {
        containerIdForSearchResult : conteiner[1],
        containerIdForAdvancedSearch : conteiner[0],
        tmplForAdvancedSearchForm : Config.SearchResult.tmpl,
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
        self.settingsSearchResult.inputParameters = JSCore.ParserInputParameters(/SearchResultWidget.js/);
        if(self.settingsSearchResult.inputParameters.content){
            var content = JSON.parse(self.settingsSearchResult.inputParameters.content)
            if(content.defaultCount)
                self.settingsSearchResult.paging.itemsPerPage = content.defaultCount;
            if(content.list)
                self.settingsSearchResult.listPerPage = content.list;
        }
        if(Parameters.cache.searchPageId > 1){
            self.settingsSearchResult.paging.currentPage = Parameters.cache.searchPageId;
            self.settingsSearchResult.paging.startContent = (Parameters.cache.searchPageId-1)*self.settingsSearchResult.paging.itemsPerPage + 1;
            Parameters.cache.searchPageId = 1;
        }
    };
    self.Route = function(){
        if(Route.route == 'search'){
            for(var key in Route.params){
                if(key == 'idSelectCategories'){
                    var categories = [];
                    var ids = decodeURIComponent(Route.params[key]).split(",");
                    if(Route.params[key]){
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
                    Parameters.filter[key] = decodeURIComponent(Route.params[key]);
            }
            EventDispatcher.DispatchEvent('searchWidget.submit.form');
        }
        else{
            ReadyWidgets.Indicator('SearchResultWidget', true);  
        }
    };
    self.RegisterEvents = function(){
        if(JSLoader.loaded){
            new Dyn();
            self.BaseLoad.Tmpl(self.settingsSearchResult.tmplForAdvancedSearchForm, function(){
                EventDispatcher.DispatchEvent('searchResultWidget.onload.tmpl')
            });
        }
        else{
            EventDispatcher.AddEventListener('onload.scripts', function (data){ 
                new Dyn();
                self.BaseLoad.Tmpl(self.settingsSearchResult.tmplForAdvancedSearchForm, function(){
                    EventDispatcher.DispatchEvent('searchResultWidget.onload.tmpl')
                });
            });
        }
        
        EventDispatcher.AddEventListener('searchResultWidget.onload.tmpl', function(){
            self.Route();
        });
        
        EventDispatcher.AddEventListener('searchWidget.submit.form', function (data){
            ReadyWidgets.Indicator('SearchResultWidget', false);
            
            Route.SetHash('search', Parameters.filter);
            self.BaseLoad.Roots(function(){
                EventDispatcher.DispatchEvent('searchResultWidget.onload.roots')
            })
        });
        
        EventDispatcher.AddEventListener('searchResultWidget.onload.roots', function (){  
            self.InsertContainer.AdvancedSearchForm();
            self.Fill.AdvancedSearchForm();
            
            EventDispatcher.DispatchEvent('searchResultWidget.submit.form');
        });
        
        EventDispatcher.AddEventListener('searchResultWidget.submit.form', function (data){
            var paging = self.settingsSearchResult.paging;
            var str = '&shopId='+Parameters.shopId+'&start='+paging.startContent+'&count='+paging.itemsPerPage;

            for(var key in Parameters.filter){
                if(Parameters.filter[key]){
                    if(key != 'idSelectCategories')
                         str = str + '&' + key + '=' + encodeURIComponent(Parameters.filter[key]);
                }
            }
            self.BaseLoad.SearchContent(str, function(data){
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
        
        EventDispatcher.AddEventListener('widget.changeHash', function (data){
            ReadyWidgets.Indicator('SearchResultWidget', true);
            $("#" + self.settingsSearchResult.containerIdForAdvancedSearch).html("");
        });
    };
    self.InsertContainer = {
        AdvancedSearchForm : function(){
            $("#" + self.settingsSearchResult.containerIdForAdvancedSearch).html("");
            $("#" + self.settingsSearchResult.containerIdForAdvancedSearch).append($('script#advancedSearchFormTmpl').html()).children().hide();
        },
        SearchResult : function(type){
            $("#" + self.settingsSearchResult.containerIdForSearchResult).html('');
            if(type == 'table'){ 
                $("#" + self.settingsSearchResult.containerIdForSearchResult).append($('script#searchResultTableTmpl').html());
            }
            if(type == 'list'){
                $("#" + self.settingsSearchResult.containerIdForSearchResult).append($('script#searchResultListTmpl').html());
            }
            if(type == 'tile'){
                $("#" + self.settingsSearchResult.containerIdForSearchResult).append($('script#searchResultTileTmpl').html());
            }
            if(type == 'error'){
                $("#" + self.settingsSearchResult.containerIdForSearchResult).append($('script#searchResultErrorTmpl').html());
            }
        }
    };
    self.Fill = {
        AdvancedSearchForm : function(){
            var searchForm = new AdvancedSearchFormViewModel(self.settingsSearchResult);
            searchForm.AddCategories(JSON.parse(Parameters.cache.roots));
        },
        SearchResult : function(data){
            var searchResult = new ListSearchResultViewModel(self.settingsSearchResult);
            searchResult.AddContent(data);
        }
    };
    self.Render = {
        AdvancedSearchForm : function(data){
            if($("#" + self.settingsSearchResult.containerIdForAdvancedSearch).length){
                ko.applyBindings(data, $("#" + self.settingsSearchResult.containerIdForAdvancedSearch)[0]);

                $("#" + self.settingsSearchResult.idTreeCategoriesForAdvancedSearchForm).dynatree({
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
                    defaultText: self.settingsSearchResult.listTypeSearch[data.typeSearch]
                }).change(function(){
                    var id = $('.' + data.cssTypeSearch).getSetSSValue();
                    $('.' + data.cssTypeSearch + ' option').removeAttr('selected');
                    $('.' + data.cssTypeSearch + ' option[value=' + id + ']').attr('selected', true);
                    $('#advancedSearch input:submit').focus();
                });

                $('.' + data.cssTypeSeller).sSelect({
                    defaultText: self.settingsSearchResult.listTypeSeller[data.typeSeller]
                }).change(function(){
                    var id = $('.' + data.cssTypeSeller).getSetSSValue();
                    $('.' + data.cssTypeSeller + ' option').removeAttr('selected');
                    $('.' + data.cssTypeSeller + ' option[value=' + id + ']').attr('selected', true);
                    $('#advancedSearch input:submit').focus();
                });
            }
        },
        SearchResult : function(data){
            if($("#" + self.settingsSearchResult.containerIdForSearchResult).length > 0){
                $("#catalog").hide();
                $("#wrapper").removeClass("with_sidebar").addClass("with_top_border");
                ko.applyBindings(data, $("#" + self.settingsSearchResult.containerIdForSearchResult)[0]);
            }
            delete data;
            ReadyWidgets.Indicator('SearchResultWidget', true);
        }
    };
    self.SetPosition = function(){

        if(self.settingsSearchResult.inputParameters['position'] == 'absolute'){
            for(var key in self.settingsSearchResult.inputParameters){
                if(self.settingsSearchResult.styleSearchResult[key])
                    self.settingsSearchResult.styleSearchResult[key] = self.settingsSearchResult.inputParameters[key];
            }
            $().ready(function(){
                 $("#" + self.settingsSearchResult.containerIdForAdvancedSearch).css(self.settingsSearchResult.styleSearchResult);
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
        ReadyWidgets.Indicator('SearchResultWidget', false);
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
        params.paging.startContent = 0;
        params.paging.currentPage = 1;
        
        Route.SetHash('search', Parameters.filter);
        
        EventDispatcher.DispatchEvent('searchResultWidget.submit.form');
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

var BlockSearchResultViewModel = function(data, i){
    var self = this;
    self.id = data.id;
    self.chortName = data.chort_name;
    self.fullName = data.full_name;
    self.routeImage = Parameters.pathToImages + data.route_image;
    self.countTovars = data.count;
    self.sellGoods = data.sell_cost + " руб.";
    self.sellCost = data.sell_end_cost + " руб.";
    self.description = ko.computed(function(){
        if(data.description)
            return data.description;
        else
            return "";
    },this);
    self.ratingGoods = data.rating_goods;
    self.discount = ko.computed(function(){
        var d = Math.floor(data.sell_end_cost*100/data.sell_goods);
        if(d > 0)
            return d + '%';
        else
            return 0;
    }, this);
    self.shopId = data.id_shop;
    self.shopName = data.name_shop;
    self.ratingShop = data.rating_shop;
    self.routeLogoShop = Parameters.pathToImages + data.route_logo_shop;
    self.positiveOpinion = '+' + data.positive_opinion;
    self.negativeOpinion = '-' + data.negative_opinion;
    self.keyWords = data.key_words;
    self.idAuction = ko.computed(function(){
        if(data.id_auction)
            return data.id_auction;
        else
            return 0;
    },this);
    self.routIconAuction = Parameters.routIconAuction;
    self.imageHref = '#' + (i+1);
    self.cssBlock = 'views-row views-row-' + (i+1);
    
    self.ClickGoods = function(){
        alert(self.id);
        EventDispatcher.DispatchEvent('contentWidget.click.goods', self);
    }
    self.ClickShop = function(){
        alert(self.shopId);
    }
    self.ClickBuy = function(){
    //alert()
    }
    self.ClickAuction = function(){
        
    }
}
var BlockTrForSearchResultTableViewModel = function(){
    var self = this;
    self.str = ko.observableArray();
    
    self.AddStr = function(data){
        self.str.push(data);
    }
}
/* End Block */

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
            ReadyWidgets.Indicator('SearchResultWidget', false);
            Parameters.filter.filterName = $(data.text).val();
            
            Route.SetHash('search', Parameters.filter);
            EventDispatcher.DispatchEvent('searchResultWidget.submit.form')
        },
        SelectCount : function(count){
            ReadyWidgets.Indicator('SearchResultWidget', false);
            self.filters.itemsPerPage = count;
            settings.paging.itemsPerPage = count;
            settings.paging.currentPage = 1;
            settings.paging.startContent = 0;
            
            Route.SetHash('search', Parameters.filter);

            EventDispatcher.DispatchEvent('searchResultWidget.submit.form')
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
                    var str = new BlockTrForSearchResultTableViewModel();
                    for(var j = 0; j <= 3; j++){
                        if(data[f]){
                            str.AddStr(new BlockSearchResultViewModel(data[f], f));
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
                    self.content.push(new BlockSearchResultViewModel(data[i], i));
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
        var str = '&shopId='+Parameters.shopId+'&start='+settings.paging.startContent+'&count='+settings.paging.itemsPerPage;       
        
        for(var key in Parameters.filter){
            if(Parameters.filter[key]){
                if(key != 'idSelectCategories')
                str = str + '&' + key + '=' + encodeURIComponent(Parameters.filter[key]);
            }
        }
        return EventDispatcher.hashCode(str);
    };
    self.AddPages = function(){
        var ClickLinkPage = function(){
            ReadyWidgets.Indicator('SearchResultWidget', false);
            var start = (this.pageId-1) * settings.paging.itemsPerPage;
            Parameters.filter.page = this.pageId;
            settings.paging.currentPage = this.pageId;
            settings.paging.startContent = start;

            Route.SetHash('search', Parameters.filter);

            EventDispatcher.DispatchEvent('searchResultWidget.submit.form')
        }
        self.paging = Paging.GetPaging(self.countGoods, settings, ClickLinkPage);
    }
}

var TestSearchResult = {
    Init : function(){
        if(typeof Widget == 'function' && JSCore !== undefined && ReadyWidgets !== undefined){
            ReadyWidgets.Indicator('SearchResultWidget', false);
            SearchResultWidget.prototype = new Widget();
            var searchResult = new SearchResultWidget(Config.Conteiners.searchResult);
            searchResult.Init();
        }
        else{
            window.setTimeout(TestSearchResult.Init, 100);
        }
    }
}

TestSearchResult.Init();
