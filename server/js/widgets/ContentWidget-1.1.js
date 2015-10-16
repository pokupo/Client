var ContentWidget = function () {
    var self = this;
    self.widgetName = 'ContentWidget';
    self.version = 1.0;
    self.minWidgetVersion = 1.0;
    self.maxWidgetVersion = 2.0;
    self.minTmplVersion = 1.0;
    self.maxTmplVersion = 2.0;
    self.InitWidget = InitWidget;

    var settings = {
        message: {
            noGoods: 'В этом разделе товаров не найдено...', // cообщение в случае если в разделе нет товаров
            filter: 'Товаров по ключу "%%filterName%%" не найдено', // сообщение в случае отсутствия товаров после фильтрации
            categoriesNotCreated: 'Извините, но в магазине пока нет товаров для продажи.' //Рубрикатор не создан
        },
        container: {
            content: {widget: 'content', def: 'defaultContentWidgetId'},
            block: {
                slider: {widget: 'sliderBlockId', def: 'defaultSliderBlockId'},
                carousel: {widget: 'carouselBlockId', def: 'defaultSliderBlockId'},
                tile: {widget: 'tileBlockId', def: 'defaultTileBlockId'},
                empty: {widget: 'emptyBlockId', def: 'defaultEmptyBlockId'}
            }
        },
        tmpl: {
            content: {
                path: "contentTmpl.html", // файл шаблона реестра товаров
                id: {
                    table: "contentTableTmpl", // id шаблона таблицы
                    list: "contentListTmpl", // id шаблона списка
                    tile: "contentTileTmpl", // id шаблона плитки
                    empty: "contentNoResultsTmpl" // id шаблона товаров не найдено
                }
            },
            block: {
                path: "blockTmpl.html", // файл шаблона промо блоков
                id: {
                    slider: "blockSliderTmpl", // id шаблона слайдера (промо)
                    carousel: "blockCaruselTmpl", // id шаблона карусели (промо)
                    tile: "blockTileTmpl", // id шаблона плитки (промо)
                    empty: "blockNoResultsTmpl" // id шаблона товаров не найдено
                }
            }
        },
        countGoodsInBlock: 6,  // кол-во товаров выводимых в блоке по умолчанию
        listPerPage: [10, 20, 50], // массив списка фильтра кол-ва товаров на странице
        sortList: [{name: 'rating', title: 'рейтингу'}, {name: 'name', title: 'названию'}, {
            name: 'cost',
            title: 'цене'
        }],
        orderBy: 'name', // сортировка по умолчанию
        showCart: true,
        showBlocks: true,
        animate: {
            content: typeof AnimateContent == 'function' ? AnimateContent : null,
            block: typeof AnimateContent == 'function' ? AnimateContent : null
        },
        filterName: '',
        slider: [],
        paging: Config.Paging
    };
    self.testBlock = {
        count: 0,
        ready: 0,
        IsReady: function () {
            if (self.testBlock.count == self.testBlock.ready)
                return true;
            return false;
        }
    };
    function InitWidget() {
        SetInputParameters();
        RegisterEvents();
        CheckContentRouting();
    }

    function SetInputParameters() {
        var input = self.GetInputParameters('content');

        if (!$.isEmptyObject(input)) {
            settings = self.UpdateSettings1(settings, input);
            if (input.hasOwnProperty('showCart'))
                settings.showCart = input.showCart;
            if (input.block) {
                var block = input.block;
                if (block.hasOwnProperty('showBlocks'))
                    settings.showBlocks = block.showBlocks;
                if (block.count)
                    settings.countGoodsInBlock = block.count;
                if (block.animate)
                    settings.animate.block = block.animate;
                if (block.tmpl) {
                    if (block.tmpl.path)
                        settings.tmpl.block.path = block.tmpl.path;
                    if (block.tmpl.id) {
                        for (var key in block.tmpl.id) {
                            settings.tmpl.block.id[key] = block.tmpl.id[key];
                        }
                    }
                }
                if (block.container) {
                    for (var key in block.container) {
                        settings.container.block[key] = block.container[key];
                    }
                }
            }
            if (input.content) {
                var content = input.content;
                if (content.defaultCount)
                    settings.paging.itemsPerPage = content.defaultCount;
                if (content.list)
                    settings.listPerPage = content.list;
                if (content.animate)
                    settings.animate.content = content.animate;
            }
        }
        Config.Containers.content = settings.container;
    }

    function CheckContentRouting() {
        if (Routing.route == 'catalog' || Routing.IsDefault()) {
            self.BaseLoad.Roots(function (data) {
                if(!data.err)
                    SelectTypeContent();
                else{
                    var block = new EmptyViewBlock({titleBlock: Routing.GetTitle(), typeView: 'categoriesNotCreated'});
                    InsertContainerBlock(0, block.typeView);
                    RenderNoResultsBlock(block);
                }
            });
        }
        else
            self.WidgetLoader(true);
    }

    function SelectTypeContent() {
        if (Routing.IsCategory()) {
            if (!self.HasDefaultContent('content', 'content') || !Routing.IsDefault()) {
                GetContent();
            }
            else
                self.WidgetLoader(true);
        }
        else if (Routing.IsDefault()) {
            var cache = Parameters.cache.roots[0];
            Config.Base.defaultSection = cache.id;
            if (cache.type_category != 'section') {
                GetContent();
            }
            else if (settings.showBlocks) {
                GetBlocks();
            }
            else if (!settings.showBlocks) {
                var children = cache.children;
                var category = null;
                $.each(children, function (i) {
                    if (children[i].type_category == 'category') {
                        category = children[i];
                        return false;
                    }
                });
                if (category)
                    Routing.SetHash('catalog', category.name_category, {section: cache.id, category: category.id})
                else
                    self.WidgetLoader(true);
            }
            else
                self.WidgetLoader(true);
        }
        else {
            if (settings.showBlocks) {
                if (!self.HasDefaultContent('content', 'block') || !Routing.IsDefault()) {
                    GetBlocks();
                }
                else
                    self.WidgetLoader(true);
            }
            else
                self.WidgetLoader(true);
        }
    }

    function GetContent() {
        self.BaseLoad.Tmpl(settings.tmpl.content, function () {
            EventDispatcher.DispatchEvent('onload.content.tmpl')
        });
    }

    function GetBlocks() {
        self.BaseLoad.Tmpl(settings.tmpl.block, function () {
            EventDispatcher.DispatchEvent('onload.blockContent.tmpl')
        });
    }

    function RegisterEvents() {
        self.AddEvent('onload.blockContent.tmpl', function () {
            self.BaseLoad.Script(PokupoWidgets.model.content, function () {
                self.BaseLoad.Blocks(Routing.GetActiveCategory(), function (data) {
                    self.CheckData(data)
                });
            });
        });

        self.AddEvent('onload.content.tmpl', function () {
            self.BaseLoad.Script(PokupoWidgets.model.content, function () {
                self.BaseLoad.Info(Routing.GetActiveCategory(), function (data) {
                    InsertContainerEmptyBlockWidget();
                    self.DispatchEvent('contentWidget.load.categoryInfo')
                })
            });
        });

        self.AddEvent('contentWidget.load.categoryInfo', function () {
            var start = (Routing.GetCurrentPage() - 1) * settings.paging.itemsPerPage;
            var orderBy = Routing.GetMoreParameter('orderBy') ? Routing.GetMoreParameter('orderBy') : settings.orderBy;
            var query = start + '/' + settings.paging.itemsPerPage + '/' + orderBy + '/' + encodeURIComponent(Routing.GetMoreParameter('filterName'));
            self.BaseLoad.Content(Routing.params.category, query, function (data) {
                FillContent(data)
            })
        });

        self.AddEvent('contentWidget.fill.block', function (data) {
            RenderBlock(data);
        });

        self.AddEvent('contentWidget.fill.listContent', function (data) {
            InsertContainerList(data.typeView);
            RenderList(data);
        });

        self.AddEvent('w.change.route', function (data) {
            CheckContentRouting();
        });

        self.AddEvent('contentWidget.click.category', function (data) {
            if ($('script#contentTileTmpl').length < 0) {
                self.BaseLoad.Tmpl(settings.tmplForContent, function () {
                    self.DispatchEvent('onload.content.tmpl')
                });
            }
            else {
                self.DispatchEvent('onload.content.tmpl')
            }
        });
    }

    self.CheckData = function (data) {
        InsertContainerEmptyBlockWidget();
        if (data.err || data == false) {
            if (data.err) {
                var block = new EmptyViewBlock({titleBlock: Routing.GetTitle(), typeView: 'categoriesNotCreated'});
                InsertContainerBlock(0, block.typeView);
                RenderNoResultsBlock(block);
            }
            else {
                var block = new EmptyViewBlock({titleBlock: Routing.GetTitle(), typeView: 'no_results'});
                InsertContainerBlock(0, block.typeView);
                RenderNoResultsBlock(block);
            }
        }
        else {
            self.testBlock.count = 0;
            self.testBlock.ready = 0;
            RenderAnimate.block = ko.observableArray();
            for (var i = 0; i <= data.length - 1; i++) {
                if (data[i].count_goods > 0) {
                    ++self.testBlock.count;
                    Parameters.cache.contentBlock[data[i].id] = {
                        sort: i,
                        block: data[i]
                    };
                    InsertContainerBlock(i, data[i].type_view);

                    var query = '0/' + settings.countGoodsInBlock + '/name/';
                    var queryHash = data[i].id + EventDispatcher.HashCode(query);

                    self.AddEvent('contentWidget.onload.content%%' + queryHash, function (data) {
                        FillBlock(Parameters.cache.contentBlock[data.categoryId]);
                    });

                    self.BaseLoad.Content(data[i].id, query, function (data) {
                        self.DispatchEvent('contentWidget.onload.content%%' + queryHash, data)
                    })
                }
            }
        }
    };
    function SetSort(type, sort) {
        $("#" + settings.container.block[type].widget + ' .promoBlocks:last').attr('id', 'block_sort_' + sort);
    }

    function InsertContainerEmptyBlockWidget() {
        $("#" + settings.container.block.slider.widget).html('');
        $("#" + settings.container.block.carousel.widget).html('');
        $("#" + settings.container.block.tile.widget).html('');
        $("#" + settings.container.content.widget).html('');
    }

    function InsertContainerBlock(sort, type) {
        if (type == 'slider') {
            self.AppendContainer(settings, 'slider', 'block', settings.container.block.slider.widget);
            SetSort('slider', sort);
        }
        if (type == 'carousel') {
            self.AppendContainer(settings, 'carousel', 'block', settings.container.block.carousel.widget);
            SetSort('carousel', sort);
        }
        if (type == 'tile') {
            self.AppendContainer(settings, 'tile', 'block', settings.container.block.tile.widget);
            SetSort('tile', sort);
        }
        if (type == 'no_results') {
            self.AppendContainer(settings, 'empty', 'block', settings.container.block.empty.widget);
        }
        if (type == 'categoriesNotCreated') {
            $("#" + settings.container.block.empty.widget).html('<p style="margin-top: 40px">' + settings.message.categoriesNotCreated + '</p>').children().hide();
        }
    }

    function InsertContainerEmptyWidget() {
        $("#" + settings.container.content.widget).html('');
    }

    function InsertContainerList(type) {
        InsertContainerEmptyWidget();
        if (type == 'table')
            self.AppendContainer(settings, 'table', 'content', settings.container.content.widget);
        if (type == 'list')
            self.AppendContainer(settings, 'list', 'content', settings.container.content.widget);
        if (type == 'tile')
            self.AppendContainer(settings, 'tile', 'content', settings.container.content.widget);
        if (type == 'no_results')
            self.AppendContainer(settings, 'empty', 'content', settings.container.content.widget);
    }

    function FillBlock(data) {
        var block = new BlockViewModel(data, settings);
        block.AddContent();
    }

    function FillContent(data) {
        if (data.content[0].count_goods != 0) {
            var content = new ListContentViewModel(settings);
            content.AddCategoryInfo(data.categoryId);
            content.AddContent(data.content);
        }
        else {
            var content = new ListContentViewModel(settings);
            content.AddCategoryInfo(data.categoryId);
            if (content.filters.filterName() != '') {
                content.SetType('no_results');
                content.SetMessage(settings.message.filter.replace(/%%filterName%%/g, content.filters.filterName()));
            }
            else {
                content.SetType('no_results');
                content.SetMessage(settings.message.noGoods);
            }
            self.DispatchEvent('contentWidget.fill.listContent', content);
        }
    }

    var RenderAnimate = {
        block: ko.observableArray(),
        Do: function () {
            if (Loader.IsReady()) {
                var b = RenderAnimate.block()
                $.each(b, function (i) {
                    if (settings.animate.block)
                        settings.animate.block();
                })
            }
            else {
                setTimeout(function () {
                    RenderAnimate.Do()
                }, 100);
            }
        }
    }

    function RenderList(data) {
        self.RenderTemplate(data, settings, null,
            function (data) {
                InsertContainerList(data.typeView);
                RenderList(data);
            },
            function () {
                InsertContainerEmptyWidget();
            }, data.typeView, null, 'content'
        );
    }

    function RenderBlock(data) {
        if ($('#' + data.cssBlock).length > 0) {
            try {
                ko.cleanNode($('#' + data.cssBlock)[0]);
                ko.applyBindings(data, $('#' + data.cssBlock)[0]);
                RenderAnimate.block.push({type: data.typeView, data: data})
                self.testBlock.ready = self.testBlock.ready + 1;

                if (self.testBlock.IsReady()) {
                    $.each(settings.container.block, function (i) {
                        self.WidgetLoader(true, settings.container.block[i].widget);
                    });
                    RenderAnimate.Do();
                }
            }
            catch (e) {
                self.Exception('Ошибка шаблона [' + self.GetTmplName1(settings, data.typeView, 'block') + ']', e);
                if (settings.tmpl.custom) {
                    delete settings.tmpl.custom;
                    self.BaseLoad.Tmpl(settings.tmpl, function () {
                        InsertContainerBlock(data.typeView);
                        RenderBlock(data);
                    });
                }
                else {
                    InsertContainerEmptyWidget();
                    $.each(settings.container.block, function (i) {
                        self.WidgetLoader(true, settings.container.block[i].widget);
                    });
                }
            }
        }
        else {
            self.Exception('Ошибка. Не найден контейнер [' + data.cssBlock + ']');
            $.each(settings.container.block, function (i) {
                self.WidgetLoader(true, settings.container.block[i].widget);
            });
        }
        delete data;
    }

    function RenderNoResultsBlock(data) {
        self.RenderTemplate(data, settings,
            function () {
                $("#" + settings.container.block.empty.widget).children().show();
                $.each(settings.container.block, function (i) {
                    self.WidgetLoader(true, settings.container.block[i].widget);
                });
            },
            function (data) {
                InsertContainerBlock(data.typeView);
                RenderBlock(data);
            },
            function () {
                $.each(settings.container.block, function (i) {
                    self.WidgetLoader(true, settings.container.block[i].widget);
                });
            }, 'empty', null, 'block'
        );
    }

    function RenderNoResults(data) {
        self.RenderTemplate(data, settings, null,
            function (data) {
                InsertContainerList(data.typeView);
                RenderNoResults(data);
            },
            function () {
                InsertContainerEmptyBlockWidget();
            }, 'empty', null, 'content'
        );
    }

}

