window.RelatedGoodsWidget = function(){
    var self = this;
    self.widgetName = 'RelatedGoodsWidget';
    self.settings = {
        tmpl : {
            path : null,
            id : {
                table : null,
                list : null,
                tile : null,
                slider : null,
                carousel : null
            }
        },
        inputParameters : {},
        container : null,
        relatedGoods : {
            id : null,
            count : null,
            countTile : null,
            typeView : null,
            orderBy : null,
            start : null
        },
        uniq : null
    };
    self.InitWidget = function(){
        self.settings.tmpl = Config.RelatedGoods.tmpl;
        self.settings.relatedGoods.count = Config.RelatedGoods.countGoodsInBlock;
        self.settings.relatedGoods.countTile = Config.RelatedGoods.countGoodsTileInStr;
        self.settings.relatedGoods.typeView = Config.RelatedGoods.typeView;
        self.settings.relatedGoods.orderBy = Config.RelatedGoods.orderBy;
        self.settings.relatedGoods.start = Config.RelatedGoods.start;
        self.Loader();
        self.RegisterEvents();
        self.LoadTmpl();
    };
    self.Loader = function(){
        Loader.InsertContainer(self.settings.container);
    };
    self.SetParameters = function(data){
        self.settings.container = data.element;
        for(var key in data.options.params){
            if(key == 'tmpl' && data.options.params['tmpl']){
                if(data.options.params['tmpl']['path'])
                    self.settings.tmpl.path = data.options.params['tmpl']['path'];
                if(data.options.params['tmpl']['id'])
                    self.settings.tmpl.id = data.options.params['tmpl']['id'];
            }
            else if (key == 'uniq' && data.options.params['uniq'])
                self.settings.uniq = data.options.params['uniq'];
            else if(key == 'id')
                self.settings.relatedGoods.id = data.options.params['id'];
            self.settings.relatedGoods[key] = data.options.params[key];
        }
    };
    self.LoadTmpl = function(){
        self.BaseLoad.Tmpl(self.settings.tmpl, function(){
            console.log('load tmpl');
            console.log(self.settings.uniq);
            EventDispatcher.DispatchEvent('RelatedGoodsWidget.onload.tmpl_' + self.settings.uniq)
        });
    };
    self.RegisterEvents = function(){
        console.log('register event');
        console.log(self.settings.uniq);
            
        EventDispatcher.AddEventListener('RelatedGoodsWidget.onload.tmpl_' + self.settings.uniq, function (data){
            var query = self.settings.relatedGoods.start + '/' + self.settings.relatedGoods.count + '/' + self.settings.relatedGoods.orderBy;
            self.BaseLoad.RelatedGoods(self.settings.relatedGoods.id, query, function(data){
                self.CheckData(data);
            })
        });
        
        EventDispatcher.AddEventListener('RelatedGoodsWidget.fill.block_' + self.settings.uniq, function (data){
            self.Render(data);
        });
    };
    self.InsertContainer = function(type){
            if(type == 'slider')
                $(self.settings.container).html($('script#' + self.settings.tmpl.id.slider).html());
            if(type == 'carousel')
                $(self.settings.container).html($('script#' + self.settings.tmpl.id.carousel).html());
            if(type == 'tile')
                $(self.settings.container).html($('script#' + self.settings.tmpl.id.tile).html());
            if(type == 'table') 
                $(self.settings.container).html($('script#' + self.settings.tmpl.id.table).html());
            if(type == 'list')
                $(self.settings.container).html($('script#' + self.settings.tmpl.id.list).html());
            if(type == 'empty')
                $(self.settings.container).html('');
    };
    self.CheckData = function(data){ 
        console.log(data);
        if(!data.err ){
            self.InsertContainer(self.settings.relatedGoods.typeView);
            self.Fill(self.settings.relatedGoods, data)
        }
        else{
            self.InsertContainer('empty');
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
        EventDispatcher.DispatchEvent('RelatedGoodsWidget.fill.block_' + settings.uniq, self);
    }
}


