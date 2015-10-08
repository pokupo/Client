var GoodsViewModel  = function(){
    var self = this;
    self.id = Routing.params.id;
    self.blocks = {};
    self.sellerInfo = {};
    self.cssBlockGallery = Config.Goods.galleryId;
    self.moreBlock = [];
    self.ShowGallery = function(){
        if($.inArray('gallery', Config.Goods.showBlocks) >= 0 && self.blocks.gallery)
            return true;
        return false;
    };

    self.AddBlock = function(name, data){
        this.blocks[name] = data;
    }
    self.SetListMoreBlock = function(prefix){
        for(var key in Config.Goods.moreBlocks){
            if($.inArray(key, Config.Goods.showBlocks) >= 0)
                self.moreBlock.push(new GoodsListMoreBlockViewModel(key, self.blocks[key], prefix));
        }
    }
}

var GoodsListMoreBlockViewModel = function(key, data, prefix){
    var self = this;
    self.prefix = 'goods';
    if(prefix)
        self.prefix = prefix + 'Goods';
    self.key = key;
    self.title = Config.Goods.moreBlocks[key];
    self.content = data ? data : null;
    self.classTabs = self.prefix + 'Tabs';
    self.classBlocks = self.prefix + 'Blocks';
    self.idTab = key + 'Tab';
    self.idBlock = key + 'Block';
    self.templateName = self.prefix + self.key.charAt(0).toUpperCase() + self.key.substr(1).toLowerCase() + 'BlockTmpl';
    self.ClickLinck = function(){
        $('.' + self.classBlocks).hide();
        $('#' + self.idBlock).show();
        $('.' + self.classTabs).removeClass('active');
        $('#' + self.idTab).addClass('active');
    }
}

