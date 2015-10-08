var FavoritesWidget = function () {
    var self = this;
    self.widgetName = 'FavoritesWidget';
    self.version = 1.0;
    self.minWidgetVersion = 1.0;
    self.maxWidgetVersion = 2.0;
    self.minTmplVersion = 1.0;
    self.maxTmplVersion = 2.0;
    self.favorites = null;
    self.InitWidget = InitWidget;

    var settings = {
        container: {widget: 'content', def: 'defaultFavoritesWidgetId'},
        title : 'Избранное',
        tmpl : {
            path : "favoritesTmpl.html", // файл шаблонов
            id: {
                content: "favoritesTmpl",//id шаблона формы авторизации
                empty : "emptyFavoritesTmpl"
            }
        },
        showBlocks : ['infoShop','addToCart','buy'],
        message :{
            clearGoods : 'Выбранные товары удалены из избранного.',
            failClearGoods : 'Произошла ошибка при удалении товара из избранного. Попробуйте еще раз.',
            confirmButchRemove : 'Вы уверены, что хотите удалить выбранный товар из избранного?',
            confirmRemove : 'Вы уверены что хотите удалить товар из избранного?',
            confirmClearFavorites : "Вы уверены, что хотите очистить избранное от товаров?"
        },
        animate: typeof AnimateFavorite == 'function' ? AnimateFavorite : null
    };
    function InitWidget() {
        RegisterEvents();
        SetInputParameters();
        CheckRouteFavorites();
    }

    function SetInputParameters() {
        var input = self.GetInputParameters('favorites');

        if (!$.isEmptyObject(input)) {
            settings = self.UpdateSettings1(settings, input);
            if (input.show) {
                for (var i = 0; i <= settings.showBlocks.length - 1; i++) {
                    if ($.inArray(settings.showBlocks[i], input.show) < 0)
                        settings.showBlocks.splice(settings.showBlocks.indexOf(settings.showBlocks[i]), 1);
                }
            }
        }

        Config.Favorites = settings;
    }

    function CheckRouteFavorites() {
        if (Routing.route == 'favorites') {
            self.BaseLoad.Login(false, false, false, function (data) {
                if (!data.err) {
                    self.BaseLoad.Tmpl(settings.tmpl, function () {
                        UpdateMenu();
                        UpdateContent();
                    });
                }
                else {
                    Parameters.cache.lastPage = Parameters.cache.history[Parameters.cache.history.length - 1];
                    Routing.SetHash('login', 'Авторизация пользователя', {});
                    self.WidgetLoader(true);
                }
            });
        }
        else
            self.WidgetLoader(true);
    }

    function RegisterEvents() {
        self.AddEvent('w.change.route', function () {
            CheckRouteFavorites();
        });

        self.AddEvent('Favorites.empty', function () {
            InsertContainerEmptyFaforites();
            RenderEmptyFaforites();
        });

        self.AddEvent('Favorites.clear.one', function (opt) {
            var str = '?idGoods=' + opt.goods.id;
            self.BaseLoad.ClearFavorite(str, function (data) {
                if (data.result == 'ok') {
                    self.ShowMessage(settings.message.clearGoods, function () {
                        opt.block.goods.remove(opt.goods);
                        if (opt.block.goods().length == 0) {
                            opt.content.content.remove(opt.block);
                            if (opt.content.content().length == 0) {
                                self.DispatchEvent('Favorites.empty');
                            }
                        }
                    }, false);
                }
                else {
                    if (!data.err)
                        data.err = settings.message.failClearGoods;
                    self.QueryError(data, function () {
                        self.DispatchEvent('Favorites.clear.one', opt)
                    })
                }
            })
        });

        self.AddEvent('Favorites.clear.all', function (opt) {
            var str = '?idGoods=' + opt.ids;
            self.BaseLoad.ClearFavorite(str, function (data) {
                if (data.result == 'ok') {
                    self.ShowMessage(settings.message.clearGoods, function () {
                        for (var i in opt.goods) {
                            opt.block.goods.remove(opt.goods[i]);
                        }

                        if (opt.block.goods().length == 0)
                            opt.content.content.remove(opt.block);

                        if (opt.content.content().length == 0)
                            self.DispatchEvent('Favorites.empty');
                    }, false);
                }
                else {
                    if (!data.err)
                        data.err = settings.message.failClearGoods;
                    self.QueryError(data, function () {
                        self.DispatchEvent('Favorites.clear.all', opt)
                    })
                }
            })
        });
    }

    function UpdateContent() {
        self.WidgetLoader(false);
        self.BaseLoad.InfoFavorite('yes', function (data) {
            if (!data.err) {
                InsertContainerContent();
                fill.Content(data);
            }
            else {
                InsertContainerEmptyFaforites();
                RenderEmptyFaforites();
            }
        });
    }

    function UpdateMenu() {
        self.BaseLoad.Script(PokupoWidgets.model.menu, function () {
            self.DispatchEvent('w.onload.menu', {menu: {}, active: ''});
        });
    }


    function InsertContainerEmptyWidget() {
        self.ClearContainer(settings);
    }

    function InsertContainerContent() {
        self.InsertContainer(settings, 'content');
    }

    function InsertContainerEmptyFaforites() {
        self.InsertContainer(settings, 'empty');
    }

    var fill = {
        Content: function (data) {
            var content = new FavoritesViewModel();
            for (var j in data) {
                BlockFavoritesForSellerViewModel.prototype = new Widget();
                self.favorites = new BlockFavoritesForSellerViewModel(content, settings);
                for (var key in data[j]) {
                    if (typeof fill[key.charAt(0).toUpperCase() + key.substr(1).toLowerCase()] == 'function')
                        fill[key.charAt(0).toUpperCase() + key.substr(1).toLowerCase()](data[j][key]);
                }
                content.AddContent(self.favorites);
            }

            RenderContent(content);
        },
        Goods: function (data) {
            self.favorites.AddContent(data);
        },
        Seller: function (data) {
            self.favorites.sellerInfo['seller'] = data;
        },
        Shop: function (data) {
            self.favorites.sellerInfo['shop'] = data;
        },
        Operator: function (data) {
            self.favorites.sellerInfo['operator'] = data;
        },
        Final_cost: function (data) {
            self.favorites.finalCost = data;
        }
    }

    function RenderContent(data) {
        self.RenderTemplate(data, settings, null,
            function(data){
                InsertContainerContent();
                RenderContent(data);
            },
            function(){
                InsertContainerEmptyWidget();
            }
        );
    }

    function RenderEmptyFaforites() {
        self.WidgetLoader(true, settings.container.widget);
        if (settings.animate)
            settings.animate();
    }
};