var EmptyViewBlock = function (data) {
    var self = this;
    self.titleBlock = data.titleBlock;
    self.typeView = data.typeView;
};

/* Block */
var BlockViewModel = function (data, settings) {
    var self = this;
    self.countGoodsInContent = settings.countGoodsInBlock;
    self.id = data.block.id;
    self.sort = data.sort;
    self.titleBlock = data.block.name_category;
    self.typeView = data.block.type_view;
    self.countGoods = data.block.count_goods ? data.block.count_goods : 0;
    self.showCart = settings.showCart;

    self.cssBlock = 'block_sort_' + data.sort;
    self.cssBlockContainer = 'sliderContainer_' + self.id;
    self.imageHref = '#';

    self.contentBlock = ko.observableArray();

    self.AddContent = function () {
        var query = '0/' + self.countGoodsInContent + '/name/';
        var queryHash = self.id + EventDispatcher.HashCode(query);
        var content = Parameters.cache.content[queryHash].content;
        if (content && content.length > 1) {
            var last = content.shift()
            self.countGoods = last.count_goods;

            if (content.length < self.countGoodsInContent)
                self.countGoodsInContent = content.length;

            var f = 0;
            for (var i = 0; i <= self.countGoodsInContent - 1; i++) {
                if (self.typeView == 'tile') {
                    var str = new BlockTrForTableViewModel();
                    for (var j = 0; j <= 2; j++) {
                        if (content[f]) {
                            str.AddStr(new ContentViewModel(content[f], f));
                            f++;
                        }
                        else
                            break;
                    }
                    if (str.str().length > 0)
                        self.contentBlock.push(str);
                    delete str;
                }
                else {
                    self.contentBlock.push(new ContentViewModel(content[i], i));
                }
            }
            content.unshift(last);
            EventDispatcher.DispatchEvent('contentWidget.fill.block', self);
        }
        else
            EventDispatcher.DispatchEvent('contentWidget.fill.block', self);
    };
    self.ClickCategory = function () {
        Routing.SetHash('catalog', self.titleBlock, {category: data.block.id});
    };
}

