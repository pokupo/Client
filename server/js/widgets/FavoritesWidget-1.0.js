var FavoritesWidget = function() {
    var self = this;
    self.widgetName = 'FavoritesWidget';
    self.version = 1.0;
    self.minWidgetVersion = 1.0;
    self.maxWidgetVersion = 2.0;
    self.minTmplVersion = 1.0;
    self.maxTmplVersion = 2.0;
    self.favorites = null;
    self.settings = {
        tmpl : {
            path: null,
            id : {
                content : null,
                empty : null
            }
        },
        showBlocks : null,
        inputParameters: {},
        style: null,
        containerId: null,
        customContainer: null
    };
    self.InitWidget = function() {
        self.settings.containerId = Config.Containers.favorites.widget;
        self.settings.customContainer = Config.Containers.favorites.customClass;
        self.settings.tmpl = Config.Favorites.tmpl;
        self.settings.showBlocks = Config.Favorites.showBlocks;
        self.settings.style = Config.Favorites.style;
        self.RegisterEvents();
        self.SetInputParameters();
        self.CheckRouteFavorites();
        self.SetPosition();
    };
    self.SetInputParameters = function() {
        var input = {};
        if(Config.Base.sourceParameters == 'string'){
            var temp = JSCore.ParserInputParameters(/FavoritesWidget/);
            if(temp.favorites){
                input = temp.favorites;
            }
        }
        if(Config.Base.sourceParameters == 'object' && typeof WParameters !== 'undefined' && WParameters.favorites){
            input = WParameters.favorites;
        }
        
        if(!$.isEmptyObject(input)){
            if (input.show) {
                for (var i = 0; i <= self.settings.showBlocks.length - 1; i++) {
                    if ($.inArray(self.settings.showBlocks[i], input.show) < 0)
                       self.settings.showBlocks.splice(self.settings.showBlocks.indexOf(self.settings.showBlocks[i]), 1);
                }
            }
        }
        self.settings.inputParameters = input;
    };
    self.CheckRouteFavorites = function() {
        if (Routing.route == 'favorites') {
            self.BaseLoad.Login(false, false, false, function(data){
                if(!data.err){
                    self.BaseLoad.Tmpl(self.settings.tmpl, function(){
                        self.Update.Menu();
                        self.Update.Content();
                    });
                }
                else{
                    Parameters.cache.lastPage = Parameters.cache.history[Parameters.cache.history.length-1];
                    Routing.SetHash('login', 'Авторизация пользователя', {});
                    self.WidgetLoader(true);
                }  
            });
        }
        else {
            self.WidgetLoader(true);
        }
    };
    self.RegisterEvents = function() {
        EventDispatcher.AddEventListener('widget.change.route', function() {
            self.CheckRouteFavorites();
        });
        
        EventDispatcher.AddEventListener('Favorites.empty', function() {
            self.InsertContainer.EmptyFaforites();
            self.Render.EmptyFaforites();
        });
        
        EventDispatcher.AddEventListener('Favorites.clear.one', function(opt) {
            var str = '?idGoods=' + opt.goods.id;
            self.BaseLoad.ClearFavorite(str, function(data){
                if(data.result == 'ok'){
                    self.ShowMessage(Config.Favorites.message.clearGoods,function(){
                        opt.block.goods.remove(opt.goods);
                        if(opt.block.goods().length == 0){
                            opt.content.content.remove(opt.block);
                            if(opt.content.content().length == 0){
                                EventDispatcher.DispatchEvent('Favorites.empty'); 
                            }
                        }
                    }, false);
                }
                else{
                    if(!data.err)
                        data.err = Config.Favorites.message.failClearGoods;
                    self.QueryError(data, function(){EventDispatcher.DispatchEvent('Favorites.clear', opt)})
                }
            })
        });
        
        EventDispatcher.AddEventListener('Favorites.clear.all', function(opt) {
            var str = '?idGoods=' + opt.ids;
            self.BaseLoad.ClearFavorite(str, function(data){
                if(data.result == 'ok'){
                    self.ShowMessage(Config.Favorites.message.clearGoods,function(){
                        for(var i in opt.goods){
                            opt.block.goods.remove(opt.goods[i]);
                        }

                        if(opt.block.goods().length == 0)
                            opt.content.content.remove(opt.block);
        
                        if(opt.content.content().length == 0)
                            EventDispatcher.DispatchEvent('Favorites.empty'); 
                    }, false);
                }
                else{
                    if(!data.err)
                        data.err = Config.Favorites.message.failClearGoods;
                    self.QueryError(data, function(){EventDispatcher.DispatchEvent('Favorites.clear', opt)})
                }
            })
        });
    }
    self.Update = {
        Content : function(){
            self.WidgetLoader(false);
            self.BaseLoad.InfoFavorite('yes', function(data){
                if(!data.err){
                    self.InsertContainer.Content();
                    self.Fill.Content(data);
                }
                else{
                    self.InsertContainer.EmptyFaforites();
                    self.Render.EmptyFaforites();
                }
            });
        },
        Menu : function(){
            Loader.Indicator('MenuPersonalCabinetWidget', false);
            self.BaseLoad.Script('widgets/MenuPersonalCabinetWidget-1.0.js', function(){
                EventDispatcher.DispatchEvent('widget.onload.menuPersonalCabinet');
            });
        },
    };
    self.InsertContainer = {
        EmptyWidget : function(){
            var temp = $("#" + self.settings.containerId).find(self.SelectCustomContent().join(', ')).clone();
            $("#" + self.settings.containerId).empty().html(temp);
        },
        Content : function(){
            self.InsertContainer.EmptyWidget();
            $("#" + self.settings.containerId).append($('script#' + self.GetTmplName('content')).html()).children().hide();
        },
        EmptyFaforites :function(){
            self.InsertContainer.EmptyWidget();
            $("#" + self.settings.containerId).append($('script#' + self.GetTmplName('empty')).html()).children().hide();
        }
    };
    self.Fill =  {
        Content : function(data){
            var content = new FavoritesViewModel();
            for(var j in data){
                BlockFavoritesForSellerViewModel.prototype = new Widget();
                self.favorites = new BlockFavoritesForSellerViewModel(content);
                for(var key in data[j]){
                    if(typeof self.Fill[key.charAt(0).toUpperCase() + key.substr(1).toLowerCase()] == 'function')
                        self.Fill[key.charAt(0).toUpperCase() + key.substr(1).toLowerCase()](data[j][key]);
                }
                content.AddContent(self.favorites);
            }

            self.Render.Content(content);
        },
        Goods : function(data){
            self.favorites.AddContent(data);
        },
        Seller : function(data){
            self.favorites.sellerInfo['seller'] = data;
        },
        Shop : function(data){
            self.favorites.sellerInfo['shop'] = data;
        },
        Operator : function(data){
            self.favorites.sellerInfo['operator'] = data;
        },
        Final_cost : function(data){
            self.favorites.finalCost = data;
        }
    };
    self.Render = {
        Content : function(data){
            if($("#" + self.settings.containerId).length > 0){
                try{
                    ko.applyBindings(data, $("#" + self.settings.containerId)[0]);
                    self.WidgetLoader(true, self.settings.containerId);
                }
                catch(e){
                    self.Exeption('Ошибка шаблона [' + self.GetTmplName('content') + ']');
                    if(self.settings.tmpl.custom){
                        delete self.settings.tmpl.custom;
                        self.BaseLoad.Tmpl(self.settings.tmpl, function(){
                            self.InsertContainer.Content();
                            self.Render.Content(data);
                        });
                    }
                    else{
                        self.InsertContainer.EmptyWidget();
                        self.WidgetLoader(true, self.settings.containerId);
                    }
                }
            }
        },
        EmptyFaforites : function(){
            self.WidgetLoader(true, self.settings.containerId);
        }
    };
    self.SetPosition = function() {
        if (self.settings.inputParameters['position'] == 'absolute') {
            for (var key in self.settings.inputParameters) {
                if (self.settings.style[key])
                    self.settings.style[key] = self.settings.inputParameters[key];
            }
            $().ready(function() {
                if ($('#' + self.settings.containerId).length > 0)
                    $('#' + self.settings.containerId).css(self.settings.style);
            });
        }
    };
};

