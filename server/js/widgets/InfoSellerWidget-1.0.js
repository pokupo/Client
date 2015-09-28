window.InfoSellerWidget = function () {
    var self = this;
    self.widgetName = 'InfoSellerWidget';
    self.version = 1.0;
    self.minWidgetVersion = 1.0;
    self.maxWidgetVersion = 2.0;
    self.minTmplVersion = 1.0;
    self.maxTmplVersion = 2.0;
    self.SetParameters = SetParameters;
    self.InitWidget = InitWidget;

    var settings = {
        tmpl: {},
        animate: null,
        container: null,
        infoSeller: {},
        hash: null,
        show: {
            blockShop: true,
            blockInfoSeller: false
        }
    }

    function InitWidget() {
        RegisterEvents();
        if(Loader.IsReady()) {
            Loader.InsertContainer(settings.container);
            LoadTmpl();
        }
    }
    function SetParameters(data) {
        var params = data.options.params;

        settings.tmpl = Config.InfoSeller.tmpl;
        settings.container = data.element;
        
        var input = {};
        if (Config.Base.sourceParameters == 'object' && typeof WParameters !== 'undefined' && WParameters.infoSeller) {
            input = WParameters.infoSeller;
        }
        if (!$.isEmptyObject(input)) {
            if(input.animate)
                settings.animate = input.animate;
        }
        
        for (var key in params) {
            if (key == 'tmpl' && params.tmpl) {
                if (params.tmpl['path'])
                    settings.tmpl.path = params.tmpl.path;
                if (params.tmpl['id'])
                    settings.tmpl.id = params.tmpl.id;
            }
            else if (key == 'uniq' && params.uniq)
                settings.hash = params.uniq;
            else if (key == 'show' && params.show)
                settings.show = params.show;
            else
                settings.infoSeller[key] = params[key];
        }
        self.settings = settings;
        Parameters.cache.infoSellerCollection[params['uniq']] = true;
    }
    function LoadTmpl() {
        self.BaseLoad.Tmpl(settings.tmpl, function () {
            $.each(Parameters.cache.infoSellerCollection, function(i){
                EventDispatcher.DispatchEvent('ISeller.tmpl.' + i);
                delete Parameters.cache.infoSellerCollection[i];
            })
        });
    }
    function RegisterEvents() {
        EventDispatcher.AddEventListener('w.ready', function(){
            LoadTmpl();
        });

        EventDispatcher.AddEventListener('ISeller.tmpl.' + settings.hash, function (data) {
            if (settings.infoSeller['data']) {
                InsertContainerContent();
                Fill(settings.infoSeller['data'])
            }
            else {
                window.console && console.log('No data on the Seller');
            }
        });
    }
    function InsertContainerEmptyWidget() {
        var temp = $(settings.container).find(self.SelectCustomContent().join(', ')).clone();
        $(settings.container).empty().html(temp);
    }
    function InsertContainerContent() {
        InsertContainerEmptyWidget();
        $(settings.container).append($('script#' + self.GetTmplName()).html());
    }
    function Fill(data) {
        var info = new InfoSellerViewModel(data, settings.show);
        Render(info);
    }
    function Render(data) {
        try {
            ko.cleanNode($(settings.container).children()[0]);
            ko.applyBindings(data, $(settings.container).children()[0]);
            if(typeof AnimateInfoSeller == 'function')
                new AnimateInfoSeller();
            if(settings.animate)
                settings.animate();
        }
        catch (e) {
            self.Exception('Ошибка шаблона [' + self.GetTmplName() + ']', e);
            if (settings.tmpl.custom) {
                delete settings.tmpl.custom;
                self.BaseLoad.Tmpl(settings.tmpl, function () {
                    InsertContainerContent();
                    Render(data);
                });
            }
            else {
                InsertContainerEmptyWidget();
            }
        }
    }
}

var InfoSellerViewModel = function (data, show) {
    var self = this, seller = data.seller, shop = data.shop;
    self.show = {
        blockShop: show.blockShop,
        blockInfoSeller: show.blockInfoSeller
    }

    self.sellerId = seller.id;
    self.nameSeller = seller.name_seller;
    self.websiteSeller = seller.website;

    self.shopId = shop.id;
    self.nameShop = shop.name_shop;
    self.emailLinkTitle = shop.email_support;
    self.mailtoShop = 'mailto:' + self.emailLinkTitle;

    self.phonesSupportShop = ko.observable();
    if (shop.phones_support && show.blockShop)
        self.phonesSupportShop(shop.phones_support);

    self.siteSupportShop = ko.observable();
    if (shop.site_support && show.blockShop)
        self.siteSupportShop(shop.site_support);
    self.siteLinkTitle = ko.computed(function(){
        var site = '';
        if(self.siteSupportShop()){
            site = self.siteSupportShop().replace('http://', '');
            site = site.replace('https://', '');
        }
        return site;
    }, this)

    self.skypeSupportShop = ko.observable();
    if (shop.skype_support && show.blockShop)
        self.skypeSupportShop(shop.skype_support);

    self.icqSupportShop = ko.observable();
    if (shop.icq_support && show.blockShop)
        self.icqSupportShop(shop.icq_support);

    self.ratingShop = shop.rating_shop;
    self.positiveOpinion = shop.positive_opinion;
    self.negativeOpinion = shop.negative_opinion;
    self.useCart = shop.use_cart;
    self.routeLogoShop = shop.route_logo_shop;
    self.allGoods = shop.all_goods;
    self.operators = data.operator;

    self.ClickOperator = function (data, event) {

    }
}


