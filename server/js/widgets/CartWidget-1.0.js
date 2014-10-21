var CartWidget = function(){
    var self = this;
    self.widgetName = 'CartWidget';
    self.version = 1.0;
    self.minWidgetVersion = 1.0;
    self.maxWidgetVersion = 2.0;
    self.minTmplVersion = 1.0;
    self.maxTmplVersion = 2.0;
    self.settings = {
        title : null,
        tmpl :{
            path : null,
            id : null
        },
        animate: null,
        inputParameters : {},
        containerId : null,
        showBlocks : null,
        style : null,
        customContainer : null
    };
    self.InitWidget = function(){
        self.settings.containerId = Config.Containers.cart.widget;
        self.settings.customContainer = Config.Containers.cart.customClass;
        self.settings.title = Config.Cart.title;
        self.settings.tmpl = Config.Cart.tmpl;
        self.settings.style = Config.Cart.style;
        self.settings.showBlocks = Config.Cart.showBlocks;
        self.RegisterEvents();
        self.SetInputParameters();
        self.LoadTmpl();
        self.SetPosition();
    };
    self.SetInputParameters = function(){
        var input = {};
        if(Config.Base.sourceParameters == 'string'){
            var temp = JSCore.ParserInputParameters(/CartWidget/);
            if(temp.cart){
                input = temp.cart;
            }
        }
        if(Config.Base.sourceParameters == 'object' && typeof WParameters !== 'undefined' && WParameters.cart){
            input = WParameters.cart;
        }
        
        if(!$.isEmptyObject(input)){
            if(input.show){
                for(var key in input.show){
                     self.settings.showBlocks[key] = input.show[key];
                }
            }
            if(input.animate)
                self.settings.animate = input.animate;
        }
        self.settings.inputParameters = input;
    };
    self.InsertContainer = {
        EmptyWidget : function(){
            var temp = $("#" + self.settings.containerId).find(self.SelectCustomContent().join(', ')).clone();
            $("#" + self.settings.containerId).empty().html(temp);
        },
        Main : function(){
            self.InsertContainer.EmptyWidget();
            $('#' + self.settings.containerId).append($('script#' + self.settings.tmpl.id).html()).children().hide();
        }
    };
    self.CheckRoute = function(){
        if(Routing.IsDefault() && self.HasDefaultContent()){
            self.WidgetLoader(true);
        }
        else{
            self.BaseLoad.CartInfo('', function(data){
                if(self.settings.showBlocks.fullInfo){
                    self.BaseLoad.CartGoods('', function(goods){
                        self.InsertContainer.Main();
                        self.Fill({info : data, goods : goods});
                    });
                }
                else{
                    self.InsertContainer.Main();
                    self.Fill({info : data});
                }
            });
        }
    };
    self.LoadTmpl = function(){
        self.BaseLoad.Tmpl(self.settings.tmpl, function(){
            EventDispatcher.DispatchEvent('CartWidget.onload.tmpl')
        });
    };
    self.RegisterEvents = function(){ 
        EventDispatcher.AddEventListener('CartWidget.onload.tmpl', function (){
            self.CheckRoute();
        });
        
        EventDispatcher.AddEventListener('widget.authentication.ok', function(){
            self.BaseLoad.CartInfo('', function(data){
                EventDispatcher.DispatchEvent('CartWidget.onload.info', data);
            });
        });
        
        EventDispatcher.AddEventListener('widget.change.route', function (data){
            self.LoadTmpl();
        });
        
        EventDispatcher.AddEventListener('widgets.cart.infoUpdate', function(data){
             self.LoadTmpl();
        });
        EventDispatcher.AddEventListener('widgets.cart.clear', function(data){
            var goodsId = data.goodsId ? data.goodsId : false;
            self.BaseLoad.ClearCart(data.sellerId, goodsId, function(data){
                 //EventDispatcher.DispatchEvent('widgets.cart.infoUpdate', data);
            });
        });
    };
    self.Fill = function(data){
        var info = new CartViewModel();
        info.AddContent(data);
        self.Render(info);
    };
    self.Render = function(data){ 
        try{
            ko.cleanNode($('#' + self.settings.containerId)[0]);
            ko.applyBindings(data, $('#' + self.settings.containerId)[0]);
            self.WidgetLoader(true, self.settings.containerId);
            if(self.settings.animate)
                self.settings.animate();
        }
        catch(e){
            self.Exception('Ошибка шаблона [' + self.GetTmplName() + ']');
            if(self.settings.tmpl.custom){
                delete self.settings.tmpl.custom;
                self.BaseLoad.Tmpl(self.settings.tmpl, function(){
                    self.InsertContainer.Main();
                    self.Render(data);
                });
            }
            else{
                self.InsertContainer.EmptyWidget();
                self.WidgetLoader(true, self.settings.containerId);
            }
        }
    };
    self.SetPosition = function(){
        if(self.settings.inputParameters['position'] == 'absolute'){
            for(var key in self.settings.inputParameters){
                if(self.settings.style[key])
                    self.settings.style[key] = self.settings.inputParameters[key];
            }
            $().ready(function(){
                if($("#" + self.settings.containerId).length > 0){
                    $("#" + self.settings.containerId).css(self.settings.style);
                }
            });
        }
    };
};

