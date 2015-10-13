var BreadCrumbWidget = function () {
    var self = this;
    self.widgetName = 'BreadCrumbWidget';
    self.version = 1.0;
    self.minWidgetVersion = 1.0;
    self.maxWidgetVersion = 2.0;
    self.minTmplVersion = 1.0;
    self.maxTmplVersion = 2.0;
    self.InitWidget = InitWidget;

    var settings = {
        container: {widget: ['breadCrumbsWidgetId_1'], def: ['defaultBreadCrumbsWidgetId_1']},
        tmpl: {
            path : "breadCrumbTmpl.html", // путь к шаблонам
            id : "breadCrumbTmpl" // id шаблона виджета хлебных крошек по умолчанию
        },
        animate: typeof AnimateBreadCrumb == 'function' ? AnimateBreadCrumb : null
    };

    function InitWidget() {
        RegisterEvents();
        SetInputParameters();
        CheckRouteBreadCrumb(Routing.GetActiveCategory());
    }

    function SetInputParameters() {
        var input = self.GetInputParameters('breadCrumb');

        if(!$.isEmptyObject(input)){
            settings = self.UpdateSettings1(settings, input);
        }

        Config.Containers.breadCrumb = settings.container;
    }

    function InsertContainerEmptyWidget(i) {
        $("#" + settings.container.widget[i]).empty().html('');
    }

    function InsertContainerMain() {
        var container = settings.container.widget;
        for (var i = 0; i <= container.length - 1; i++) {
            if ($("#" + container[i]).length > 0) {
                InsertContainerEmptyWidget(i);
                $("#" + container[i]).append($('script#' + self.GetTmplName1(settings)).html()).children().hide();
            }
        }
    }

    function CheckRouteBreadCrumb(id) {
        if (Routing.IsDefault() && self.HasDefaultContent()) {
            self.WidgetLoader(true);
        }
        else {
            self.WidgetLoader(false);
            self.BaseLoad.Tmpl(settings.tmpl, function () {
                if (id)
                    self.BaseLoad.Path(id, function (data) {
                        Fill(data);
                    });
                else
                    self.WidgetLoader(true);
            });
        }
    }

    function RegisterEvents() {
        self.AddEvent('w.change.route', function (data) {
            CheckRouteBreadCrumb(Routing.GetActiveCategory());
        });

        self.AddEvent('w.change.breadCrumb', function (id) {
            CheckRouteBreadCrumb(id);
        })

        self.AddEvent('breadCrumb.fill.item', function (data) {
            Render(data);
        });

        self.AddEvent('breadCrumb.click.item', function (item) {
            self.BaseLoad.Path(item.id, function (data) {
                Routing.SetHash('catalog', data[data.length - 1].name_category, Routing.GetPath(data));
            });
        });
    }

    function Fill(data) {
        var breadCrumb = new BreadCrumbViewModel();
        breadCrumb.AddCrumbs(data);
    }

    function Render(data) {
        InsertContainerMain();
        var container = settings.container.widget;
        for (var i = 0; i <= container.length - 1; i++) {
            if ($("#" + container[i]).length > 0) {
                try {
                    ko.cleanNode($('#' + container[i])[0]);
                    ko.applyBindings(data, $('#' + container[i])[0]);
                    self.ShowContainer(container[i]);
                    self.WidgetLoader(true);
                    if (settings.animate)
                        settings.animate();
                }
                catch (e) {
                    self.Exception('Ошибка шаблона [' + self.GetTmplName1(settings) + ']', e);
                    if (settings.tmpl.custom) {
                        delete settings.tmpl.custom;
                        self.BaseLoad.Tmpl(settings.tmpl, function () {
                            Render(data);
                        });
                    }
                    else {
                        InsertContainerEmptyWidget(i);
                        self.WidgetLoader(true);
                    }
                }
            }
            else {
                self.Exception('Ошибка. Не найден контейнер [' + container[i] + ']');
                self.WidgetLoader(true);
            }
            delete data;
        }
    }
}