var FavoritesViewModel = function () {
    var self = this;
    self.content = ko.observableArray();
    self.AddContent = function (data) {
        self.content.push(data);
    };
};

var BlockFavoritesForSellerViewModel = function (content, settings) {
    var self = this;

    self.sellerInfo = {};
    self.showSellerInfo = ko.computed(function () {
        if ($.inArray('infoShop', settings.showBlocks) >= 0)
            return true;
        return false;
    }, this);
    self.goods = ko.observableArray();

    self.uniq = EventDispatcher.GetUUID();
    self.cssSelectAll = "cartGoodsSelectAll_" + self.uniq;
    self.isSelectedAll = ko.observable(false);
    self.isSelectedAll.subscribe(function (check) {
        ko.utils.arrayForEach(self.goods(), function (goods) {
            $('#' + goods.cssCheckboxGoods)[0].checked = check;
            goods.isSelected(check);
        });
    });
    self.ClickSelectAll = function () {
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
            $('#' + goods.cssCheckboxGoods)[0].checked = val;
            goods.isSelected(val);
        });
    }

    self.AddContent = function (data) {
        for (var i = 0; i <= data.length - 1; i++) {
            BlockFavoritesGoodsSellersViewModel.prototype = new Widget();
            self.goods.push(new BlockFavoritesGoodsSellersViewModel(data[i], self, content, settings));
        }
        self.finalCost = data.final_cost;
    };
    self.ClickButchRemove = function () {
        self.Confirm(settings.message.confirmButchRemove, function () {
            var checkedGoods = [];
            var removedGoods = [];
            var count = self.goods().length - 1;

            for (var i = 0; i <= count; i++) {
                if (self.goods()[i].isSelected()) {
                    checkedGoods.push(self.goods()[i].id);
                    removedGoods.push(self.goods()[i]);
                }
            }

            DispatchEvent('Favorites.clear.all', {
                ids: checkedGoods,
                goods: removedGoods,
                content: content,
                block: self
            });
        })
    };
    self.ClickClearFavorites = function () {
        self.Confirm(settings.message.confirmClearFavorites, function () {
            var count = self.goods().length - 1;
            var removedGoods = [];
            var removedGoodsIds = [];
            for (var i = 0; i <= count; i++) {
                removedGoods.push(self.goods()[i]);
                removedGoodsIds.push(self.goods()[i].id);
            }
            ;
            var ids = removedGoodsIds.join(',');

            DispatchEvent('Favorites.clear.all', {
                ids: ids,
                goods: removedGoods,
                content: content,
                block: self
            });
        });
    };
    self.DisabledButton = ko.computed(function () {
        var countGoods = self.goods().length;
        var selectedGoods = [];

        for (var i = 0; i <= countGoods - 1; i++) {
            if (self.goods()[i].isSelected())
                selectedGoods.push(self.goods()[i].id);
        }

        if (selectedGoods.length > 0)
            return true;
        return false;
    }, this);

    function DispatchEvent(name, data){
        EventDispatcher.DispatchEvent(name, data);
    }
};