var FavoritesViewModel = function(){
    var self = this;
    self.content = ko.observableArray();
    self.AddContent = function(data){
        self.content.push(data);
    };
};

var BlockFavoritesForSellerViewModel = function(content){
    var self = this;

    self.sellerInfo = {};
    self.showSellerInfo = ko.computed(function(){
        if($.inArray('infoShop', Config.Favorites.showBlocks) >= 0)
            return true;
        return false;
    }, this);
    self.goods = ko.observableArray();

    self.uniq = EventDispatcher.GetUUID();
    self.cssSelectAll = "favoritesSelectAll_" + self.uniq;
    self.isChecked = ko.observable(false);
    
    self.AddContent = function(data){
        for(var i = 0; i <= data.length-1; i++){
           BlockFavoritesGoodsSellersViewModel.prototype = new Widget();
           self.goods.push(new BlockFavoritesGoodsSellersViewModel(data[i], self, content));
        }
        self.finalCost = data.final_cost;
    };
    self.ClickButchRemove = function(){
        self.Confirm(Config.Favorites.message.confirmButchRemove, function(){
            var checkedGoods = [];
            var removedGoods = [];
            var count = self.goods().length-1;

            for(var i = 0; i <= count; i++) {
                if(self.goods()[i].isSelected()){
                  checkedGoods.push(self.goods()[i].id);
                  removedGoods.push(self.goods()[i]);
                }
            };

            EventDispatcher.DispatchEvent('Favorites.clear.all', {ids:checkedGoods, goods:removedGoods, content:content, block:self});
        })
    };
    self.ClickClearFavorites = function(){
        self.Confirm(Config.Favorites.message.confirmClearFavorites, function(){
            var count = self.goods().length-1;
            var removedGoods = [];
            var removedGoodsIds = [];
            for(var i = 0; i <= count; i++) {
                  removedGoods.push(self.goods()[i]);
                  removedGoodsIds.push(self.goods()[i].id);
            };
            var ids = removedGoodsIds.join(',');

            EventDispatcher.DispatchEvent('Favorites.clear.all', {ids:ids, goods:removedGoods, content:content, block:self});
        });
    };
    self.ClickSelectAll = function(block){
        var check = $('#' + self.cssSelectAll).is(':checked');
        ko.utils.arrayForEach(self.goods(), function(goods) {
            goods.isSelected(check);
        });
    }
    self.DisabledButton = ko.computed(function(){
        var countGoods = self.goods().length;
        var selectedGoods = [];
        
        for(var i = 0; i <= countGoods-1; i++) {
            if(self.goods()[i].isSelected())
              selectedGoods.push(self.goods()[i].id);
        };
        if(selectedGoods.length > 0)
            return true;
        return false;
    }, this);
};

