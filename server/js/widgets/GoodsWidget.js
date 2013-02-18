var GoodsWidget = function(){
    var self = this;
    self.widgetName = 'GoodsWidget';
    self.settingsGoods = {
        containerIdForGoods : Config.Conteiners.goods, 
        tmplForGoods : Config.Goods.tmpl,
        inputParameters : {},
        styleGoods : Config.Goods.style
    };
    self.InitWidget = function(){
        self.RegisterEvents();
        self.SetInputParameters();
        self.Route();
        self.SetPosition();
    };
    self.SetInputParameters = function(){
        self.settingsGoods.inputParameters = JSCore.ParserInputParameters(/GoodsWidget.js/);
    };
    self.Route = function(){
        if(Route.route == 'goods'){
            self.Update();
        }
        else{
            ReadyWidgets.Indicator('GoodsWidget', true);
        }
    };
    self.RegisterEvents = function(){ 
        EventDispatcher.AddEventListener('widget.change.route', function (){
            if(Route.route == 'goods'){
                self.Update();
            }
        });
    };
    self.Update = function(){
        self.BaseLoad.GoodsInfo(1, '1111111', function(data){
            EventDispatcher.DispatchEvent('GoodsWidget.onload.info', data)
        })
    };
    self.Fill = {
        
    };
    self.Render = {
        Goods: function(data){
            if($("#" + self.settingsGoods.containerIdForGoods).length > 0){
                $("#catalog").hide();
                $("#wrapper").removeClass("with_sidebar").addClass("with_top_border");
                ko.applyBindings(data, $("#" + self.settingsGoods.containerIdForGoods)[0]);
            }
            delete data;
            ReadyWidgets.Indicator('GoodsWidget', true);
        }
    };
    self.SetPosition = function(){
        if(self.settingsGoods.inputParameters['position'] == 'absolute'){
            for(var key in self.settingsGoods.inputParameters){
                if(self.settingsGoods.styleGoods[key])
                    self.settingsGoods.styleGoods[key] = self.settingsGoods.inputParameters[key];
            }
            $().ready(function(){
                $('#' + self.settingsGoods.containerIdForGoods).css(self.settingsGoods.styleGoods);
            });
        }
    }
}

var TestGoodsCrumb = {
    Init : function(){
        if(typeof Widget == 'function'){
            GoodsWidget.prototype = new Widget();
            var goods = new GoodsWidget();
            goods.Init(goods);
        }
        else{
            window.setTimeout(TestGoodsCrumb.Init, 100);
        }
    }
}

TestGoodsCrumb.Init();