var GoodsMainBlockViewModel = function(data, ordered){
    var self = this;
    self.id = data.id;
    self.sellerId = 0;
    self.shopId = 0;
    self.chortName =  data.chort_name;
    self.fullName = data.full_name;
    self.description = data.description;
    self.weight = data.weight;
    self.count = ko.observable(data.count);
    if(data.count_reserve){
        if(data.count > data.count_reserve)
            self.count(data.count - data.count_reserve);
        else
            self.count(0)
    }
    self.isEgoods = ko.computed(function(){
        if(data.is_egoods =='yes')
            return true;
        return false;
    }, this);
    self.inStock = ko.computed(function(){
        if(self.isEgoods() && self.count() && self.count() != 0){
            return 'Есть';
        }
        else if(self.count() && self.count() != 0){
            if(self.count() >= 1)
                return "Да";
        }
        else
            return "Нет";
    },this);
    self.sellCost = data.sell_cost;
    self.keyWords = data.key_words;
    self.ratingGoods = data.rating_goods;
    self.sellEndCost = data.sell_end_cost;
    self.discount = ko.computed(function(){
        var d = Math.floor((self.sellCost-self.sellEndCost)*100/self.sellCost);
        if(d > 0)
            return d + '%';
        else
            return '';
    }, this);
    self.routeImages = data.route_image;
    self.routeBigImages = data.route_big_image;
    self.idAuction = data.id_auction;
    self.auctionPrice = data.last_cost;
    self.nameGroupUser = ko.computed(function(){
        if(data.name_group_user)
            return data.name_group_user;
        return null;
    }, this);
    self.ordered = ko.observable(0);
    if(self.count() > 0 || self.isEgoods())
        self.ordered(1);
    self.cart = ko.observable(Parameters.cache.cart);
    self.uniq = EventDispatcher.GetUUID();
    self.cssToCart = 'goodsToCart_' + self.uniq;
    self.cssTitleToCart = 'goodsTilteToCart_' + self.uniq;
    self.cssShareBlock = 'share';
    self.Login = function(){
        Parameters.cache.lastPage = Parameters.cache.history[Parameters.cache.history.length-1];
        Routing.SetHash('login', 'Авторизация пользователя', {});
    };
    self.Registration = function(){
        Parameters.cache.lastPage = Parameters.cache.history[Parameters.cache.history.length-1];
        Routing.SetHash('registration', 'Регистрация пользователя', {step: 1});
    };
    self.showSelectionCount = ko.computed(function(){
        if($.inArray('selectionCount', Config.Goods.showBlocks) >= 0 && self.count() && self.count() != 0)
            return true;
        return false;
    }, this);
    self.ClickPlus = function(){
        if(self.ordered() < self.count()){
            self.ordered(self.ordered() + 1);
        }
        else
            self.ShowMessage(Config.Goods.message.maxIsReached, false, false);
    };
    self.ClickMinus = function(){
        if(self.ordered() > 0)
            self.ordered(self.ordered() - 1);
    };
    self.showAddToCart = ko.computed(function(){
        if($.inArray('addToCart', Config.Goods.showBlocks) >= 0 && self.count() != 0)
            return true;
        return false;
    }, this);
    self.AddToCart = function(cart){
        Parameters.cache.cart = self.ordered();
        self.cart(self.cart() + self.ordered());
        EventDispatcher.DispatchEvent('w.cart.add', {goodsId : self.id, sellerId : self.shopId, count: self.ordered(), hash : self.uniq})
    };
    self.showBuy = ko.computed(function(){
        if($.inArray('buy', Config.Goods.showBlocks) >= 0 && self.count() != 0)
            return true;
        return false;
    }, this);
    self.Buy = function(){
        if(Parameters.cache.userInformation == null ||(Parameters.cache.userInformation != null && Parameters.cache.userInformation.err)){
            Parameters.cache.lastPage = { route : 'order', title: 'Оформление заказа', data: {create: 'directly', sellerId: self.shopId, goodsId: self.id, count: self.ordered()}};
            Routing.SetHash('login', 'Авторизация пользователя', {});
        }
        else{
            Routing.SetHash('order', 'Оформление заказа', {create: 'directly', sellerId: self.shopId, goodsId: self.id, count: self.ordered()});
        }
    };
    self.ReportAvailability = function(){

    };
    self.showFavorites = ko.computed(function(){
        if($.inArray('favorites', Config.Goods.showBlocks) >= 0 && self.count() != 0)
            return true;
        return false;
    }, this);
    self.ToCart = function(){
        Parameters.cache.lastPage = Parameters.cache.history[Parameters.cache.history.length-1];
        Routing.SetHash('cart', Config.CartGoods.title, {});
    };
    self.BidOnAuction = function(){

    };
    self.AddFavorites = function(){
        if(Parameters.cache.userInformation != null && !Parameters.cache.userInformation.err)
            self.AddCommentForm();
        else
            self.ShowError(Config.Authentication.message.pleaseLogIn, false, false);
    };
    self.comment = ko.observable('');
    self.AddCommentForm = function(){
        self.comment(' ');
        this.ShowCommentForm(
            self.comment(),
            function(comment){
                self.comment(comment);
                EventDispatcher.DispatchEvent('w.fav.add', {goodsId:self.id, comment:self.comment(), data:self});
            }
        );
    };
    self.IsFavorite = ko.observable();

    if($.inArray(self.id, Parameters.cache.favorite) >=0)
        self.IsFavorite(true)
    else
        self.IsFavorite(false)

    self.ClickFavorites = function(){
        Routing.SetHash('favorites', 'Избранное', {});
    };
    self.Gift = function(){

    };
    self.Remove = function(){

    };
}

var GalleryBlockViewModel = function(data){
    var self = this;
    self.id = data.id;
    self.title = data.name_photo;
    self.thumb = data.route_photo;
    self.image = data.route_big_photo;
}

var ShippingBlockViewModel = function(data){
    var self = this;
    self.id = data.id;
    self.nameMethodShipping = data.name_method_shipping;
    self.descMethodShipping = data.desc_method_shipping;
    self.costShipping = ko.computed(function(){
        if(data.cost_shipping)
            return data.cost_shipping;
        return null;
    }, this);
}

var MoreBlockViewModel = function(key){
    var self = this;
    self.key = key;
    self.params = [];
    self.AddParams = function(data){
        for(var key in data){
            self.params.push(data[key]);
        }
    }
}

var BuyButtonViewModel = function(data){
    var self = this;
    self.showBuy = ko.computed(function(){
        if(data.showAddToCart())
            return true;
        return false;
    }, this);
    self.Buy = function(){
        Routing.SetHash('order', 'Оформление заказа', {create: 'directly', sellerId: data.shopId, goodsId: data.id, count: data.ordered()});
    };
};

var AddToCartButtonViewModel = function(data){
    var self = this;
    self.showAddToCart = ko.computed(function(){
        if(data.showBuy())
            return true;
        return false;
    }, this);
    self.AddToCart = function(cart){
        Parameters.cache.cart = data.ordered();
        data.cart(data.cart() + data.ordered());

        EventDispatcher.DispatchEvent('w.cart.add', {goodsId : data.id, sellerId : data.sellerId, count: data.ordered(), hash : data.uniq})
    };
};
