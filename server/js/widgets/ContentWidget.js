var ContentWidget = function(conteiner){
    var self = this;
    self.settingsContent = {
        conteinerIdForContent : "",
        tmplForBlock : "content/blockTmpl.html",
        tmplForContent : "content/contentTmpl.html",
        inputParameters : {},
        styleCatalog : {},
        inputParameters : {},
        countTovarsInBlock : 6,
        itemsPerPage : 20,
        startContent : 0,
        orderByContent : 'name',
        filterName : '',
        listPerPage : [],
        numberPage : 1
    };
    self.SetInputParameters = function(){
        self.settingsContent.inputParameters = JSCore.ParserInputParameters(/ContentWidget.js/);
        
        if(self.settingsContent.inputParameters.block){
            self.settingsContent.countTovarsInBlock = JSON.parse(self.settingsContent.inputParameters.block).count;
        }
        if(self.settingsContent.inputParameters.content){
            var content = JSON.parse(self.settingsContent.inputParameters.content)
            if(content.defaultCount)
                self.settingsContent.itemsPerPage = content.defaultCount;
            if(content.list)
                self.settingsContent.listPerPage = content.list;
        }
    };
    self.InitWidget = function(){
        self.settingsContent.conteinerIdForContent = conteiner;
        self.SetInputParameters();
        self.CreateContainer();
        self.RegisterEvents();
    };
    self.SelectTypeContent = function(){
        if(Parameters.typeCategory == 'category'){     
            self.LoadTmpl(self.settingsContent.tmplForContent, function(){
                EventDispatcher.DispatchEvent('onload.content.tmpl')
            });
        }
        else{
            self.LoadTmpl(self.settingsContent.tmplForBlock, function(){
                EventDispatcher.DispatchEvent('onload.blockContent.tmpl')
            });
        }
    };
    self.Load = {
        Content : function(parentId){
            if(Parameters.cache.content[parentId] == undefined){
                XDMTransport.LoadData(self.settings.dataForContent + "&parentId=" + parentId, function(data){
                    Parameters.cache.content[parentId] = data;
                    self.FillBlock(Parameters.cache.contentBlock[parentId]);
                })
            }
            else{
                self.FillBlock(Parameters.cache.contentBlock[parentId]);
            }
        }
    };
    self.RegisterEvents = function(){
        if(JSLoader.loaded){
            self.SelectTypeContent();
        }
        else{
            EventDispatcher.AddEventListener('onload.scripts', function (data){ 
                self.SelectTypeContent();
            });
        }
        
        EventDispatcher.AddEventListener('onload.blockContent.tmpl', function (){
            self.BaseLoad.Blocks(Parameters.lastItem, function(data){
                self.BustBlock(data)
            });
        });
        
        EventDispatcher.AddEventListener('onload.content.tmpl', function (){
            self.BaseLoad.Info(Parameters.activeItem, function(data){
                EventDispatcher.DispatchEvent('contentWidget.load.categoryInfo', {
                    'id':data.id
                })
            })
        });
        
        EventDispatcher.AddEventListener('contentWidget.load.categoryInfo', function(params){
            if(params.count)
                self.settingsContent.itemsPerPage = params.count;
            if(params.orderBy)
                self.settingsContent.orderByContent = params.orderBy;
            if(params.filterName)
                self.settingsContent.filterName = params.filterName;
            if(params.start)
                self.settingsContent.startContent = params.start;
            self.BaseLoad.Content(
                params.id,                              // id категори
                self.settingsContent.startContent,      // Начальная позиция в списке для получения части списка с этой позиции
                self.settingsContent.itemsPerPage, // Количество товаров в списке
                self.settingsContent.orderByContent,    // Сортировка
                self.settingsContent.filterName,        // Выборка только тех товаров в названиях которых встречается эта ключевая фраза,
                function(data){
                    self.FillContent(data, params.id);
                }
                )
        });
        
        EventDispatcher.AddEventListener('contentWidget.fill.block', function (data){
            if(data.typeView == 'slider'){ 
                self.RenderBlock(data);
                new InitSlider(data.cssBlockContainer);
                delete  data;
            }
            if(data.typeView == 'carousel'){
                self.RenderBlock(data);
                new InitCarousel(data.cssBlockContainer);
                delete  data;
            }
            if(data.typeView == 'tile'){
                self.RenderBlock(data);
                delete  data;
            }
        });
        
        EventDispatcher.AddEventListener('contentWidget.fill.listContent', function(data){
            self.InsertListContainer(data.typeView);
            self.RenderList(data);
            
            $(Parameters.sortingBlockContainer + ' .sort select').sSelect({
                defaultText: Parameters.listSort[data.filters.orderBy]
            }).change(function(){
                data.filters.orderBy = $(Parameters.sortingBlockContainer + ' .sort select').getSetSSValue();
                EventDispatcher.DispatchEvent('contentWidget.load.categoryInfo', 
                {
                    'id' : data.id, 
                    'orderBy' : $(Parameters.sortingBlockContainer + ' .sort select').getSetSSValue()
                }
                )
            });
        });
        
        EventDispatcher.AddEventListener('widget.changeHash', function (data){
            $("#" + self.settingsContent.conteinerIdForContent).html('');
            self.SelectTypeContent();
        });
    
        EventDispatcher.AddEventListener('contentWidget.click.goods', function(data){
            self.RenderTovars(data);
        });
        
        EventDispatcher.AddEventListener('contentWidget.click.category', function(data){

            });
    };
    self.BustBlock = function(data){
        for(var i = 0; i <= data.length - 1; i++){
            Parameters.cache.contentBlock[data[i].id] = {
                sort : i, 
                block : data[i]
            };
            self.InsertBlockContainer(i, data[i].type_view);
            self.Load.Content({
                'id':data[i].id
            });
        }
    };
    self.InsertBlockContainer = function(sort, type){
        if(type == 'slider'){ 
            $("#" + self.settingsContent.conteinerIdForContent).append($('script#blockSliderTmpl').html());
        }
        if(type == 'carousel'){
            $("#" + self.settingsContent.conteinerIdForContent).append($('script#blockCaruselTmpl').html());
        }
        if(type == 'table'){
            $("#" + self.settingsContent.conteinerIdForContent).append($('script#blockTileTmpl').html());
        }
        $("#" + self.settingsContent.conteinerIdForContent + ' .promoBlocks:last').attr('id', 'block_sort_' + sort).hide();
    };
    self.InsertListContainer = function(type){
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
    };
    self.FillBlock = function(data){
        var block = new BlockViewModel(data, self.settingsContent.countGoodsInBlock);
        block.AddContent();
    };
    self.FillContent = function(data, categoryId){
        var content = new ListContentViewModel(self.settingsContent);
        content.AddCategoryInfo(categoryId);
        content.AddContent(data);
    };
    self.RenderList = function(data){
        ko.applyBindings(data, $("#" + self.settingsContent.conteinerIdForContent)[0]);
        
        console.log(data.paging());
        
    //        $(".pager").pagination(data.countGoods, {
    //            current_page: self.settingsContent.numberPage-1,
    //            items_per_page: self.settingsContent.itemsPerPage,
    //            num_display_entries: 3,
    //            num_edge_entries: 3,
    //            prev_text: ' ',
    //            next_text: ' ',
    //            prev_show_always:false,
    //            next_show_always:false,
    //            callback: self.ClickPageLink
    //        });
    };
    self.RenderBlock = function(data){
        ko.applyBindings(data, $('#' + data.cssBlock)[0]);
        $('#' + data.cssBlock).show();
    }
    self.ClickPageLink = function(page_index, jq){
        if(self.settingsContent.numberPage != page_index+1){
            var start = (page_index + 1) * self.settingsContent.itemsPerPage;
            self.settingsContent.numberPage = page_index+1;
            EventDispatcher.DispatchEvent('contentWidget.load.categoryInfo', 
            {
                'id' : Parameters.lastItem, 
                'start' : start
            }
            )
        }
    }
}

