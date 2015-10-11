var MenuPersonalCabinetWidget = function () {
    var self = this;
    self.widgetName = 'MenuPersonalCabinetWidget';
    self.version = 1.1;
    self.minWidgetVersion = 1.0;
    self.maxWidgetVersion = 2.0;
    self.minTmplVersion = 1.0;
    self.maxTmplVersion = 2.0;
    self.active = null;
    self.subMenu = [];
    self.InitWidget = InitWidget;
    self.AddMenu = AddMenu;
    self.CheckRouteMenuProfile = CheckRouteMenuProfile;

    var settings = {
        container: {widget: 'menuPersonalCabinetWidgetId', def: 'defaultMenuPersonalCabinetWidgetId'},
        showCart: true,
        showRegSeller: true,
        tmpl : {
            path : "menuPersonalCabinetTmpl.html", // файл шаблонов
            id : 'menuPersonalCabinetTmpl' // id шаблона меню личного кабинета
        },
        animate: typeof AnimateMenuPersonalCabinet == 'function' ? AnimateMenuPersonalCabinet : null
    };
    function InitWidget() {
        RegisterEvents();
        SetInputParameters();
    }
    function SetInputParameters() {
        var input = self.GetInputParameters('menuPersonalCabinet');

        if(!$.isEmptyObject(input))
            settings = self.UpdateSettings1(settings, input);

        Config.Containers.menuPersonalCabinet = settings.container;
    }
    function AddMenu(opt) {
        if (opt) {
            self.active = opt.active;
            self.subMenu = opt.menu;
        }
    }
    function CheckRouteMenuProfile() {
        var route = Routing.route;
        if (route == 'profile'
            || route == 'favorites'
            || route == 'cabinet_cart'
            || route == 'purchases'
            || route == 'messages') {
            self.BaseLoad.Tmpl(settings.tmpl, function () {
                InsertContainerContent();
                Fill();
            });
        }
        else {
            $("#" + settings.container.widget).empty()
            self.WidgetLoader(true);
        }
    }
    function RegisterEvents() {
        self.AddEvent('w.change.route', function () {
            var route = Routing.route;
            if (route != 'profile'
                && route != 'favorites'
                && route != 'cabinet_cart'
                && route != 'purchases'
                && route != 'messages') {
                $("#" + settings.container.widget).empty();
                self.WidgetLoader(true);
            }
            if (route == 'cabinet_cart' && !settings.showCart) {
                $("#" + settings.container.widget).empty();
                self.WidgetLoader(true);
            }
        })
    }

    function InsertContainerEmptyWidget() {
        self.ClearContainer(settings)
    }

    function InsertContainerContent() {
        self.InsertContainer(settings);
    }

    function Fill() {
        self.BaseLoad.MessageCountUnread(function (data) {
            Parameters.cache.message.countNewMessage(parseInt(data.count_unread_topic));
            var menu = new MenuPersonalCabinetViewModel(self);
            menu.AddSubMenu(self.subMenu, self.active);
            Render(menu);
        });
    }
    function Render(data) {
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
};

var MenuPersonalCabinetViewModel = function (menu) {
    var self = this,
        user = Parameters.cache.userInformation,
        route = Routing.route;
    self.subMenu = ko.observableArray();
    self.avatar = user ? user.route_icon_user : '';
    self.username = user ? user.login : '';
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
        if (route == 'profile')
            return 'active';
        return '';
    }, this);
    self.ClickProfile = function () {
        SetHash('profile', 'Личный кабинет', {});
    };
    self.activePurchases = ko.computed(function () {
        if (route == 'purchases')
            return 'active';
        return '';
    }, this);
    self.ClickPurchases = function () {
        SetHash('purchases', 'Мои покупки', {block: 'list'});
    };
    self.activeAuction = ko.computed(function () {
        if (route == 'auction')
            return 'active';
        return '';
    }, this);
    self.ClickAuction = function () {

    };
    self.activeFavorites = ko.computed(function () {
        if (route == 'favorites')
            return 'active';
        return '';
    }, this);
    self.ClickFavorites = function () {
        SetHash('favorites', 'Избранное', {});
    };
    self.showCart = menu.settings.showCart;
    self.activeCart = ko.computed(function () {
        if (route == 'cabinet_cart')
            return 'active';
        return '';
    }, this);
    self.ClickCart = function () {
        SetHash('cabinet_cart', 'Корзина', {});
    };
    self.activeMessages = ko.computed(function () {
        if (route == 'messages')
            return 'active';
        return '';
    }, this);
    self.ClickMessages = function () {
        SetHash('messages', 'Сообщения', {});
    };
    self.ClickBecomeSeller = function () {
        window.location.href = 'https://' + window.location.hostname + '/seller/register';
    };
    self.showRegSeller = menu.settings.showRegSeller;
    self.ClickRegistrationSeller = function () {
        SetHash('registration_seller', 'Стать продавцом', {});
    };

    function SetHash(alias, title, params){
        Routing.SetHash(alias, title, params)
    }
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