/* Content List*/
var ListContentViewModel = function (settings) {
    var self = this;
    self.id = 0;
    self.titleBlock = '';
    self.typeView = 'tile';
    self.countGoods = 0;
    self.message = '';
    self.showCart = settings.showCart;

    self.content = ko.observableArray();
    self.paging = ko.observableArray();
    self.GetSort = function () {
        var s = new SortContentListViewModel();
        s.AddContent(settings.sortList);
        s.SetDefault(Routing.GetMoreParameter('orderBy') ? Routing.GetMoreParameter('orderBy') : settings.orderBy);
        return s;
    };
    self.filters = {
        typeView: self.typeView,
        filterName: ko.observable(Routing.GetMoreParameter('filterName') ? Routing.GetMoreParameter('filterName') : settings.filterName),
        itemsPerPage: settings.paging.itemsPerPage,
        listPerPage: ko.observableArray(),
        countOptionList: ko.observable(settings.listPerPage.length - 1),
        sort: self.GetSort(),
        FilterNameGoods: function (data) {
            settings.filterName = self.filters.filterName($(data.text).val());

            Loader.Indicator('ContentWidget', false);

            Routing.UpdateMoreParameters({filterName: self.filters.filterName()});
            Routing.UpdateHash({page: 1});
        },
        ClickFilterNameGoods: function () {
            settings.filterName = self.filters.filterName();

            Loader.Indicator('ContentWidget', false);

            Routing.UpdateMoreParameters({filterName: self.filters.filterName()});
            Routing.UpdateHash({page: 1});
        },
        ViewSelectCount: function () {
            self.filters.listPerPage = ko.observableArray();
            for (var key in settings.listPerPage) {
                if (settings.listPerPage[key] < self.countGoods)
                    self.filters.listPerPage.push(settings.listPerPage[key])
                else {
                    self.filters.listPerPage.push(settings.listPerPage[key]);
                    break;
                }
            }
            if (self.filters.listPerPage().length == 1)
                self.filters.listPerPage = ko.observableArray();
        },
        SelectCount: function (count) {
            Loader.Indicator('ContentWidget', false);
            self.filters.itemsPerPage = settings.paging.itemsPerPage = count;

            Routing.UpdateHash({page: 1});
        },
        selectTypeView: {
            ClickTile: function () {
                self.typeView = 'tile';
                self.filters.typeView = 'tile';
                Parameters.cache.typeView = 'tile';
                self.AddContent(Parameters.cache.content[self.GetQueryHash()].content);
                EventDispatcher.DispatchEvent('contentWidget.fill.listContent', self);
            },
            ClickTable: function () {
                self.typeView = 'table';
                self.filters.typeView = 'table';
                Parameters.cache.typeView = 'table';
                self.AddContent(Parameters.cache.content[self.GetQueryHash()].content);
                EventDispatcher.DispatchEvent('contentWidget.fill.listContent', self);
            },
            ClickList: function () {
                self.typeView = 'list';
                self.filters.typeView = 'list';
                Parameters.cache.typeView = 'list';
                self.AddContent(Parameters.cache.content[self.GetQueryHash()].content);
                EventDispatcher.DispatchEvent('contentWidget.fill.listContent', self);
            }
        }
    };
    self.SetType = function (type) {
        self.typeView = type;
    };
    self.SetMessage = function (message) {
        self.message = message;
    };
    self.AddCategoryInfo = function (categoryId) {
        var data = Parameters.cache.infoCategory[categoryId];
        self.id = data.id;
        self.titleBlock = data.name_category;
        if (Parameters.cache.typeView) {
            self.typeView = Parameters.cache.typeView;
            self.filters.typeView = Parameters.cache.typeView;
        }
        else if (data.type_view) {
            var typeView = data.type_view;
            if (data.type_view == 'carousel' || data.type_view == 'slider')
                var typeView = 'tile';
            self.typeView = typeView;
            self.filters.typeView = typeView;
        }
    };
    self.AddContent = function (data) {
        self.content = ko.observableArray();
        if (data && data.length > 1) {
            var last = data.shift();
            self.countGoods = last.count_goods;
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

            self.filters.ViewSelectCount();
            EventDispatcher.DispatchEvent('contentWidget.fill.listContent', self);
        }
    };
    self.GetQueryHash = function () {
        var start = (Routing.GetCurrentPage() - 1) * settings.paging.itemsPerPage;
        var orderBy = Routing.GetMoreParameter('orderBy') ? Routing.GetMoreParameter('orderBy') : settings.orderBy;
        var query = start + '/' + settings.paging.itemsPerPage + '/' + orderBy + '/' + encodeURIComponent(Routing.GetMoreParameter('filterName'));
        return Routing.GetActiveCategory() + EventDispatcher.HashCode(query);
    };
    self.AddPages = function () {
        var ClickLinkPage = function () {
            Loader.Indicator('ContentWidget', false);

            Routing.UpdateHash({page: this.pageId});
        }

        self.paging = Paging.GetPaging(self.countGoods, settings, ClickLinkPage);
    }
}

var SortContentItemViewModel = function (data, active) {
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

        Loader.Indicator('ContentWidget', false);

        Routing.UpdateMoreParameters({orderBy: self.name});
        Routing.UpdateHash({page: 1});
    };
};

var SortContentListViewModel = function () {
    var self = this;
    self.activeItem = ko.observable();
    self.list = ko.observableArray();
    self.cssSortList = 'sort_list';

    self.AddContent = function (data) {
        $.each(data, function (i) {
            self.list.push(new SortContentItemViewModel(data[i], self));
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

/* End Content*/
var TestContent = {
    Init: function () {
        if (typeof Widget == 'function') {
            ContentWidget.prototype = new Widget();
            var content = new ContentWidget();
            content.Init(content);
        }
        else {
            setTimeout(function () {
                TestContent.Init()
            }, 100);
        }
    }
}

TestContent.Init();