var BlockFavoritesGoodsSellersViewModel = function(data, block, content){
    var self = this;
    self.sellerId = block.sellerInfo.seller.id;
    self.uniq = EventDispatcher.HashCode(new Date().getTime().toString() + '-' + self.id);
    self.cssToCart = 'goodsToCart_' + self.uniq;
    self.cssTitleToCart = 'goodsTilteToCart_' + self.uniq;
    self.id = data.id;
    self.fullName = data.full_name;
    self.sellCost = ko.observable(data.sell_cost);
    self.sellEndCost = ko.observable(data.sell_end_cost);
    self.routeImages = Parameters.pathToImages + data.route_image;
    self.isSelected = ko.observable(false);
    self.showAddToCart = ko.computed(function(){
        if($.inArray('addToCart', Config.Favorites.showBlocks) >= 0)
            return true;
        return false;
    }, this);
    
    self.AddToCart = function(){
        EventDispatcher.DispatchEvent('widgets.cart.addGoods', {goodsId : self.id, hash : self.uniq})
    };
    self.showBuy = ko.computed(function(){
        if($.inArray('buy', Config.Favorites.showBlocks) >= 0)
            return true;
        return false;
    }, this);
    self.Buy = function(){
        Routing.SetHash('order', 'Оформление заказа', {create: 'directly', sellerId: self.sellerId, goodsId: self.id, count: 1});
    };
    self.ClickGoods = function(){
        Routing.SetHash('goods', self.fullName, {id : self.id});
    };
    self.ClickRemove = function(){
        self.Confirm(Config.Favorites.message.confirmRemove, function(){
            EventDispatcher.DispatchEvent('Favorites.clear.one', {goods:self, block:block, content:content});
        });
    };
};

var TestFavorites = {
    Init : function(){
        if(typeof Widget == 'function'){
            FavoritesWidget.prototype = new Widget();
            var favorites = new FavoritesWidget();
            favorites.Init(favorites);
        }
        else{
            setTimeout(function(){TestFavorites.Init()}, 100);
        }
    }
}

TestFavorites.Init();


