var CartWidget = function () {
    var self = this;
    self.widgetName = 'CartWidget';
    self.version = 1.0;
    self.minWidgetVersion = 1.0;
    self.maxWidgetVersion = 2.0;
    self.minTmplVersion = 1.0;
    self.maxTmplVersion = 2.0;
    self.InitWidget = InitWidget;

    var settings = {
        container: {widget: 'cartInfoWidgetId', def: 'defaultCartInfoWidgetId'},
        cartId : 'cart', // id корзины товара
        tmpl : {
            path : "cartShopTmpl.html", // файл шаблонов
            id : "cartTmpl" //id шаблона формы авторизации
        },
        message : {
            title : 'Корзина', // заголовок блока
            cartGoodsTitle: 'Моя корзина',
            maxIsReached : "Достигнут максимум" // сообщение о том что достигнут максимум при выборе кол-ва товара
        },
        showBlocks : {
            title : 'always', // показывать название «Корзина» - всегда(always)/никогда(never)/когда пустая(empty)
            count : true, // отображать кол-во товара
            baseCost : false, // отображать сумму без скидок
            finalCost : false, // отображать конечную сумму
            fullInfo : false // отображать информацию по товарам
        },
        animate: typeof AnimateCart == 'function' ? AnimateCart : null
    };
    function InitWidget() {
        SetInputParameters();
        RegisterEvents();
        LoadTmpl();
    }
    function SetInputParameters() {
        var input = self.GetInputParameters('cart');

        if(!$.isEmptyObject(input)){
            settings = self.UpdateSettings1(settings, input);
            if (input.show) {
                for (var key in input.show) {
                    settings.showBlocks[key] = input.show[key];
                }
            }
        }
        Config.Containers.cart = settings.container;
    }

    function InsertContainerEmptyWidget() {
        self.ClearContainer(settings);
    }

    function InsertContainerMain() {
        self.InsertContainer(settings);
    }

    function CheckRoute() {
        if (Routing.IsDefault() && self.HasDefaultContent()) {
            self.WidgetLoader(true);
        }
        else {
            self.BaseLoad.CartInfo('', function (data) {
                if (settings.showBlocks.fullInfo) {
                    self.BaseLoad.CartGoods('', function (goods) {
                        InsertContainerMain();
                        Fill({info: data, goods: goods});
                    });
                }
                else {
                    InsertContainerMain();
                    Fill({info: data});
                }
            });
        }
    }
    function LoadTmpl() {
        self.BaseLoad.Tmpl(settings.tmpl, function () {
            CheckRoute();
        });
    }
    function RegisterEvents() {
        self.AddEvent('w.auth.ok', function () {
            LoadTmpl();
        });

        self.AddEvent('w.change.route', function (data) {
            LoadTmpl();
        });

        self.AddEvent('widgets.cart.infoUpdate', function (data) {
            LoadTmpl();
        });
        self.AddEvent('widgets.cart.clear', function (data) {
            var goodsId = data.goodsId ? data.goodsId : false;
            self.BaseLoad.ClearCart(data.sellerId, goodsId, function () {
                self.DispatchEvent('CartGoods.clear.cartInfo.' + data.sellerId + '.' + goodsId);
            });
        });
        self.AddEvent('Cart.change.count', function (goods) {
            self.BaseLoad.AddGoodsToCart(goods.id, goods.sellerId, goods.ordered(), function (data) {
                goods.sellCost(data.sell_cost);
                goods.sellEndCost(data.sell_end_cost);
                self.DispatchEvent('CartGoods.change.cartInfo.' + goods.sellerId + '.' + goods.id, goods.ordered());
            });
        });
    }
    function Fill(data) {
        var info = new CartViewModel(settings);
        info.AddContent(data);
        Render(info);
    }
    function Render(data) {
        self.RenderTemplate(data, settings, null,
            function(data){
                InsertContainerMain();
                Render(data);
            },
            function(){
                InsertContainerEmptyWidget();
            }
        );
    }
};

