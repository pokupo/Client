var GoodsWidget = function(){
    var self = this;
    self.widgetName = 'GoodsWidget';
    self.goods = null;
    self.settings = {
        containerId : null, 
        tmplPath : null,
        tmplId : null,
        showBlocks : null,
        inputParameters : {},
        styleGoods : null
    };
    self.InitWidget = function(){
        self.settings.containerId = Config.Containers.goods.widget; 
        self.settings.tmplPath = Config.Goods.tmpl.path;
        self.settings.tmplId = Config.Goods.tmpl.tmplId;
        self.settings.showBlocks = Config.Goods.showBlocks;
        self.settings.styleGoods = Config.Goods.style;
        self.SetInputParameters();
        self.RegisterEvents();
        self.SetPosition();
    };
    self.SetInputParameters = function(){
        var input = {};
        if(Config.Base.sourceParameters == 'string'){
            var temp = JSCore.ParserInputParameters(/GoodsWidget.js/);
            if(temp.goods){
                input = temp.goods;
            }
        }
        if(Config.Base.sourceParameters == 'object' && typeof WParameters !== 'undefined' && WParameters.goods){
            input = WParameters.goods;
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
            if(input.tmpl){
                self.settings.tmplPath = 'goods/' + input.tmpl + '.html';
            }
        }
        self.settings.inputParameters = input;
    };
    self.CheckRoute = function(){
        if(Routing.route == 'goods'){
            self.Update();
        }
        else
            self.WidgetLoader(true);
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
            self.CheckRoute();
        });
        
        EventDispatcher.AddEventListener('GoodsWidget.onload.info', function (data){
            self.Fill.Content(data);
        });
    };
    self.Update = function(){
        self.BaseLoad.InfoFavorite('no', function(data){
            Parameters.cache.favorite = data;
            self.BaseLoad.GoodsInfo(Routing.params.id, self.settings.inputParameters['infoBlock'], function(data){
                EventDispatcher.DispatchEvent('GoodsWidget.onload.info', data)
            })
        });
    };
    self.InsertContainer = {
        Content : function(){
            $("#" + self.settings.containerId).html($('script#' + self.settings.tmplId).html());
        }
    };
    self.Fill = {
        Content : function(data){
            self.goods = new GoodsViewModel();
            for(var key in data){
                if(typeof self.Fill[key.charAt(0).toUpperCase() + key.substr(1).toLowerCase()] == 'function')
                    self.Fill[key.charAt(0).toUpperCase() + key.substr(1).toLowerCase()](data[key]);
                else
                    self.Fill.Block(key, data[key]);
            }
            self.goods.blocks.main.sellerId = data.seller.id
            self.goods.SetListMoreBlock(); 
            self.Render.Goods(self.goods);
        },
        Main : function(data){
            GoodsMainBlockViewModel.prototype = new Widget();
            self.goods.AddBlock('main', new GoodsMainBlockViewModel(data));
            self.goods.AddBlock('description', data.description);
        },
        Gallery : function(data){
            var gallery =[];
            for(var i = 0; i <= data.length - 1; i++){
                gallery[i] = new GalleryBlockViewModel(data[i]);
            }
            self.goods.AddBlock('gallery', gallery);
        },
        Seller : function(data){
            self.goods.sellerInfo['seller'] = data;
        },
        Shop : function(data){
            self.goods.sellerInfo['shop'] = data;
        },
        Operator : function(data){
            self.goods.sellerInfo['operator'] = data;
        },
        Block : function(key, data){
            var block = new MoreBlockViewModel(key);
            if(key == 'shipping'){
                var shipping = [];
                for(var r in data){
                    shipping.push(new ShippingBlockViewModel(data[r]));
                }
                data = shipping;
            }
            block.AddParams(data);
            
            self.goods.AddBlock(key, block);
        }
    };
    self.Render = {
        Goods: function(data){
            if($("#" + self.settings.containerId).length > 0){
                self.InsertContainer.Content();
                ko.applyBindings(data, $("#" + self.settings.containerId)[0]);

                new AnimateMoreBlockTabs(data.moreBlock[0].idBlock);
                
                if(data.ShowGallery())
                    new AnimateCarousel(Config.Goods.galleryId);
            }
            self.AddGoodsInCookie(data);
            delete data;

            self.WidgetLoader(true, self.settings.containerId);
            if(Ya != undefined){
                Config.Goods.share.element = data.blocks.main.cssShareBlock
                new Ya.share(Config.Goods.share);
            }
        }
    };
    self.AddGoodsInCookie = function(data){
        var viewed = $.cookie(Config.Base.cookie.previously_viewed);
        
        if(!viewed){
            $.cookie(Config.Base.cookie.previously_viewed, data.id);
        }
        else{
            var viewedArray = viewed.split(",")
            var pos = $.inArray(data.id, viewedArray);
            if(pos >= 0){
                viewedArray.splice(pos, 1);
                viewedArray.unshift(data.id);
            }
            else{
                viewedArray.unshift(data.id);
            }
            if(viewedArray.length > 20)
                viewedArray.splice(20, 1)

            $.cookie(Config.Base.cookie.previously_viewed, viewedArray.join(","));
        }
            
        var viewed = $.cookie(Config.Base.cookie.previously_viewed);
    };
    self.SetPosition = function(){
        if(self.settings.inputParameters['position'] == 'absolute'){
            for(var key in self.settings.inputParameters){
                if(self.settings.styleGoods[key])
                    self.settings.styleGoods[key] = self.settings.inputParameters[key];
            }
            $().ready(function(){
                $('#' + self.settings.containerId).css(self.settings.styleGoods);
            });
        }
    }
}

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
    self.SetListMoreBlock = function(){
        for(var key in Config.Goods.moreBlocks){
            if($.inArray(key, Config.Goods.showBlocks) > 0)
                self.moreBlock.push(new GoodsListMoreBlockViewModel(key, self.blocks[key]));
        }
    }
}

