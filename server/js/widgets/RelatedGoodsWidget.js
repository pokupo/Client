window.RelatedGoodsWidget = function(){
    var self = this;
    self.widgetName = 'RelatedGoodsWidget';
    self.settings = {
        tmplForRelatedGoods : Config.RelatedGoods.tmpl, 
        inputParameters : {},
        conteiner : null,
        style : Config.RelatedGoods.style,
        relatedGoods : {
            id : 0,
            count : Config.RelatedGoods.countGoodsInBlock,
            countTile : Config.RelatedGoods.countGoodsTileInStr,
            typeView : Config.RelatedGoods.typeView,
            orderBy : Config.RelatedGoods.orderBy,
            start : Config.RelatedGoods.start
        }
    };
    self.InitWidget = function(){
        self.RegisterEvents();
        self.SetPosition();
    };
    self.SetInputParameters = function(){
        self.settings.inputParameters = JSCore.ParserInputParameters(/RelatedGoodsWidget.js/);
    };
    self.SetParameters = function(data){
        self.settings.conteiner = data.element;
        for(var key in data.options.params){
            self.settings.relatedGoods[key] = data.options.params[key];
        }
    };
    self.RegisterEvents = function(){
        if(JSLoader.loaded){
            self.BaseLoad.Tmpl(self.settings.tmplForRelatedGoods, function(){
                EventDispatcher.DispatchEvent('RelatedGoodsWidget.onload.tmpl')
            });
        }
        else{
            EventDispatcher.AddEventListener('onload.scripts', function (data){ 
                self.BaseLoad.Tmpl(self.settings.tmplForRelatedGoods, function(){
                    EventDispatcher.DispatchEvent('RelatedGoodsWidget.onload.tmpl')
                });
            });
        }
        
        EventDispatcher.AddEventListener('RelatedGoodsWidget.onload.tmpl', function (data){
            var query = self.settings.relatedGoods.start + '/' + self.settings.relatedGoods.count + '/' + self.settings.relatedGoods.orderBy;
            self.BaseLoad.RelatedGoods(self.settings.relatedGoods.id, query, function(data){
                self.BustBlock(data);
            })
        });
        
        EventDispatcher.AddEventListener('RelatedGoodsWidget.fill.block', function (data){
            self.Render(data);
        });
    };
    self.InsertContainer = function(type){
            if(type == 'slider')
                $(self.settings.conteiner).append($('script#relatedGoodsSliderTmpl').html());
            if(type == 'carousel')
                $(self.settings.conteiner).append($('script#relatedGoodsCaruselTmpl').html());
            if(type == 'tile')
                $(self.settings.conteiner).append($('script#relatedGoodsTileTmpl').html());
            if(type == 'table') 
                $(self.settings.conteiner).append($('script#relatedGoodsTableTmpl').html());
            if(type == 'list')
                $(self.settings.conteiner).append($('script#relatedGoodsListTmpl').html());
    };
    self.BustBlock = function(data){
        if(data.err)
            ReadyWidgets.Indicator('RelatedGoodsWidget', true);
        else{
            self.InsertContainer(self.settings.relatedGoods.typeView);
            self.Fill(self.settings.relatedGoods, data)
        }
    };
    self.Fill = function(settings, data){
        var related = new RelatedGoodsViewModel(settings, data);
        related.AddContent();
    };
    self.Render = function(data){
        ko.applyBindings(data, $(self.settings.conteiner).children()[0]);
        
        if(self.settings.relatedGoods.typeView == 'slider')
                new InitSlider(data.cssBlockContainer);
        if(self.settings.relatedGoods.typeView == 'carousel')
                new InitCarousel(data.cssBlockContainer);
            
        ReadyWidgets.Indicator('RelatedGoodsWidget', true);
    };
    self.SetPosition = function(){
        if(self.settings.inputParameters['position'] == 'absolute'){
            for(var key in self.settings.inputParameters){
                if(self.settings.style[key])
                    self.settings.style[key] = self.settings.inputParameters[key];
            }
            $().ready(function(){
                self.settings.conteiner.css(self.settings.style);
            });
        }
    }
}

var RelatedGoodsViewModel = function(settings, data){
    var self = this;
    self.typeView      = settings.typeView;
    self.countGoods    = settings.count;
    self.countTile     = settings.countTile;
    self.content       = ko.observableArray();
    self.cssBlockContainer  = 'relatedGoodsConteiner_';
    
    self.AddContent = function(){
        if(data && data.length > 1){
            var first = data.shift()
            self.countGoods  = first.count_goods;
        
            if(data.length < self.countGoods)
                self.countGoods = data.length;
            
            var f = 0;
            for(var i = 0; i <= self.countGoods-1; i++){
                if(self.typeView == 'tile'){
                    var str = new BlockTrForTableViewModel();
                    for(var j = 0; j <= self.countTile-1; j++){
                        if(data[f]){
                            str.AddStr(new ContentViewModel(data[f], f));
                            f++;
                        }
                        else
                            break;
                    }
                    if(str.str().length > 0)
                        self.content.push(str);
                    delete str;
                }
                else{
                    self.content.push(new ContentViewModel(data[i], i));
                }
            }
            self.cssBlockContainer  = self.cssBlockContainer + EventDispatcher.hashCode(data.toString());
            EventDispatcher.DispatchEvent('RelatedGoodsWidget.fill.block', self);
        }
    }
}