var BreadCrumbItem = function (data) {
    var self = this;
    self.id = data.id;
    self.title = data.name_category;
    self.typeCategory = data.type_category;
    self.selectList = ko.observableArray();
    self.showSelectList = ko.computed(function () {
        if (self.selectList() > 0)
            return true;
        else false;
    }, this);
    self.ClickItem = function () {
        if (!self.showSelectList())
            EventDispatcher.DispatchEvent('breadCrumb.click.item', {id: self.id});
    };
    self.AddSelectList = function (children) {
        for (var i = 0; i <= children.length - 1; i++) {
            self.selectList.push(new SelectListBreadCrumbItem(children[i]));
        }
    }
}

var BreadCrumbViewModel = function () {
    var self = this;
    self.lastItem = ko.observable();
    self.title = "";
    self.crumbs = ko.observableArray();

    self.ToHomepage = function () {
        Routing.SetHash('default', 'Домашняя', {});
    };
    self.showReturn = ko.computed(function () {
        if (Parameters.cache.history.length > 1)
            return true
        return false;
    }, this);
    self.Return = function () {
        Parameters.cache.history.pop();
        var link = Parameters.cache.history.pop();
        if (link.route == 'order' && link.data.create)
            link = Parameters.cache.history.pop();
        Routing.SetHash(link.route, link.title, link.data, true);
    };
    self.AddCrumbs = function (data) {
        if (data) {
            for (var i = 0; i <= data.length - 1; i++) {
                var breadCrumb = new BreadCrumbItem(data[i]);

                if (data[i].children) {
                    breadCrumb.AddSelectList(data[i].children);
                }

                self.crumbs.push(breadCrumb);
            }
            if (Routing.route == 'default') {
                self.crumbs = ko.observableArray();
                self.lastItem(Routing.defaultTitle);
            }
            if (Routing.route == 'goods')
                self.lastItem('Карточка товара');
            if (Routing.route == 'cart') {
                self.crumbs = ko.observableArray();
                self.lastItem('Моя корзина');
            }
            if (Routing.route == 'payment') {
                self.crumbs = ko.observableArray();
                self.lastItem('Оплата заказа');
            }
            if (Routing.route == 'registration') {
                self.crumbs = ko.observableArray();

                self.crumbs.push(new BreadCrumbItem({id: 0, name_category: 'Регистрация покупателя'}));

                if (Routing.params.step == 1)
                    self.lastItem('Шаг 1');
                if (Routing.params.step == 2)
                    self.lastItem('Шаг 2');
                if (Routing.params.step == 3)
                    self.lastItem('Шаг 3');
                if (Routing.params.step == 4)
                    self.lastItem('Шаг 4');
            }
            if (Routing.route == 'order') {
                self.crumbs = ko.observableArray();

                self.crumbs.push(new BreadCrumbItem({id: 0, name_category: 'Оформление заказа'}));

                if (Routing.params.step == 1)
                    self.lastItem('Шаг 1');
                if (Routing.params.step == 2)
                    self.lastItem('Шаг 2');
                if (Routing.params.step == 3)
                    self.lastItem('Шаг 3');
                if (Routing.params.step == 4)
                    self.lastItem('Шаг 4');
                if (Routing.params.step == 5)
                    self.lastItem('Шаг 5');
            }
            if (Routing.route == 'profile' || Routing.route == 'favorites' || Routing.route == 'purchases' || Routing.route == 'cabinet_cart') {
                self.crumbs = ko.observableArray();

                self.lastItem('Личный кабинет');
            }

            if (!self.lastItem()) {
                var last = self.crumbs().pop();
                self.lastItem(last.title);
            }

            EventDispatcher.DispatchEvent('breadCrumb.fill.item', self);
        }
    };
}

var SelectListBreadCrumbItem = function (data) {
    var self = this;
    self.id = data.id;
    self.title = data.name_category;
    self.cssActiveItem = ko.computed(function () {
        if (Routing.route == 'catalog' && self.id == Routing.GetActiveCategory())
            return 'active';
        return '';
    }, this);

    self.ClickItem = function () {
        EventDispatcher.DispatchEvent('breadCrumb.click.item', {id: self.id});
    }
}

var TestBreadCrumb = {
    Init: function () {
        if (typeof Widget == 'function') {
            BreadCrumbWidget.prototype = new Widget();
            var breadCrumb = new BreadCrumbWidget();
            breadCrumb.Init(breadCrumb);
        }
        else {
            setTimeout(function () {
                TestBreadCrumb.Init()
            }, 100);
        }
    }
}

TestBreadCrumb.Init();

