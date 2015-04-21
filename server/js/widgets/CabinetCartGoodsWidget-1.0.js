var CabinetCartGoodsWidget = function(){
    var self = this;
    self.widgetName = 'CabinetCartGoodsWidget';
    self.version = 1.0;
    self.minWidgetVersion = 1.0;
    self.maxWidgetVersion = 2.0;
    self.minTmplVersion = 1.0;
    self.maxTmplVersion = 2.0;
    self.cart = null;
    self.settings = {
        tmpl : {
            path : null,
            id : {
                content : null,
                empty : null
            }
        },
        animate: null,
        inputParameters : {},
        style : null,
        containerId : null,
        customContainer : null
    };
    self.InitWidget = function(){
        self.settings.containerId = Config.Containers.cabinetCartGoods.widget;
        self.settings.customContainer = Config.Containers.cabinetCartGoods.customClass;
        self.settings.tmpl = Config.CabinetCartGoods.tmpl;
        self.settings.style = Config.CabinetCartGoods.style;
        self.RegisterEvents();
        self.SetInputParameters();
        self.CheckCabinetCartGoodsRoute();
        self.SetPosition();
    };
    self.SetInputParameters = function(){
        var input = {};
        if(Config.Base.sourceParameters == 'string'){
            var temp = JSCore.ParserInputParameters(/CabinetCartGoodsWidget/);
            if(temp.cabinetCartGoods){
                input = temp.cabinetCartGoods;
            }
        }
        if(Config.Base.sourceParameters == 'object' && typeof WParameters !== 'undefined' && WParameters.cabinetCartGoods){
            input = WParameters.cabinetCartGoods;
        }
        
        if(!$.isEmptyObject(input)){
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
            if(input.animate)
                self.settings.animate = input.animate;
        }
        self.settings.inputParameters = input;
    };
    self.CheckCabinetCartGoodsRoute = function(){
        if(Routing.route == 'cabinet_cart'){
            self.BaseLoad.Tmpl(self.settings.tmpl, function(){
                self.Update.Content();
            });
        }
        else
            self.WidgetLoader(true);
    };
    self.RegisterEvents = function(){ 
        EventDispatcher.AddEventListener('widget.change.route', function (){
            self.CheckCabinetCartGoodsRoute();
        });
        
        EventDispatcher.AddEventListener('CabinetCartGoods.onload.info', function (data){
            if(!data.err){
                self.InsertContainer.Content();
                self.Fill.Content(data);
            }
            else{
                self.InsertContainer.EmptyCart();
                self.Render.EmptyCart();
            }
        });
        
        EventDispatcher.AddEventListener('CabinetCartGoods.change.count', function(goods){
            self.BaseLoad.AddGoodsToCart(goods.goodsId, goods.sellerId, goods.count, function(data){
                 EventDispatcher.DispatchEvent('widgets.cart.infoUpdate', data);
                 goods.sellCost = data.sell_cost;
                 goods.sellEndCost = data.sell_end_cost;
            });
        });
        
        EventDispatcher.AddEventListener('CabinetCartGoods.clear', function(data){
            var goodsId = data.goodsId ? data.goodsId : false;
            self.BaseLoad.ClearCart(data.sellerId, goodsId, function(data){
                 EventDispatcher.DispatchEvent('widgets.cart.infoUpdate', data);
            });
        });
        
        EventDispatcher.AddEventListener('CabinetCartGoods.empty.cart', function(){
            self.InsertContainer.EmptyCart();
            self.Render.EmptyCart();
        });
    };
    self.Update = {
        Content : function(){
            self.WidgetLoader(false);
            self.BaseLoad.Login(false, false, false, function(data){
                if(!data.err){
                    Loader.Indicator('MenuPersonalCabinetWidget', false);
                    self.BaseLoad.InfoFavorite('no', function(data){
                        Parameters.cache.favorite = data;
                        self.BaseLoad.CartGoods('', function(data){
                            EventDispatcher.DispatchEvent('CabinetCartGoods.onload.info', data);
                        });
                    });
                    self.Update.Menu();
                }
                else{
                    Parameters.cache.lastPage = Parameters.cache.history[Parameters.cache.history.length-1];
                    Routing.SetHash('login', 'Авторизация пользователя', {});
                    self.WidgetLoader(true);
                }
            });
        },
        Menu : function(){
            self.BaseLoad.Script('widgets/MenuPersonalCabinetWidget-1.1.js', function(){
                EventDispatcher.DispatchEvent('widget.onload.menuPersonalCabinet', {menu : {}, active : ''});
            });
        }
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
        EmptyCart :function(){
            self.InsertContainer.EmptyWidget();
            $("#" + self.settings.containerId).append($('script#' + self.GetTmplName('empty')).html()).children().hide();
        }
    };
    self.Fill =  {
        Content : function(data){
            var content = new CartGoodsViewModel();
            for(var j in data){
                BlockCabinetGoodsForSellerViewModel.prototype = new Widget();
                self.cart = new BlockCabinetGoodsForSellerViewModel(content);
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
        Final_cost : function(data){
            self.cart.finalCost = data;
        }
    };
    self.Render = {
        Content : function(data){
            if($("#" + self.settings.containerId).length > 0){
                try{
                    ko.cleanNode($("#" + self.settings.containerId)[0]);
                    ko.applyBindings(data, $("#" + self.settings.containerId)[0]);
                    self.WidgetLoader(true,self.settings.containerId);
                    if(typeof AnimateCabinetCartGoods == 'function')
                        new AnimateCabinetCartGoods();
                    if(self.settings.animate)
                        self.settings.animate();
                }
                catch(e){
                    self.Exception('Ошибка шаблона [' + self.GetTmplName('content') + ']', e);
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
            else{
                self.Exception('Ошибка. Не найден контейнер [' + self.settings.containerId + ']');
                self.WidgetLoader(true, self.settings.containerId);
            }
        },
        EmptyCart : function(){
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
                if($('#' + self.settings.containerId).length > 0)
                   $('#' + self.settings.containerId).css(self.settings.style);
            });
        }
    };
};

var CartGoodsViewModel = function(){
    var self = this;
    self.sellerBlock = ko.observableArray();
    self.AddContent = function(data){
        self.sellerBlock.push(data);
    };
};

var BlockCabinetGoodsForSellerViewModel = function(content){
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
    self.uniq = EventDispatcher.HashCode(new Date().getTime().toString());
    self.cssSelectAll = "cartGoodsSelectAll_" + self.uniq;
    self.isSelectedAll = ko.observable(false);
    self.isSelectedAll.subscribe(function(check) {
        ko.utils.arrayForEach(self.goods(), function(goods) {
            $('#' + goods.cssCheckboxGoods() )[0].checked = check;
            goods.isSelected(check);
        });
    });
    self.ClickSelectAll = function(){
        var all = $('#' + self.cssSelectAll);
        var check = all.is(':checked');
        var val;
        if(check){
            all[0].checked = false;
            val = false;
        }
        else{
            all[0].checked = true;
            val = true;
        }
        
        ko.utils.arrayForEach(self.goods(), function(goods) {
            $('#' + goods.cssCheckboxGoods())[0].checked = val;
            goods.isSelected(val);
        });
    }
    
    self.AddContent = function(data){
        for(var i = 0; i <= data.length-1; i++){
           BlockCabinetCartGoodsSellersViewModel.prototype = new Widget();
           self.goods.push(new BlockCabinetCartGoodsSellersViewModel(data[i], self, content));
        }
        self.finalCost = data.final_cost;
    };
    self.comment = ko.observable();
    self.ClickButchFavorites = function(){
        var checkedGoods = [];
        ko.utils.arrayForEach(self.goods(), function(goods) {
            if(goods.isSelected()){
                checkedGoods.push(goods.id)
                goods.IsFavorite(true);
            }
        });
        self.AddCommentForm(checkedGoods);
    };
    self.AddCommentForm = function(checkedGoods){
        self.comment(' ');
        $( "#dialog-form-batch" ).dialog({
            height: 300,
            width: 396,
            modal: true,
            buttons: {
                "Сохранить": function() {
                     EventDispatcher.DispatchEvent('widgets.favorites.add', {goodsId:checkedGoods.join(','), comment: self.comment(), data: self});
                     $( this ).dialog( "close" );
                }
            }
        });
        
    };
    self.ClickButchRemove = function(){
        self.Confirm(Config.CartGoods.message.confirmButchRemove, function(){
            self.Remove();
        });
    };
    self.Remove = function(){
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

        EventDispatcher.DispatchEvent('CabinetCartGoods.clear', {goodsId:checkedGoods.join(','), sellerId: self.sellerInfo.shop.id});

        if(self.goods().length == 0)
            content.content.remove(self);
        if(content.content().length == 0)
            EventDispatcher.DispatchEvent('CabinetCartGoods.empty.cart');
    };
    self.IsFavorite = function(){
        
    };
    self.ClickProceed = function(){
        Routing.SetHash('default', 'Домашняя', {});
    };
    self.ClickIssueOrder = function(){
        if(Parameters.cache.userInformation.err){
            Parameters.cache.lastPage = { route : 'order', title: 'Оформление заказа', data: {create: 'fromCart', sellerId: self.sellerInfo.shop.id}};
            Routing.SetHash('login', 'Авторизация пользователя', {});
        }
        else{           
            Routing.SetHash('order', 'Оформление заказа', {create: 'fromCart', sellerId: self.sellerInfo.shop.id});
        };
    };
    self.ClickClearCurt = function(){
        self.Confirm(Config.CabinetCartGoods.message.confirmClearCart, function(){
            var count = self.goods().length-1;
            var removedGoods = [];
            for(var i = 0; i <= count; i++) {
                  removedGoods.push(self.goods()[i]);
            };
            for(var i in removedGoods){
                self.goods.remove(removedGoods[i]);
            }
            content.sellerBlock.remove(self);
            
            EventDispatcher.DispatchEvent('CabinetCartGoods.clear', {sellerId:self.sellerInfo.shop.id});
            if(content.sellerBlock().length == 0)
                EventDispatcher.DispatchEvent('CabinetCartGoods.empty.cart'); 
        });
    };
    self.isDisabledButton = ko.computed(function(){
        var countGoods = self.goods().length;
        var selectedGoods = [];
        
        for(var i = 0; i <= countGoods-1; i++) {
            if(self.goods()[i].isSelected())
              selectedGoods.push(self.goods()[i].id);
        };
        if(selectedGoods.length > 0)
            return false;
        return true;
    }, this);
};

var BlockCabinetCartGoodsSellersViewModel = function(data, block, content){
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
    self.sum = ko.computed(function(){
        return (self.ordered() * self.sellCost()).toFixed(2);
    }, this);
    self.endSum = ko.computed(function(){
        return (self.ordered() * self.sellEndCost()).toFixed(2);
    }, this);
    self.isSelected = ko.observable(false);
    self.isSelected.subscribe(function(check) {
        var countGoods = block.goods().length;
        var selectedGoods = [];
        
        for(var i = 0; i <= countGoods-1; i++) {
            if(block.goods()[i].isSelected())
              selectedGoods.push(block.goods()[i].id);
        };
        if(selectedGoods.length < countGoods)
            $('#' + block.cssSelectAll )[0].checked = false;
        else
            $('#' + block.cssSelectAll )[0].checked = true;
    });
    self.cssCheckboxGoods = ko.observable('goods_' + self.id);
    self.ClickOrder = function(order, elem){
        var $checkBox = $('#' + order.cssCheckboxGoods());
        var isChecked = $checkBox.is(':checked');
        if(isChecked == false){
            $checkBox[0].checked = true;
            self.isSelected(true);
        }
        else{
            $checkBox[0].checked = false;
            self.isSelected(false);
        }
    }
    self.discount = ko.computed(function(){
        var d = 100 - Math.floor(self.sellEndCost()*100/self.sellCost());
        if(d > 0)
            return d + '%';
        else
            return 0;
    }, this);
    self.comment = ko.observable();
    self.ClickPlus = function(){
        if(self.ordered() < self.countReserv){
            self.ordered(self.ordered() + 1);
            EventDispatcher.DispatchEvent('CabinetCartGoods.change.count', {goodsId : self.id, sellerId : self.sellerId, count: self.ordered()}, self);
        }
        else
            self.ShowMessage(Config.Goods.message.maxIsReached, false, false);
    };
    self.ClickMinus = function(){
        if(self.ordered() > 0){
            self.ordered(self.ordered() - 1);
             EventDispatcher.DispatchEvent('CabinetCartGoods.change.count', {goodsId : self.id, sellerId : self.sellerId, count: self.ordered()}, self);
        }
    };
    self.ClickGoods = function(){
        Routing.SetHash('goods', self.fullName, {id : self.id});
    };
    self.AddFavorites = function(){
        if(Parameters.cache.userInformation != null && !Parameters.cache.userInformation.err)
            self.AddCommentForm();
        else
            self.ShowMessage(Config.Authentication.message.pleaseLogIn, false, false);
    };
    self.ClickFavorites = function(){
        Routing.SetHash('favorites', 'Избранное', {});
    };
    self.ClickRemove = function(){
        self.Confirm(Config.CartGoods.message.confirmRemove, function(){
            self.Remove();
        });
    };
    self.Remove = function(){
        EventDispatcher.DispatchEvent('CartGoods.clear', {goodsId:self.id, sellerId: self.sellerId});
        block.goods.remove(self);
        if(block.goods().length == 0){
            content.content.remove(block);
            if(content.content().length == 0){
                EventDispatcher.DispatchEvent('CartGoods.empty.cart'); 
            }
        }
    };
    self.AddCommentForm = function(){
        block.comment(' ');
        $( "#dialog-form-batch" ).dialog({
            height: 300,
            width: 396,
            modal: true,
            buttons: {
                "Сохранить": function() {
                     EventDispatcher.DispatchEvent('widgets.favorites.add', {goodsId:self.id, comment: block.comment(), data : self});
                     $( this ).dialog( "close" );
                }
            }
        });
    };
    self.IsFavorite = ko.observable();

    if($.inArray(self.id, Parameters.cache.favorite) >=0)
        self.IsFavorite(true)
    else
        self.IsFavorite(false)
};


var TestCabinetCartGoods = {
    Init : function(){
        if(typeof Widget == 'function'){
            CabinetCartGoodsWidget.prototype = new Widget();
            var cabinetCartGoods = new CabinetCartGoodsWidget();
            cabinetCartGoods.Init(cabinetCartGoods);
        }
        else{
            setTimeout(function(){TestCabinetCartGoods.Init()}, 100);
        }
    }
}

TestCabinetCartGoods.Init();
