var StandaloneGoodsWidget = function () {
    var self = this;
    self.widgetName = 'StandaloneGoodsWidget';
    self.version = 1.0;
    self.minWidgetVersion = 1.0;
    self.maxWidgetVersion = 2.0;
    self.minTmplVersion = 1.0;
    self.maxTmplVersion = 2.0;
    self.goods = null;
    self.hasButton = false;
    self.InitWidget = InitWidget;
    var settings = {
        container: {widget: 'content', def: 'defaultStandaloneGoodsWidgetId'},
        tmpl: {
            path: "standaloneGoodsTmpl.html", // файл шаблона
            id: "standaloneGoodsTmpl" // id шаблона виджета карточки товара по умолчанию
        },
        showBlocks: ['main'], // блоки отображаемые по умолчанию
        button: {
            active: 'Купить',
            inactive: 'Товар недоступен'
        },
        moreBlocks: {
            blockDescription: 'Описание', // заголовок блока "Описание товара"
            blockShipping: 'Условия доставки', // заголовок блока "Условия доставки"
            blockOpinion: 'Отзывы покупателей' // заголовок блока "Отзывы покупателей"
        },
        message: {
            maxIsReached: "Достигнут максимум" // сообщение о том что достигнут максимум при выборе кол-ва товара
        },
        share: {
            element: 'share',  // id блока в котором будут размещены ссылки на соц сети
            elementStyle: {
                'quickServices': ['vkontakte', 'odnoklassniki', 'facebook', 'twitter', 'gplus'] // массив подключаемых соц сетей в формате http://api.yandex.ru/share/
            }
        },
        galleryId: "jcarousel", // id галереи
        animate: typeof AnimateStandaloneGoods == 'function' ? AnimateStandaloneGoods : null,
        infoBlock: 1111111,
        idGoods: null,
        count: 1,
        idShopPartner: null,
        mailUser: null,
        idMethodPayment: null
    };

    function InitWidget() {
        SetInputParameters();
        RegisterEvents();
        CheckRouteGoods();
    }

    function SetInputParameters() {
        var input = self.GetInputParameters('standaloneGoods');

        var rParams = Routing.params;

        if (rParams.id)
            settings.idGoods = rParams.id;
        if (rParams.idShopPartner)
            settings.idShopPartner = rParams.idShopPartner;
        if (rParams.mailUser)
            settings.mailUser = rParams.mailUser;
        if (rParams.idMethodPayment)
            settings.idMethodPayment = rParams.idMethodPayment;
        if (rParams.button)
            settings.button.active = rParams.button;
        if (rParams.count)
            settings.count = rParams.count;
        if (input.infoBlock)
            settings.infoBlock = input.infoBlock;

        if (!$.isEmptyObject(input)) {
            settings = self.UpdateSettings1(settings, input);
            if (input.show) {
                for (var i = 0; i <= input.show.length - 1; i++) {
                    if ($.inArray(input.show[i], settings.showBlocks) < 0)
                        settings.showBlocks.push(input.show[i]);
                }
            }
        }

        var arrayParams = ["blockIdGoods", "blockShortName", "blockFullName", "blockGallery", "blockShop", "blockInfoSeller",
            "blockCount", "editableCount", "blockShare", "blockDescription", "blockShipping", "blockOpinion"];
        $.each(arrayParams, function(i, one){
            setShowBlocks(one);
        })

        function setShowBlocks(name){
            if(rParams[name] && $.inArray(name, settings.showBlocks) < 0)
                settings.showBlocks.push(name);
        }

        if (!$.isEmptyObject(input)) {
            if (input.hide) {
                for (var i = 0; i <= input.hide.length - 1; i++) {
                    var test = $.inArray(input.hide[i], settings.showBlocks);
                    if (test > 0) {
                        settings.showBlocks.splice(test, 1);
                    }
                }
            }
        }
        Config.Containers.standaloneGoods = settings.container;
    }

    function CheckRouteGoods() {
        if (Routing.route == 'goods' || Routing.IsDefault()) {
            console.log(settings.tmpl);
            self.BaseLoad.Tmpl(settings.tmpl, function () {
                console.log('templete');
                self.BaseLoad.Script(PokupoWidgets.model.goods, function () {
                    console.log('model');
                    Update();
                });
            });
        }
        else
            self.WidgetLoader(true);
    }

    function RegisterEvents() {
        self.AddEvent('w.change.route', function () {
            CheckRouteGoods();
        });

        self.AddEvent('SGoods.onload.info', function (data) {
            fill.Content(data);
        });
    }

    function Update() {
        self.BaseLoad.GoodsInfo(settings.idGoods, settings.infoBlock, function (data) {
            self.DispatchEvent('SGoods.onload.info', data)
            console.log('ddd');
        })
    }

    function InsertContainerEmptyWidget() {
        self.ClearContainer(settings)
    }

    function InsertContainerContent() {
        self.InsertContainer(settings)
    }

    var fill = {
        Content: function (data) {
            StandaloneGoodsViewModel.prototype = new GoodsViewModel(settings);
            self.goods = new StandaloneGoodsViewModel(settings);

            for (var key in data) {
                if (key == 'opinion' && $.inArray('blockOpinion', settings.showBlocks) < 0)
                    continue;
                if (key == 'shipping' && $.inArray('blockShipping', settings.showBlocks) < 0)
                    continue;
                if (typeof fill[key.charAt(0).toUpperCase() + key.substr(1).toLowerCase()] == 'function')
                    fill[key.charAt(0).toUpperCase() + key.substr(1).toLowerCase()](data[key]);
                else
                    fill.Block(key, data[key]);
            }

            self.goods.CheckShow();
            self.goods.blocks.main.sellerId = data.seller.id;
            self.goods.blocks.main.shopId = data.shop.id;
            self.goods.SetListMoreBlock('standalone');
            RenderGoods(self.goods);
        },
        Main: function (data) {
            GoodsMainBlockViewModel.prototype = new Widget();
            self.goods.AddBlock('main', new GoodsMainBlockViewModel(data, settings));
            if ($.inArray('blockDescription', settings.showBlocks) >= 0) {
                var key = 'blockDescription';
                self.goods.AddBlock(key, data.description);
                if (data.description && data.description.match(/data-bind/))
                    self.hasButton = key;
            }
            if (settings.count && settings.count <= self.goods.blocks.main.count())
                self.goods.blocks.main.ordered(settings.count);
            else {
                self.goods.blocks.main.count(0);
            }
        },
        Gallery: function (data) {
            var gallery = [];
            for (var i = 0; i <= data.length - 1; i++) {
                gallery[i] = new GalleryBlockViewModel(data[i]);
            }
            self.goods.AddBlock('gallery', gallery);
        },
        Seller: function (data) {
            self.goods.sellerInfo['seller'] = data;
        },
        Shop: function (data) {
            self.goods.sellerInfo['shop'] = data;
        },
        Operator: function (data) {
            self.goods.sellerInfo['operator'] = data;
        },
        Block: function (key, data) {
            var block = new MoreBlockViewModel(key);
            if (key == 'shipping') {
                var shipping = [];
                for (var r in data) {
                    shipping.push(new ShippingBlockViewModel(data[r]));
                }
                data = shipping;
                key = 'blockShipping';
            }
            if (key == 'opinion')
                key = 'blockOpinion';

            block.AddParams(data);

            self.goods.AddBlock(key, block);
        }
    };

    function RenderGoods(data) {
        InsertContainerContent();
        self.RenderTemplate(data, settings,
            function (data) {
                if (self.hasButton) {
                    $.each(data.moreBlock, function (i) {
                        if (data.moreBlock[i].key == self.hasButton) {
                            var button = $('#' + data.moreBlock[i].idBlock + ' [data-bind^=click]');
                            $.each(button, function (i) {
                                if (data.blocks.main.showAddToCart()) {
                                    if ($(button[i]).attr('data-bind').match(/AddToCart/)) {
                                        var addToCart = new AddToCartButtonViewModel(data.blocks.main);
                                        ko.applyBindings(addToCart, button[i]);
                                    }
                                }
                                else
                                    $(button[i]).hide();

                                if (data.blocks.main.showBuy()) {
                                    if ($(button[i]).attr('data-bind').match(/Buy/)) {
                                        var buy = new BuyButtonViewModel(data.blocks.main);
                                        ko.applyBindings(buy, button[i]);
                                    }
                                }
                                else
                                    $(button[i]).hide();
                            });
                        }
                    });
                }
                AddGoodsInCookie(data);
            },
            function (data) {
                InsertContainerContent();
                RenderGoods(data);
            },
            function () {
                InsertContainerEmptyWidget();
            });
    }

    function AddGoodsInCookie(data) {
        var viewed = $.cookie(Config.Base.cookie.previously_viewed);

        if (!viewed) {
            $.cookie(Config.Base.cookie.previously_viewed, data.id);
        }
        else {
            var viewedArray = viewed.split(",")
            var pos = $.inArray(data.id, viewedArray);
            if (pos >= 0) {
                viewedArray.splice(pos, 1);
                viewedArray.unshift(data.id);
            }
            else {
                viewedArray.unshift(data.id);
            }
            if (viewedArray.length > 20)
                viewedArray.splice(20, 1)

            $.cookie(Config.Base.cookie.previously_viewed, viewedArray.join(","));
        }

        var viewed = $.cookie(Config.Base.cookie.previously_viewed);
    }
}

