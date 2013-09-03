var ContentWidget = function(){
    var self = this;
    self.widgetName = 'ContentWidget';
    self.settings = {
        containerId : null,
        tmplForBlock : null,
        tmplForContent : null,
        blockSliderTmpl : null,
        blockCaruselTmpl : null,
        blockTileTmpl : null,
        contentTableTmpl : null,
        contentListTmpl : null,
        contentTileTmpl : null,
        noResultsTmpl : null,
        inputParameters : {},
        styleCatalog : {},
        countGoodsInBlock : null,
        orderByContent : null,
        filterName : '',
        listPerPage : null,
        slider : [],
        paging : null,
        styleContent : null
    };
    self.testBlock = {
        count : 0,
        ready : 0,
        IsReady : function(){
            if(self.testBlock.count == self.testBlock.ready)
                return true;
            return false;
        }
    };
    self.SetInputParameters = function(){
        self.settings.inputParameters = JSCore.ParserInputParameters(/ContentWidget.js/);
        
        if(self.settings.inputParameters.block){
            self.settings.countGoodsInBlock = JSON.parse(self.settings.inputParameters.block).count;
        }
        if(self.settings.inputParameters.content){
            var content = JSON.parse(self.settings.inputParameters.content)
            if(content.defaultCount)
                self.settings.paging.itemsPerPage = content.defaultCount;
            if(content.list)
                self.settings.listPerPage = content.list;
        }
    };
    self.InitWidget = function(){
        self.settings.containerId = Config.Containers.content;
        self.settings.blockContainerId = Config.Containers.block;
        self.settings.tmplForBlock = Config.Content.tmpl.pathBlock;
        self.settings.tmplForContent = Config.Content.tmpl.pathList;
        self.settings.blockMainTmpl = Config.Content.tmpl.blockMainTmpl;
        self.settings.blockSliderTmpl = Config.Content.tmpl.blockSliderTmpl;
        self.settings.blockCaruselTmpl = Config.Content.tmpl.blockCaruselTmpl;
        self.settings.blockTileTmpl = Config.Content.tmpl.blockTileTmpl;
        self.settings.contentTableTmpl = Config.Content.tmpl.contentTableTmpl;
        self.settings.contentListTmpl = Config.Content.tmpl.contentListTmpl;
        self.settings.contentTileTmpl = Config.Content.tmpl.contentTileTmpl;
        self.settings.noResultsTmpl = Config.Content.tmpl.noResultsTmpl;
        self.settings.countGoodsInBlock = Config.Content.countGoodsInBlock;
        self.settings.orderByContent = Config.Content.orderBy;
        self.settings.listPerPage = Config.Content.listPerPage;
        self.settings.paging = Config.Paging;
        self.settings.styleContent = Config.Content.style;
        self.SetInputParameters();
        self.RegisterEvents();
        self.CheckRouting();
        self.SetPosition();
    };
    self.CheckRouting = function(){
        if(Routing.route == 'catalog'){
            self.SelectTypeContent();
        }
        else{
            self.WidgetLoader(true);
        }
    };
    self.SelectTypeContent = function(){
        if(Routing.IsCategory()){  
            self.BaseLoad.Tmpl(self.settings.tmplForContent, function(){
                EventDispatcher.DispatchEvent('onload.content.tmpl')
            });
        }
        else{
            self.BaseLoad.Tmpl(self.settings.tmplForBlock, function(){
                EventDispatcher.DispatchEvent('onload.blockContent.tmpl')
            });
        }
    };
    self.RegisterEvents = function(){
        EventDispatcher.AddEventListener('onload.blockContent.tmpl', function (){
            self.BaseLoad.Blocks(Routing.GetActiveCategory(), function(data){
                self.CheckData(data)
            });
        });
        
        EventDispatcher.AddEventListener('onload.content.tmpl', function (){
            self.BaseLoad.Info(Routing.GetActiveCategory(), function(data){
                EventDispatcher.DispatchEvent('contentWidget.load.categoryInfo')
            })
        });
        
        EventDispatcher.AddEventListener('contentWidget.load.categoryInfo', function(){ 
            var start = (Routing.GetCurrentPage()-1) * self.settings.paging.itemsPerPage;
            var orderBy = Routing.GetMoreParameter('orderBy') ? Routing.GetMoreParameter('orderBy') : self.settings.orderByContent;
            var query = start + '/' + self.settings.paging.itemsPerPage + '/' + orderBy + '/' + encodeURIComponent(Routing.GetMoreParameter('filterName'));
            self.BaseLoad.Content(Routing.params.category, query, function(data){ self.Fill.Content(data) })
        });
        
        EventDispatcher.AddEventListener('contentWidget.fill.block', function (data){
            self.Render.Block(data);
            delete  data;
        });
        
        EventDispatcher.AddEventListener('contentWidget.fill.listContent', function(data){
            self.InsertContainer.List(data.typeView);
            self.Render.List(data);
        });
        
        EventDispatcher.AddEventListener('widget.change.route', function (data){
            if(Routing.route == 'catalog'){
                self.WidgetLoader(false);
                self.SelectTypeContent();
            }
        });
    
        EventDispatcher.AddEventListener('contentWidget.click.category', function(data){
            if($('script#contentTileTmpl').length < 0){
                self.BaseLoad.Tmpl(self.settings.tmplForContent, function(){
                    EventDispatcher.DispatchEvent('onload.content.tmpl')
                });
            }
            else{
                EventDispatcher.DispatchEvent('onload.content.tmpl')
            }
        });
    };
    self.CheckData = function(data){
        self.InsertContainer.Main();
        if(data.err)
            self.WidgetLoader(true);
        else{
            self.testBlock.count = data.length;
            for(var i = 0; i <= data.length - 1; i++){
                Parameters.cache.contentBlock[data[i].id] = {
                    sort : i, 
                    block : data[i]
                };
                self.InsertContainer.Block(i, data[i].type_view);

                var query = '0/' + self.settings.countGoodsInBlock + '/name/';
                var queryHash = data[i].id + EventDispatcher.HashCode(query);

                EventDispatcher.AddEventListener('contentWidget.onload.content%%' + queryHash, function(data){
                    self.Fill.Block(Parameters.cache.contentBlock[data.categoryId]);
                });

                self.BaseLoad.Content(data[i].id, query, function(data){
                    EventDispatcher.DispatchEvent('contentWidget.onload.content%%' + queryHash, data)
                })
            }
        }
    };
    self.InsertContainer = {
        Main : function(){
            if($('#' + self.settings.blockContainerId).length == 0)
                $("#" + self.settings.containerId).html($('script#' + self.settings.blockMainTmpl).html());
            else
                $('#' + self.settings.blockContainerId).empty();
        },
        Block : function(sort, type){
            if(type == 'slider'){ 
                $("#" + self.settings.blockContainerId).append($('script#' + self.settings.blockSliderTmpl).html());
            }
            if(type == 'carousel'){
                $("#" + self.settings.blockContainerId).append($('script#' + self.settings.blockCaruselTmpl).html());
            }
            if(type == 'tile'){
                $("#" + self.settings.blockContainerId).append($('script#' + self.settings.blockTileTmpl).html());
            }
            $("#" + self.settings.blockContainerId + ' .promoBlocks:last').attr('id', 'block_sort_' + sort);
        },
        List : function(type){
            $("#" + self.settings.containerId).html('');
            if(type == 'table'){ 
                $("#" + self.settings.containerId).append($('script#' + self.settings.contentTableTmpl).html());
            }
            if(type == 'list'){
                $("#" + self.settings.containerId).append($('script#' + self.settings.contentListTmpl).html());
            }
            if(type == 'tile'){
                $("#" + self.settings.containerId).append($('script#' + self.settings.contentTileTmpl).html());
            }
            if(type == 'no_results'){
                $("#" + self.settings.containerId).append($('script#' + self.settings.noResultsTmpl).html());
            }
        }
    };
    self.Fill = {
        Block : function(data){
            var block = new BlockViewModel(data, self.settings.countGoodsInBlock);
            block.AddContent();
        },
        Content : function(data){
            if(data.content[0].count_goods  != 0){
                var content = new ListContentViewModel(self.settings);
                content.AddCategoryInfo(data.categoryId);
                content.AddContent(data.content);
            }
            else{
                var content = new ListContentViewModel(self.settings);
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
        Animate : {
            block : ko.observableArray(),
            Do : function(){
                var b = self.Render.Animate.block()
                $.each(b, function(i){
                    if(b[i].type == 'slider')
                        new AnimateSlider(b[i].css);
                    if(b[i].type == 'carousel')
                        new AnimateCarousel(b[i].css);
                })
            }
        },
        List : function(data){
            if($("#" + self.settings.containerId).length > 0){
                ko.applyBindings(data, $("#" + self.settings.containerId)[0]);
                var f = data.filters;
                new AnimateSelectList(f.sort.cssSortList);
            }
            delete data;
            self.WidgetLoader(true);
        },
        Block : function(data){
            if($('#' + data.cssBlock).length > 0){
                ko.applyBindings(data, $('#' + data.cssBlock)[0]);
                self.Render.Animate.block.push({type: data.typeView, css : data.cssBlockContainer})
                self.testBlock.ready = self.testBlock.ready + 1;

                if(self.testBlock.IsReady()){
                    self.WidgetLoader(true); 
                    self.Render.Animate.Do();
                }
            }
            delete data;
        },
        NoResults : function(data){
            if($("#" + self.settings.containerId).length > 0){
                ko.applyBindings(data, $("#" + self.settings.containerId)[0]);
            }
            self.WidgetLoader(true);
        }
    };
    self.SetPosition = function(){
        if(self.settings.inputParameters['position'] == 'absolute'){
            for(var key in self.settings.inputParameters){
                if(self.settings.styleContent[key])
                    self.settings.styleContent[key] = self.settings.inputParameters[key];
            }
            $().ready(function(){
                $("#" + self.settings.containerId).css(self.settings.styleContent);
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
    self.cssBlockContainer  = 'sliderContainer_' + self.id ;
    self.imageHref     = '#';
    
    self.contentBlock  = ko.observableArray();
    
    self.AddContent = function(){
        var query = '0/' + countGoodsInContent + '/name/';
        var queryHash = self.id + EventDispatcher.HashCode(query);
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
                            str.AddStr(new ContentViewModel(content[f], f));
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
                    self.contentBlock.push(new ContentViewModel(content[i], i));
                }
            }
            content.unshift(last);
            EventDispatcher.DispatchEvent('contentWidget.fill.block', self);
        }
    };
    self.ClickCategory = function(){
        Loader.Indicator('ContentWidget', false);
        Routing.UpdateHash({category:data.block.id});
        Routing.SetHash('catalog', self.titleBlock, Routing.params);
    };
}

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
    self.GetSort = function(){
        var s = new SortContentListViewModel();
        s.AddContent(Config.Content.sortList);
        s.SetDefault(Routing.GetMoreParameter('orderBy') ? Routing.GetMoreParameter('orderBy') : settings.orderByContent);
        return s;
    };
    self.filters = {
        typeView : self.typeView,
        filterName : Routing.GetMoreParameter('filterName') ? Routing.GetMoreParameter('filterName') : settings.filterName,
        itemsPerPage : settings.paging.itemsPerPage,
        listPerPage : ko.observableArray(),
        countOptionList : ko.observable(settings.listPerPage.length-1),
        sort : self.GetSort(),
        FilterNameGoods : function(data){
            self.filters.filterName = settings.filterName = $(data.text).val();

            Loader.Indicator('ContentWidget', false);
            
            Routing.UpdateMoreParameters({filterName : self.filters.filterName});
            Routing.UpdateHash({page : 1});
        },
        ViewSelectCount : function(){
            self.filters.listPerPage = ko.observableArray();
            for(var key in settings.listPerPage){
                if(settings.listPerPage[key] < self.countGoods)
                   self.filters.listPerPage.push(settings.listPerPage[key])
               else{
                   self.filters.listPerPage.push(settings.listPerPage[key]);
                   break;
                }
            }
            if(self.filters.listPerPage().length == 1)
                self.filters.listPerPage = ko.observableArray();
        },
        SelectCount : function(count){
            Loader.Indicator('ContentWidget', false);
            self.filters.itemsPerPage = settings.paging.itemsPerPage = count;

            Routing.UpdateHash({page : 1}); 
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
            self.AddPages();
            data.unshift(last);
            
            self.filters.ViewSelectCount();
            EventDispatcher.DispatchEvent('contentWidget.fill.listContent', self);
        }
    };
    self.GetQueryHash = function(){
        var start = (Routing.GetCurrentPage()-1) * settings.paging.itemsPerPage;
        var orderBy = Routing.GetMoreParameter('orderBy') ? Routing.GetMoreParameter('orderBy') : settings.orderByContent;
        var query = start + '/' + settings.paging.itemsPerPage + '/' + orderBy + '/' + encodeURIComponent(Routing.GetMoreParameter('filterName'));
        return Routing.GetActiveCategory() + EventDispatcher.HashCode(query);
    };
    self.AddPages = function(){
        var ClickLinkPage = function(){
            Loader.Indicator('ContentWidget', false);

            Routing.UpdateHash({page : this.pageId});
        }
        
        self.paging = Paging.GetPaging(self.countGoods, settings, ClickLinkPage);
    }
}

var SortContentItemViewModel = function(data, active){
    var self = this;
    self.name = data.name;
    self.title = data.title;
    self.ClickSort = function(){
        active(self);
        Loader.Indicator('ContentWidget', false); 
                
        Routing.UpdateMoreParameters({orderBy : self.name});
        Routing.UpdateHash({page : 1});
    };
};

var SortContentListViewModel = function(){
    var self = this;
    self.activeItem = ko.observable();
    self.list = ko.observableArray();
    self.cssSortList = 'sort_list';
    
    self.AddContent = function(data){
        $.each(data, function(i){
            self.list.push(new SortContentItemViewModel(data[i], self.activeItem));
        });
    };
    self.SetDefault = function(orderBy){
        $.each(self.list(), function(i){
            if(self.list()[i].name == orderBy)
                self.activeItem(self.list()[i]);
        });
    };
};

/* End Content*/
var TestContent = {
    Init : function(){
        if(typeof Widget == 'function'){
            ContentWidget.prototype = new Widget();
            var content = new ContentWidget();
            content.Init(content);
        }
        else{
            setTimeout(function(){TestContent.Init()}, 100);
        }
    }
}

TestContent.Init();
