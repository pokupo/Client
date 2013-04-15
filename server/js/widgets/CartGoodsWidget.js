var CartGoodsWidget = function(){
    var self = this;
    self.widgetName = 'CartGoodsWidget';
    self.cart = null;
    self.settings = {
        tmplPath : null,
        cartTmplId : null,
        emptyCartTmplId : null,
        inputParameters : {},
        style : null,
        containerId : null,
    };
    self.InitWidget = function(){
        self.settings.containerId = Config.Containers.cartGoods;
        self.settings.tmplPath = Config.CartGoods.tmpl.path;
        self.settings.cartTmplId = Config.CartGoods.tmpl.cartTmplId;
        self.settings.emptyCartTmplId = Config.CartGoods.tmpl.emptyCartTmplId;
        self.settings.style = Config.CartGoods.style;
        self.RegisterEvents();
        self.SetInputParameters();
        self.SetPosition();
    };
    self.SetInputParameters = function(){
        self.settings.inputParameters = JSCore.ParserInputParameters(/CartGoodsWidget.js/);
        if(self.settings.inputParameters['params']){
            var input = JSON.parse(self.settings.inputParameters['params']);
            self.settings.inputParameters = input;
            if(input.show){
                for(var i = 0; i <= input.show.length-1; i++){
                    if($.inArray(input.show[i], self.settings.showBlocks) < 0)
                        self.settings.showBlocks.push(input.show[i]);
                }
            }
            if(input.hide){
                for(var i = 0; i <= input.hide.length-1; i++){
                    var test = $.inArray(input.hide[i], self.settings.showBlocks);
                    if(test > 0){
                        self.settings.showBlocks.splice(test, 1);
                    }
                }
            }
            if(input.tmpl){
                self.settings.tmplPath = 'cartGoods/' + input.tmpl + '.html';
            }
        }
    };
    self.CheckRoute = function(){
        if(Routing.route == 'cart'){
            self.Update();
        }
        else{
            self.WidgetLoader(true);
        }
    };
    self.RegisterEvents = function(){ 
        if(JSLoader.loaded){
            self.BaseLoad.Tmpl(self.settings.tmplPath, function(){
                 self.CheckRoute();
            });
        }
        else{
            EventDispatcher.AddEventListener('onload.scripts', function (data){
                self.BaseLoad.Tmpl(self.settings.tmplPath, function(){
                     self.CheckRoute();
                });
            });
        }
        
        EventDispatcher.AddEventListener('widget.change.route', function (){
            if(Routing.route == 'cart'){
                self.Update();
            }
        });
        
        EventDispatcher.AddEventListener('CartGoods.onload.info', function (data){
            if(!data.err){
                self.InsertContainer.Content();
                self.Fill.Content(data);
            }
            else{
                self.InsertContainer.EmptyCart();
                self.Render.EmptyCart();
            }
        });
        
        EventDispatcher.AddEventListener('CartGoods.change.count', function(goods){
            self.BaseLoad.AddGoodsToCart(goods.goodsId, goods.sellerId, goods.count, function(data){
                 EventDispatcher.DispatchEvent('widgets.cart.infoUpdate', data);
                 goods.sellCost = data.sell_cost;
                 goods.sellEndCost = data.sell_end_cost;
            });
        });
        
        EventDispatcher.AddEventListener('CartGoods.clear', function(data){
            var goodsId = data.goodsId ? data.goodsId : false;
            self.BaseLoad.ClearCart(data.sellerId, goodsId, function(data){
                 EventDispatcher.DispatchEvent('widgets.cart.infoUpdate', data);
            });
        });
        
        EventDispatcher.AddEventListener('CartGoods.empty.cart', function(){
            self.InsertContainer.EmptyCart();
            self.Render.EmptyCart();
        });
    };
    self.Update = function(){
        self.WidgetLoader(false);
        $("#" + self.settings.containerId).html('');
        self.BaseLoad.CartGoods('', function(data){
            EventDispatcher.DispatchEvent('CartGoods.onload.info', data);
        });
    };
    self.InsertContainer = {
        Content : function(){
            $("#" + self.settings.containerId).empty().append($('script#' + self.settings.cartTmplId).html());
        },
        EmptyCart :function(){
            $("#" + self.settings.containerId).empty().append($('script#' + self.settings.emptyCartTmplId).html());
        }
    };
    self.Fill =  {
        Content : function(data){
            var content = new CartGoodsViewModel();
            for(var j in data){
                self.cart = new BlockGoodsForSellerViewModel(content);
                for(var key in data[j]){
                    if(typeof self.Fill[key.charAt(0).toUpperCase() + key.substr(1).toLowerCase()] == 'function')
                        self.Fill[key.charAt(0).toUpperCase() + key.substr(1).toLowerCase()](data[j][key]);
                }
                content.AddContent(self.cart);
            }

            self.Render.Content(content);
        },
        Goods : function(data){
            self.cart.AddContent(data);
        },
        Seller : function(data){
            self.cart.sellerInfo['seller'] = data;
        },
        Shop : function(data){
            self.cart.sellerInfo['shop'] = data;
        },
        Operator : function(data){
            self.cart.sellerInfo['operator'] = data;
        },
        Аinal_cost : function(data){
            self.cart.finalCost = data;
        }
    };
    self.Render = {
        Content : function(data){
            if($("#" + self.settings.containerId).length > 0){
                if(Config.Containers.catalog)
                       $("#" + Config.Containers.catalog).hide();
                $("#wrapper").removeClass("with_sidebar").addClass("with_top_border");
                ko.applyBindings(data, $("#" + self.settings.containerId)[0]);
            }
            self.WidgetLoader(true);
        },
        EmptyCart : function(){
            if($("#" + self.settings.containerId).length > 0){
                if(Config.Containers.catalog)
                       $("#" + Config.Containers.catalog).hide();
                $("#wrapper").removeClass("with_sidebar").addClass("with_top_border");
            }
            self.WidgetLoader(true);
        }
    };
    self.SetPosition = function(){
        if(self.settings.inputParameters['position'] == 'absolute'){
            for(var key in self.settings.inputParameters){
                if(self.settings.style[key])
                    self.settings.style[key] = self.settings.inputParameters[key];
            }
            $().ready(function(){
                $('#' + self.settings.containerId).css(self.settings.style);
            });
        }
    };
};

