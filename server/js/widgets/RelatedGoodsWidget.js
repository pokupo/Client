window.RelatedGoodsWidget = function(){
    var self = this;
    self.widgetName = 'RelatedGoodsWidget';
    self.settings = {
        tmplPath : null,
        contentTableTmpl : null,
        contentListTmpl : null,
        contentTileTmpl : null,
        contentSliderTmpl : null,
        contentCaruselTmpl : null,
        inputParameters : {},
        container : null,
        relatedGoods : {
            id : 0,
            count : null,
            countTile : null,
            typeView : null,
            orderBy : null,
            start : null
        }
    };
    self.InitWidget = function(){
        self.settings.tmplPath = Config.RelatedGoods.tmpl.path;
        self.settings.contentTableTmpl = Config.RelatedGoods.tmpl.contentTableTmpl;
        self.settings.contentListTmpl = Config.RelatedGoods.tmpl.contentListTmpl;
        self.settings.contentTileTmpl = Config.RelatedGoods.tmpl.contentTileTmpl;
        self.settings.contentSliderTmpl = Config.RelatedGoods.tmpl.contentSliderTmpl;
        self.settings.contentCaruselTmpl = Config.RelatedGoods.tmpl.contentCaruselTmpl;
        self.settings.relatedGoods.count = Config.RelatedGoods.countGoodsInBlock;
        self.settings.relatedGoods.countTile = Config.RelatedGoods.countGoodsTileInStr;
        self.settings.relatedGoods.typeView = Config.RelatedGoods.typeView;
        self.settings.relatedGoods.orderBy = Config.RelatedGoods.orderBy;
        self.settings.relatedGoods.start = Config.RelatedGoods.start;
        
        self.RegisterEvents();
        self.Loader();
    };
    self.Loader = function(){
        Loader.InsertContainer(self.settings.container);
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
                $(self.settings.container).empty().append($('script#' + self.settings.contentSliderTmpl).html());
            if(type == 'carousel')
                $(self.settings.container).empty().append($('script#' + self.settings.contentCaruselTmpl).html());
            if(type == 'tile')
                $(self.settings.container).empty().append($('script#' + self.settings.contentTileTmpl).html());
            if(type == 'table') 
                $(self.settings.container).empty().append($('script#' + self.settings.contentTableTmpl).html());
            if(type == 'list')
                $(self.settings.container).empty().append($('script#' + self.settings.contentListTmpl).html());
    };
    self.CheckData = function(data){ 
        if(!data.err ){
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
                new AnimateSlider(data.cssBlockContainer);
        if(self.settings.relatedGoods.typeView == 'carousel')
                new AnimateCarousel(data.cssBlockContainer);
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
        if(data && data.length >= 1){
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
        }
        EventDispatcher.DispatchEvent('RelatedGoodsWidget.fill.block', self);
    }
}


