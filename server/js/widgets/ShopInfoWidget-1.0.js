var ShopInfoWidget = function () {
    var self = this;
    self.widgetName = 'ShopInfoWidget';
    self.version = 1.0;
    self.minWidgetVersion = 1.0;
    self.maxWidgetVersion = 2.0;
    self.minTmplVersion = 1.0;
    self.maxTmplVersion = 2.0;
    self.InitWidget = InitWidget;

    var settings = {
        container: { widget: 'shopInfoWidgetId', def: 'defaultShopInfoWidgetId'},
        defaultLogo: "//seller.pokupo.ru/images/logos/shop/1.png",
        show: {
            logo: true,
            title: true
        },
        tmpl : {
            path : 'shopInfoTmpl.html', // файл шаблонов
            id : 'shopInfoTmpl'
        },
        animate: typeof AnimateShopInfo == 'function' ? AnimateShopInfo : null
    };
    function InitWidget() {
        SetInputParameters()
        RegisterEvents();
        Fill();
    }

    function SetInputParameters() {
        var input = self.GetInputParameters('shopInfo');

        if(!$.isEmptyObject(input)){
            settings = self.UpdateSettings1(settings, input);
            if (input.show) {
                if (input.show.hasOwnProperty('logo'))
                    settings.show.logo = input.show.logo;
                if (input.show.hasOwnProperty('title'))
                    settings.show.title = input.show.title;
            }
        }
        Config.Containers.shopInfo = settings.container;
    }

    function RegisterEvents() {
        self.AddEvent('w.change.route', function (data) {
            Fill();
        });
    }

    function InsertContainerEmptyWidget() {
        self.ClearContainer(settings)
    }

    function InsertContainerContent() {
        self.InsertContainer(settings)
    }

    function Fill() {
        self.BaseLoad.Tmpl(settings.tmpl, function () {
            self.BaseLoad.ShopInfo(function (data) {
                InsertContainerContent();
                var info = new ShopInfoViewModel(data, settings);
                Render(info);
            });
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
}

var ShopInfoViewModel = function (data, settings) {
    var self = this;
    self.logo = settings.defaultLogo;
    if (data.id_logo_shop)
        self.logo = data.id_logo_shop;
    self.name = data.name_shop;
    self.link = data.site_shop;
    self.showLogo = settings.show.logo;
    self.showTitle = settings.show.title;
}

var TestShopInfo = {
    Init: function () {
        if (typeof Widget == 'function') {
            ShopInfoWidget.prototype = new Widget();
            var information = new ShopInfoWidget();
            information.Init(information);
        }
        else {
            setTimeout(function () {
                TestShopInfo.Init()
            }, 100);
        }
    }
}

TestShopInfo.Init();