var CartViewModel = function(){
    var self = this;
    self.title = Config.Cart.title;
    self.goods = ko.observableArray();
    self.isAuthorized = ko.computed(function(){
        if(Parameters.cache.userInformation && !Parameters.cache.userInformation.err)
            return true;
        return false;
    }, this);
    self.ShowTitle = ko.computed(function(){
        if(Config.Cart.showBlocks.title == 'never')
            return false;
        if(Config.Cart.showBlocks.title == 'always')
            return true;
        if(Config.Cart.showBlocks.title == 'empty'){
            return true;
        }
        return false;
    }, this);
    self.count = ko.observable(0);
    self.ShowCount = ko.computed(function(){
        if(Config.Cart.showBlocks.count && self.count() > 0){
            return true;
        }
        return false;
    },this);
    self.baseCost = ko.observable(0);
    self.ShowBaseCost = ko.computed(function(){
        if(Config.Cart.showBlocks.baseCost && self.baseCost() > 0 && self.baseCost() > self.finalCost())
            return true;
        return false;
    },this);
    self.finalCost = ko.observable(0);
    self.ShowFinalCost = ko.computed(function(){
        if(Config.Cart.showBlocks.finalCost && self.finalCost() > 0)
            return true;
        return false;
    },this);
    
    self.AddContent = function(data){
        var info = data.info;
        var goods = data.goods;
        if(!info.err){
            self.count(info.count);
            self.baseCost(info.base_cost);
            self.finalCost(info.final_cost);
        }
        if(goods && !goods.err){
            $.each(goods, function(i){
                $.each(goods[i].goods, function(j){
                    self.goods.push(new ShortBlockCartGoodsSellersViewModel(goods[i].goods[j], self));
                });
            });
        }
    };
    self.ClickCart = function(){
        if(self.count() > 0){
            Parameters.cache.lastPage = Parameters.cache.history[Parameters.cache.history.length-1];
            Routing.SetHash('cart', Config.CartGoods.title, {});
        }
    };
    self.ClickIssueOrder = function(){
        if(self.count() > 0){
//            Routing.SetHash('order', 'Оформление заказа', {create: 'fromCart', sellerId: self.sellerInfo.seller.id});
        }
    };
};

var ShortBlockCartGoodsSellersViewModel = function(data, cart){
    var self = this;
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
    self.CartItog = ko.computed(function(){
        var itog = 0;
        $.each(cart.goods(), function(i){
            itog = itog + parseInt(cart.goods()[i].endSum(), 10); 
        });
        cart.finalCost(itog);
        return itog;
    }, this);
    self.ClickPlus = function(){
        if(self.ordered() < self.countReserv){
            self.ordered(self.ordered() + 1);
            self.CartItog();
            cart.count(cart.count() + 1);
        }
    };
    self.ClickMinus = function(){
        if(self.ordered() > 0){
            self.ordered(self.ordered() - 1);
            self.CartItog();
            cart.count(cart.count()- 1);
        }
    };
    self.ClickGoods = function(){
        Routing.SetHash('goods', self.fullName, {id : self.id});
    };
    self.ClickRemove = function(){
        EventDispatcher.DispatchEvent('widgets.cart.clear', {goodsId:self.id, sellerId: false});
        cart.goods
        cart.goods.remove(self);
        cart.count(cart.count()- self.ordered());
    };
}

var TestCart = {
    Init : function(){
        if(typeof Widget == 'function'){
            CartWidget.prototype = new Widget();
            var cart = new CartWidget();
            cart.Init(cart);
        }
        else{
            setTimeout(function(){TestCart.Init()}, 100);
        }
    }
}

TestCart.Init();