var ContentWidget = function(conteiner){
    var self = this;
    self.widgetName = 'ContentWidget';
    self.settingsContent = {
        conteinerIdForContent : "",
        tmplForBlock : Config.Content.tmplForBlock,
        tmplForContent : Config.Content.tmplForContent,
        inputParameters : {},
        styleCatalog : {},
        inputParameters : {},
        countGoodsInBlock : Config.Content.countGoodsInBlock,
        orderByContent : Config.Content.orderBy,
        filterName : '',
        listPerPage : Config.Content.listPerPage,
        slider : [],
        paging : Config.Paging,
        styleContent : Config.Content.style
    };
    self.SetInputParameters = function(){
        self.settingsContent.inputParameters = JSCore.ParserInputParameters(/ContentWidget.js/);
        
        if(self.settingsContent.inputParameters.block){
            self.settingsContent.countGoodsInBlock = JSON.parse(self.settingsContent.inputParameters.block).count;
        }
        if(self.settingsContent.inputParameters.content){
            var content = JSON.parse(self.settingsContent.inputParameters.content)
            if(content.defaultCount)
                self.settingsContent.paging.itemsPerPage = content.defaultCount;
            if(content.list)
                self.settingsContent.listPerPage = content.list;
        }
    };
    self.InitWidget = function(){
        self.settingsContent.conteinerIdForContent = conteiner;
        self.SetInputParameters();
        self.RegisterEvents();
        self.Route();
        self.SetPosition();
    };
    self.Route = function(){
        if(Route.route == 'catalog'){
            self.SelectTypeContent();
        }
        else{
            ReadyWidgets.Indicator('ContentWidget', true);
        }
    };
    self.SelectTypeContent = function(){
        if(Route.IsCategory()){  
            self.BaseLoad.Tmpl(self.settingsContent.tmplForContent, function(){
                EventDispatcher.DispatchEvent('onload.content.tmpl')
            });
        }
        else{
            self.BaseLoad.Tmpl(self.settingsContent.tmplForBlock, function(){
                EventDispatcher.DispatchEvent('onload.blockContent.tmpl')
            });
        }
    };
    self.RegisterEvents = function(){
        EventDispatcher.AddEventListener('onload.blockContent.tmpl', function (){
            self.BaseLoad.Blocks(Route.GetActiveCategory(), function(data){
                self.BustBlock(data)
            });
        });
        
        EventDispatcher.AddEventListener('onload.content.tmpl', function (){
            self.BaseLoad.Info(Route.GetActiveCategory(), function(data){
                EventDispatcher.DispatchEvent('contentWidget.load.categoryInfo')
            })
        });
        
        EventDispatcher.AddEventListener('contentWidget.load.categoryInfo', function(){ 
            var start = (Route.GetCurrentPage()-1) * self.settingsContent.paging.itemsPerPage;
            var orderBy = Route.GetMoreParameter('orderBy') ? Route.GetMoreParameter('orderBy') : self.settingsContent.orderByContent;
            var query = start + '/' + self.settingsContent.paging.itemsPerPage + '/' + orderBy + '/' + encodeURIComponent(Route.GetMoreParameter('filterName'));
            self.BaseLoad.Content(Route.params.category, query, function(data){ self.Fill.Content(data) })
        });
        
        EventDispatcher.AddEventListener('contentWidget.fill.block', function (data){
            if(data.typeView == 'slider'){ 
                self.Render.Block(data);
                new InitSlider(data.cssBlockContainer);
                delete  data;
            }
            if(data.typeView == 'carousel'){
                self.Render.Block(data);
                new InitCarousel(data.cssBlockContainer);
                delete  data;
            }
            if(data.typeView == 'tile'){
                self.Render.Block(data);
                delete  data;
            }
        });
        
        EventDispatcher.AddEventListener('contentWidget.fill.listContent', function(data){
            self.InsertContainer.List(data.typeView);
            self.Render.List(data);
            
            $(Parameters.sortingBlockContainer + ' .sort select').sSelect({
                defaultText: Parameters.listSort[data.filters.orderBy]
            }).change(function(){
                ReadyWidgets.Indicator('ContentWidget', false);
                data.filters.orderBy = $(Parameters.sortingBlockContainer + ' .sort select').getSetSSValue();
                
                Route.UpdateMoreParameters({orderBy : data.filters.orderBy});
                Route.UpdateHash({page : 1});
            });
        });
        
        EventDispatcher.AddEventListener('widget.change.route', function (data){
            if(Route.route == 'catalog'){
                ReadyWidgets.Indicator('ContentWidget', false);
                self.SelectTypeContent();
            }
        });
    
        EventDispatcher.AddEventListener('contentWidget.click.category', function(data){
            if($('script#contentTileTmpl').length < 0){
                self.BaseLoad.Tmpl(self.settingsContent.tmplForContent, function(){
                    EventDispatcher.DispatchEvent('onload.content.tmpl')
                });
            }
            else{
                EventDispatcher.DispatchEvent('onload.content.tmpl')
            }
        });
    };
    self.BustBlock = function(data){
        $("#" + self.settingsContent.conteinerIdForContent).html('');
        if(data.err)
            ReadyWidgets.Indicator('ContentWidget', true);
        for(var i = 0; i <= data.length - 1; i++){
            Parameters.cache.contentBlock[data[i].id] = {
                sort : i, 
                block : data[i]
            };
            self.InsertContainer.Block(i, data[i].type_view);
            
            var query = '0/' + self.settingsContent.countGoodsInBlock + '/name/';
            var queryHash = data[i].id + EventDispatcher.hashCode(query);
            
            EventDispatcher.AddEventListener('contentWidget.onload.content%%' + queryHash, function(data){
                self.Fill.Block(Parameters.cache.contentBlock[data.categoryId]);
            });

            self.BaseLoad.Content(data[i].id, query, function(data){
                EventDispatcher.DispatchEvent('contentWidget.onload.content%%' + queryHash, data)
            })
        }
    };
    self.InsertContainer = {
        Block : function(sort, type){
            if(type == 'slider'){ 
                $("#" + self.settingsContent.conteinerIdForContent).append($('script#blockSliderTmpl').html());
            }
            if(type == 'carousel'){
                $("#" + self.settingsContent.conteinerIdForContent).append($('script#blockCaruselTmpl').html());
            }
            if(type == 'tile'){
                $("#" + self.settingsContent.conteinerIdForContent).append($('script#blockTileTmpl').html());
            }
            $("#" + self.settingsContent.conteinerIdForContent + ' .promoBlocks:last').attr('id', 'block_sort_' + sort).hide();
        },
        List : function(type){
            $("#" + self.settingsContent.conteinerIdForContent).html('');
            if(type == 'table'){ 
                $("#" + self.settingsContent.conteinerIdForContent).append($('script#contentTableTmpl').html());
            }
            if(type == 'list'){
                $("#" + self.settingsContent.conteinerIdForContent).append($('script#contentListTmpl').html());
            }
            if(type == 'tile'){
                $("#" + self.settingsContent.conteinerIdForContent).append($('script#contentTileTmpl').html());
            }
            if(type == 'no_results'){
                $("#" + self.settingsContent.conteinerIdForContent).append($('script#contentNoResultsTmpl').html());
            }
        }
    };
    self.Fill = {
        Block : function(data){
            var block = new BlockViewModel(data, self.settingsContent.countGoodsInBlock);
            block.AddContent();
        },
        Content : function(data){
            if(data.content[0].count_goods  != 0){
                var content = new ListContentViewModel(self.settingsContent);
                content.AddCategoryInfo(data.categoryId);
                content.AddContent(data.content);
            }
            else{
                var content = new ListContentViewModel(self.settingsContent);
                content.AddCategoryInfo(data.categoryId);
                if(content.filters.filterName != ''){
                    content.SetType('no_results');
                    content.SetMessage(Config.Content.message.filter.replace(/%%filterName%%/g, content.filters.filterName));
                }
                else{
                    content.SetType('no_results');
                    content.SetMessage(Config.Content.message.noGoods);
                }
                EventDispatcher.DispatchEvent('contentWidget.fill.listContent', content);
            }
        }
    };
    self.Render = {
        List : function(data){
            if($("#" + self.settingsContent.conteinerIdForContent).length > 0){
                $("#wrapper").removeClass("with_sidebar").addClass("with_top_border");
                ko.applyBindings(data, $("#" + self.settingsContent.conteinerIdForContent)[0]);
            }
            delete data;
            ReadyWidgets.Indicator('ContentWidget', true);
        },
        Block : function(data){
            if($('#' + data.cssBlock).length > 0){
                ko.applyBindings(data, $('#' + data.cssBlock)[0]);
                $('#' + data.cssBlock).show();
            }
            delete data;
            ReadyWidgets.Indicator('ContentWidget', true);
        },
        NoResults : function(data){
            if($("#" + self.settingsContent.conteinerIdForContent).length > 0){
                $("#wrapper").removeClass("with_sidebar").addClass("with_top_border");
                ko.applyBindings(data, $("#" + self.settingsContent.conteinerIdForContent)[0]);
            }
            ReadyWidgets.Indicator('ContentWidget', true);
        }
    };
    self.SetPosition = function(){
        if(self.settingsContent.inputParameters['position'] == 'absolute'){
            for(var key in self.settingsContent.inputParameters){
                if(self.settingsContent.styleContent[key])
                    self.settingsContent.styleContent[key] = self.settingsContent.inputParameters[key];
            }
            $().ready(function(){
                $("#" + conteiner).css(self.settingsContent.styleContent);
            });
        }
    }
}

