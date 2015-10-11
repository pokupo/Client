var CartGoodsWidget = function () {
    var self = this;
    self.widgetName = 'CartGoodsWidget';
    self.version = 1.0;
    self.minWidgetVersion = 1.0;
    self.maxWidgetVersion = 2.0;
    self.minTmplVersion = 1.0;
    self.maxTmplVersion = 2.0;
    self.cart = null;
    self.InitWidget = InitWidget;

    var settings = {
        container: {widget: 'content', def: 'defaultCartGoodsWidgetId'},
        tmpl: {
            path: "cartGoodsTmpl.html", // файл шаблонов
            id: {
                content: "cartGoodsTmpl", //id шаблона формы авторизации
                empty: "emptyCartGoodsTmpl"
            }
        },
        message: {
            title: 'Моя корзина',
            addFavorites: 'Выбранные товары добавлены в избранное.',
            failAddFavorites: 'Произошла ошибка при добавлении товара в избранное. Попробуйте еще раз.',
            confirmRemove: 'Вы уверены, что хотите удалить товар из корзины?',
            confirmClearCart: 'Вы уверены, что хотите очистить корзину?',
            confirmButchRemove: 'Вы уверены, что хотите удалить выбранный товар из корзины?',
            maxIsReached: "Достигнут максимум",
            pleaseLogIn: 'Необходимо авторизоваться.'
        },
        showBlocks: [],
        animate: typeof AnimateCartGoods == 'function' ? AnimateCartGoods : null
    };

    function InitWidget() {
        RegisterEvents();
        SetInputParameters();
        CheckRouteCartGoods();
    }

    function SetInputParameters() {
        var input = self.GetInputParameters('cartGoods');

        if (!$.isEmptyObject(input))
            settings = self.UpdateSettings1(settings, input);

        Config.Containers.cartGoods = settings.container;
    }

    function CheckRouteCartGoods() {
        if (Routing.route == 'cart') {
            self.BaseLoad.Tmpl(settings.tmpl, function () {
                Update();
            });
        }
        else
            self.WidgetLoader(true);
    }

    function RegisterEvents() {
        self.AddEvent('w.change.route', function () {
            CheckRouteCartGoods();
        });

        self.AddEvent('CartGoods.onload.info', function (data) {
            if (!data.err) {
                InsertContainerContent();
                fill.Content(data);
            }
            else {
                InsertContainerEmptyCart();
                RenderEmptyCart();
            }
        });

        self.AddEvent('CartGoods.change.count', function (goods) {
            self.BaseLoad.AddGoodsToCart(goods.id, goods.sellerId, goods.ordered(), function (data) {
                self.DispatchEvent('widgets.cart.infoUpdate', data);
                goods.sellCost(data.sell_cost);
                goods.sellEndCost(data.sell_end_cost);
            });
        });

        self.AddEvent('CartGoods.clear', function (data) {
            var goodsId = data.goodsId ? data.goodsId : false;
            self.BaseLoad.ClearCart(data.sellerId, goodsId, function (data) {
                self.DispatchEvent('widgets.cart.infoUpdate', data);
            });
        });

        self.AddEvent('CartGoods.empty.cart', function () {
            InsertContainerEmptyCart();
            RenderEmptyCart();
        });
    }

    function Update() {
        self.WidgetLoader(false);
        self.BaseLoad.InfoFavorite('no', function (data) {
            Parameters.cache.favorite = data;
            self.BaseLoad.CartGoods('', function (data) {
                self.DispatchEvent('CartGoods.onload.info', data);
            });
        });
    }

    function InsertContainerEmptyWidget() {
        self.ClearContainer(settings)
    }

    function InsertContainerContent() {
        self.InsertContainer(settings, 'content');
    }

    function InsertContainerEmptyCart() {
        self.InsertContainer(settings, 'empty');
    }

    var fill = {
        Content: function (data) {
            var content = new CartGoodsViewModel(settings);
            for (var j in data) {
                BlockGoodsForSellerViewModel.prototype = new Widget();
                self.cart = new BlockGoodsForSellerViewModel(content, settings);
                for (var key in data[j]) {
                    if (typeof fill[key.charAt(0).toUpperCase() + key.substr(1).toLowerCase()] == 'function')
                        fill[key.charAt(0).toUpperCase() + key.substr(1).toLowerCase()](data[j][key]);
                }
                content.AddContent(self.cart);
            }

            RenderContent(content);
        },
        Goods: function (data) {
            self.cart.AddContent(data);
        },
        Seller: function (data) {
            self.cart.sellerInfo['seller'] = data;
        },
        Shop: function (data) {
            self.cart.sellerInfo['shop'] = data;
        },
        Operator: function (data) {
            self.cart.sellerInfo['operator'] = data;
        },
        Final_cost: function (data) {
            self.cart.finalCost = data;
        }
    };
    function RenderContent(data) {
        self.RenderTemplate(data, settings, null,
            function(data){
                InsertContainerContent();
                RenderContent(data);
            },
            function(){
                InsertContainerEmptyWidget();
            },
            'content'
        );
    }

    function RenderEmptyCart() {
        self.WidgetLoader(true);
        if (settings.animate)
            settings.animate();
    }
};

