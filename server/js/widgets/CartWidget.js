var CartWidget = function(){
    var self = this;
    self.widgetName = 'CartWidget';
    self.settings = {
        title : null,
        tmplPath : null,
        tmplId : null,
        inputParameters : {},
        containerId : null,
        showBlocks : null,
        style : null
    };
    self.InitWidget = function(){
        self.settings.containerId = Config.Containers.cart;
        self.settings.title = Config.Cart.title;
        self.settings.tmplPath = Config.Cart.tmpl.path;
        self.settings.tmplId = Config.Cart.tmpl.tmplId;
        self.settings.style = Config.Cart.style;
        self.settings.showBlocks = Config.Cart.showBlocks;
        self.RegisterEvents();
        self.SetInputParameters();
        self.SetPosition();
    };
    self.SetInputParameters = function(){
        self.settings.inputParameters = JSCore.ParserInputParameters(/CartWidget.js/);
        if(self.settings.inputParameters['params']){
            var input = JSON.parse(self.settings.inputParameters['params']);
            self.settings.inputParameters['params'] = input;
            if(input.show){
                for(var key in input.show){
                     self.settings.showBlocks[key] = input.show[key];
                }
            }
            if(input.tmpl){
                self.settings.tmplPath = 'userInformation/' + input.tmpl + '.html';
            }
        }
    };
    self.RegisterEvents = function(){
        if(JSLoader.loaded){
            self.BaseLoad.Tmpl(self.settings.tmplPath, function(){
                EventDispatcher.DispatchEvent('CartWidget.onload.tmpl')
            });
        }
        else{
            EventDispatcher.AddEventListener('onload.scripts', function (data){ 
                self.BaseLoad.Tmpl(self.settings.tmplPath, function(){
                    EventDispatcher.DispatchEvent('CartWidget.onload.tmpl')
                });
            });
        }
        
        EventDispatcher.AddEventListener('CartWidget.onload.tmpl', function (){
            self.BaseLoad.CartInfo('', function(data){
                EventDispatcher.DispatchEvent('CartWidget.onload.info', data);
            });
        });
        
        EventDispatcher.AddEventListener('CartWidget.onload.info', function(data){
            self.Fill(data);
        })
        
        EventDispatcher.AddEventListener('widget.authentication.ok', function(){
            self.BaseLoad.CartInfo('', function(data){
                EventDispatcher.DispatchEvent('CartWidget.onload.info', data);
            });
        });
        
        EventDispatcher.AddEventListener('widget.change.route', function (data){
            EventDispatcher.DispatchEvent('CartWidget.onload.tmpl');
        });
        
        EventDispatcher.AddEventListener('widgets.cart.infoUpdate', function(data){
             EventDispatcher.DispatchEvent('CartWidget.onload.info', data);
        });
    };
    self.Fill = function(data){
        var info = new CartViewModel();
        info.AddContent(data);
        self.Render(info);
    };
    self.Render = function(data){
        $('#' + self.settings.containerId).empty().append($('script#' + self.settings.tmplId).html());
        ko.applyBindings(data, $('#' + self.settings.containerId)[0]);
        self.WidgetLoader(true);
    };
    self.SetPosition = function(){
        if(self.settings.inputParameters['position'] == 'absolute'){
            for(var key in self.settings.inputParameters){
                if(self.settings.style[key])
                    self.settings.style[key] = self.settings.inputParameters[key];
            }
            $().ready(function(){
                if($("#" + self.settings.containerId).length > 0){
                    $("#" + self.settings.containerId).css(self.settings.style);
                }
            });
        }
    };
};

var CartViewModel = function(){
    var self = this;
    self.title = Config.Cart.title;
    self.ShowTitle = function(){
        if(Config.Cart.showBlock.title == 'never')
            return false;
        if(Config.Cart.showBlock.title == 'always')
            return true;
        if(Config.Cart.showBlock.title == 'empty'){
            return true;
        }
    };
    self.count = 0;
    self.ShowCount = function(){
        if(Config.Cart.showBlock.count && self.count > 0)
            return true;
        return false;
    };
    self.baseCost = 0;
    self.ShowBaseCost = function(){
        if(Config.Cart.showBlock.baseCost && self.baseCost > 0)
            return true;
        return false;
    };
    self.finalCost = 0;
    self.ShowFinalCost = function(){
        if(Config.Cart.showBlock.finalCost && self.finalCost > 0)
            return true;
        return false;
    };
    
    self.AddContent = function(data){
        if(!data.err){
            self.count = data.count;
            self.baseCost = data.base_cost;
            self.finalCost = data.final_cost;
        }
    };
    self.ClickCart = function(){
        Parameters.cache.lastPage = Parameters.cache.history[Parameters.cache.history.length-1];
        Routing.SetHash('cart', Config.CartGoods.title, {});
    };
};

var TestCart = {
    Init : function(){
        if(typeof Widget == 'function'){
            CartWidget.prototype = new Widget();
            var cart = new CartWidget();
            cart.Init(cart);
        }
        else{
            setTimeout(function(){TestCart.Init()}, 100);
        }
    }
}

TestCart.Init();