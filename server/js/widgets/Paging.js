var Page = function(opt){
    var self = this;
    self.pageId = opt.id;
    self.title = opt.title;
    self.current = opt.current;
    self.cssLink = ko.computed(function(){
        if(opt.cssLink)
            return opt.cssLink;
        return opt.settings.paging.cssItem;
    }, this);
}

var Paging = {
    countGoods : 0,
    result : null,
    settings : null,
    paging : null,
    np : 0,
    GetPaging : function(count, settings, click){
        this.countGoods = count;
        this.settings = settings;
        this.paging = this.settings.paging;
        this.np = this.NumPages();
        Page.prototype.ClickLinkPage = click;
        this.AddPages()

        return this.result;
    },
    NumPages : function(){
        return Math.ceil(this.countGoods/this.paging.itemsPerPage)
    },
    GetInterval : function(){
        var ne_half = Math.ceil(this.paging.numDisplayEntries/2);
        var upper_limit = this.np-this.paging.numDisplayEntries;
        var start = Routing.GetCurrentPage()>ne_half?Math.max(Math.min(Routing.GetCurrentPage()-ne_half, upper_limit), 0):0;
        var end = Math.min(start + 3, this.np);
        return [start + 1,end + 1]; 
    },
    AppendItem : function(id, opt){
        id = id<1 ? 1 : (id<this.np ? id : this.np);
            
        opt = jQuery.extend({
            text : id, 
            classes : ""
        }, opt||{});
         
        if(id == Routing.GetCurrentPage()){
            this.result.push(new Page({
                current : true, 
                id : id,
                title : opt.text, 
                cssLink : this.paging.cssCurrent,
                settings : this.settings
            }));
             
        }
        else
        {
            this.result.push( new Page({
                current : false, 
                id : id,
                title : opt.text, 
                cssLink : opt.classes,
                settings : this.settings
            }));
        }
    },
    AddPages : function(){
        this.result = ko.observableArray();
        var interval = this.GetInterval();
        if(this.paging.prevText && (Routing.GetCurrentPage() > 1 || this.paging.prevShowAlways)){
            this.AppendItem(Routing.GetCurrentPage()-1, {
                text : this.paging.prevText,
                classes : this.paging.cssPrev
            })
        }
        // Generate starting points
        if (interval[0] > 0 && this.paging.numEdgeEntries > 0)
        {
            var end = Math.min(this.paging.numEdgeEntries, interval[0]);
            for(var i=1; i<end; i++) {
                this.AppendItem(i)
            }

            if(this.paging.numEdgeEntries < interval[0] && this.paging.ellipseText)
            {
                this.result.push(new Page({
                    current : true, 
                    id : 0,
                    title : this.paging.ellipseText, 
                    cssLink : this.paging.cssItem,
                    settings : this.settings
                }));
            }
        }
        // Generate interval links
        for(var i=interval[0]; i<interval[1]; i++) {
            this.AppendItem(i)
        }
        // Generate ending points
        if (interval[1] <= this.np && this.paging.numEdgeEntries > 0)
        {
            if(this.np-this.paging.numEdgeEntries+1 > interval[1]&& this.paging.ellipseText)
            {
                this.result.push(new Page({
                    current : true, 
                    id : 0,
                    title : this.paging.ellipseText, 
                    cssLink : this.paging.cssItem,
                    settings : this.settings
                }));
            }
            var begin = Math.max(this.np-this.paging.numEdgeEntries, interval[1]);
            for(var i=begin; i<=this.np; i++) {
                this.AppendItem(i)
            }		
        }
        // Generate "Next"-Link
        if(this.paging.nextText && (Routing.GetCurrentPage() < this.np || this.paging.nextShowAlways)){
            this.AppendItem(Routing.GetCurrentPage()+1, {
                text : this.paging.nextText,
                classes : this.paging.cssNext
            })
        }
    }
}