var CartGoodsViewModel = function () {
    var self = this;
    self.sellerBlock = ko.observableArray();
    self.AddContent = function (data) {
        self.sellerBlock.push(data);
    };
};

var BlockGoodsForSellerViewModel = function (content, settings) {
    var self = this;

    self.sellerInfo = {};
    self.goods = ko.observableArray();
    self.finalCost = 0;
    self.tatalForPayment = ko.computed(function () {
        var total = 0;
        if (self.goods().length > 0) {
            for (var i = 0; i <= self.goods().length - 1; i++) {
                total = total + parseFloat(self.goods()[i].endSum());
            }
        }
        return total.toFixed(2);
    }, this);
    self.totalSum = ko.computed(function () {
        var total = 0;
        if (self.goods().length > 0) {
            for (var i = 0; i <= self.goods().length - 1; i++) {
                total = total + parseFloat(self.goods()[i].sum());
            }
        }

        return total.toFixed(2);
    }, this);
    self.tatalDiscount = ko.computed(function () {
        return (self.totalSum() - self.tatalForPayment()).toFixed(2);
    }, this);
    self.uniq = EventDispatcher.HashCode(new Date().getTime().toString());

    self.AddContent = function (data) {
        for (var i = 0; i <= data.length - 1; i++) {
            BlockCartGoodsSellersViewModel.prototype = new Widget();
            self.goods.push(new BlockCartGoodsSellersViewModel(data[i], self, content, settings));
        }
        self.finalCost = data.final_cost;
    };
    self.comment = ko.observable();
    self.ClickButchFavorites = function () {
        var checkedGoods = [];
        ko.utils.arrayForEach(self.goods(), function (goods) {
            if (goods.isSelected()) {
                checkedGoods.push(goods.id)
                goods.IsFavorite(true);
            }
        });
        self.AddCommentForm(checkedGoods);
    };
    self.AddCommentForm = function (checkedGoods) {
        self.comment(' ');
        $("#dialog-form-batch").dialog({
            height: 300,
            width: 396,
            modal: true,
            buttons: {
                "Сохранить": function () {
                    var checked = [];
                    $.each(checkedGoods, function (i) {
                        checked[i] = checkedGoods[i].id;
                    });
                    DispatchEvent('w.fav.add', {
                        goodsId: checked.join(','),
                        comment: self.comment(),
                        data: checkedGoods
                    });
                    $(this).dialog("close");
                }
            }
        });

    };
    self.ClickButchRemove = function () {
        self.Confirm(settings.message.confirmButchRemove, function () {
            self.Remove();
        });
    };
    self.Remove = function () {
        var checkedGoods = [];
        var removedGoods = [];
        var count = self.goods().length - 1;

        for (var i = 0; i <= count; i++) {
            if (self.goods()[i].isSelected()) {
                checkedGoods.push(self.goods()[i].id);
                removedGoods.push(self.goods()[i]);
            }
        }

        for (var i in removedGoods) {
            self.goods.remove(removedGoods[i]);
        }
        DispatchEvent('CartGoods.clear', {
            goodsId: checkedGoods.join(','),
            sellerId: self.sellerInfo.shop.id
        });

        if (self.goods().length == 0)
            content.sellerBlock.remove(self);
        if (content.sellerBlock().length == 0)
            DispatchEvent('CartGoods.empty.cart');
    };
    self.IsFavorite = function () {

    };
    self.ClickProceed = function () {
        var last = Parameters.cache.lastPage;
        if (last.route != 'cart')
            Routing.SetHash(last.route, last.title, last.data);
        else
            Routing.SetHash('default', 'Домашняя', {});
    };
    self.ClickIssueOrder = function () {
        if (Parameters.cache.userInformation == null || (Parameters.cache.userInformation != null && Parameters.cache.userInformation.err)) {
            Parameters.cache.lastPage = {
                route: 'order',
                title: 'Оформление заказа',
                data: {create: 'fromCart', sellerId: self.sellerInfo.shop.id}
            };
            Routing.SetHash('login', 'Авторизация пользователя', {});
        }
        else {
            Routing.SetHash('order', 'Оформление заказа', {create: 'fromCart', sellerId: self.sellerInfo.shop.id});
        }
    };
    self.ClickClearCurt = function () {
        self.Confirm(settings.message.confirmClearCart, function () {
            var count = self.goods().length - 1;
            var removedGoods = [];
            for (var i = 0; i <= count; i++) {
                removedGoods.push(self.goods()[i]);
            }
            ;
            for (var i in removedGoods) {
                self.goods.remove(removedGoods[i]);
            }
            content.sellerBlock.remove(self);
            DispatchEvent('CartGoods.clear', {sellerId: self.sellerInfo.shop.id});
            if (content.sellerBlock().length == 0)
                DispatchEvent('CartGoods.empty.cart');
        });
    };

    self.cssSelectAll = "cartGoodsSelectAll_" + self.uniq;
    self.isSelectedAll = ko.observable(false);
    self.isSelectedAll.subscribe(function (check) {
        ko.utils.arrayForEach(self.goods(), function (goods) {
            $('#' + goods.cssCheckboxGoods())[0].checked = check;
            goods.isSelected(check);
        });
    });
    self.ClickSelectAll = function (block) {
        var all = $('#' + self.cssSelectAll);
        var check = all.is(':checked');
        var val;
        if (check) {
            all[0].checked = false;
            val = false;
        }
        else {
            all[0].checked = true;
            val = true;
        }

        ko.utils.arrayForEach(self.goods(), function (goods) {
            $('#' + goods.cssCheckboxGoods())[0].checked = val;
            goods.isSelected(val);
        });
    }
    self.isDisabledButton = ko.computed(function () {
        var countGoods = self.goods().length;
        var selectedGoods = [];

        for (var i = 0; i <= countGoods - 1; i++) {
            if (self.goods()[i].isSelected())
                selectedGoods.push(self.goods()[i].id);
        }

        if (selectedGoods.length > 0)
            return false;
        return true;
    }, this);

    function DispatchEvent(event, data){
        EventDispatcher.DispatchEvent(event, data);
    }
};

