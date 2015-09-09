var GoodsWidget = function(){
    var self = this;
    self.widgetName = 'GoodsWidget';
    self.version = 1.2;
    self.minWidgetVersion = 1.0;
    self.maxWidgetVersion = 2.0;
    self.minTmplVersion = 1.0;
    self.maxTmplVersion = 2.0;
    self.goods = null;
    self.hasButton = false;
    self.settings = {
        containerId : null, 
        tmpl : {
            path : null,
            id : null
        },
        animate: null,
        showBlocks : null,
        inputParameters : {},
        styleGoods : null,
        customContainer: null,
        infoBlock: 1111111
    };
    self.InitWidget = function(){
        self.settings.containerId = Config.Containers.goods.widget;
        self.settings.customContainer = Config.Containers.goods.customClass;
        self.settings.tmpl = Config.Goods.tmpl;
        self.settings.showBlocks = Config.Goods.showBlocks;
        self.settings.styleGoods = Config.Goods.style;
        self.SetInputParameters();
        self.RegisterEvents();
        self.CheckRouteGoods();
        self.SetPosition();
    };
    self.SetInputParameters = function(){
        var input = {};
        if(Config.Base.sourceParameters == 'string'){
            var temp = JSCore.ParserInputParameters(/GoodsWidget/);
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
            if(input.infoBlock)
                self.settings.infoBlock = input.infoBlock;
            if(input.animate)
                self.settings.animate = input.animate;
        }
        self.settings.inputParameters = input;
    };
    self.CheckRouteGoods = function(){
        if(Routing.route == 'goods'){
            self.BaseLoad.Tmpl(self.settings.tmpl, function(){
                self.BaseLoad.Script('widgets/GoodsViewModel-1.0.min.js', function() {
                    self.Update();
                });
            });
        }
        else
            self.WidgetLoader(true);
    };
    self.RegisterEvents = function(){ 
        EventDispatcher.AddEventListener('w.change.route', function (){
            self.CheckRouteGoods();
        });
        
        EventDispatcher.AddEventListener('GoodsWidget.onload.info', function (data){
            self.Fill.Content(data);
        });
    };
    self.Update = function(){
        self.BaseLoad.InfoFavorite('no', function(data){
            Parameters.cache.favorite = data;
            self.BaseLoad.GoodsInfo(Routing.params.id, self.settings.infoBlock, function(data){
                EventDispatcher.DispatchEvent('GoodsWidget.onload.info', data)
            })
        });
    };
    self.InsertContainer = {
        EmptyWidget : function(){
            var temp = $("#" + self.settings.containerId).find(self.SelectCustomContent().join(', ')).clone();
            $("#" + self.settings.containerId).empty().html(temp);
        },
        Content : function(){
            self.InsertContainer.EmptyWidget();
            $("#" + self.settings.containerId).append($('script#' + self.GetTmplName()).html()).children().hide();
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
            self.goods.blocks.main.sellerId = data.seller.id;
            self.goods.blocks.main.shopId = data.shop.id;
            self.goods.SetListMoreBlock(); 
            self.Render.Goods(self.goods);
        },
        Main : function(data){
            GoodsMainBlockViewModel.prototype = new Widget();
            self.goods.AddBlock('main', new GoodsMainBlockViewModel(data));
            var key = 'description';
            self.goods.AddBlock(key, data.description);
            if(data.description && data.description.match(/data-bind/))
                self.hasButton = key;
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
            if($("#" + self.settings.containerId).length > 0) {
                try {
                    self.InsertContainer.Content();
                    ko.cleanNode($("#" + self.settings.containerId)[0]);
                    ko.applyBindings(data, $("#" + self.settings.containerId)[0]);

                    if (self.hasButton) {
                        $.each(data.moreBlock, function (i) {
                            if (data.moreBlock[i].key == self.hasButton) {
                                var button = $('#' + data.moreBlock[i].idBlock + ' [data-bind^=click]');
                                $.each(button, function (i) {
                                    if (data.blocks.main.showAddToCart()) {
                                        if ($(button[i]).attr('data-bind').match(/AddToCart/)) {
                                            var addToCart = new AddToCartButtonViewModel(data.blocks.main);
                                            ko.applyBindings(addToCart, button[i]);
                                        }
                                    }
                                    else
                                        $(button[i]).hide();

                                    if (data.blocks.main.showBuy()) {
                                        if ($(button[i]).attr('data-bind').match(/Buy/)) {
                                            var buy = new BuyButtonViewModel(data.blocks.main);
                                            ko.applyBindings(buy, button[i]);
                                        }
                                    }
                                    else
                                        $(button[i]).hide();
                                });
                            }
                        });
                    }

                    if(typeof AnimateGoods == 'function')
                        new AnimateGoods();
                    if (self.settings.animate)
                        self.settings.animate();

                    self.AddGoodsInCookie(data);
                    delete data;

                    self.WidgetLoader(true, self.settings.containerId);
                }
                catch (e) {
                    self.Exception('Ошибка шаблона [' + self.GetTmplName() + ']', e);
                    if (self.settings.tmpl.custom) {
                        delete self.settings.tmpl.custom;
                        self.BaseLoad.Tmpl(self.settings.tmpl, function () {
                            self.InsertContainer.Content();
                            self.Render.Goods(data);
                        });
                    }
                    else {
                        self.InsertContainer.EmptyWidget();
                        self.WidgetLoader(true, self.settings.containerId);
                    }
                }
            }
            else{
                self.Exception('Ошибка. Не найден контейнер [' + self.settings.containerId + ']');
                self.WidgetLoader(true, self.settings.containerId);
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

var TestGoods = {
    Init : function(){
        if(typeof Widget == 'function'){
            GoodsWidget.prototype = new Widget();
            var goods = new GoodsWidget();
            goods.Init(goods);
        }
        else{
            setTimeout(function(){TestGoods.Init()}, 100);
        }
    }
}

TestGoods.Init();
