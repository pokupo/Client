var StandaloneGoodsWidget = function(){
    var self = this;
    self.widgetName = 'StandaloneGoodsWidget';
    self.version = 1.0;
    self.minWidgetVersion = 1.0;
    self.maxWidgetVersion = 2.0;
    self.minTmplVersion = 1.0;
    self.maxTmplVersion = 2.0;
    self.goods = null;
    self.hasButton = false;
    self.settings = {
        idGoods: null,
        count: 1,
        idShopPartner: null,
        mailUser: null,
        idMethodPayment: null,
        containerId : null,
        tmpl : {
            path : null,
            id : null
        },
        animate: null,
        showBlocks : null,
        button: null,
        inputParameters : {},
        styleGoods : null,
        customContainer: null,
        infoBlock: 1111111
    };
    self.InitWidget = function(){
        self.settings.containerId = Config.Containers.standaloneGoods.widget;
        self.settings.customContainer = Config.Containers.standaloneGoods.customClass;
        self.settings.tmpl = Config.StandaloneGoods.tmpl;
        self.settings.showBlocks = Config.StandaloneGoods.showBlocks;
        self.settings.styleGoods = Config.StandaloneGoods.style;
        self.settings.button = Config.StandaloneGoods.button;
        SetInputParameters();
        RegisterEvents();
        CheckRouteGoods();
        SetPosition();
    };
    function SetInputParameters(){
        var input = {};
        if(Config.Base.sourceParameters == 'string'){
            var temp = JSCore.ParserInputParameters(/StandaloneGoodsWidget/);
            if(temp.goods){
                input = temp.goods;
            }
        }
        if(Config.Base.sourceParameters == 'object' && typeof WParameters !== 'undefined' && WParameters.standaloneGoods){
            input = WParameters.standaloneGoods;
        }

        var rParams = Routing.params,
            settings = self.settings;


        if(rParams.id)
            settings.idGoods = rParams.id;
        if(rParams.idShopPartner)
            settings.idShopPartner = rParams.idShopPartner;
        if(rParams.mailUser)
            settings.mailUser = rParams.mailUser;
        if(rParams.idMethodPayment)
            settings.idMethodPayment = rParams.idMethodPayment;
        if(rParams.button)
            settings.button.active = rParams.button;
        if(rParams.count)
            settings.count = rParams.count;
        if(input.infoBlock)
            settings.infoBlock = input.infoBlock;

        if(!$.isEmptyObject(input)){
            if(input.idGoods)
                settings.idGoods = input.idGoods;

            if(input.show){
                for(var i = 0; i <= input.show.length-1; i++){
                    if($.inArray(input.show[i], settings.showBlocks) < 0)
                        settings.showBlocks.push(input.show[i]);
                }
            }

            if(input.button)
                settings.button.active = input.button;

            if(input.count)
                settings.count = input.count;

            if(input.animate)
                settings.animate = input.animate;
        }

        if(rParams.blockIdGoods && $.inArray("blockIdGoods", settings.showBlocks) < 0)
            settings.showBlocks.push("blockIdGoods");
        if(rParams.blockShortName && $.inArray("blockShortName", settings.showBlocks) < 0)
            settings.showBlocks.push("blockShortName");
        if(rParams.blockFullName && $.inArray("blockFullName", settings.showBlocks) < 0)
            settings.showBlocks.push("blockFullName");
        if(rParams.blockGallery && $.inArray("blockGallery", settings.showBlocks) < 0)
            settings.showBlocks.push("blockGallery");
        if(rParams.blockShop && $.inArray("blockShop", settings.showBlocks) < 0)
            settings.showBlocks.push("blockShop");
        if(rParams.blockInfoSeller && $.inArray("blockInfoSeller", settings.showBlocks) < 0)
            settings.showBlocks.push("blockInfoSeller");
        if(rParams.blockCount && $.inArray("blockCount", settings.showBlocks) < 0)
            settings.showBlocks.push("blockCount");
        if(rParams.editableCount && $.inArray("editableCount", settings.showBlocks) < 0)
            settings.showBlocks.push("editableCount");
        if(rParams.blockShare && $.inArray("blockShare", settings.showBlocks) < 0)
            settings.showBlocks.push("blockShare");
        if(rParams.blockDescription && $.inArray("blockDescription", settings.showBlocks) < 0)
            settings.showBlocks.push("blockDescription");
        if(rParams.blockShipping && $.inArray("blockShipping", settings.showBlocks) < 0)
            settings.showBlocks.push("blockShipping");
        if(rParams.blockOpinion && $.inArray("blockOpinion", settings.showBlocks) < 0)
            settings.showBlocks.push("blockOpinion");

        if(!$.isEmptyObject(input)){
            if(input.hide){
                for(var i = 0; i <= input.hide.length-1; i++){
                    var test = $.inArray(input.hide[i], settings.showBlocks);
                    if(test > 0){
                        settings.showBlocks.splice(test, 1);
                    }
                }
            }
        }

        settings.inputParameters = input;
        self.settings = settings;
    };
    function CheckRouteGoods(){
        if(Routing.route == 'goods' || Routing.IsDefault()){
            self.BaseLoad.Tmpl(self.settings.tmpl, function(){
                self.BaseLoad.Script('widgets/GoodsViewModel-1.0.min.js', function() {
                    Update();
                });
            });
        }
        else
            self.WidgetLoader(true);
    };
    function RegisterEvents(){
        EventDispatcher.AddEventListener('w.change.route', function (){
            CheckRouteGoods();
        });

        EventDispatcher.AddEventListener('SGoods.onload.info', function (data){
            self.Fill.Content(data);
        });
    }
    function Update(){
        self.BaseLoad.GoodsInfo(self.settings.idGoods, self.settings.infoBlock, function(data){
            EventDispatcher.DispatchEvent('SGoods.onload.info', data)
        })
    }
    function InsertContainerEmptyWidget(){
        var temp = $("#" + self.settings.containerId).find(self.SelectCustomContent().join(', ')).clone();
        $("#" + self.settings.containerId).empty().html(temp);
    }
    function InsertContainerContent(){
        InsertContainerEmptyWidget();
        $("#" + self.settings.containerId).append($('script#' + self.GetTmplName()).html()).children().hide();
    }
    self.Fill = {
        Content : function(data){
            StandaloneGoodsViewModel.prototype = new GoodsViewModel();
            self.goods = new StandaloneGoodsViewModel(self.settings);

            for(var key in data){
                if(key == 'opinion' && $.inArray('blockOpinion', self.settings.showBlocks) < 0)
                    continue;
                if(key == 'shipping' && $.inArray('blockShipping', self.settings.showBlocks) < 0)
                    continue;
                if(typeof self.Fill[key.charAt(0).toUpperCase() + key.substr(1).toLowerCase()] == 'function')
                    self.Fill[key.charAt(0).toUpperCase() + key.substr(1).toLowerCase()](data[key]);
                else
                    self.Fill.Block(key, data[key]);
            }

            self.goods.CheckShow();
            self.goods.blocks.main.sellerId = data.seller.id;
            self.goods.blocks.main.shopId = data.shop.id;
            self.goods.SetListMoreBlock('standalone');
            RenderGoods(self.goods);
        },
        Main : function(data){
            GoodsMainBlockViewModel.prototype = new Widget();
            self.goods.AddBlock('main', new GoodsMainBlockViewModel(data));
            if($.inArray('blockDescription', self.settings.showBlocks) >= 0) {
                var key = 'blockDescription';
                self.goods.AddBlock(key, data.description);
                if (data.description && data.description.match(/data-bind/))
                    self.hasButton = key;
            }
            if(self.settings.count && self.settings.count <= self.goods.blocks.main.count())
                self.goods.blocks.main.ordered(self.settings.count);
            else{
                self.goods.blocks.main.count(0);
            }
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
                key = 'blockShipping';
            }
            if(key == 'opinion')
                key = 'blockOpinion';

            block.AddParams(data);

            self.goods.AddBlock(key, block);
        }
    };
    function RenderGoods(data){
        if($("#" + self.settings.containerId).length > 0) {
            try {
                InsertContainerContent();
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

                if(typeof AnimateStandaloneGoods == 'function')
                    new AnimateStandaloneGoods();
                if (self.settings.animate)
                    self.settings.animate();

                AddGoodsInCookie(data);
                delete data;

                self.WidgetLoader(true, self.settings.containerId);
            }
            catch (e) {
                self.Exception('Ошибка шаблона [' + self.GetTmplName() + ']', e);
                if (self.settings.tmpl.custom) {
                    delete self.settings.tmpl.custom;
                    self.BaseLoad.Tmpl(self.settings.tmpl, function () {
                        InsertContainerContent();
                        RenderGoods(data);
                    });
                }
                else {
                    InsertContainerEmptyWidget();
                    self.WidgetLoader(true, self.settings.containerId);
                }
            }
        }
        else{
            self.Exception('Ошибка. Не найден контейнер [' + self.settings.containerId + ']');
            self.WidgetLoader(true, self.settings.containerId);
        }
    };
    function AddGoodsInCookie(data){
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
    function SetPosition(){
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

var StandaloneGoodsViewModel = function(settings){
    var self = this;
    self.activeButton = settings.button.active;
    self.inactiveButton = settings.button.inactive;
    self.show = {
        blockIdGoods: false,
        blockShortName: false,
        blockFullName: false,
        blockGallery: false,
        blockShop: false,
        blockInfoSeller: false,
        blockOperator: false,
        blockCount: false,
        editableCount: false,
        blockShare: false,
        blockDescription: false,
        blockShipping: false,
        blockOpinion: false
    };
    self.ShowGallery = function(){
        if(self.blocks.gallery)
            return true;
        return false;
    };
    self.CheckShow = function(){
        if($.inArray('blockIdGoods', settings.showBlocks) >= 0)
            self.show.blockIdGoods = true;
        if($.inArray('blockShortName', settings.showBlocks) >= 0)
            self.show.blockShortName = true;
        if($.inArray('blockFullName', settings.showBlocks) >= 0)
            self.show.blockFullName = true;
        if($.inArray('blockGallery', settings.showBlocks) >= 0)
            self.show.blockGallery = true;
        if($.inArray('blockShop', settings.showBlocks) >= 0)
            self.show.blockShop = true;
        if($.inArray('blockInfoSeller', settings.showBlocks) >= 0)
            self.show.blockInfoSeller = true;
        if($.inArray('blockOperator', settings.showBlocks) >= 0)
            self.show.blockOperator = true;
        if($.inArray('blockCount', settings.showBlocks) >= 0)
            self.show.blockCount = true;
        if($.inArray('editableCount', settings.showBlocks) >= 0)
            self.show.editableCount = true;
        if($.inArray('blockShare', settings.showBlocks) >= 0)
            self.show.blockShare = true;
        if($.inArray('blockDescription', settings.showBlocks) >= 0)
            self.show.blockDescription = true;
        if($.inArray('blockShipping', settings.showBlocks) >= 0)
            self.show.blockShipping = true;
        if($.inArray('blockOpinion', settings.showBlocks) >= 0)
            self.show.blockOpinion = true;
    }
    self.SetListMoreBlock = function(prefix){
        for(var key in Config.StandaloneGoods.moreBlocks){
            if($.inArray(key, settings.showBlocks) >= 0) {
                StandaloneGoodsListMoreBlockViewModel.prototype = new GoodsListMoreBlockViewModel(key, self.blocks[key], prefix);
                self.moreBlock.push(new StandaloneGoodsListMoreBlockViewModel());
            }
        }
    }
    self.Buy = function(){
        var params = {
            idGoods: settings.idGoods,
            count: self.blocks.main.ordered(),
        };
        if(settings.idShopPartner)
            params.idShopPartner = settings.idShopPartner;
        if(settings.mailUser)
            params.mailUser = settings.mailUser;
        if(settings.idMethodPayment )
            params.idMethodPayment = settings.idMethodPayment;

        Routing.SetHash('standalone_payment', 'Оплатить товар', params);
    }
}

var StandaloneGoodsListMoreBlockViewModel = function(){
    this.title = Config.StandaloneGoods.moreBlocks[this.key];
    this.templateName = this.prefix + this.key.charAt(0).toUpperCase() + this.key.substr(1) + 'BlockTmpl';
}

var TestStandaloneGoods = {
    Init : function(){
        if(typeof Widget == 'function'){
            StandaloneGoodsWidget.prototype = new Widget();
            var goods = new StandaloneGoodsWidget();
            goods.Init(goods);
        }
        else{
            setTimeout(function(){TestStandaloneGoods.Init()}, 100);
        }
    }
}

TestStandaloneGoods.Init();
