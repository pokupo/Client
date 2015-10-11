var SearchResultWidget = function () {
    var self = this;
    self.widgetName = 'SearchResultWidget';
    self.version = 1.0;
    self.minWidgetVersion = 1.0;
    self.maxWidgetVersion = 2.0;
    self.minTmplVersion = 1.0;
    self.maxTmplVersion = 2.0;
    self.InitWidget = InitWidget;
    var settings = {
        container : {
            form: {widget: 'advancedSearchFormWidgetId', def: 'defaultAdvancedSearchFormWidgetId'},
            content:{widget: 'content', def: 'defaultAdvancedSearchResultWidgetId'}
        },
        tmpl: {
            content : {
                path : "searchResultTmpl.html", // результатов поиска
                id : {
                    table : "searchResultTableTmpl", // id шаблона таблицы
                    list : "searchResultListTmpl", // id шаблона списка
                    tile : "searchResultTileTmpl", // id шаблона плитки
                    empty : "searchResultErrorTmpl" // id шаблона товаров не найдено
                }
            },
            form : {
                path : "advancedSearchFormTmpl.html", // файл шаблонов расширенной формы
                id : "advancedSearchFormTmpl" // id шаблона расширенной формы
            }
        },
        showCatalog: true,
        showForm: true,
        showCart: true,
        idAdvancedSearchForm : "advancedSearch", // id расширенной формы
        listPerPage : [10, 20, 50], // массив списка фильтра кол-ва товаров на странице
        sortList : [{name: 'rating', title: 'рейтингу'}, {name: 'name', title: 'названию'}, {name: 'cost', title: 'цене'}],
        listTypeSearch : { // тип поиска
            any : 'Любое из слов',
            all : 'Все слова'
        },
        listTypeSeller : { // тип продавцов
            '' : "Все продавцы",
            person : 'Частное лицо',
            company : 'Компания'
        },
        animate: {
            content: typeof AnimateSearchResult == 'function' ? AnimateSearchResult:null,
            form: typeof AnimateSearchResult == 'function' ? AnimateSearchResult:null
        },
        idTreeCategoriesForAdvancedSearchForm: 'tree_categories_for_advanced_search',
        paging: Config.Paging
    };
    function InitWidget() {
        RegisterEvents();
        SetInputParameters();
        CheckRoutingSearch();
    }
    function SetInputParameters() {
        var input = self.GetInputParameters('searchResult');

        if(!$.isEmptyObject(input)){
            settings = self.UpdateSettings1(settings, input);
            if (input.content) {
                if (input.content.hasOwnProperty('showCart'))
                    settings.showCart = input.content.showCart;
                if (input.content.hasOwnProperty('defaultCount'))
                    settings.paging.itemsPerPage = input.content.defaultCount;
                if (input.content.list)
                    settings.listPerPage = input.content.list;
            }
            if (input.form) {
                if (input.form.hasOwnProperty('showForm'))
                    settings.showForm = input.form.showForm;
                if (input.form.hasOwnProperty('showCatalog'))
                    settings.showCatalog = input.form.showCatalog;
            }
        }

        Config.Containers.searchResult = settings.container;
    }

    function CheckRoutingSearch() {
        if (Routing.route == 'search') {
            var pRoute = Routing.params;
            for (var key in pRoute) {
                if (key == 'idSelectCategories') {
                    var categories = [];
                    var ids = decodeURIComponent(pRoute[key]).split(",");
                    if (pRoute[key]) {
                        var j = 0;
                        for (var i in ids) {
                            var id = parseInt(ids[i]);
                            if (id && !isNaN(id))
                                categories[j++] = id;
                        }

                        Parameters.filter[key] = categories;
                        Parameters.filter.idCategories = categories;
                    }
                }
                else
                    Parameters.filter[key] = decodeURIComponent(pRoute[key]);
            }
            self.DispatchEvent('w.change.route')
        }
        self.DispatchEvent('SearchR.show.form');
    }

    function RegisterEvents() {
        self.AddEvent('SearchR.show.form', function () {
            if (settings.showForm) {
                $("#" + settings.container.form.widget).html("");
                self.BaseLoad.Roots(function () {
                    self.DispatchEvent('SearchR.onload.roots.show.form')
                })
            }
            else
                self.WidgetLoader(true, settings.container.form.widget);
        });

        self.AddEvent('SearchR.onload.roots.show.form', function (data) {
            self.BaseLoad.Tmpl(settings.tmpl.form, function () {
                InsertContainerAdvancedSearchForm();
                if (Routing.route != 'search')
                    Parameters.SetDefaultFilterParameters();
                FillAdvancedSearchForm();
                self.WidgetLoader(true, settings.container.form.widget);
            });
        });

        self.AddEvent('SearchR.submit.form', function (data) {
            var paging = settings.paging;
            var start = (Routing.GetCurrentPage() - 1) * paging.itemsPerPage;
            var query = start + '/' + paging.itemsPerPage + '/' + Parameters.filter.orderBy + '/' + (Parameters.filter.filterName ? encodeURIComponent(Parameters.filter.filterName) : '') + '?';
            var keys = ['keyWords', 'typeSearch', 'idCategories', 'startCost', 'endCost', 'exceptWords', 'typeSeller'];

            var params = [];
            for (var i = 0; i <= keys.length - 1; i++) {
                if (Parameters.filter[keys[i]])
                    params[i] = keys[i] + '=' + encodeURIComponent(Parameters.filter[keys[i]]);
            }
            query = query + params.join('&');
            self.BaseLoad.SearchContent(Parameters.shopId, query, function (data) {
                self.DispatchEvent('SearchR.onload.searchResult', data);
            })
        });

        self.AddEvent('SearchR.onload.searchResult', function (data) {
            self.DispatchEvent('onload.breadCrumb.tmpl');
            FillSearchResult(data);
        });

        self.AddEvent('SearchR.fill.searchResult', function (data) {
            InsertContainerSearchResult(data.typeView);
            RenderSearchResult(data);
        });

        self.AddEvent('SearchR.fill.categories', function (data) {
            RenderAdvancedSearchForm(data);
        });

        self.AddEvent('w.change.route', function (data) {
            if (Routing.route == 'search') {
                self.BaseLoad.Tmpl(settings.tmpl.content, function () {
                    self.DispatchEvent('SearchR.submit.form');
                });
            }
            self.DispatchEvent('SearchR.show.form');
        });
    }

    function InsertContainerEmptyFormWidget() {
        $("#" + settings.container.form.widget).empty().html('');
    }

    function InsertContainerAdvancedSearchForm() {
        InsertContainerEmptyFormWidget();
        self.AppendContainer(settings, false, 'form', settings.container.form.widget)
    }

    function InsertContainerEmptyWidget() {
        $("#" + settings.container.content.widget).empty().html('');
    }

    function InsertContainerSearchResult(type) {
        InsertContainerEmptyWidget();
        var container = settings.container.content.widget;
        if (type == 'table')
            self.AppendContainer(settings, 'table', 'content', container)
        if (type == 'list')
            self.AppendContainer(settings, 'list', 'content', container)
        if (type == 'tile')
            self.AppendContainer(settings, 'tile', 'content', container)
        if (type == 'error')
            self.AppendContainer(settings, 'empty', 'content', container)
    }

    function FillAdvancedSearchForm() {
        var searchForm = new AdvancedSearchFormViewModel(settings);
        self.BaseLoad.Roots(function (data) {
            searchForm.AddCategories(data);
        });
    }

    function FillSearchResult(data) {
        self.BaseLoad.Script(PokupoWidgets.model.content, function () {
            var searchResult = new ListSearchResultViewModel(settings);
            searchResult.AddContent(data);
        });
    }

    function RenderAdvancedSearchForm(data) {
        if (ko.global)
            ko.global.route = Routing.route;
        else
            ko.global = {
                route: Routing.route
            };

        self.RenderTemplate(data, settings, null,
            function(data){
                InsertContainerAdvancedSearchForm();
                RenderAdvancedSearchForm(data);
            },
            function(){
                InsertContainerEmptyFormWidget();
            },
            null, null, 'form'
        );
    }

    function RenderSearchResult(data) {
        self.RenderTemplate(data, settings, null,
            function(data){
                InsertContainerSearchResult(data.typeView);
                RenderSearchResult(data);
            },
            function(){
                InsertContainerEmptyWidget();
            },
            data.typeView, null, 'content'
        );
    }
}


