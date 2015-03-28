window.InfoSellerWidget = function () {
    var self = this;
    self.widgetName = 'InfoSellerWidget';
    self.version = 1.0;
    self.minWidgetVersion = 1.0;
    self.maxWidgetVersion = 2.0;
    self.minTmplVersion = 1.0;
    self.maxTmplVersion = 2.0;
    self.settings = {
        tmpl: {
            path: null,
            id: null
        },
        animate: null,
        inputParameters: {},
        container: null,
        style: null,
        infoSeller: {},
        hash: null
    };
    self.InitWidget = function () {
        self.settings.style = Config.InfoSeller.style;
        self.Loader();
        self.RegisterEvents();
        if(Loader.IsReady())
            self.LoadTmpl();
    };
    self.Loader = function () {
        Loader.InsertContainer(self.settings.container);
    };
    self.SetParameters = function (data) {
        self.settings.tmpl = Config.InfoSeller.tmpl;
        self.settings.container = data.element;
        
        var input = {};
        if (Config.Base.sourceParameters == 'object' && typeof WParameters !== 'undefined' && WParameters.infoSeller) {
            input = WParameters.infoSeller;
        }
        if (!$.isEmptyObject(input)) {
            if(input.animate)
                self.settings.animate = input.animate;
        }
        self.settings.inputParameters = input;
        
        for (var key in data.options.params) {
            if (key == 'tmpl' && data.options.params['tmpl']) {
                if (data.options.params['tmpl']['path'])
                    self.settings.tmpl.path = data.options.params['tmpl']['path'];
                if (data.options.params['tmpl']['id'])
                    self.settings.tmpl.id = data.options.params['tmpl']['id'];
            }
            else if (key == 'uniq' && data.options.params['uniq'])
                self.settings.hash = data.options.params['uniq'];
            else if (key == 'animate' && data.options.params['animate'])
                self.settings.animate = data.options.params['animate'];
            else
                self.settings.infoSeller[key] = data.options.params[key];
        }
    };
    self.LoadTmpl = function () {
        self.BaseLoad.Tmpl(self.settings.tmpl, function () {
            EventDispatcher.DispatchEvent('InfoSellerWidget.onload.tmpl.' + self.settings.hash)
        });
    };
    self.RegisterEvents = function () {
        EventDispatcher.AddEventListener('widget.display.ready', function(){
            self.LoadTmpl();
        });

        EventDispatcher.AddEventListener('InfoSellerWidget.onload.tmpl.' + self.settings.hash, function (data) {
            if (self.settings.infoSeller['data']) {
                self.InsertContainer.Content();
                self.Fill(self.settings.infoSeller['data'])
            }
            else {
                window.console && console.log('No data on the Seller');
            }
        });

        EventDispatcher.AddEventListener('InfoSellerWidget.fill.block.' + self.settings.hash, function (data) {
            self.Render(data);
        });
    };
    self.InsertContainer = {
        EmptyWidget: function () {
            var temp = $(self.settings.container).find(self.SelectCustomContent().join(', ')).clone();
            $(self.settings.container).empty().html(temp);
        },
        Content: function () {
            self.InsertContainer.EmptyWidget();
            $(self.settings.container).append($('script#' + self.GetTmplName()).html());
        }
    }
    self.Fill = function (data) {
        var info = new InfoSellerViewModel(data);
        self.Render(info);
    };
    self.Render = function (data) {
        try {
            ko.cleanNode($(self.settings.container).children()[0]);
            ko.applyBindings(data, $(self.settings.container).children()[0]);
            if(typeof AnimateInfoSeller == 'function')
                new AnimateInfoSeller();
            if(self.settings.animate)
                self.settings.animate();
        }
        catch (e) {
            self.Exception('Ошибка шаблона [' + self.GetTmplName() + ']', e);
            if (self.settings.tmpl.custom) {
                delete self.settings.tmpl.custom;
                self.BaseLoad.Tmpl(self.settings.tmpl, function () {
                    self.InsertContainer.Content();
                    self.Render(data);
                });
            }
            else {
                self.InsertContainer.EmptyWidget();
            }
        }
    }
}

var InfoSellerViewModel = function (data) {
    var self = this;
    self.sellerId = data.seller.id;
    self.nameSeller = data.seller.name_seller;
    self.websiteSeller = data.seller.website;
    self.shopId = data.shop.id;
    self.nameShop = data.shop.name_shop;
    self.emailLinkTitle = data.shop.email_support;
    self.mailtoShop = 'mailto:' + self.emailLinkTitle;

    self.phonesSupportShop = ko.observable();
    if (data.shop.phones_support)
        self.phonesSupportShop(data.shop.phones_support);

    self.siteSupportShop = ko.observable();
    if (data.shop.site_support)
        self.siteSupportShop(data.shop.site_support);
    self.siteLinkTitle = ko.computed(function(){
        var site = '';
        if(self.siteSupportShop()){
            site = self.siteSupportShop().replace('http://', '');
            site = site.replace('https://', '');
        }
        return site;
    }, this)

    self.skypeSupportShop = ko.observable();
    if (data.shop.skype_support)
        self.skypeSupportShop(data.shop.skype_support);

    self.icqSupportShop = ko.observable();
    if (data.shop.icq_support)
        self.icqSupportShop(data.shop.icq_support);

    self.ratingShop = data.shop.rating_shop;
    self.positiveOpinion = data.shop.positive_opinion;
    self.negativeOpinion = data.shop.negative_opinion;
    self.useCart = data.shop.use_cart;
    self.routeLogoShop = data.shop.route_logo_shop;
    self.allGoods = data.shop.all_goods;
    self.operators = data.operator;

    self.ClickOperator = function (data, event) {

    }
}