var GoodsListMoreBlockViewModel = function(key, data){
    var self = this;
    self.key = key;
    self.title = Config.Goods.moreBlocks[key];
    self.content = data ? data : null;
    self.classTabs = 'goodsTabs';
    self.classBlocks = 'goodsBlocks';
    self.idTab = key + 'Tab';
    self.idBlock = key + 'Block';
    self.templateName = 'goods' + self.key.charAt(0).toUpperCase() + self.key.substr(1).toLowerCase() + 'BlockTmpl';
    self.ClickLinck = function(){
        $('.' + self.classBlocks).hide();
        $('#' + self.idBlock).show();
        $('.' + self.classTabs).removeClass('active');
        $('#' + self.idTab).addClass('active');
    }
}

var GoodsMainBlockViewModel = function(data){
    var self = this;
    self.id = data.id;
    self.sellerId = 0;
    self.chortName =  data.chort_name;
    self.fullName = data.full_name;
    self.description = data.description;
    self.weight = data.weight;
    self.count = data.count;
    if(data.count_reserve)
        self.count = data.count - data.count_reserve;
    self.isEgoods = ko.computed(function(){
        if(data.is_egoods =='yes')
            return true;
        return false;
    }, this);
    self.inStock = ko.computed(function(){
        if(self.isEgoods() && !self.count && self.count != 0){
            return 'Есть';
        }
        else if(self.count && self.count != 0){
            if(self.count > 1)
                return self.count;
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
            return 'Нет';
    }, this);
    self.routeImages = Parameters.pathToImages + data.route_image;
    self.routeBigImages = Parameters.pathToImages + '/big' + data.route_image
    self.idAuction = data.id_auction;
    self.auctionPrice = data.last_cost;
    self.nameGroupUser = ko.computed(function(){
        if(data.name_group_user)
            return data.name_group_user;
        return null;
    }, this);
    self.ordered = ko.observable(1);
    self.cart = ko.observable(Parameters.cache.cart);
    self.uniq = EventDispatcher.HashCode(new Date().getTime().toString() + '-' + self.id);
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
        if($.inArray('selectionCount', Config.Goods.showBlocks) >= 0 && self.count && self.count != 0)  
            return true;
        return false;
    }, this);
    self.ClickPlus = function(){
        if(self.ordered() < self.count){
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
        if($.inArray('addToCart', Config.Goods.showBlocks) >= 0 && self.count != 0)
            return true;
        return false;
    }, this);
    self.AddToCart = function(cart){
        Parameters.cache.cart = self.ordered();
        self.cart(self.cart() + self.ordered()); 
 
        EventDispatcher.DispatchEvent('widgets.cart.addGoods', {goodsId : self.id, sellerId : self.sellerId, count: self.ordered(), hash : self.uniq})
    };
    self.showBuy = ko.computed(function(){
        if($.inArray('buy', Config.Goods.showBlocks) >= 0 && self.count != 0)
            return true;
        return false;
    }, this);
    self.Buy = function(){
         Routing.SetHash('order', 'Оформление заказа', {create: 'directly', sellerId: self.sellerId, goodsId: self.id, count: self.ordered()});
    };
    self.ReportAvailability = function(){

    };
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
            self.ShowMessage(Config.Authentication.message.pleaseLogIn, false, false);
    };
    self.comment = ko.observable('');
    self.AddCommentForm = function(){
        self.comment(' ');
        $( "#dialog-form-batch" ).dialog({
            height: 300,
            width: 396,
            modal: true,
            buttons: {
                "Сохранить": function() {
                     EventDispatcher.DispatchEvent('widgets.favorites.add', {goodsId:self.id, count:self.ordered(), data:self});
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
    self.thumb = Parameters.pathToImages + data.route_photo;
    self.image = Parameters.pathToImages + '/big' + data.route_photo
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

var TestGoodsCrumb = {
    Init : function(){
        if(typeof Widget == 'function'){
            GoodsWidget.prototype = new Widget();
            var goods = new GoodsWidget();
            goods.Init(goods);
        }
        else{
            setTimeout(function(){TestGoodsCrumb.Init()}, 100);
        }
    }
}

TestGoodsCrumb.Init();