var BlockCartGoodsSellersViewModel = function (data, block, content, settings) {
    var self = this;
    self.sellerId = block.sellerInfo.seller.id;
    self.id = data.id;
    self.fullName = data.full_name;
    self.countReserv = data.count_reserv;
    self.count = data.count;
    self.sellCost = ko.observable(data.sell_cost);
    self.sellEndCost = ko.observable(data.sell_end_cost);
    self.routeImages = data.route_image;
    self.routeBigImages = data.route_big_image;
    self.ordered = ko.observable(self.count);
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
    self.isSelected = ko.observable(false);
    self.isSelected.subscribe(function (check) {
        var countGoods = block.goods().length;
        var selectedGoods = [];

        for (var i = 0; i <= countGoods - 1; i++) {
            if (block.goods()[i].isSelected())
                selectedGoods.push(block.goods()[i].id);
        }
        if (selectedGoods.length < countGoods)
            $('#' + block.cssSelectAll)[0].checked = false;
        else
            $('#' + block.cssSelectAll)[0].checked = true;
    });
    self.cssCheckboxGoods = ko.observable('goods_' + self.id);
    self.ClickOrder = function (order, elem) {
        var $checkBox = $('#' + order.cssCheckboxGoods());
        var isChecked = $checkBox.is(':checked');
        if (isChecked == false) {
            $checkBox[0].checked = true;
            self.isSelected(true);
        }
        else {
            $checkBox[0].checked = false;
            self.isSelected(false);
        }
    }
    self.discount = ko.computed(function () {
        var d = 100 - Math.floor(self.sellEndCost() * 100 / self.sellCost());
        if (d > 0)
            return d + '%';
        else
            return 0;
    }, this);
    self.comment = ko.observable();
    self.ClickPlus = function () {
        if (self.ordered() < self.countReserv) {
            self.ordered(self.ordered() + 1);
            DispatchEvent('CartGoods.change.count', self);
        }
        else
            self.ShowMessage(settings.message.maxIsReached, false, false);
    };
    self.ClickMinus = function () {
        if (self.ordered() > 0) {
            self.ordered(self.ordered() - 1);
            DispatchEvent('CartGoods.change.count', self);
        }
    };
    self.ClickGoods = function () {
        Routing.SetHash('goods', self.fullName, {id: self.id});
    };
    self.AddFavorites = function () {
        if (Parameters.cache.userInformation != null && !Parameters.cache.userInformation.err)
            self.AddCommentForm();
        else
            self.ShowMessage(settings.message.pleaseLogIn, false, false);
    };
    self.ClickFavorites = function () {
        Routing.SetHash('favorites', 'Избранное', {});
    };
    self.ClickRemove = function () {
        self.Confirm(settings.message.confirmRemove, function () {
            self.Remove();
        });
    };
    self.Remove = function () {
        DispatchEvent('CartGoods.clear', {goodsId: self.id, sellerId: self.sellerId});
        RemoveGoods();
    };
    self.AddCommentForm = function () {
        block.comment(' ');
        $("#dialog-form-batch").dialog({
            height: 300,
            width: 396,
            modal: true,
            buttons: {
                "Сохранить": function () {
                    DispatchEvent('w.fav.add', {
                        goodsId: self.id,
                        comment: block.comment(),
                        data: self
                    });
                    self.IsFavorite(true);
                    $(this).dialog("close");
                }
            }
        });
    };
    self.IsFavorite = ko.observable();

    if ($.inArray(self.id, Parameters.cache.favorite) >= 0)
        self.IsFavorite(true)
    else
        self.IsFavorite(false)

    function RemoveGoods() {
        block.goods.remove(self);
        if (block.goods().length == 0) {
            content.sellerBlock.remove(block);
            if (content.sellerBlock().length == 0) {
                DispatchEvent('CartGoods.empty.cart');
            }
        }
    }

    AddEvent('CartGoods.clear.cartInfo.' + self.sellerId + '.' + self.id, function () {
        RemoveGoods();
    });

    AddEvent('CartGoods.change.cartInfo.' + self.sellerId + '.' + self.id, function (count) {
        self.ordered(count);
    });

    function AddEvent(name, callback){
        EventDispatcher.AddEventListener(name, callback);
    }

    function DispatchEvent(name, data){
        EventDispatcher.DispatchEvent(name, data);
    }
};


var TestCartGoods = {
    Init: function () {
        if (typeof Widget == 'function') {
            CartGoodsWidget.prototype = new Widget();
            var cartGoods = new CartGoodsWidget();
            cartGoods.Init(cartGoods);
        }
        else {
            setTimeout(function () {
                TestCartGoods.Init()
            }, 100);
        }
    }
}

TestCartGoods.Init();
