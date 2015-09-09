var ShopInfoWidget = function(){
    var self = this;
    self.widgetName = 'ShopInfoWidget';
    self.version = 1.0;
    self.minWidgetVersion = 1.0;
    self.maxWidgetVersion = 2.0;
    self.minTmplVersion = 1.0;
    self.maxTmplVersion = 2.0;
    self.settings = {
        containerId : null,
        tmpl: {
            path : null,
            id : null
        },
        show: {
            logo: null,
            title: true
        },
        animate: null,
        inputParameters : {},
        customContainer: null
    };
    self.InitWidget = function(){
        self.settings.containerId = Config.Containers.shopInfo.widget;
        self.settings.customContainer = Config.Containers.shopInfo.customClass;
        self.settings.tmpl = Config.ShopInfo.tmpl;
        self.settings.show = Config.ShopInfo.show;
        self.SetInputParameters()
        self.RegisterEvents();
        self.Fill();
    };
    self.SetInputParameters = function(){
        var input = {};
        if(Config.Base.sourceParameters == 'string'){
            var temp = JSCore.ParserInputParameters(/ShopInfoWidget/);
            if(temp.search){
                input = temp.search;
            }
        }
        if(Config.Base.sourceParameters == 'object' && typeof WParameters !== 'undefined' && WParameters.shopInfo){
            input = WParameters.shopInfo;
        }
        if(!$.isEmptyObject(input)){
            if(input.show){
                if(input.show.hasOwnProperty('logo'))
                    self.settings.show.logo = input.show.logo;
                if(input.show.hasOwnProperty('title'))
                    self.settings.show.title = input.show.title;
            }
            if(input.tmpl){
                if(input.tmpl.path)
                    self.settings.tmpl.path = input.tmpl.path;
                if(input.tmpl.id)
                    self.settings.tmpl.id = input.tmpl.id;
            }
            if(input.animate)
                self.settings.animate = input.animate;
        }
        self.settings.inputParameters = input;
    };
    self.RegisterEvents = function(){
        EventDispatcher.AddEventListener('w.change.route', function (data){
            self.Fill();
        });
    };
    self.InsertContainer = {
        EmptyWidget : function(){
            var temp = $("#" + self.settings.containerId).find(self.SelectCustomContent().join(', ')).clone();
            $("#" + self.settings.containerId).empty().html(temp);
        },
        Content : function(){
            self.InsertContainer.EmptyWidget();
            $("#" + self.settings.containerId).append($('script#' + self.GetTmplName()).html()).children().hide();
        }
    };
    self.Fill = function(){
        self.BaseLoad.Tmpl(self.settings.tmpl, function() {
            self.BaseLoad.ShopInfo(function (data) {
                self.InsertContainer.Content();
                var info = new ShopInfoViewModel(data, self.settings);
                self.Render(info);
            });
        });
    };
    self.Render = function(data){
        if($("#" + self.settings.containerId).length > 0){
            try{
                ko.cleanNode($("#" + self.settings.containerId)[0]);
                ko.applyBindings(data, $("#" + self.settings.containerId)[0]);
                self.WidgetLoader(true, self.settings.containerId);
                if(typeof AnimateShopInfo == 'function')
                    new AnimateShopInfo();
                if(self.settings.animate)
                    self.settings.animate();
            }
            catch(e){
                self.Exception('Ошибка шаблона [' + self.GetTmplName() + ']', e);
                if(self.settings.tmpl.custom){
                    delete self.settings.tmpl.custom;
                    self.BaseLoad.Tmpl(self.settings.tmpl, function(){
                        self.InsertContainer.Content();
                        self.Render(data);
                    });
                }
                else{
                    self.InsertContainer.EmptyWidget();
                    self.WidgetLoader(true, self.settings.containerId);
                }
            }
        }
        else{
            self.Exception('Ошибка. Не найден контейнер [' + self.settings.containerId + ']');
            self.WidgetLoader(true, self.settings.containerId);
        }
    };
}

var ShopInfoViewModel = function(data, settings){
    var self = this;
    self.logo = Config.ShopInfo.defaultLogo;
    if(data.id_logo_shop)
        self.logo = data.id_logo_shop;
    self.name = data.name_shop;
    self.link = data.site_shop;
    self.showLogo = settings.show.logo;
    self.showTitle = settings.show.title;
}

var TestShopInfo = {
    Init : function(){
        if(typeof Widget == 'function'){
            ShopInfoWidget.prototype = new Widget();
            var information = new ShopInfoWidget();
            information.Init(information);
        }
        else{
            setTimeout(function(){TestShopInfo.Init()}, 100);
        }
    }
}

TestShopInfo.Init();