var BlockFavoritesGoodsSellersViewModel = function (data, block, content, settings) {
    var self = this;
    self.sellerId = block.sellerInfo.seller.id;
    self.uniq = EventDispatcher.HashCode(new Date().getTime().toString() + '-' + self.id);
    self.cssToCart = 'goodsToCart_' + self.uniq;
    self.cssTitleToCart = 'goodsTilteToCart_' + self.uniq;
    self.id = data.id;
    self.fullName = data.full_name;
    self.sellCost = ko.observable(data.sell_cost);
    self.sellEndCost = ko.observable(data.sell_end_cost);
    self.routeImages = data.route_image;
    self.routeBigImages = data.route_big_image;
    self.isSelected = ko.observable(false);
    self.isSelected.subscribe(function (check) {
        var countGoods = block.goods().length;
        var selectedGoods = [];

        for (var i = 0; i <= countGoods - 1; i++) {
            if (block.goods()[i].isSelected())
                selectedGoods.push(block.goods()[i].id);
        }
        ;
        if (selectedGoods.length < countGoods)
            $('#' + block.cssSelectAll)[0].checked = false;
        else
            $('#' + block.cssSelectAll)[0].checked = true;
    });
    self.cssCheckboxGoods = 'goods_' + self.id;
    self.ClickOrder = function () {
        var checkBox = $('#' + self.cssCheckboxGoods);
        var isChecked = checkBox.is(':checked');
        if (isChecked == false) {
            checkBox[0].checked = true;
            self.isSelected(true);
        }
        else {
            checkBox[0].checked = false;
            self.isSelected(false);
        }
    }
    self.showAddToCart = ko.computed(function () {
        if ($.inArray('addToCart', settings.showBlocks) >= 0)
            return true;
        return false;
    }, this);

    self.AddToCart = function () {
        DispatchEvent('w.cart.add', {goodsId: self.id, hash: self.uniq})
    };
    self.showBuy = ko.computed(function () {
        if ($.inArray('buy', settings.showBlocks) >= 0)
            return true;
        return false;
    }, this);
    self.Buy = function () {
        Routing.SetHash('order', 'Оформление заказа', {
            create: 'directly',
            sellerId: self.sellerId,
            goodsId: self.id,
            count: 1
        });
    };
    self.ClickGoods = function () {
        Routing.SetHash('goods', self.fullName, {id: self.id});
    };
    self.ClickRemove = function () {
        self.Confirm(settings.message.confirmRemove, function () {
            DispatchEvent('Favorites.clear.one', {goods: self, block: block, content: content});
        });
    };

    function DispatchEvent(name, data){
        EventDispatcher.DispatchEvent(name, data);
    }
};

var TestFavorites = {
    Init: function () {
        if (typeof Widget == 'function') {
            FavoritesWidget.prototype = new Widget();
            var favorites = new FavoritesWidget();
            favorites.Init(favorites);
        }
        else {
            setTimeout(function () {
                TestFavorites.Init()
            }, 100);
        }
    }
}

TestFavorites.Init();