var CartGoodsViewModel = function(){
    var self = this;
    self.content = ko.observableArray();
    self.AddContent = function(data){
        self.content.push(data);
    };
};

var BlockGoodsForSellerViewModel = function(content){
    var self = this;

    self.sellerInfo = {};
    self.goods = ko.observableArray();
    self.finalCost = 0;
    self.tatalForPayment = ko.computed(function(){
        var total = 0;
        if(self.goods().length > 0){
            for(var i = 0; i <= self.goods().length-1; i++){
                total = total + parseFloat(self.goods()[i].endSum());
            }
        }
        return total.toFixed(2);
    }, this);
    self.totalSum = ko.computed(function(){
        var total = 0;
        if(self.goods().length > 0){
            for(var i = 0; i <= self.goods().length-1; i++){
                total = total + parseFloat(self.goods()[i].sum());
            }
        }
        
        return total.toFixed(2);
    }, this);
    self.tatalDiscount = ko.computed(function(){
        return (self.totalSum() - self.tatalForPayment()).toFixed(2);
    }, this);
    self.cssSelectAll = "cartGoodsSelectAll";
    self.isChecked = ko.observable(false);
    
    self.AddContent = function(data){
        for(var i = 0; i <= data.length-1; i++){
           self.goods.push(new BlockCartGoodsSellersViewModel(data[i], self, content));
        }
        self.finalCost = data.final_cost;
    };
    self.ClickButchFavorites = function(){
        //var checkedGoods = [];
        ko.utils.arrayForEach(self.goods(), function(goods) {
            if(goods.isSelected())
                EventDispatcher.DispatchEvent('widgets.favorites.add', {goodsId:goods.id, count: 0});
              //checkedGoods.push(goods.id);  
        });
    };
    self.ClickButchRemove = function(){
        var checkedGoods = [];
        var removedGoods = [];
        var count = self.goods().length-1;

        for(var i = 0; i <= count; i++) {
            if(self.goods()[i].isSelected()){
              checkedGoods.push(self.goods()[i].id);
              removedGoods.push(self.goods()[i]);
            }
        };
        for(var i in removedGoods){
            self.goods.remove(removedGoods[i]);
        }

        EventDispatcher.DispatchEvent('CartGoods.clear', {goodsId:checkedGoods.join(','), sellerId: self.sellerInfo.seller.id});
        
        if(self.goods().length == 0)
            EventDispatcher.DispatchEvent('CartGoods.empty.cart'); 
    };
    self.ClickProceed = function(){
        var last = Parameters.cache.lastPage;
        Routing.SetHash(last.route, last.title, last.data);
    };
    self.ClickIssueOrder = function(){
        console.log('order');
    };
    self.ClickClearCurt = function(){
        EventDispatcher.DispatchEvent('CartGoods.clear', {sellerId:self.sellerId});
    };
    self.ClickSelectAll = function(block){
        var check = $('#' + self.cssSelectAll).is(':checked');
        ko.utils.arrayForEach(self.goods(), function(goods) {
            goods.isSelected(check);
        });
    }
};

