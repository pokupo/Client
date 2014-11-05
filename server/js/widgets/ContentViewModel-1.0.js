var ContentViewModel = function(data, i){
    var self = this;
    self.id = data.id;
    self.uniq = EventDispatcher.GetUUID();
    self.chortName = data.chort_name;
    self.fullName = data.full_name;
    self.routeImage = ko.computed(function(){
        if(data.route_image)
            return data.route_image
        return null;
    }, this);
    self.backgroundImage = ko.computed(function(){
        if(data.route_image)
            return "background: url('" + data.route_image + "')";
        return null;
    }, this);
    self.routeBigImage = ko.computed(function(){
        if(data.route_image)
            return data.route_big_image
        return null;
    }, this);
    self.backgroundBigImage = ko.computed(function(){
        if(data.route_image)
            return "background: url('" + data.route_big_image + "')";
        return null;
    }, this);
    self.countTovars = data.count;
    self.sellGoods = data.sell_cost;
    self.sellCost = data.sell_end_cost;
    self.description = ko.computed(function(){
        if(data.description)
            return data.description;
        else
            return "";
    },this);
    self.ratingGoods = data.rating_goods;
    self.discount = ko.computed(function(){
        var d = Math.floor(data.sell_end_cost*100/data.sell_goods);
        if(d > 0)
            return d + '%';
        else
            return 0;
    }, this);
    self.shopId = data.id_shop;
    self.shopName = data.name_shop;
    self.ratingShop = data.rating_shop;
    self.routeLogoShop = data.route_logo_shop;
    self.positiveOpinion = '+' + data.positive_opinion;
    self.negativeOpinion = '-' + data.negative_opinion;
    self.keyWords = data.key_words;
    self.idAuction = ko.computed(function(){
        if(data.id_auction)
            return data.id_auction;
        else
            return 0;
    },this);
    self.imageHref = '#' + (i+1);
    self.cssBlock = 'views-row views-row-' + (i+1);
    self.cssToCart = 'goodsToCart_' + self.uniq;
    self.cssTitleToCart = 'goodsTilteToCart_' + self.uniq;
    
    self.ClickGoods = function(){
        Routing.SetHash('goods', self.chortName, {category : Routing.GetActiveCategory(),id : self.id});
    }
    self.ClickShop = function(){
        
    }
    self.ClickBuy = function(){
         EventDispatcher.DispatchEvent('widgets.cart.addGoods', {goodsId : self.id, hash : self.uniq})
    }
    self.ClickAuction = function(){
        
    }
}
var BlockTrForTableViewModel = function(){
    var self = this;
    self.str = ko.observableArray();
    
    self.AddStr = function(data){
        self.str.push(data);
    }
}

var CountryListViewModel = function(data) {
    var self = this;
    self.id = data.id;
    self.name = data.name;
    self.fullName = data.full_name;
    self.partWorld = data.part_world;
    self.location = data.location;
};


