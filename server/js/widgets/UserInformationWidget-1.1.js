var UserInformationWidget = function () {
    var self = this;
    self.widgetName = 'UserInformationWidget';
    self.version = 1.0;
    self.minWidgetVersion = 1.0;
    self.maxWidgetVersion = 2.0;
    self.minTmplVersion = 1.0;
    self.maxTmplVersion = 2.0;
    self.InitWidget = InitWidget;

    var settings = {
        container: {widget: 'userInformationWidgetId', def: 'defaultUserInformationWidgetId'},
        tmpl : {
            path : "userInformationTmpl.html", // файл шаблонов
            id : {
                info : "userInformationTmpl", //id шаблона вывода информации о пользователе
                auth : "authorizationLinkTmpl" //id шаблона с сылками войти/регистрация
            }
        },
        message: {
            confirmLogOut : 'Вы действительно хотите выйти?'
        },
        showBlocks : ['login'],
        animate: typeof AnimateUserInformation == 'function' ? AnimateUserInformation : null
    };
    function InitWidget() {
        RegisterEvents();
        SetInputParameters();
        LoadTmpl();
    };
    function SetInputParameters() {
        var input = self.GetInputParameters('userInformation');

        if (!$.isEmptyObject(input)) {
            settings = self.UpdateSettings1(settings, input);
            if (input.show) {
                for (var i = 0; i <= input.show.length - 1; i++) {
                    if ($.inArray(input.show[i], settings.showBlocks) < 0)
                        settings.showBlocks.push(input.show[i]);
                }
            }
        }
        Config.Containers.userInformation = settings.container;
    }
    function LoadTmpl() {
        self.BaseLoad.Tmpl(settings.tmpl, function () {
            self.DispatchEvent('UInfo.tmpl')
        });
    };
    function RegisterEvents() {
        self.AddEvent('UInfo.tmpl', function () {
            self.BaseLoad.Login(false, false, false, function (data) {
                CheckAuthorization(data);
            });
        });

        self.AddEvent('w.auth.ok', function (data) {
            CheckAuthorization(data.request);
        });

        self.AddEvent('UInfo.logout', function () {
            self.BaseLoad.Logout(function (data) {
                if (data.result == 'ok' || data.result == 'fail') {
                    self.BaseLoad.LogoutForProxy();
                    Routing.SetHash('default', 'Домашняя', {});
                }
            });
        });

        self.AddEvent('w.change.route', function (data) {
            self.BaseLoad.Tmpl(settings.tmpl, function () {
                self.DispatchEvent('UInfo.tmpl');
            });
        });
    }
    function CheckAuthorization(data) {
        if (Routing.IsDefault() && self.HasDefaultContent()) {
            self.WidgetLoader(true);
        }
        else {
            if (!data.err) {
                InsertContainerInfoBlock();
                FillInfoBlock(data);
            }
            else {
                InsertContainerAuthBlock();
                FillAuthBlock();
            }
        }
    }
    function InsertContainerEmptyWidget() {
        self.ClearContainer(settings)
    }

    function InsertContainerAuthBlock() {
        self.InsertContainer(settings, 'auth')
    }

    function InsertContainerInfoBlock() {
        self.InsertContainer(settings, 'info')
    }

    function FillAuthBlock() {
        var block = new UserAuthorizationBlockViewModel();
        RenderAuthBlock(block);
    }

    function FillInfoBlock(data) {
        self.BaseLoad.MessageCountUnread(function (messages) {
            Parameters.cache.message.countNewMessage(parseInt(messages.count_unread_topic));
            UserInformationBlockViewModel.prototype = new Widget();
            var block = new UserInformationBlockViewModel(data, settings);
            RenderInfoBlock(block);
        });
    }

    function RenderAuthBlock(data) {
        self.RenderTemplate(data, settings, null,
            function(data){
                InsertContainerAuthBlock();
                RenderAuthBlock(data);
            },
            function(){
                InsertContainerEmptyWidget();
            }
        );
    }

    function RenderInfoBlock(data) {
        self.RenderTemplate(data, settings, null,
            function(data){
                InsertContainerInfoBlock();
                RenderInfoBlock(data);
            },
            function(){
                InsertContainerEmptyWidget();
            }
        );
    }
};

var UserAuthorizationBlockViewModel = function () {
    var self = this;
    self.ClickLogin = function () {
        Parameters.cache.lastPage = Parameters.cache.history[Parameters.cache.history.length - 1];
        Routing.SetHash('login', 'Авторизация пользователя', {});
    };
    self.ClickRegistration = function () {
        Parameters.cache.lastPage = Parameters.cache.history[Parameters.cache.history.length - 1];
        Routing.SetHash('registration', 'Регистрация пользователя', {step: 1});
    };
};

var UserInformationBlockViewModel = function (data, settings) {
    var self = this;
    self.email = data.email;
    self.login = data.login;
    self.phone = data.phone;
    self.countNewMessage = ko.computed(function () {
        return Parameters.cache.message.countNewMessage();
    }, this);
    self.showIcon = function () {
        if (!data.route_icon_user || $.inArray('icon', settings.showBlocks) < 0)
            return false;
        return true;
    };
    self.iconUser = '';
    if (data.route_icon_user)
        self.iconUser = data.route_icon_user + '?' + EventDispatcher.HashCode(EventDispatcher.GetUUID());
    self.background = '';
    self.backgroundImage = '';
    if (self.iconUser) {
        self.background = "background: url('" + self.iconUser + "')";
        self.backgroundImage = "background-image: url('" + self.iconUser + "')";
    }

    self.showRaiting = function () {
        if ($.inArray('raiting', settings.showBlocks) < 0)
            return false;
        return true;
    };
    self.ratingUser = data.rating_user;

    self.showProfile = function () {
        if ($.inArray('profile', settings.showBlocks) < 0)
            return false;
        return true;
    };

    self.ClickLogout = function () {
        self.Confirm(settings.message.confirmLogOut, function () {
            Loader.Indicator('UserInformationWidget', false);
            EventDispatcher.DispatchEvent('UInfo.logout');
        }, false);
    };
    self.ClickPrivateOffice = function () {
        SetHash('profile', 'Личный кабинет', {});
    };
    self.ClickMessages = function () {
        SetHash('messages', 'Сообщения', {});
    };
    self.ClickFavorites = function () {
        SetHash('favorites', 'Избранное', {});
    };
    self.ClickPurchases = function () {
        SetHash('purchases', 'Мои покупки', {block: 'list'});
    };
    self.ClickProfile = function () {
        SetHash('profile', 'Личный кабинет', {});
    };

    function SetHash(alias, title, params){
        Routing.SetHash(alias, title, params);
    }
};

var TestUserInformation = {
    Init: function () {
        if (typeof Widget == 'function') {
            UserInformationWidget.prototype = new Widget();
            var information = new UserInformationWidget();
            information.Init(information);
        }
        else {
            setTimeout(function () {
                TestUserInformation.Init()
            }, 100);
        }
    }
}

TestUserInformation.Init();


