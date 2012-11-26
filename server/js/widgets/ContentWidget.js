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
            self.Load.Content(data[i].id);
        }
    };
    self.FillBlock = function(data){
        if(data.block.type_view == 'slider'){
            var blockSlider = new SliderBlockViewModel(data);
            blockSlider.AddContent();
            self.RenderSlider(blockSlider);
            new InitSlider(blockSlider.cssSliderBlockContainer);
        }
        if(data.block.type_view == 'carousel'){
            var blockCarousel = new BlockViewModel(data);
            blockCarousel.AddContent();
            self.RenderCarousel(blockCarousel);
            jQuery('#jcarousel').jcarousel({
                wrap: 'circular', 
                scroll: 1
            });
        }
    };
    self.RenderSlider = function(data){
        $("#" + self.settingsContent.conteinerIdForContent).append($('script#blockSliderTmpl').html());
        $("#" + self.settingsContent.conteinerIdForContent + ' .promoBlocks:last').attr('id', data.cssSliderBlock);
        ko.applyBindings(data, $('#' + data.cssSliderBlock)[0]);
    }
    self.RenderCarousel = function(data){
        $("#" + self.settingsContent.conteinerIdForContent).append($('script#blockCaruselTmpl').html());
        $("#" + self.settingsContent.conteinerIdForContent + ' .promoBlocks:last').attr('id', data.cssBlock);
        ko.applyBindings(data, $('#' + data.cssBlock)[0]);
    }
}

/* Slider */
var SliderBlockViewModel = function(data){
    var self = this;
    self.idSliderBlock       = data.block.id;
    self.sortSlider          = data.sort;
    self.titleSliderBlock    = data.block.name_category;
    self.typeView            = data.block.type_view;
    self.cssSliderBlock      = 'block_sort_' + data.sort;
    self.cssSliderBlockContainer  = 'sliderConteiner_' + data.block.id;
    self.sliderImageHref     = '#';
    self.contentSliderBlock  = ko.observableArray();
    self.AddContent = function(){
        for(var i = 0; i <= data.content.length-1; i++){
            self.contentSliderBlock.push(new BlockContentSliderBlockViewModel(data.content[i], i));
        }
    };
}
var BlockContentSliderBlockViewModel = function(data, i){
    var self = this;
    self.idSliderBlockContent = data.id;
    self.chortNameSliderBlockContent = data.chort_name;
    self.routeImageSliderBlockContent = data.route_image;
    self.discountSliderBlockContent = data.discount;
    self.imageHrefSliderBlockContent = '#' + (i+1);
    self.cssSliderBlockContentItem = 'views-row views-row-' + (i+1);
    self.ClickItemSliderBlockContent = function(){
        EventDispatcher.DispatchEvent('widget.click.content', data)
    }
}
/* End Slider */


var BlockViewModel = function(data){
    var self = this;
    self.idBlock = data.block.id;
    self.sort = data.sort;
    self.titleBlock = data.block.name_category;
    self.typeView = data.block.type_view;
    self.cssBlock = 'block_sort_' + data.sort;
    self.cssSliderContainer = 'sliderConteiner_' + data.block.id;
    self.sliderImageHref = '#';
    self.content = ko.observableArray();
    self.AddContent = function(){
        for(var i = 0; i <= data.content.length-1; i++){
            self.content.push(new BlockContentViewModel(data.content[i], i));
        }
    };
}

var BlockContentViewModel = function(data, i){
    var self = this;
    self.id = data.id;
    self.chortName = data.chort_name;
    self.routeImage = data.route_image;
    self.discount = data.discount;
    self.sliderImageHref = '#' + (i+1);
    self.cssSliderBlockItem = 'views-row views-row-' + (i+1);
    self.ClickItem = function(){
        EventDispatcher.DispatchEvent('widget.click.content', data)
    }
}

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
