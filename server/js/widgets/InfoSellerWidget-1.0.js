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
        tmpl: {
            id : "infoSellerTmpl",
            path : "infoSellerTmpl.html"
        },
        animate: typeof AnimateInfoSeller == 'function' ? AnimateInfoSeller : null,
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

        settings.container = data.element;

        var input = self.GetInputParameters('infoSeller');
        if(!$.isEmptyObject(input)) {
            settings = self.UpdateSettings1(settings, input);
            if(input.show){
                for(var i = 0; i <= input.show.length-1; i++){
                    if(settings.show.hasOwnProperty(input.show[i]))
                        settings.show[input.show[i]] = true;
                }
            }
        }

        Config.InfoSeller = settings;
        Parameters.cache.infoSellerCollection[params['uniq']] = true;
    }
    function LoadTmpl() {
        self.BaseLoad.Tmpl(settings.tmpl, function () {
            $.each(Parameters.cache.infoSellerCollection, function(i){
                self.DispatchEvent('ISeller.tmpl.' + i);
                delete Parameters.cache.infoSellerCollection[i];
            })
        });
    }
    function RegisterEvents() {
        self.AddEvent('w.ready', function(){
            LoadTmpl();
        });

        self.AddEvent('ISeller.tmpl.' + settings.hash, function (data) {
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
        $(settings.container).empty().html('');
    }
    function InsertContainerContent() {
        InsertContainerEmptyWidget();
        $(settings.container).append($('script#' + self.GetTmplName1(settings)).html());
    }
    function Fill(data) {
        var info = new InfoSellerViewModel(data, settings.show);
        Render(info);
    }
    function Render(data) {
        var container = $(settings.container);
        try {
            ko.cleanNode(container.children()[0]);
            ko.applyBindings(data, container.children()[0]);
            if(settings.animate)
                settings.animate();
        }
        catch (e) {
            self.Exception('Ошибка шаблона [' + self.GetTmplName1(settings) + ']', e);
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


