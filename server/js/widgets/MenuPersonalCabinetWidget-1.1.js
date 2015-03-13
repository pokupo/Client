var MenuPersonalCabinetWidget = function () {
    var self = this;
    self.widgetName = 'MenuPersonalCabinetWidget';
    self.version = 1.1;
    self.minWidgetVersion = 1.0;
    self.maxWidgetVersion = 2.0;
    self.minTmplVersion = 1.0;
    self.maxTmplVersion = 2.0;
    self.settings = {
        containerMenuId: null,
        tmpl: {
            path: null,
            id: null
        },
        animate: null,
        style: null,
        customContainer: null
    };
    self.active = null;
    self.subMenu = [];
    self.InitWidget = function () {
        self.settings.tmpl = Config.MenuPersonalCabinet.tmpl;
        self.settings.containerMenuId = Config.Containers.menuPersonalCabinet.widget;
        self.settings.customContainer = Config.Containers.menuPersonalCabinet.customClass;
        self.settings.style = Config.MenuPersonalCabinet.style;
        self.RegisterEvents();
        self.SetPosition();
    };
    self.SetInputParameters = function () {
        var input = {};
        if (Config.Base.sourceParameters == 'object' && typeof WParameters !== 'undefined' && WParameters.menuPersonalCabinet) {
            input = WParameters.menuPersonalCabinet;
        }
        if (input.tmpl) {
            if (input.tmpl.path)
                self.settings.tmpl.path = input.tmpl.path;
            if (input.tmpl.id) {
                for (var key in input.tmpl.id) {
                    self.settings.tmpl.id[key] = input.tmpl.id[key];
                }
            }
            if(input.animate)
                self.settings.animate = input.animate;
        }
    };
    self.AddMenu = function (opt) {
        if (opt) {
            self.active = opt.active;
            self.subMenu = opt.menu;
        }
    };
    self.CheckRouteMenuProfile = function () {
        if (Routing.route == 'profile'
                || Routing.route == 'favorites'
                || Routing.route == 'cabinet_cart'
                || Routing.route == 'purchases'
                || Routing.route == 'messages') {
            self.BaseLoad.Tmpl(self.settings.tmpl, function () {
                self.InsertContainer.Content();
                self.Fill();
            });
        }
        else {
            $("#" + self.settings.containerMenuId).empty()
            self.WidgetLoader(true);
        }
    };
    self.RegisterEvents = function () {
        EventDispatcher.AddEventListener('widget.change.route', function () {
            if (Routing.route != 'profile'
                    && Routing.route != 'favorites'
                    && Routing.route != 'cabinet_cart'
                    && Routing.route != 'purchases'
                    && Routing.route != 'messages') {
                $("#" + self.settings.containerMenuId).empty();
                self.WidgetLoader(true);
            }
        })
    };
    self.InsertContainer = {
        EmptyWidget: function () {
            var temp = $("#" + self.settings.containerMenuId).find(self.SelectCustomContent().join(', ')).clone();
            $("#" + self.settings.containerMenuId).empty().html(temp);
        },
        Content: function () {
            self.InsertContainer.EmptyWidget();
            $("#" + self.settings.containerMenuId).html($('script#' + self.GetTmplName()).html()).children().hide();
        }
    };
    self.Fill = function () {
        self.BaseLoad.MessageCountUnread(function (data) {
            Parameters.cache.message.countNewMessage(parseInt(data.count_unread_topic));
            var menu = new MenuPersonalCabinetViewModel(self);
            menu.AddSubMenu(self.subMenu, self.active);
            self.Render(menu);
        });
    };
    self.Render = function (menu) {
        if ($("#" + self.settings.containerMenuId).length > 0) {
            try {
                self.WidgetLoader(true, self.settings.containerMenuId);
                ko.cleanNode($("#" + self.settings.containerMenuId)[0]);
                ko.applyBindings(menu, $("#" + self.settings.containerMenuId)[0]);
                if(typeof AnimateMenuPersonalCabinet == 'function')
                    new AnimateMenuPersonalCabinet();
                if(self.settings.animate)
                    self.settings.animate();
            }
            catch (e) {
                self.Exception('Ошибка шаблона [' + self.GetTmplName() + ']');
                console.log(e);
                if (self.settings.tmpl.custom) {
                    delete self.settings.tmpl.custom;
                    self.BaseLoad.Tmpl(self.settings.tmpl, function () {
                        self.InsertContainer.Content();
                        self.Render(menu);
                    });
                }
                else {
                    self.InsertContainer.EmptyWidget();
                    self.WidgetLoader(true, self.settings.containerMenuId);
                }
            }
        }
        else{
            self.Exception('Ошибка. Не найден контейнер [' + self.settings.containerMenuId + ']');
            self.WidgetLoader(true, self.settings.containerMenuId);
        }
    };
    self.SetPosition = function () {
        if (self.settings.style.position == 'absolute') {
            $().ready(function () {
                for (var i = 0; i <= self.settings.containerFormId.length - 1; i++) {
                    $("#" + self.settings.containerFormId[i]).css(self.settings.style);
                }
            });
        }
    };
};

var MenuPersonalCabinetViewModel = function (menu) {
    var self = this;
    self.subMenu = ko.observableArray();
    var user = Parameters.cache.userInformation;
    self.avatar = user.route_icon_user;
    self.username = user.login;
    self.countNewMessage = ko.computed(function () {
        return Parameters.cache.message.countNewMessage();
    }, this);

    self.AddSubMenu = function (subMenu, active) {
        self.subMenu = ko.observableArray();
        for (var key in subMenu) {
            self.subMenu.push(new SubMenuViewModel(subMenu[key], active));
        }
    };
    self.activeProfile = ko.computed(function () {
        if (Routing.route == 'profile')
            return 'active';
        return '';
    }, this);
    self.ClickProfile = function () {
        Routing.SetHash('profile', 'Личный кабинет', {});
    };
    self.activePurchases = ko.computed(function () {
        if (Routing.route == 'purchases')
            return 'active';
        return '';
    }, this);
    self.ClickPurchases = function () {
        Routing.SetHash('purchases', 'Мои покупки', {block: 'list'});
    };
    self.activeAuction = ko.computed(function () {
        if (Routing.route == 'auction')
            return 'active';
        return '';
    }, this);
    self.ClickAuction = function () {

    };
    self.activeFavorites = ko.computed(function () {
        if (Routing.route == 'favorites')
            return 'active';
        return '';
    }, this);
    self.ClickFavorites = function () {
        Routing.SetHash('favorites', 'Избранное', {});
    };
    self.activeCart = ko.computed(function () {
        if (Routing.route == 'cabinet_cart')
            return 'active';
        return '';
    }, this);
    self.ClickCart = function () {
        Routing.SetHash('cabinet_cart', 'Корзина', {});
    };
    self.activeMessages = ko.computed(function () {
        if (Routing.route == 'messages')
            return 'active';
        return '';
    }, this);
    self.ClickMessages = function () {
        Routing.SetHash('messages', 'Сообщения', {});
    };
    self.ClickBecomeSeller = function () {
        window.location.href = 'https://' + window.location.hostname + '/seller/register';
    };
};

var SubMenuViewModel = function (subMenu, active) {
    var self = this;
    self.title = subMenu.title;
    self.isActive = ko.computed(function () {
        if (active == subMenu.prefix)
            return true;
        return false;
    });
    self.activeSubMenu = ko.computed(function () {
        if (active == subMenu.prefix)
            return 'active';
        return '';
    }, this);
    self.ClickSubMenu = function () {
        Routing.SetHash(Routing.route, self.title, {info: subMenu.prefix});
    };
}
