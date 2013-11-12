var MenuPersonalCabinetWidget = function(){
    var self = this;
    self.widgetName = 'MenuPersonalCabinetWidget';
    self.settings = {
        containerMenuId: null,
        tmpl : {
            path : null,
            id : null
        },
        style: null,
        customContainer: null
    };
    self.active = null;
    self.subMenu = [];
    self.InitWidget = function(){
        self.settings.tmpl = Config.MenuPersonalCabinet.tmpl;
        self.settings.containerMenuId = Config.Containers.menuPersonalCabinet.widget;
        self.settings.customContainer = Config.Containers.menuPersonalCabinet.customClass;
        self.settings.style = Config.MenuPersonalCabinet.style;
        self.RegisterEvents();
        self.CheckRouteMenuProfile();
        self.SetPosition();
    };
     self.SetInputParameters = function(){
        var input = {};
        if(Config.Base.sourceParameters == 'object' && typeof WParameters !== 'undefined' && WParameters.menuPersonalCabinet){
            input = WParameters.menuPersonalCabinet;
        }
     };
    self.AddMenu = function(opt){
        if(opt){
            self.active = opt.active;
            self.subMenu = opt.menu;
        }
    };
    self.CheckRouteMenuProfile = function() {
        if(Routing.route == 'profile' || Routing.route == 'favorites' || Routing.route == 'cabinet_cart' || Routing.route == 'purchases'){
            self.BaseLoad.Tmpl(self.settings.tmpl, function() {
                self.InsertContainer.Content();
                self.Fill();
            });
        }
        else{
            $("#" + self.settings.containerMenuId).empty()
            self.WidgetLoader(true);
        }
    };
    self.RegisterEvents = function() {
        EventDispatcher.AddEventListener('widget.change.route', function() {
            self.CheckRouteMenuProfile();
        });
    };
    self.InsertContainer = {
        EmptyWidget : function(){
            var temp = $("#" + self.settings.containerMenuId).find(self.SelectCustomContent().join(', ')).clone();
            $("#" + self.settings.containerMenuId).empty().html(temp);
        },
        Content : function(){
            self.InsertContainer.EmptyWidget();
            $("#" + self.settings.containerMenuId).append($('script#' + self.GetTmplName()).html()).children().hide();
        }
    };
    self.Fill = function(){
        var menu = new MenuPersonalCabinetViewModel();
        menu.AddSubMenu(self.subMenu, self.active);
        self.Render(menu);
    };
    self.Render = function(menu){
        if ($("#" + self.settings.containerMenuId).length > 0) {
            try{
                ko.applyBindings(menu, $("#" + self.settings.containerMenuId)[0]);
                self.WidgetLoader(true, self.settings.containerMenuId);
            }
            catch(e){
                self.Exeption('Ошибка шаблона [' + self.GetTmplName() + ']');
                if(self.settings.tmpl.custom){
                    delete self.settings.tmpl.custom;
                    self.BaseLoad.Tmpl(self.settings.tmpl, function(){
                        self.InsertContainer.Content();
                        self.Render(menu);
                    });
                }
                else{
                    self.InsertContainer.EmptyWidget();
                    self.WidgetLoader(true, self.settings.containerMenuId);
                }
            }
        }
    };
    self.SetPosition = function() {
        if (self.settings.style.position == 'absolute') {
            $().ready(function() {
                for (var i = 0; i <= self.settings.containerFormId.length - 1; i++) {
                    $("#" + self.settings.containerFormId[i]).css(self.settings.style);
                }
            });
        }
    };
};

var MenuPersonalCabinetViewModel = function(){
    var self = this;
    self.subMenu = ko.observableArray();
    var user = Parameters.cache.userInformation;
    self.avatar = Parameters.pathToImages + user.route_icon_user;
    self.username = user.login;
    
    self.AddSubMenu = function(subMenu, active){
        for(var key in subMenu){
            self.subMenu.push(new SubMenuViewModel(subMenu[key], active));
        }
    };
    self.activeProfile = ko.computed(function(){
        if(Routing.route == 'profile')
            return 'active';
        return '';
    }, this);
    self.ClickProfile = function(){
        Routing.SetHash('profile', 'Личный кабинет', {});
    };
    self.activePurchases = ko.computed(function(){
        if(Routing.route == 'purchases')
            return 'active';
        return '';
    }, this);
    self.ClickPurchases = function(){
        Routing.SetHash('purchases', 'Мои покупки', {block: 'list'});
    };
    self.activeAuction = ko.computed(function(){
        if(Routing.route == 'auction')
            return 'active';
        return '';
    }, this);
    self.ClickAuction = function(){
        
    };
    self.activeFavorites = ko.computed(function(){
        if(Routing.route == 'favorites')
            return 'active';
        return '';
    }, this);
    self.ClickFavorites = function(){
        Routing.SetHash('favorites', 'Избранное', {});
    };
    self.activeCart = ko.computed(function(){
        if(Routing.route == 'cabinet_cart')
            return 'active';
        return '';
    }, this);
    self.ClickCart = function(){
        Routing.SetHash('cabinet_cart', 'Корзина', {});
    };
    self.activeMessages = ko.computed(function(){
        if(Routing.route == 'messages')
            return 'active';
        return '';
    }, this);
    self.ClickMessages = function(){
        
    };
    self.ClickBecomeSeller = function(){
        window.location.href = 'https://' + window.location.hostname + '/seller/register';
    };
};

var SubMenuViewModel = function(subMenu, active){
    var self = this;
    self.title = subMenu.title;
    self.activeSubMenu = ko.computed(function(){
        if(active == subMenu.prefix)
            return 'active';
        return '';
    }, this);
    self.ClickSubMenu = function(){
        Routing.SetHash(Routing.route, self.title, {info: subMenu.prefix});
    };
}
