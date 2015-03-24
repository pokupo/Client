window.RelatedGoodsWidget = function(){
    var self = this;
    self.widgetName = 'RelatedGoodsWidget';
    self.version = 1.0;
    self.minWidgetVersion = 1.0;
    self.maxWidgetVersion = 2.0;
    self.minTmplVersion = 1.0;
    self.maxTmplVersion = 2.0;
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
        animate: null,
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
        self.Loader();
        self.RegisterEvents();
        self.LoadTmpl();
    };
    self.Loader = function(){
        Loader.InsertContainer(self.settings.container);
    };
    self.SetParameters = function(data){
        self.settings.tmpl = Config.RelatedGoods.tmpl;
        self.settings.relatedGoods = Config.RelatedGoods;
        self.settings.container = data.element;
        
        var input = {};
        if (Config.Base.sourceParameters == 'object' && typeof WParameters !== 'undefined' && WParameters.relatedGoods) {
            input = WParameters.relatedGoods;
        }
        if (!$.isEmptyObject(input)) {
            if(input.animate)
                self.settings.animate = input.animate;
        }
        self.settings.inputParameters = input;
        
        for(var key in data.options.params){
            if(key == 'tmpl' && data.options.params['tmpl']){
                if(data.options.params['tmpl']['path'])
                    self.settings.tmpl.path = data.options.params['tmpl']['path'];
                if(data.options.params['tmpl']['id'])
                    self.settings.tmpl.id = data.options.params['tmpl']['id'];
            }
            else if (key == 'uniq' && data.options.params['uniq'])
                self.settings.uniq = data.options.params['uniq'];
            else if (key == 'animate' && data.options.params['animate'])
                self.settings.animate = data.options.params['animate'];
            else if(key == 'id')
                self.settings.relatedGoods.id = data.options.params['id'];
            self.settings.relatedGoods[key] = data.options.params[key];
        }
    };
    self.LoadTmpl = function(){
        self.BaseLoad.Tmpl(self.settings.tmpl, function(){
            EventDispatcher.DispatchEvent('RelatedGoodsWidget.onload.tmpl_' + self.settings.uniq)
        });
    };
    self.RegisterEvents = function(){    
        EventDispatcher.AddEventListener('RelatedGoodsWidget.onload.tmpl_' + self.settings.uniq, function (data){
            var query = self.settings.relatedGoods.start + '/' + self.settings.relatedGoods.count + '/' + self.settings.relatedGoods.orderBy;
            self.BaseLoad.RelatedGoods(self.settings.relatedGoods.id, query, function(data){
                self.CheckData(data);
            })
        });
        
        EventDispatcher.AddEventListener('RelatedGoodsWidget.fill.block_' + self.settings.uniq, function (data){
            self.Render(data);
        });
        EventDispatcher.AddEventListener('widget.change.route', function() {
            self.WidgetLoader(true);
        });
    };
    self.InsertContainer = {
        EmptyWidget : function(){
            var temp = $("#" + self.settings.container).find(self.SelectCustomContent().join(', ')).clone();
            $("#" + self.settings.container).empty().html(temp);
        },
        Content : function(type){
            if(type == 'slider')
                $(self.settings.container).html($('script#' + self.GetTmplName('slider')).html());
            if(type == 'carousel')
                $(self.settings.container).html($('script#' + self.GetTmplName('carousel')).html());
            if(type == 'tile')
                $(self.settings.container).html($('script#' + self.GetTmplName('tile')).html());
            if(type == 'table') 
                $(self.settings.container).html($('script#' + self.GetTmplName('table')).html());
            if(type == 'list')
                $(self.settings.container).html($('script#' + self.GetTmplName('list')).html());
            if(type == 'empty')
                $(self.settings.container).html('');
        }
    };
    self.CheckData = function(data){ 
        if(!data.err ){
            self.InsertContainer.Content(self.settings.relatedGoods.typeView);
            self.Fill(self.settings.relatedGoods, data)
        }
        else{
            self.InsertContainer.Content('empty');
        }
    };
    self.Fill = function(settings, data){
        var related = new RelatedGoodsViewModel(settings, data);
        related.AddContent();
    };
    self.Render = function(data){
        try{
            ko.cleanNode($(self.settings.container).children()[0]);
            ko.applyBindings(data, $(self.settings.container).children()[0]);
            if(typeof AnimateRelatedGoods == 'function')
                new AnimateRelatedGoods();
            if(self.settings.animate)
                self.settings.animate();
            self.WidgetLoader(true);
        }
        catch(e){
            self.Exception('Ошибка шаблона [' + self.GetTmplName(data.typeView) + ']', e);
            if(self.settings.tmpl.custom){
                delete self.settings.tmpl.custom;
                self.BaseLoad.Tmpl(self.settings.tmpl, function(){
                    self.InsertContainer.Content(data.typeView);
                    self.Render.Content(data);
                });
            }
            else{
                self.InsertContainer.EmptyWidget();
                self.WidgetLoader(true);
            }
        }
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
            data.unshift(first);
        }
        EventDispatcher.DispatchEvent('RelatedGoodsWidget.fill.block_' + settings.uniq, self);
    }
}