/* Block */
var BlockViewModel = function(data, countGoodsInContent){
    var self = this;
    self.id            = data.block.id;
    self.sort          = data.sort;
    self.titleBlock    = data.block.name_category;
    self.typeView      = data.block.type_view;
    self.countGoods    = data.block.count_goods;
    
    self.cssBlock      = 'block_sort_' + data.sort;
    self.cssBlockContainer  = 'sliderConteiner_' + self.id ;
    self.imageHref     = '#';
    
    self.contentBlock  = ko.observableArray();
    
    self.AddContent = function(){
        var query = '0/' + countGoodsInContent + '/name/';
        var queryHash = self.id + EventDispatcher.hashCode(query);
        var content = Parameters.cache.content[queryHash].content;
        if(content && content.length > 1){
            var last = content.shift()
            self.countGoods  = last.count_goods;
        
            if(content.length < countGoodsInContent)
                countGoodsInContent = content.length;
            
            var f = 0;
            for(var i = 0; i <= countGoodsInContent-1; i++){
                if(self.typeView == 'tile'){
                    var str = new BlockTrForTableViewModel();
                    for(var j = 0; j <= 2; j++){
                        if(content[f]){
                            str.AddStr(new BlockContentViewModel(content[f], f));
                            f++;
                        }
                        else
                            break;
                    }
                    if(str.str().length > 0)
                        self.contentBlock.push(str);
                    delete str;
                }
                else{
                    self.contentBlock.push(new BlockContentViewModel(content[i], i));
                }
            }
            content.unshift(last);
            EventDispatcher.DispatchEvent('contentWidget.fill.block', self);
        }
    };
    self.ClickCategory = function(){
        ReadyWidgets.Indicator('ContentWidget', false);
        Route.UpdateHash({category:data.block.id});
        Route.SetHash('catalog', self.titleBlock, Route.params);
    };
}
var BlockContentViewModel = function(data, i){
    var self = this;
    self.id = data.id;
    self.chortName = data.chort_name;
    self.fullName = data.full_name;
    self.routeImage = Parameters.pathToImages + data.route_image;
    self.countTovars = data.count;
    self.sellGoods = data.sell_cost + " руб.";
    self.sellCost = data.sell_end_cost + " руб.";
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
    self.routeLogoShop = Parameters.pathToImages + data.route_logo_shop;
    self.positiveOpinion = '+' + data.positive_opinion;
    self.negativeOpinion = '-' + data.negative_opinion;
    self.keyWords = data.key_words;
    self.idAuction = ko.computed(function(){
        if(data.id_auction)
            return data.id_auction;
        else
            return 0;
    },this);
    self.routIconAuction = Parameters.routIconAuction;
    self.imageHref = '#' + (i+1);
    self.cssBlock = 'views-row views-row-' + (i+1);
    
    self.ClickGoods = function(){
        Route.SetHash('goods', self.chortName, {category : Route.GetActiveCategory(),id : self.id});
    }
    self.ClickShop = function(){
        alert(self.shopId);
    }
    self.ClickBuy = function(){
    //alert()
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
/* End Block */

/* Content List*/
var ListContentViewModel = function(settings){
    var self = this;
    self.id       = 0;
    self.titleBlock    = '';
    self.typeView      = 'tile';
    self.countGoods    = 0;
    self.message = '';

    self.content  = ko.observableArray();
    self.paging = ko.observableArray();
    self.filters = {
        typeView : self.typeView,
        orderBy : Route.GetMoreParameter('orderBy') ? Route.GetMoreParameter('orderBy') : settings.orderByContent,
        filterName : Route.GetMoreParameter('filterName') ? Route.GetMoreParameter('filterName') : settings.filterName,
        itemsPerPage : settings.paging.itemsPerPage,
        listPerPage : settings.listPerPage,
        countOptionList : ko.observable(settings.listPerPage.length-1),
        FilterNameGoods : function(data){
            self.filters.filterName = settings.filterName = $(data.text).val();

            ReadyWidgets.Indicator('ContentWidget', false);
            
            Route.UpdateMoreParameters({filterName : self.filters.filterName});
            Route.UpdateHash({page : 1});
        },
        SelectCount : function(count){
            ReadyWidgets.Indicator('ContentWidget', false);
            self.filters.itemsPerPage = settings.paging.itemsPerPage = count;

            Route.UpdateHash({page : 1}); 
        },
        selectTypeView : {
            ClickTile : function(){
                self.typeView = 'tile';
                self.filters.typeView = 'tile';
                Parameters.cache.typeView = 'tile';
                self.AddContent(Parameters.cache.content[self.GetQueryHash()].content);
                EventDispatcher.DispatchEvent('contentWidget.fill.listContent', self);
            },
            ClickTable : function(){
                self.typeView = 'table';
                self.filters.typeView = 'table';
                Parameters.cache.typeView = 'table';
                self.AddContent(Parameters.cache.content[self.GetQueryHash()].content);
                EventDispatcher.DispatchEvent('contentWidget.fill.listContent', self);
            },
            ClickList : function(){
                self.typeView = 'list';
                self.filters.typeView = 'list';
                Parameters.cache.typeView = 'list';
                self.AddContent(Parameters.cache.content[self.GetQueryHash()].content);
                EventDispatcher.DispatchEvent('contentWidget.fill.listContent', self);
            }
        }
    };
    self.SetType = function(type){
        self.typeView = type;
    };
    self.SetMessage = function(message){
       self.message = message; 
    };
    self.AddCategoryInfo = function(categoryId){
        var data = JSON.parse(Parameters.cache.infoCategory[categoryId]);
        self.id            = data.id;
        self.titleBlock    = data.name_category;
        if(Parameters.cache.typeView){
            self.typeView = Parameters.cache.typeView;
            self.filters.typeView = Parameters.cache.typeView;
        }
        else if(data.type_view){
            var typeView = data.type_view;
            if(data.type_view == 'carousel' || data.type_view == 'slider')
                var typeView = 'tile';
            self.typeView  = typeView;
            self.filters.typeView = typeView;
        }
    };
    self.AddContent = function(data){
        self.content  = ko.observableArray();
        if(data && data.length > 1){
            var last = data.shift();
            self.countGoods = last.count_goods;
            var f = 0;
            for(var i = 0; i <= data.length-1; i++){
                if(self.typeView == 'tile'){
                    var str = new BlockTrForTableViewModel();
                    for(var j = 0; j <= 3; j++){
                        if(data[f]){
                            str.AddStr(new BlockContentViewModel(data[f], f));
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
                    self.content.push(new BlockContentViewModel(data[i], i));
                }
            }
            self.AddPages();
            data.unshift(last);
            EventDispatcher.DispatchEvent('contentWidget.fill.listContent', self);
        }
    };
    self.GetQueryHash = function(){
        var start = (Route.GetCurrentPage()-1) * settings.paging.itemsPerPage;
        var orderBy = Route.GetMoreParameter('orderBy') ? Route.GetMoreParameter('orderBy') : settings.orderByContent;
        var query = start + '/' + settings.paging.itemsPerPage + '/' + orderBy + '/' + encodeURIComponent(Route.GetMoreParameter('filterName'));
        return Route.GetActiveCategory() + EventDispatcher.hashCode(query);
    };
    self.AddPages = function(){
        var ClickLinkPage = function(){
            ReadyWidgets.Indicator('ContentWidget', false);

            Route.UpdateHash({page : this.pageId});
        }
        
        self.paging = Paging.GetPaging(self.countGoods, settings, ClickLinkPage);
    }
}

/* End Content*/
var TestContent = {
    Init : function(){
        if(typeof Widget == 'function'){
            ReadyWidgets.Indicator('ContentWidget', false);
            ContentWidget.prototype = new Widget();
            var content = new ContentWidget(Config.Conteiners.content);
            content.Init(content);
        }
        else{
            window.setTimeout(TestContent.Init, 100);
        }
    }
}

TestContent.Init();
