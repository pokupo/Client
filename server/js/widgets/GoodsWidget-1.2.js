var GoodsWidget = function () {
    var self = this;
    self.widgetName = 'GoodsWidget';
    self.version = 1.2;
    self.minWidgetVersion = 1.0;
    self.maxWidgetVersion = 2.0;
    self.minTmplVersion = 1.0;
    self.maxTmplVersion = 2.0;
    self.goods = null;
    self.hasButton = false;
    self.InitWidget = InitWidget;

    var settings = {
        container: {widget: 'content', def: 'defaultGoodsWidgetId'},
        tmpl: {
            path : "goodsTmpl.html", // файл шаблона
            id : "goodsTmpl" // id шаблона виджета карточки товара по умолчанию
        },
        animate: typeof AnimateGoods == 'function' ? AnimateGoods : null,
        showBlocks : ['main', 'description'], // блоки отображаемые по умолчанию
        infoBlock: 1111111,
        moreBlocks : {
            description : 'Описание', // заголовок блока "Описание товара"
            shipping : 'Условия доставки', // заголовок блока "Условия доставки"
            opinion : 'Отзывы покупателей' // заголовок блока "Отзывы покупателей"
        },
        message : {
            maxIsReached : "Достигнут максимум" // сообщение о том что достигнут максимум при выборе кол-ва товара
        },
        share : {
            element: 'share',  // id блока в котором будут размещены ссылки на соц сети
            elementStyle: {
                'quickServices': ['vkontakte', 'odnoklassniki', 'facebook', 'twitter', 'gplus'] // массив подключаемых соц сетей в формате http://api.yandex.ru/share/
            }
        },
        galleryId : "jcarousel", // id галереи
    }

    function InitWidget() {
        SetInputParameters();
        RegisterEvents();
        CheckRouteGoods();
    }
    function SetInputParameters() {
        var input = self.GetInputParameters('goods');

        if (!$.isEmptyObject(input)) {
            settings = self.UpdateSettings1(settings, input);
            if(input.show){
                for(var i = 0; i <= input.show.length-1; i++){
                    if($.inArray(input.show[i], settings.showBlocks) < 0)
                        settings.showBlocks.push(input.show[i]);
                }
            }
        }
        Config.Containers.goods = settings.container;
    }
    function CheckRouteGoods() {
        if (Routing.route == 'goods') {
            self.BaseLoad.Tmpl(settings.tmpl, function () {
                self.BaseLoad.Script(PokupoWidgets.model.goods, function () {
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

        self.AddEvent('G.info', function (data) {
            fill.Content(data);
        });
    }

    function Update() {
        self.BaseLoad.InfoFavorite('no', function (data) {
            Parameters.cache.favorite = data;
            self.BaseLoad.GoodsInfo(Routing.params.id, settings.infoBlock, function (data) {
                self.DispatchEvent('G.info', data)
            })
        });
    }

    function InsertContainerEmptyWidget() {
        self.ClearContainer(settings);
    }

    function InsertContainerContent() {
        self.InsertContainer(settings)
    }

    var fill = {
        Content: function (data) {
            self.goods = new GoodsViewModel(settings);
            for (var key in data) {
                if (typeof fill[key.charAt(0).toUpperCase() + key.substr(1).toLowerCase()] == 'function')
                    fill[key.charAt(0).toUpperCase() + key.substr(1).toLowerCase()](data[key]);
                else
                    fill.Block(key, data[key]);
            }
            self.goods.blocks.main.sellerId = data.seller.id;
            self.goods.blocks.main.shopId = data.shop.id;
            self.goods.SetListMoreBlock();
            RenderGoods(self.goods);
        },
        Main: function (data) {
            GoodsMainBlockViewModel.prototype = new Widget();
            self.goods.AddBlock('main', new GoodsMainBlockViewModel(data, settings));
            var key = 'description';
            self.goods.AddBlock(key, data.description);
            if (data.description && data.description.match(/data-bind/))
                self.hasButton = key;
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
            }
            block.AddParams(data);

            self.goods.AddBlock(key, block);
        }
    };
    function RenderGoods(data) {
        InsertContainerContent();
        self.RenderTemplate(data, settings,
            function(data){
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
            function(data){
                InsertContainerContent();
                RenderGoods(data);
            },
            function(){
                InsertContainerEmptyWidget();
            }
        );
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
    }
}

var TestGoods = {
    Init: function () {
        if (typeof Widget == 'function') {
            GoodsWidget.prototype = new Widget();
            var goods = new GoodsWidget();
            goods.Init(goods);
        }
        else {
            setTimeout(function () {
                TestGoods.Init()
            }, 100);
        }
    }
}

TestGoods.Init();