var StandaloneGoodsViewModel = function (settings) {
    var self = this;
    self.activeButton = settings.button.active;
    self.inactiveButton = settings.button.inactive;
    self.show = {
        blockIdGoods: false,
        blockShortName: false,
        blockFullName: false,
        blockGallery: false,
        blockShop: false,
        blockInfoSeller: false,
        blockOperator: false,
        blockCount: false,
        editableCount: false,
        blockShare: false,
        blockDescription: false,
        blockShipping: false,
        blockOpinion: false
    };
    self.ShowGallery = function () {
        if (self.blocks.gallery)
            return true;
        return false;
    };
    self.CheckShow = function () {
        for(var k in self.show) setShowBlocks(k);
    };
    self.SetListMoreBlock = function (prefix) {
        for (var key in settings.moreBlocks) {
            if (inShowBlocks(key)) {
                StandaloneGoodsListMoreBlockViewModel.prototype = new GoodsListMoreBlockViewModel(key, self.blocks[key], prefix, settings);
                self.moreBlock.push(new StandaloneGoodsListMoreBlockViewModel(settings));
            }
        }
    }
    function inShowBlocks(key){
        return $.inArray(key, settings.showBlocks) >= 0
    }
    self.Buy = function () {
        var params = {
            idGoods: settings.idGoods,
            count: self.blocks.main.ordered(),
        };
        if (settings.idShopPartner)
            params.idShopPartner = settings.idShopPartner;
        if (settings.mailUser)
            params.mailUser = settings.mailUser;
        if (settings.idMethodPayment)
            params.idMethodPayment = settings.idMethodPayment;

        Routing.SetHash('standalone_payment', 'Оплатить товар', params);
    }

    function setShowBlocks(name){
        if($.inArray(name, settings.showBlocks) >= 0)
            self.show[name] = true;
    }
}

var StandaloneGoodsListMoreBlockViewModel = function (settings) {
    this.title = settings.moreBlocks[this.key];
    this.templateName = this.prefix + this.key.charAt(0).toUpperCase() + this.key.substr(1) + 'BlockTmpl';
}

var TestStandaloneGoods = {
    Init: function () {
        if (typeof Widget == 'function') {
            StandaloneGoodsWidget.prototype = new Widget();
            var goods = new StandaloneGoodsWidget();
            goods.Init(goods);
        }
        else {
            setTimeout(function () {
                TestStandaloneGoods.Init()
            }, 100);
        }
    }
}

TestStandaloneGoods.Init();
