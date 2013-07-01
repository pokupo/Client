var FavoritesWidget = function() {
    var self = this;
    self.widgetName = 'FavoritesWidget';
    self.favorites = null;
    self.settings = {
        tmplPath: null,
        favTmplId: null,
        emptyFavTmplId: null,
        showBlocks : null,
        inputParameters: {},
        style: null,
        containerId: null,
    };
    self.InitWidget = function() {
        self.settings.containerId = Config.Containers.favorites;
        self.settings.tmplPath = Config.Favorites.tmpl.path;
        self.settings.favTmplId = Config.Favorites.tmpl.cartTmplId;
        self.settings.emptyFavTmplId = Config.Favorites.tmpl.emptyCartTmplId;
        self.settings.showBlocks = Config.Favorites.showBlocks;
        self.settings.style = Config.Favorites.style;
        self.RegisterEvents();
        self.SetInputParameters();
        self.SetPosition();
    };
    self.SetInputParameters = function() {
        self.settings.inputParameters = JSCore.ParserInputParameters(/FavoritesWidget.js/);
        if (self.settings.inputParameters['params']) {
            var input = JSON.parse(self.settings.inputParameters['params']);
            self.settings.inputParameters['params'] = input;
            if (input.show) {
                for (var i = 0; i <= self.settings.showBlocks.length - 1; i++) {
                    if ($.inArray(self.settings.showBlocks[i], input.show) < 0)
                       self.settings.showBlocks.splice(self.settings.showBlocks.indexOf(self.settings.showBlocks[i]), 1);
                }
            }
            if (input.tmpl) {
                self.settings.tmplPath = 'favorites/' + input.tmpl + '.html';
            }
        }
    };
    self.CheckRoute = function() {
        if (Routing.route == 'favorites') {
            self.BaseLoad.Login(false, false, false, function(data){
                if(!data.err){
                    self.Update.Menu();
                    self.Update.Content();
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
        if (JSLoader.loaded) {
            self.BaseLoad.Tmpl(self.settings.tmplPath, function() {
                self.CheckRoute();
            });
        }
        else {
            EventDispatcher.AddEventListener('onload.scripts', function(data) {
                self.BaseLoad.Tmpl(self.settings.tmplPath, function() {
                    self.CheckRoute();
                });
            });
        }

        EventDispatcher.AddEventListener('widget.change.route', function() {
            if (Routing.route == 'favorites') {
                self.Update.Menu();
                self.Update.Content();
            }
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
                    self.InsertContainer.EmptyCart();
                    self.Render.EmptyCart();
                }
            });
        },
        Menu : function(){
            Loader.Indicator('MenuPersonalCabinetWidgetWidget', false);
            self.BaseLoad.Script('widgets/MenuPersonalCabinetWidget.js', function(){
                EventDispatcher.DispatchEvent('widget.onload.menuPersonalCabinet');
            });
        },
    };
    self.InsertContainer = {
        Content : function(){
            $("#" + self.settings.containerId).empty().append($('script#' + self.settings.favTmplId).html());
        },
        EmptyFaforites :function(){
            $("#" + self.settings.containerId).empty().append($('script#' + self.settings.emptyFavTmplId).html());
        }
    };
    self.Fill =  {
        Content : function(data){
            var content = new FavoritesViewModel();
            for(var j in data){
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
    self.goods = ko.observableArray();

    self.uniq = EventDispatcher.HashCode(new Date().getTime().toString());
    self.cssSelectAll = "favoritesSelectAll_" + self.uniq;
    self.isChecked = ko.observable(false);
    
    self.AddContent = function(data){
        for(var i = 0; i <= data.length-1; i++){
           BlockFavoritesGoodsSellersViewModel.prototype = new Widget();
           self.goods.push(new BlockFavoritesGoodsSellersViewModel(data[i], self, content));
        }
        self.finalCost = data.final_cost;
    };
    self.comment = ko.observable();
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

       // EventDispatcher.DispatchEvent('CartGoods.clear', {goodsId:checkedGoods.join(','), sellerId: self.sellerInfo.seller.id});
        
        if(self.goods().length == 0)
            content.content.remove(self);
        //if(content.content().length == 0)
            //EventDispatcher.DispatchEvent('CartGoods.empty.cart'); 
    };
    self.ClickClearCurt = function(){
        var count = self.goods().length-1;
        var removedGoods = [];
        for(var i = 0; i <= count; i++) {
              removedGoods.push(self.goods()[i]);
        };
        for(var i in removedGoods){
            self.goods.remove(removedGoods[i]);
        }
        content.content.remove(self);
        //EventDispatcher.DispatchEvent('CartGoods.clear', {sellerId:self.sellerInfo.seller.id});
        //if(content.content().length == 0)
           // EventDispatcher.DispatchEvent('CartGoods.empty.cart'); 
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
    self.id = data.id;
    self.fullName = data.full_name;
    self.sellCost = ko.observable(data.sell_cost);
    self.sellEndCost = ko.observable(data.sell_end_cost);
    self.routeImages = Parameters.pathToImages + data.route_image;
    self.isSelected = ko.observable(false);
    self.comment = ko.observable();
    self.showAddToCart = ko.computed(function(){
        return true;
    }, this);
    
    self.AddToCart = function(){
        
    };
    self.showBuy = ko.computed(function(){
        return true;
    }, this);
    self.Buy = function(){
        
    };
    self.ClickGoods = function(){
        Routing.SetHash('goods', self.fullName, {id : self.id});
    };
    self.ClickRemove = function(){
//        EventDispatcher.DispatchEvent('CartGoods.clear', {goodsId:self.id, sellerId: self.sellerId});
        block.goods.remove(self);
        if(block.goods().length == 0){
            content.content.remove(block);
//            if(content.content().length == 0){
//                EventDispatcher.DispatchEvent('CartGoods.empty.cart'); 
//            }
        }
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


