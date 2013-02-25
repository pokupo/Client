var GoodsWidget = function(){
    var self = this;
    self.widgetName = 'GoodsWidget';
    self.goods = null;
    self.settingsGoods = {
        containerIdForGoods : Config.Containers.goods, 
        tmplPath : Config.Goods.tmplPath,
        tmplId : Config.Goods.tmplId,
        tmplRoute : Config.Goods.tmplPath + Config.Goods.tmplId + '.html',
        inputParameters : {},
        styleGoods : Config.Goods.style
    };
    self.InitWidget = function(){
        self.SetInputParameters();
        self.RegisterEvents();
        self.SetPosition();
    };
    self.GetTmplRoute = function(){
        return self.settingsGoods.tmplPath + self.settingsGoods.tmplId + '.html';
    };
    self.SetInputParameters = function(){
        self.settingsGoods.inputParameters = JSCore.ParserInputParameters(/GoodsWidget.js/);
        var input = JSON.parse(self.settingsGoods.inputParameters['params']);
        self.settingsGoods.inputParameters = input;
        if(input.show){
            for(var i = 0; i <= input.show.length-1; i++){
                if($.inArray(input.show[i], Config.Goods.showBlocks) < 0)
                    Config.Goods.showBlocks.push(input.show[i]);
            }
        }
        if(input.hide){
            for(var i = 0; i <= input.hide.length-1; i++){
                var test = $.inArray(input.hide[i], Config.Goods.showBlocks);
                if(test > 0){
                    Config.Goods.showBlocks.splice(test, 1);
                }
            }
        }
        if(input.tmpl){
            self.settingsGoods.tmplId = input.tmpl;
        }
    };
    self.Route = function(){
        if(Route.route == 'goods'){
            self.Update();
        }
        else{
            ReadyWidgets.Indicator('GoodsWidget', true);
        }
    };
    self.RegisterEvents = function(){ 
        if(JSLoader.loaded){
            self.BaseLoad.Tmpl(self.GetTmplRoute(), function(){
                 self.Route();
            });
        }
        else{
            EventDispatcher.AddEventListener('onload.scripts', function (data){
                self.BaseLoad.Tmpl(self.GetTmplRoute(), function(){
                     self.Route();
                });
            });
        }
        
        EventDispatcher.AddEventListener('widget.change.route', function (){
            if(Route.route == 'goods'){
                self.Update();
            }
        });
        
        EventDispatcher.AddEventListener('GoodsWidget.onload.info', function (data){
            self.Fill.Content(data);
        });
    };
    self.Update = function(){
        self.BaseLoad.GoodsInfo(Route.params.id, self.settingsGoods.inputParameters['infoBlock'], function(data){
            EventDispatcher.DispatchEvent('GoodsWidget.onload.info', data)
        })
    };
    self.InsertContainer = {
        Content : function(){
            $("#" + self.settingsGoods.containerIdForGoods).html('');
            $("#" + self.settingsGoods.containerIdForGoods).append($('script#' + self.settingsGoods.tmplId).html());
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
            self.goods.SetListMoreBlock(); 
            self.Render.Goods(self.goods);
        },
        Main : function(data){
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
            block.AddParams(data);
            self.goods.AddBlock(key, block);
        }
    };
    self.Render = {
        Goods: function(data){
            if($("#" + self.settingsGoods.containerIdForGoods).length > 0){
                self.InsertContainer.Content();
                if(Config.Containers.catalog)
                   $("#" + Config.Containers.catalog).hide();
                $("#wrapper").removeClass("with_sidebar").addClass("with_top_border");
                ko.applyBindings(data, $("#" + self.settingsGoods.containerIdForGoods)[0]);
                
                if(Ya != undefined)
                    new Ya.share(Config.Goods.share);
                if(data.showGallery)
                    new InitCarousel(Config.Goods.galleryId);
            }
            self.AddGoodsInCookie(data);
            delete data;
            ReadyWidgets.Indicator('GoodsWidget', true);
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
        if(self.settingsGoods.inputParameters['position'] == 'absolute'){
            for(var key in self.settingsGoods.inputParameters){
                if(self.settingsGoods.styleGoods[key])
                    self.settingsGoods.styleGoods[key] = self.settingsGoods.inputParameters[key];
            }
            $().ready(function(){
                $('#' + self.settingsGoods.containerIdForGoods).css(self.settingsGoods.styleGoods);
            });
        }
    }
}

var GoodsViewModel  = function(){
    var self = this;
    self.id = Route.params.id;
    self.blocks = {};
    self.sellerInfo = {};
    self.showGallery = ko.computed(function(){
        if($.inArray('gallery', Config.Goods.showBlocks) > 0 && self.blocks.gallery)
            return true;
        return false;
    }, this);
    self.cssBlockGallery = Config.Goods.galleryId;
    self.moreBlock = [];
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
    self.chortName =  data.chort_name;
    self.fullName = data.full_name;
    self.description = data.description;
    self.weight = data.weight;
    self.count = data.count;
    self.inStock = ko.computed(function(){
        if(self.count && self.count != 0){
            if(self.count > 1)
                return self.count;
            return "Да";
        }
        else
            return "Нет";
    },this);
    self.sellCost = data.sell_cost;
    self.keyWords = data.key_words;
    self.isEgoods = data.is_egoods;
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
    self.idAuction = data.id_auction;
    self.auctionPrice = data.auction_price;
    self.nameGroupUser = ko.computed(function(){
        if(data.name_group_user)
            return data.name_group_user;
        return null;
    }, this);
    self.ordered = ko.observable(0);
    self.cart = ko.observable(Parameters.cache.cart);
    
    self.Login = function(){ 
        alert('login');
    };
    self.showSelectionCount = ko.computed(function(){
        if($.inArray('selectionCount', Config.Goods.showBlocks) > 0 && self.count != 0)  
            return true;
        return false;
    }, this);
    self.ClickPlus = function(){
        if(self.ordered() < self.count){
            self.ordered(self.ordered() + 1);
        }
        else
            alert(Config.Goods.message.maxIsReached);
    }
    self.ClickMinus = function(){
        if(self.ordered() > 0)
            self.ordered(self.ordered() - 1);
    }
    self.showAddToCart = ko.computed(function(){
        if($.inArray('addToCart', Config.Goods.showBlocks) > 0 && self.count != 0)
            return true;
        return false;
    }, this);
    self.AddToCart = function(){
        Parameters.cache.cart = self.ordered();
        self.cart(self.cart() + self.ordered()); 
        
        if(typeof AnimateAddToCart == 'function')
            new AnimateAddToCart();
    };
    self.showBuy = ko.computed(function(){
        if($.inArray('buy', Config.Goods.showBlocks) > 0 && self.count != 0)
            return true;
        return false;
    }, this);
    self.Buy = function(){
        alert('buy');
    };
    self.ReportAvailability = function(){
        alert('report');
    };
    self.ToCart = function(){
        alert('to cart');
    };
    self.BidOnAuction = function(){
        alert('bid on auction') ;
    };
    self.Favorites = function(){
        alert('favorites');
    };
    self.Gift = function(){
        alert('gift');
    };
}

var GalleryBlockViewModel = function(data){
    var self = this;
    self.id = data.id;
    self.title = data.name_photo;
    self.thumb = Parameters.pathToImages + data.route_photo;
    self.image = Parameters.pathToImages + '/big' + data.route_photo
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
    self.ClickLink = function(){
        
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
            window.setTimeout(TestGoodsCrumb.Init, 100);
        }
    }
}

TestGoodsCrumb.Init();
