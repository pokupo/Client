var CartGoodsWidget = function(){
    var self = this;
    self.widgetName = 'CartGoodsWidget';
    self.cart = null;
    self.settings = {
        tmplPath : null,
        tmplId : null,
        inputParameters : {},
        style : null,
        containerId : null,
    };
    self.InitWidget = function(){
        self.settings.containerId = Config.Containers.cartGoods;
        self.settings.tmplPath = Config.CartGoods.tmpl.path;
        self.settings.tmplId = Config.CartGoods.tmpl.tmplId;
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
            self.InsertContainer();
            self.Fill.Content(data);
        });
        
        EventDispatcher.AddEventListener('CartGoods.change.count', function(data){
            self.BaseLoad.AddGoodsToCart(data.goodsId, data.sellerId, data.count, function(data){
                console.log(data);
            });
        });
    };
    self.Update = function(){
        self.WidgetLoader(false);
        $("#" + self.settings.containerId).html('');
        self.BaseLoad.CartGoods('', function(data){
            EventDispatcher.DispatchEvent('CartGoods.onload.info', data);
        });
    };
    self.InsertContainer = function(){
        $("#" + self.settings.containerId).empty().append($('script#' + self.settings.tmplId).html());
    };
    self.Fill =  {
        Content : function(data){
            var content = new CartGoodsViewModel();
            for(var j in data){
                self.cart = new BlockGoodsForSellerViewModel();
                for(var key in data[j]){
                    if(typeof self.Fill[key.charAt(0).toUpperCase() + key.substr(1).toLowerCase()] == 'function')
                        self.Fill[key.charAt(0).toUpperCase() + key.substr(1).toLowerCase()](data[j][key]);
                }
                content.AddContent(self.cart);
            }

            self.Render(content);
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
    self.Render = function(data){
        if($("#" + self.settings.containerId).length > 0){
            if(Config.Containers.catalog)
                   $("#" + Config.Containers.catalog).hide();
            $("#wrapper").removeClass("with_sidebar").addClass("with_top_border");
            ko.applyBindings(data, $("#" + self.settings.containerId)[0]);
        }
        self.WidgetLoader(true);
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

var BlockGoodsForSellerViewModel = function(){
    var self = this;
    self.sellerInfo = {};
    self.goods = ko.observableArray();
    self.finalCost = 0;
    self.tatalForPayment = ko.computed(function(){
        var total = 0;
        if(self.goods().length > 0){
            for(var i = 0; i <= self.goods().length-1; i++){
                total = total + self.goods()[i].endSum();
            }
        }
        return total;
    }, this);
    self.totalSum = ko.computed(function(){
        var total = 0;
        if(self.goods().length > 0){
            for(var i = 0; i <= self.goods().length-1; i++){
                total = total + self.goods()[i].sum();
            }
        }
        return total;
    }, this);
    self.tatalDiscount = ko.computed(function(){
        return (self.totalSum() - self.tatalForPayment()).toFixed(2);
    }, this);
    self.cssSelectAll = "cartGoodsSelectAll";
    //self.isChecked = ko.observable(false);
    self.checkedGoods = ko.observableArray();

    
    self.AddContent = function(data){
        for(var i = 0; i <= data.length-1; i++){
           self.goods.push(new BlockCartGoodsSellersViewModel(data[i]));
        }
        self.finalCost = data.final_cost;
    };
    self.ClickButchFavorites = function(){
        console.log(self.checkedGoods());
    };
    self.ClickButchRemove = function(){
        
    };
    self.ClickProceed = function(){
        console.log('proceed');
    };
    self.ClickIssueOrder = function(){
        console.log('order');
    };
    self.ClickClearCurt = function(){
        
    };
    self.ClickSelectAll = function(){
         if($('#' + self.cssSelectAll).is(':checked')){
             $('#' + self.cssSelectAll).removeAttr('checked');
         }
         else{
             $('#' + self.cssSelectAll).attr('checked', 'checked');
         }
         
//         ko.utils.arrayForEach(self.goods(), function(goods) {
//            goods.isSelected(true);
//         });
    }
};

var BlockCartGoodsSellersViewModel = function(data){
    var self = this;
    self.sellerId = 0;
    self.id = data.id;
    self.fullName = data.full_name;
    self.countReserv = data.count_reserv;
    self.count = data.count;
    self.sellCost = data.sell_cost;
    self.sellEndCost = data.sell_end_cost;
    self.routeImages = Parameters.pathToImages + data.route_image;
    self.ordered = ko.observable(self.count);
    self.sum = ko.computed(function(){
        return self.ordered() * self.sellCost;
    }, this);
    self.endSum = ko.computed(function(){
        return self.ordered() * self.sellEndCost;
    }, this);
    self.isSelected = ko.observable(false);
    self.ClickPlus = function(){
        if(self.ordered() < self.countReserv){
            self.ordered(self.ordered() + 1);
        }
        else
            alert(Config.Goods.message.maxIsReached);
    };
    self.ClickMinus = function(){
        if(self.ordered() > 0)
            self.ordered(self.ordered() - 1);
    };
    self.ClickGoods = function(){
        Routing.SetHash('goods', self.fullName, {id : self.id});
    };
    self.Favorites = function(){
        alert('favorites');
    };
    self.ClickRemove = function(){
         EventDispatcher.DispatchEvent('CartGoods.change.count', {goodsId:self.id, sellerId:self.sellerId, count:0});
    };
};

//var BlockInfoSellerCartViewModel = function(data){
//    var self = this;
//    self.sellerId = data.id;
//    self.nameShop = data.name_shop;
//    self.siteShop = data.site_shop;
//    self.emailSupport = data.email_support;
//    self.mailtoShop = 'mailto:' + self.emailSupport;
//    self.phonesSupport = data.phones_support;
//    self.siteSupport = data.site_support;
//    self.skypeSupport = data.skype_support;
//    self.icqSupport = data.icq_support;
//    self.ratingShop = data.rating_shop;
//    self.positiveOpinion = data.positive_opinion;
//    self.negativeOpinion = data.negative_opinion;
//    self.routeLogoShop = Parameters.pathToImages + data.route_logo_shop;
//    self.allGoods = data.all_goods;
//    
//    self.ClickOperator = function(data, event){
//        alert('operator id=' + data.id);
//    };
//};

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