var CartViewModel = function (settings) {
    var self = this;
    self.title = settings.message.title;
    self.goods = ko.observableArray();
    self.isAuthorized = ko.computed(function () {
        if (Parameters.cache.userInformation && !Parameters.cache.userInformation.err)
            return true;
        return false;
    }, this);
    self.ShowTitle = ko.computed(function () {
        if (settings.showBlocks.title == 'never')
            return false;
        if (settings.showBlocks.title == 'always')
            return true;
        if (settings.showBlocks.title == 'empty') {
            return true;
        }
        return false;
    }, this);
    self.count = ko.observable(0);
    self.ShowCount = ko.computed(function () {
        if (settings.showBlocks.count && self.count() > 0) {
            return true;
        }
        return false;
    }, this);
    self.baseCost = ko.observable(0);
    self.ShowBaseCost = ko.computed(function () {
        if (settings.showBlocks.baseCost && self.baseCost() > 0 && self.baseCost() > self.finalCost())
            return true;
        return false;
    }, this);
    self.finalCost = ko.observable(0);
    self.ShowFinalCost = ko.computed(function () {
        if (settings.showBlocks.finalCost && self.finalCost() > 0)
            return true;
        return false;
    }, this);
    self.ShowFullInfo = ko.computed(function () {
        if (settings.showBlocks.fullInfo && self.goods().length > 0)
            return true;
        return false;
    }, this);

    self.AddContent = function (data) {
        var info = data.info;
        var goods = data.goods;
        if (!info.err) {
            self.count(info.count);
            self.baseCost(info.base_cost);
            self.finalCost(info.final_cost);
        }
        if (goods && !goods.err) {
            ShortBlockCartGoodsSellersViewModel.prototype = new Widget();
            $.each(goods, function (i) {
                $.each(goods[i].goods, function (j) {
                    self.goods.push(new ShortBlockCartGoodsSellersViewModel(goods[i].goods[j], goods[i].seller.id, self, settings));
                });
            });
        }
    };
    self.ClickCart = function () {
        if (self.count() > 0) {
            Parameters.cache.lastPage = Parameters.cache.history[Parameters.cache.history.length - 1];
            Routing.SetHash('cart', settings.message.cartGoodsTitle, {});
        }
    };
    self.ClickIssueOrder = function () {
        if (self.count() > 0) {
            Routing.SetHash('order', 'Оформление заказа', {create: 'fromCart', sellerId: self.sellerInfo.shop.id});
        }
    };
};

var ShortBlockCartGoodsSellersViewModel = function (data, sellerId, cart, settings) {
    var self = this;
    self.id = data.id;
    self.fullName = data.full_name;
    self.countReserv = data.count_reserv;
    self.count = data.count;
    self.sellCost = ko.observable(data.sell_cost);
    self.sellEndCost = ko.observable(data.sell_end_cost);
    self.routeImages = data.route_image;
    self.routeBigImages = data.route_big_image;
    self.ordered = ko.observable(self.count);
    self.sellerId = sellerId;
    self.sum = ko.computed(function () {
        return (self.ordered() * self.sellCost()).toFixed(2);
    }, this);
    self.endSum = ko.computed(function () {
        return (self.ordered() * self.sellEndCost()).toFixed(2);
    }, this);
    self.isEgoods = ko.computed(function(){
        if(data.is_egoods =='yes')
            return true;
        return false;
    }, this);
    self.CartItog = ko.computed(function(){
        var itog = 0;
        $.each(cart.goods(), function (i) {
            itog = itog + parseInt(cart.goods()[i].endSum(), 10);
        });
        cart.finalCost(itog);
        return itog;
    }, this);
    self.ClickPlus = function () {
        if (self.ordered() < self.countReserv) {
            self.ordered(self.ordered() + 1);
            self.CartItog();
            cart.count(cart.count() + 1);
            DispatchEvent('Cart.change.count', self);
        }
        else
            self.ShowMessage(settings.message.maxIsReached, false, false);
    };
    self.ClickMinus = function () {
        if (self.ordered() > 0) {
            self.ordered(self.ordered() - 1);
            self.CartItog();
            cart.count(cart.count() - 1);
            DispatchEvent('Cart.change.count', self);
        }
    };
    self.ClickGoods = function () {
        Routing.SetHash('goods', self.fullName, {id: self.id});
    };
    self.ClickRemove = function () {
        DispatchEvent('widgets.cart.clear', {goodsId: self.id, sellerId: sellerId});
        cart.goods.remove(self);
        cart.count(cart.count() - self.ordered());
    };

    function DispatchEvent(name, data){
        EventDispatcher.DispatchEvent(name, data);
    }
}

var TestCart = {
    Init: function () {
        if (typeof Widget == 'function') {
            CartWidget.prototype = new Widget();
            var cart = new CartWidget();
            cart.Init(cart);
        }
        else {
            setTimeout(function () {
                TestCart.Init()
            }, 100);
        }
    }
}

TestCart.Init();