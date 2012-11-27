var ContentWidget = function(conteiner){
    var self = this;
    self.settingsContent = {
        conteinerIdForContent : "",
        tmplForBlock : "content/blockTmpl.html",
        tmplForContent : "content/contentTmpl.html",
        inputParameters : {},
        styleCatalog : {}
    };
    self.InitWidget = function(){
        self.settingsContent.conteinerIdForContent = conteiner;
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
        Blocks : function(){
            if(!Parameters.cache.block[Parameters.lastItem]){
                XDMTransport.LoadData(self.settings.dataBlocksForCatalog + "&parentId=" + Parameters.lastItem, function(data){
                    Parameters.cache.block[Parameters.lastItem] = data;
                    self.BustBlock(JSON.parse(data));
                })
            }
            else{
                self.BustBlock(JSON.parse(Parameters.cache.block[Parameters.lastItem]));
            }
        },
        Content : function(parentId){
            if(Parameters.cache.contentBlock[parentId].content != undefined){
                XDMTransport.LoadData(self.settings.dataForContent + "&parentId=" + parentId, function(data){
                    var t = JSON.parse(data);
                    Parameters.cache.contentBlock[parentId] = {
                        sort : Parameters.cache.contentBlock[parentId]['sort'], 
                        block : Parameters.cache.contentBlock[parentId]['block'], 
                        content : t
                    };
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
        
        EventDispatcher.AddEventListener('onload.blockContent.tmpl', function (data){
            self.Load.Blocks();
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
            if(data.typeView == 'table'){
                self.RenderBlock(data);
                delete  data;
            }
        });

        EventDispatcher.AddEventListener('onload.content.tmpl', function (data){
            alert('content')
        });
        
        
    };
    self.BustBlock = function(data){
        for(var i = 0; i <= data.length - 1; i++){
            Parameters.cache.contentBlock[data[i].id] = {
                sort : i, 
                block : data[i], 
                content : []
            };
            self.InsertContainer(i, data[i].type_view);
            self.Load.Content(data[i].id);
        }
    };
    self.InsertContainer = function(sort, type){
        if(type == 'slider'){ 
            $("#" + self.settingsContent.conteinerIdForContent).append($('script#blockSliderTmpl').html());
        }
        if(type == 'carousel'){
            $("#" + self.settingsContent.conteinerIdForContent).append($('script#blockCaruselTmpl').html());
        }
        if(type == 'table'){
            $("#" + self.settingsContent.conteinerIdForContent).append($('script#blockTovarsTmpl').html());
        }
        $("#" + self.settingsContent.conteinerIdForContent + ' .promoBlocks:last').attr('id', 'block_sort_' + sort).hide();
    };
    self.FillBlock = function(data){
        var block = null;
        block = new BlockViewModel(data);
        block.AddContent();
    };
    self.RenderBlock = function(data){
        ko.applyBindings(data, $('#' + data.cssBlock)[0]);
        $('#' + data.cssBlock).show();
    }
}

/* Block */
var BlockViewModel = function(data){
    var self = this;
    self.idBlock       = data.block.id;
    self.sort          = data.sort;
    self.titleBlock    = data.block.name_category;
    self.typeView      = data.block.type_view;
    
    self.cssBlock      = 'block_sort_' + data.sort;
    self.cssBlockContainer  = 'sliderConteiner_' + data.block.id;
    self.imageHref     = '#';
    
    self.contentBlock  = ko.observableArray();
    
    self.AddContent = function(){
        for(var i = 0; i <= data.content.length-1; i++){
            if(data.block.type_view == 'table'){
                var str = new BlockTrForTableViewModel();
                for(var j = 0; j <= 2; j++){
                    i = i + j;
                    if(data.content[i]){
                        str.AddStr(new BlockContentViewModel(data.content[i], i));
                    }
                    else
                        break;
                }
                if(str.str().length > 0)
                    self.contentBlock.push(str);
                delete str;
            }
            else{
                self.contentBlock.push(new BlockContentViewModel(data.content[i], i));
            }
        }
        EventDispatcher.DispatchEvent('contentWidget.fill.block', self);
    };
}
var BlockContentViewModel = function(data, i){
    var self = this;
    self.idBlockContent = data.id;
    self.chortNameBlockContent = data.chort_name;
    self.fullNameBlockContent = data.full_name;
    self.routeImageBlockContent = data.route_image;
    self.countTovarsBlockContent = data.count;
    self.sellCostBlockContent = data.sell_cost + " руб.";
    self.keyWordsBlockContent = data.key_words;
    self.shortDescriptionBlockContent = data.short_description;
    self.descriptionBlockContent = data.description;
    self.ratingBlockContent = data.rating;
    self.discountBlockContent = data.discount;
    self.shopIdBlockContent = data.shop_id;
    self.shopNameBlockContent = data.shop_name;
    self.shopRatingBlockContent = data.shop_rating;
    self.reviewsBlockContent = data.reviews;
    self.idAuctionBlockContent = data.id_auction
    
    self.imageHrefBlockContent = '#' + (i+1);
    self.cssBlockContent = 'views-row views-row-' + (i+1);
    
    self.OldPriceBlockContent = ko.computed(function(){
        
        return parseInt(data.discount)*parseInt(data.sell_cost.replace(' ', ''))/100  + " руб.";
    }, this);
    self.ClickItemBlockContent = function(){
        EventDispatcher.DispatchEvent('widget.click.content', data)
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