var BlockCartGoodsSellersViewModel = function(data, block, content){
    var self = this;
    self.sellerId = block.sellerInfo.seller.sellerId;
    self.id = data.id;
    self.fullName = data.full_name;
    self.countReserv = data.count_reserv;
    self.count = data.count;
    self.sellCost = ko.observable(data.sell_cost);
    self.sellEndCost = ko.observable(data.sell_end_cost);
    self.routeImages = Parameters.pathToImages + data.route_image;
    self.ordered = ko.observable(self.count);
    self.sum = ko.computed(function(){
        return (self.ordered() * self.sellCost()).toFixed(2);
    }, this);
    self.endSum = ko.computed(function(){
        return (self.ordered() * self.sellEndCost()).toFixed(2);
    }, this);
    self.isSelected = ko.observable(false);
    self.ClickPlus = function(){
        if(self.ordered() < self.countReserv){
            self.ordered(self.ordered() + 1);
            EventDispatcher.DispatchEvent('CartGoods.change.count', {goodsId : self.id, sellerId : self.sellerId, count: self.ordered()}, self);
        }
        else
            alert(Config.Goods.message.maxIsReached);
    };
    self.ClickMinus = function(){
        if(self.ordered() > 0){
            self.ordered(self.ordered() - 1);
             EventDispatcher.DispatchEvent('CartGoods.change.count', {goodsId : self.id, sellerId : self.sellerId, count: self.ordered()}, self);
        }
    };
    self.ClickGoods = function(){
        Routing.SetHash('goods', self.fullName, {id : self.id});
    };
    self.Favorites = function(){
        EventDispatcher.DispatchEvent('widgets.favorites.add', {goodsId:self.id, count:self.ordered()});
    };
    self.ClickRemove = function(){
        EventDispatcher.DispatchEvent('CartGoods.clear', {goodsId:self.id, sellerId: self.sellerId});
//        EventDispatcher.DispatchEvent('CartGoods.change.count', {goodsId:self.id, sellerId:self.sellerId, count:0});
        block.goods.remove(self);
        if(block.goods().length == 0){
            content.content.remove(block);
            if(content.content().length == 0){
                EventDispatcher.DispatchEvent('CartGoods.empty.cart'); 
            }
        }
    };
};


var TestCartGoods = {
    Init : function(){
        if(typeof Widget == 'function'){
            CartGoodsWidget.prototype = new Widget();
            var cartGoods = new CartGoodsWidget();
            cartGoods.Init(cartGoods);
        }
        else{
            setTimeout(function(){TestCartGoods.Init()}, 100);
        }
    }
}

TestCartGoods.Init();