/* Block */
var BlockViewModel = function(data, countGoodsInContent){
    var self = this;
    self.idBlock       = data.block.id;
    self.sort          = data.sort;
    self.titleBlock    = data.block.name_category;
    self.typeView      = data.block.type_view;
    self.countGoods    = data.count_goods;
    
    self.cssBlock      = 'block_sort_' + data.sort;
    self.cssBlockContainer  = 'sliderConteiner_' + data.block.id;
    self.imageHref     = '#';
    
    self.contentBlock  = ko.observableArray();
    
    self.AddContent = function(){
        var content = JSON.parse(Parameters.cache.content[data.block.id]);
        if(content.length < countGoodsInContent)
            countGoodsInContent = content.length;
        for(var i = 0; i <= countGoodsInContent-1; i++){
            if(data.block.type_view == 'tile'){
                var str = new BlockTrForTableViewModel();
                for(var j = 0; j <= 2; j++){
                    i = i + j;
                    if(content[i]){
                        str.AddStr(new BlockContentViewModel(content[i], i));
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
        EventDispatcher.DispatchEvent('contentWidget.fill.block', self);
    };
    self.ClickCategory = function(){
        EventDispatcher.DispatchEvent('contentWidget.click.category', self);
    };
}
var BlockContentViewModel = function(data, i){
    var self = this;
    self.id = data.id;
    self.chortName = data.chort_name;
    self.fullName = data.full_name;
    self.routeImage = Parameters.pathToImages + data.route_image;
    self.countTovars = data.count;
    self.sellGoods = data.sell_goods + " руб.";
    self.sellCost = data.sell_end_cost + " руб."; 
    //self.shortDescription = data.short_description;
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
    self.routeLogoShop =Parameters.pathToImages + data.route_logo_shop;
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
    
    self.ClickTovars = function(){
        EventDispatcher.DispatchEvent('contentWidget.click.goods', self);
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
    self.defaultAct    = '';

    self.content  = ko.observableArray();
    self.paging = ko.observableArray();
    self.filters = {
        typeView : self.typeView,
        orderBy : settings.orderByContent,
        filterName : settings.filterName,
        itemsPerPage : Parameters.paging.itemsPerPage,
        listPerPage : settings.listPerPage,
        countOptionList : ko.observable(settings.listPerPage.length-1),
        FilterNameGoods : function(data){
            self.filters.filterName = $(data.text).val();
            EventDispatcher.DispatchEvent('contentWidget.load.categoryInfo', 
            {
                'id' : self.id, 
                'filterName' : self.filters.filterName
            }
            )
        },
        SelectCount : function(count){
            self.filters.itemsPerPage = count;
            EventDispatcher.DispatchEvent('contentWidget.load.categoryInfo', 
            {
                'id' : self.id, 
                'count' : count
            }
            ) 
        },
        selectTypeView : {
            ClickTile : function(){
                self.typeView = 'tile';
                self.filters.typeView = 'tile';
                Parameters.cache.typeView = 'tile';
                self.AddContent(JSON.parse(Parameters.cache.content[self.GetQueryHash(self.id)]));
                EventDispatcher.DispatchEvent('contentWidget.fill.listContent', self);
            },
            ClickTable : function(){
                self.typeView = 'table';
                self.filters.typeView = 'table';
                Parameters.cache.typeView = 'table';
                self.AddContent(JSON.parse(Parameters.cache.content[self.GetQueryHash(self.id)]));
                EventDispatcher.DispatchEvent('contentWidget.fill.listContent', self);
            },
            ClickList : function(){
                self.typeView = 'list';
                self.filters.typeView = 'list';
                Parameters.cache.typeView = 'list';
                self.AddContent(JSON.parse(Parameters.cache.content[self.GetQueryHash(self.id)]));
                EventDispatcher.DispatchEvent('contentWidget.fill.listContent', self);
            }
        }
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
            self.typeView  = data.type_view;
            self.filters.typeView = data.type_view;
        }
        self.defaultAct    = data.default_act;
    };
    self.AddContent = function(data){
        self.content  = ko.observableArray();
        if(data && data.length > 1){
            self.countGoods    = data.shift().count_goods;
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
            EventDispatcher.DispatchEvent('contentWidget.fill.listContent', self);
        }
    };
    self.GetQueryHash = function(categoryId){
        return EventDispatcher.MD5(categoryId + settings.startContent + settings.itemsPerPage + settings.orderByContent + settings.filterName);
    };
    self.NumPages = function(){
        return Math.ceil(self.countGoods/settings.itemsPerPage)
    };
    self.GetInterval = function(){
        var ne_half = Math.ceil(Parameters.paging.numDisplayEntries/2);
        var np = self.NumPages();
        var upper_limit = np-Parameters.paging.numDisplayEntries;
        var start = Parameters.paging.currentPage>ne_half?Math.max(Math.min(Parameters.paging.currentPage-ne_half, upper_limit), 0):0;
        var end = Parameters.paging.currentPage>ne_half?Math.min(Parameters.paging.currentPage+ne_half, np):Math.min(Parameters.paging.numDisplayEntries, np);
        return [start,end];
    };
    self.AppendItem = function(page_id, appendopts){
        var np = self.NumPages();   
        page_id = page_id<0?0:(page_id<np?page_id:np-1); // Normalize page id to sane value
            
        appendopts = jQuery.extend({
            text : page_id+1, 
            classes : ""
        }, appendopts||{});
            
        if(page_id == Parameters.paging.currentPage){
            self.paging.push(new Page(true, page_id, appendopts.text, Parameters.paging.cssCurrent));
        }
        else
        {
            self.paging.push( new Page(false, page_id, appendopts.text, appendopts.classes));
        }
    };
    self.AddPages = function(){
        var interval = self.GetInterval();
        var np = self.NumPages();

        if(Parameters.paging.prevText && (Parameters.paging.currentPage > 0 || Parameters.paging.prevShowAlways)){
            self.AppendItem(Parameters.paging.currentPage-1, {
                text : Parameters.paging.prevText,
                classes : Parameters.paging.cssPrev
            })
        }
        // Generate starting points
        
        if (interval[0] > 0 && Parameters.paging.numEdgeEntries > 0)
        {
            var end = Math.min(Parameters.paging.numEdgeEntries, interval[0]);
            for(var i=0; i<end; i++) {
                self.AppendItem(i)
            }
            if(Parameters.paging.numEdgeEntries < interval[0] && Parameters.paging.ellipseText)
            {
                self.paging.push(new Page(true, 0, Parameters.paging.ellipseText, Parameters.paging.cssItem));
            }
        }
        // Generate interval links
        for(var i=interval[0]; i<interval[1]; i++) {
            self.AppendItem(i)
        }
        // Generate ending points
        if (interval[1] < np && Parameters.paging.numEdgeEntries > 0)
        {
            if(np-Parameters.paging.numEdgeEntries > interval[1]&& Parameters.paging.ellipseText)
            {
                self.paging.push(new Page(true, 0, Parameters.paging.ellipseText, Parameters.paging.cssItem));
            }
            
            var begin = Math.max(np-Parameters.paging.numEdgeEntries, interval[1]);
            for(var i=begin; i<np; i++) {
                self.AppendItem(i)
            }
				
        }
        // Generate "Next"-Link
        if(Parameters.paging.nextText && (Parameters.paging.currentPage < np-1 || Parameters.paging.nextShowAlways)){
            self.AppendItem(Parameters.paging.currentPage+1, {
                text : Parameters.paging.nextText,
                classes : Parameters.paging.cssNext
            })
        }
    }
}

var Page = function(current, pageId, title, cssLink){
    var self = this;
    self.pageId = pageId;
    self.title = title;
    self.current = current;
    self.cssLink = ko.computed(function(){
        if(cssLink)
            return cssLink;
        return Parameters.paging.cssItem;
    }, this);
    self.ClickLinkPage = function(){
        alert(self.pageId);
    }
}
/* End Content*/
var TestContent = {
    Init : function(){
        if(typeof Widget == 'function' && JSCore !== undefined && Parameters.typeCategory != ""){
            ContentWidget.prototype = new Widget();
            var content = new ContentWidget('content');
            content.Init();
        }
        else{
            window.setTimeout(TestContent.Init, 100);
        }
    }
}

TestContent.Init();