var AdvancedSearchFormViewModel = function (settings) {
    var self = this,
        filter = Parameters.filter;
    self.keyWords = filter.keyWords;
    self.idCategories = filter.idCategories;
    self.typeSearch = ko.observable();
    self.typeSearch(filter.typeSearch);
    self.startCost = filter.startCost;
    self.endCost = filter.endCost;
    self.exceptWords = filter.exceptWords;
    self.typeSeller = ko.observable();
    self.typeSeller(filter.typeSeller);
    self.showCatalog = settings.showCatalog;

    self.categories = [];
    self.typesSearch = ko.observableArray();
    self.typesSellers = ko.observableArray();
    self.typeCategories = [];
    self.cssTypeSearch = 'advancedSearchTypeSearch';
    self.cssTypeSeller = 'advancedSearchTypeSeller';
    self.cachData = {};

    self.AddCategories = function (data) {
        self.cachData = data;
        if (self.idCategories && self.idCategories.length == 1) {
            FindSelectedSection(data, self.idCategories);
        }

        self.categories = AddChildren(data).children;
        Parameters.cache.categories = self.categories;
        EventDispatcher.DispatchEvent('SearchR.fill.categories', self);
    };

    self.SubmitAdvancedSearchForm = function (data) {
        Loader.Indicator('SearchResultWidget', false);
        self.keyWords = $(data.keyWords).val();
        self.startCost = $(data.startCost).val();
        self.endCost = $(data.endCost).val();
        self.exceptWords = $(data.exceptWords).val();

        Parameters.filter.idCategories = self.idCategories = [];
        FindSelectedSection(self.cachData, Parameters.filter.idSelectCategories);

        if (self.idCategories.length > 0)
            Parameters.filter.idCategories = self.idCategories.join(",");
        Parameters.filter.keyWords = self.keyWords;
        Parameters.filter.typeSearch = self.typeSearch();
        Parameters.filter.startCost = self.startCost;
        Parameters.filter.endCost = self.endCost;
        Parameters.filter.exceptWords = self.exceptWords;
        Parameters.filter.typeSeller = self.typeSeller();
        Parameters.filter.page = 1;
        Routing.SetHash('search', 'Расширенный поиск', Parameters.filter);
    };

    FillTypeSearchSelectList(settings.listTypeSearch, self.typesSearch);
    FillTypeSellerSelectList(settings.listTypeSeller, self.typesSellers);

    function AddChildren(data, select) {
        var children = [];
        var active = false;
        for (var j = 0; j <= data.length - 1; j++) {
            var node = {};
            node.select = false;
            if ($.inArray(data[j].id, Parameters.filter.idSelectCategories) >= 0 || select == true) {
                node.select = true;
                active = true;
            }

            if (data[j].children) {
                var ch = AddChildren(data[j].children, node.select);
                node.children = ch.children;
                node.expand = ch.active;
                node.isFolder = true;
            }

            node.key = data[j].id;
            node.title = data[j].name_category;
            children.push(node);

            self.typeCategories[data[j].id] = data[j].type_category;
        }
        return {children: children, active: active};
    }
    function FillTypeSearchSelectList(options, list) {
        for (var key in options) {
            list.push(new AdvancedSearchFormTypeSearchViewModel({key: key, title: options[key]}, self));
        }
    }
    function FillTypeSellerSelectList(options, list) {
        for (var key in options) {
            list.push(new AdvancedSearchFormTypeSellerViewModel({key: key, title: options[key]}, self));
        }
    }
    function FindSelectedSection(data, selected) {
        for (var i = 0; i <= data.length - 1; i++) {
            if (selected) {
                for (var j = 0; j <= selected.length; j++) {
                    if (data[i].id == selected[j] && data[i].children) {
                        FindChildrenCategory(data[i].children);
                        break;
                    }
                    else if (data[i].children)
                        FindSelectedSection(data[i].children, selected)
                    else if (data[i].id == selected[j]) {
                        if ($.inArray(data[i].id, self.idCategories) < 0)
                            self.idCategories.push(data[i].id);
                    }
                }
            }
        }
    }
    function FindChildrenCategory(data) {
        for (var i = 0; i <= data.length - 1; i++) {
            if (data[i].type_category == 'category') {
                if ($.inArray(data[i].id, self.idCategories) < 0)
                    self.idCategories.push(data[i].id);
            }
            if (data[i].children) {
                FindChildrenCategory(data[i].children)
            }
        }
    }
}

