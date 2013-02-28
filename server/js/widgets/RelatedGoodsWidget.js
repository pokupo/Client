window.RelatedGoodsWidget = function(){
    var self = this;
    self.widgetName = 'RelatedGoodsWidget';
    self.settings = {
        tmplPath : Config.RelatedGoods.tmpl.path,
        contentTableTmpl : Config.RelatedGoods.tmpl.contentTableTmpl,
        contentListTmpl : Config.RelatedGoods.tmpl.contentListTmpl,
        contentTileTmpl : Config.RelatedGoods.tmpl.contentTileTmpl,
        contentSliderTmpl : Config.RelatedGoods.tmpl.contentSliderTmpl,
        contentCaruselTmpl : Config.RelatedGoods.tmpl.contentCaruselTmpl,
        inputParameters : {},
        container : null,
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
    };
    self.SetParameters = function(data){
        self.settings.container = data.element;
        
        for(var key in data.options.params){
            if(key == 'tmpl' && data.options.params['tmpl'])
                self.settings.tmplPath = 'relatedGoods/' + data.options.params['tmpl'] + '.html';
            else
                self.settings.relatedGoods[key] = data.options.params[key];
        }
    };
    self.RegisterEvents = function(){
        if(JSLoader.loaded){
            self.BaseLoad.Tmpl(self.settings.tmplPath, function(){
                EventDispatcher.DispatchEvent('RelatedGoodsWidget.onload.tmpl')
            });
        }
        else{
            EventDispatcher.AddEventListener('onload.scripts', function (data){ 
                self.BaseLoad.Tmpl(self.settings.tmplPath, function(){
                    EventDispatcher.DispatchEvent('RelatedGoodsWidget.onload.tmpl')
                });
            });
        }
        
        EventDispatcher.AddEventListener('RelatedGoodsWidget.onload.tmpl', function (data){
            var query = self.settings.relatedGoods.start + '/' + self.settings.relatedGoods.count + '/' + self.settings.relatedGoods.orderBy;
            self.BaseLoad.RelatedGoods(self.settings.relatedGoods.id, query, function(data){
                self.CheckData(data);
            })
        });
        
        EventDispatcher.AddEventListener('RelatedGoodsWidget.fill.block', function (data){
            self.Render(data);
        });
    };
    self.InsertContainer = function(type){
            if(type == 'slider')
                $(self.settings.container).append($('script#' + self.settings.contentSliderTmpl).html());
            if(type == 'carousel')
                $(self.settings.container).append($('script#' + self.settings.contentCaruselTmpl).html());
            if(type == 'tile')
                $(self.settings.container).append($('script#' + self.settings.contentTileTmpl).html());
            if(type == 'table') 
                $(self.settings.container).append($('script#' + self.settings.contentTableTmpl).html());
            if(type == 'list')
                $(self.settings.container).append($('script#' + self.settings.contentListTmpl).html());
    };
    self.CheckData = function(data){
        if(data.err)
            self.WidgetLoader(true);
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
        ko.applyBindings(data, $(self.settings.container).children()[0]);
        
        if(self.settings.relatedGoods.typeView == 'slider')
                new InitSlider(data.cssBlockContainer);
        if(self.settings.relatedGoods.typeView == 'carousel')
                new InitCarousel(data.cssBlockContainer);
            
        self.WidgetLoader(true);
    };
}

var RelatedGoodsViewModel = function(settings, data){
    var self = this;
    self.typeView      = settings.typeView;
    self.countGoods    = settings.count;
    self.countTile     = settings.countTile;
    self.content       = ko.observableArray();
    self.cssBlockContainer  = 'relatedGoodsContainer_';
    
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
            self.cssBlockContainer  = self.cssBlockContainer + EventDispatcher.HashCode(data.toString());
            EventDispatcher.DispatchEvent('RelatedGoodsWidget.fill.block', self);
        }
    }
}


