var CatalogWidget = function () {
    var self = this;
    self.widgetName = 'CatalogWidget';
    self.version = 1.0;
    self.minWidgetVersion = 1.0;
    self.maxWidgetVersion = 2.0;
    self.minTmplVersion = 1.0;
    self.maxTmplVersion = 2.0;
    self.InitWidget = InitWidget;

    var settings = {
        container: {widget: 'catalogWidgetId', def: 'defaultCatalogWidgetId'},
        tmpl : {
            path : "catalogTmpl.html", // путь к шаблонам
            id : "catalogTmpl" // id шаблона виджета каталога по умолчанию
        },
        animate: typeof AnimateCatalog == 'function' ? AnimateCatalog : null,
    };
    function InitWidget() {
        RegisterEvents();
        SetInputParameters();
        self.CheckRouteCatalog();
    }

    function SetInputParameters() {
        var input = self.GetInputParameters('catalog');

        if(!$.isEmptyObject(input))
            settings = self.UpdateSettings1(settings, input);

        Config.Containers.catalog = settings.container;
    }

    self.CheckRouteCatalog = function() {
        if (Routing.route == 'catalog' || Routing.route == 'goods' || (Routing.IsDefault() && !self.HasDefaultContent())) {
            self.BaseLoad.Tmpl(settings.tmpl, function () {
                self.BaseLoad.Roots(function () {
                    Update();
                })
            });
        }
        else
            self.WidgetLoader(true);
    }

    function RegisterEvents() {
        self.AddEvent('catalogWidget.fill.section', function (data) {
            Render(data);
        });

        self.AddEvent('w.change.route', function () {
            self.CheckRouteCatalog();
        });
    }

    function InsertContainerEmptyWidget() {
        self.ClearContainer(settings)
    }

    function InsertContainerMain() {
        self.InsertContainer(settings);
    }

    function Update() {
        if (!Parameters.cache.catalogs[Routing.GetActiveCategory()]) {
            InsertContainerMain();
            self.BaseLoad.Section(Routing.GetActiveCategory(), function (data) {

                self.BaseLoad.Path(Routing.GetActiveCategory(), function (path) {
                    if (path[path.length - 1]) {
                        var parent = []
                        parent[0] = {
                            id: path[path.length - 1].id,
                            name_category: path[path.length - 1].name_category,
                            type_category: 'section',
                            back: 'return',
                            children: Parameters.cache.childrenCategory[Routing.GetActiveCategory()]
                        }
                        Fill(parent);
                    }
                    else {
                        Fill(data);
                    }
                });
            })
        }
        else if (Parameters.cache.catalogs[Routing.GetActiveCategory()]) {
            InsertContainerMain();
            self.BaseLoad.Roots(function (data) {
                Fill(data);
            });
        }
        else {
            self.WidgetLoader(true);
        }
    }

    function Fill(data) {
        var catalog = new CatalogViewModel();
        for (var i = 0; i <= data.length - 1; i++) {
            catalog.AddItem(data[i]);
        }
        self.DispatchEvent('catalogWidget.fill.section', catalog);
    }

    function Render(data) {
        self.RenderTemplate(data, settings, null,
            function(data){
                InsertContainerMain();
                Render(data);
            },
            function(){
                InsertContainerEmptyWidget();
            }
        );
    }
}

var CatalogViewModel = function () {
    var self = this;
    self.tab = ko.observableArray();
    self.AddItem = function (data) {
        var section = new SectionViewModel(data, self.tab());
        if (data.children) {
            for (var i = 0; i <= data.children.length - 1; i++) {
                var item1 = new ItemViewModel(data.children[i], data.id);
                if (data.children[i].children) {
                    for (var j = 0; j <= data.children[i].children.length - 1; j++) {
                        var item2 = new ItemViewModel(data.children[i].children[j], data.children[i].id);
                        item1.children.push(item2);
                    }
                }
                section.children.push(item1);
            }
        }
        self.tab.push(section);
    }
}

var SectionViewModel = function (data, parent) {
    var self = this;
    self.id = data.id;
    self.title = ko.computed(function () {
        if (data.back)
            return 'Вверх';
        return data.name_category;
    }, this);
    self.type_category = data.type_category;
    self.listClass = 'catalogCategories_' + data.id;
    self.tabClass = ko.computed(function () {
        var css = 'listCategories_' + data.id;
        if (parent.length == 1)
            css = css + ' single';
        if (Routing.GetActiveCategory() == data.id) {
            if (data.back)
                return css + ' return active'
            else
                return css + ' active'
        }
        else
            return css;
    }, this);
    self.countGoods = data.count_goods;
    self.children = ko.observableArray();
    self.titleWithCount = ko.computed(function () {
        if (data.back)
            return 'Вверх';
        else {
            var text = data.name_category;
            if (data.count_goods && data.count_goods > 0)
                text = text + ' <span>' + data.count_goods + '</span>';
            return text;
        }
    }, this);
    self.isActive = ko.computed(function () {
        if (Routing.GetActiveCategory() == self.id)
            return true;
        return false;
    }, this);
    self.ClickTab = function () {
        if (Parameters.cache.catalogs[self.id]) {
            var tabTag = $('.listCategories_' + self.id)[0].tagName;
            $(tabTag + '[class^=listCategories]').removeClass('active');
            $('.listCategories_' + self.id).addClass('active');
            var listTag = $('.catalogCategories_' + data.id)[0].tagName;
            $(listTag + '[class*=catalogCategories]').hide();
            $('.catalogCategories_' + data.id).show();

            params = {section: data.id};
            Routing.SetHash('catalog', data.name_category, params);
        }
        else {
            var path = Parameters.cache.path[self.id].path;
            params = {section: path[path.length - 2].id};
            Routing.SetHash('catalog', path[path.length - 2].name_category, params);
        }

    }
}

var ItemViewModel = function (data, parent) {
    var self = this;
    self.id = data.id;
    self.title = data.name_category;
    self.countGoods = data.count_goods;
    self.children = ko.observableArray();

    self.titleWithCount = ko.computed(function () {
        var text = data.name_category;
        if (data.count_goods && data.count_goods > 0)
            text = text + ' <span>' + data.count_goods + '</span>';
        return text;
    }, this);
    self.hasChildren = ko.computed(function () {
        if (self.children().length > 0)
            return true;
        return false;
    }, this);
    self.liClass = ko.computed(function () {
        if (self.hasChildren())
            return 'menuparent';
        return '';
    }, this);
    self.ClickItem = function () {
        var params;
        if (data.type_category == 'category')
            params = {section: parent, category: data.id};
        else
            params = {section: data.id};

        Routing.SetHash('catalog', self.title, params);
    }
}

var TestCatalog = {
    Init: function () {
        if (typeof Widget == 'function') {
            CatalogWidget.prototype = new Widget();
            var catalog = new CatalogWidget();
            catalog.Init(catalog);
        }
        else {
            setTimeout(function () {
                TestCatalog.Init()
            }, 100);
        }
    }
}

TestCatalog.Init();