var AdvancedSearchFormTypeSearchViewModel = function (data, parent) {
    var self = this;
    self.title = data.title;
    self.key = data.key;

    self.ClickItem = function () {
        parent.typeSearch(self.key);
    }
}

var AdvancedSearchFormTypeSellerViewModel = function (data, parent) {
    var self = this;
    self.title = data.title;
    self.key = data.key;

    self.ClickItem = function () {
        parent.typeSeller(self.key);
    }
}

/* Content List*/
var ListSearchResultViewModel = function (settings) {
    var self = this;
    self.id = 0;
    self.titleBlock = 'Расширенный поиск';
    self.typeView = 'tile';
    self.countGoods = 0;
    self.showCart = settings.showCart;

    self.content = ko.observableArray();
    self.paging = ko.observableArray();
    self.GetSort = function () {
        var s = new SortSearchResultListViewModel();
        s.AddContent(settings.sortList);
        s.SetDefault(Parameters.filter.orderBy);
        return s;
    };
    self.filters = {
        typeView: self.typeView,
        sort: self.GetSort(),
        filterName: ko.observable(Parameters.filter.filterName),
        itemsPerPage: settings.paging.itemsPerPage,
        listPerPage: ko.observableArray(),
        countOptionList: ko.observable(settings.listPerPage.length - 1),
        FilterNameGoods: function (data) {
            Loader.Indicator('SearchResultWidget', false);
            Parameters.filter.filterName = $(data.text).val();

            Routing.UpdateHash({page: 1, filterName: $(data.text).val()});
        },
        ClickFilterNameGoods: function () {
            Loader.Indicator('SearchResultWidget', false);
            Parameters.filter.filterName = self.filters.filterName();

            Routing.UpdateMoreParameters({filterName: self.filters.filterName()});
            Routing.UpdateHash({page: 1});
        },
        ViewSelectCount: function () {
            self.filters.listPerPage = ko.observableArray();
            for (var key in settings.listPerPage) {
                if (settings.listPerPage[key] < self.countGoods)
                    self.filters.listPerPage.push(settings.listPerPage[key]);
                else {
                    self.filters.listPerPage.push(settings.listPerPage[key]);
                    break;
                }
            }
            if (self.filters.listPerPage().length == 1)
                self.filters.listPerPage = ko.observableArray();
        },
        SelectCount: function (count) {
            Loader.Indicator('SearchResultWidget', false);
            self.filters.itemsPerPage = settings.paging.itemsPerPage = count;

            Routing.UpdateHash({page: 1});
        },
        selectTypeView: {
            ClickTile: function () {
                self.typeView = 'tile';
                self.filters.typeView = 'tile';
                Parameters.cache.typeView = 'tile';
                self.AddContent(Parameters.cache.searchContent[self.GetQueryHash()]);
                EventDispatcher.DispatchEvent('SearchR.fill.searchResult', self);
            },
            ClickTable: function () {
                self.typeView = 'table';
                self.filters.typeView = 'table';
                Parameters.cache.typeView = 'table';
                self.AddContent(Parameters.cache.searchContent[self.GetQueryHash()]);
                EventDispatcher.DispatchEvent('SearchR.fill.searchResult', self);
            },
            ClickList: function () {
                self.typeView = 'list';
                self.filters.typeView = 'list';
                Parameters.cache.typeView = 'list';
                self.AddContent(Parameters.cache.searchContent[self.GetQueryHash()]);
                EventDispatcher.DispatchEvent('SearchR.fill.searchResult', self);
            }
        }
    };
    self.AddContent = function (data) {
        self.content = ko.observableArray();
        if (Parameters.cache.typeView) {
            self.typeView = Parameters.cache.typeView;
            self.filters.typeView = Parameters.cache.typeView;
        }
        if (data && data.length > 1) {
            var last = data.shift();
            self.countGoods = parseInt(last.count_goods);
            var f = 0;
            for (var i = 0; i <= data.length - 1; i++) {
                if (self.typeView == 'tile') {
                    var str = new BlockTrForTableViewModel();
                    for (var j = 0; j <= 3; j++) {
                        if (data[f]) {
                            str.AddStr(new ContentViewModel(data[f], f));
                            f++;
                        }
                        else
                            break;
                    }
                    if (str.str().length > 0)
                        self.content.push(str);
                    delete str;
                }
                else {
                    self.content.push(new ContentViewModel(data[i], i));
                }
            }
            self.AddPages();
            data.unshift(last);
        }

        if (self.countGoods == 0)
            self.typeView = 'error';

        self.filters.ViewSelectCount();
        EventDispatcher.DispatchEvent('SearchR.fill.searchResult', self);
    };
    self.GetQueryHash = function () {
        var start = (Routing.GetCurrentPage() - 1) * settings.paging.itemsPerPage;
        var query = start + '/' + settings.paging.itemsPerPage + '/' + Parameters.filter.orderBy + '/' + (Parameters.filter.filterName ? encodeURIComponent(Parameters.filter.filterName) : '') + '?';
        var keys = ['keyWords', 'typeSearch', 'idCategories', 'startCost', 'endCost', 'exceptWords', 'typeSeller'];
        var params = [];
        for (var i = 0; i <= keys.length - 1; i++) {
            if (Parameters.filter[keys[i]])
                params[i] = keys[i] + '=' + encodeURIComponent(Parameters.filter[keys[i]]);
        }
        query = query + params.join('&');
        return Parameters.shopId + EventDispatcher.HashCode(query);
    };
    self.AddPages = function () {
        var ClickLinkPage = function () {
            Loader.Indicator('SearchResultWidget', false);

            Routing.UpdateHash({page: this.pageId});
        }
        self.paging = Paging.GetPaging(self.countGoods, settings, ClickLinkPage);
    }
}

var SortSearchResultItemViewModel = function (data, active) {
    var self = this;
    self.name = data.name;
    self.title = data.title;
    self.isActive = false;
    self.ClickSort = function () {
        $.each(active.list(), function (i) {
            active.list()[i].isActive = false
        })
        active.activeItem(self);
        self.isActive = true;
        Loader.Indicator('SearchResultWidget', false);

        Parameters.filter.orderBy = self.name;
        Routing.UpdateMoreParameters({orderBy: self.name});
        Routing.UpdateHash({page: 1});
    };
};

var SortSearchResultListViewModel = function () {
    var self = this;
    self.activeItem = ko.observable();
    self.list = ko.observableArray();
    self.cssSortList = 'sort_search_result_list';

    self.AddContent = function (data) {
        $.each(data, function (i) {
            self.list.push(new SortSearchResultItemViewModel(data[i], self));
        });
    };
    self.SetDefault = function (orderBy) {
        $.each(self.list(), function (i) {
            if (self.list()[i].name == orderBy) {
                self.activeItem(self.list()[i]);
                self.list()[i].isActive = true;
            }
            else {
                self.list()[i].isActive = false;
            }
        });
    };
};

var TestSearchResult = {
    Init: function () {
        if (typeof Widget == 'function') {
            SearchResultWidget.prototype = new Widget();
            var searchResult = new SearchResultWidget();
            searchResult.Init(searchResult);
        }
        else {
            setTimeout(function () {
                TestSearchResult.Init()
            }, 100);
        }
    }
}

TestSearchResult.Init();
