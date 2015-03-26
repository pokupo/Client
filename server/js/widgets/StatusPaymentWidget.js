var StatusPaymentWidget = function () {
    var self = this;
    self.widgetName = 'StatusPaymentWidget';
    self.version = 1.0;
    self.minWidgetVersion = 1.0;
    self.maxWidgetVersion = 2.0;
    self.minTmplVersion = 1.0;
    self.maxTmplVersion = 2.0;
    self.settings = {
        containerId: null,
        customContainer: null,
        tmpl: {
            path: null,
            id: null
        },
        inputParameters: {},
        style: null
    };
    self.InitWidget = function(){
        self.settings.containerId = Config.Containers.statusPayment.widget;
        self.settings.customContainer = Config.Containers.statusPayment.customClass;
        self.settings.tmpl = Config.StatusPayment.tmpl;
        self.settings.style = Config.StatusPayment.style;
        self.RegisterEvents();
        self.CheckRoute();
        self.SetInputParameters();
        self.SetPosition();
    };
    self.SetInputParameters = function(){
        var input = {};
        if(Config.Base.sourceParameters == 'string'){
            var temp = JSCore.ParserInputParameters(/StatusPaymentWidget/);
            if(temp.statusPayment){
                input = temp.statusPayment;
            }
        }
        if(Config.Base.sourceParameters == 'object' && typeof WParameters !== 'undefined' && WParameters.statusPayment){
            input = WParameters.statusPayment;
        }

        if(JSSettings.dev)
            Logger.Console.VarDump(self.widgetName, "Input parameters", input);

        if(!$.isEmptyObject(input)){
            if(input.tmpl){
                if(input.tmpl.path)
                    self.settings.tmpl.path = input.tmpl.path;
                if(input.tmpl.id)
                    self.settings.tmpl.id = input.tmpl.id;
            }
            if(input.container){
                if(input.container)
                    self.settings.containerId = input.container;
            }
            if(input.animate)
                self.settings.animate = input.animate;
        }

        self.settings.inputParameters = input;
        if(JSSettings.dev)
            Logger.Console.VarDump(self.widgetName, "Result settings", self.settings);

        self.settings.inputParameters = input;
    };
    self.InsertContainer = {
        EmptyWidget : function(){
            var temp = $("#" + self.settings.containerId).find(self.SelectCustomContent().join(', ')).clone();
            $("#" + self.settings.containerId).empty().html(temp);
        },
        Content : function(){
            self.InsertContainer.EmptyWidget();
            $("#" + self.settings.containerId).append($('script#' + self.GetTmplName()).html()).children().hide();
        }
    };
    self.CheckRoute = function(){
        if(Routing.route == 'payment'){

        }
    };
    self.RegisterEvents = function(){
        EventDispatcher.AddEventListener('widget.change.route', function (data){
            self.CheckRoute();
        });
    };
    self.Fill = function(data){
        var info = new StatusPaymentViewModel();
        self.Render(info);
    };
    self.Render = function(data){
        if ($('#' + self.settings.containerId).length > 0) {
            try{
                ko.cleanNode($('#' + self.settings.containerId)[0]);
                ko.applyBindings(data, $('#' + self.settings.containerId)[0]);
                self.WidgetLoader(true);
                if(typeof AnimateStatusPayment == 'function')
                    new AnimateStatusPayment();
                if (self.settings.animate)
                    self.settings.animate();
            }
            catch (e) {
                self.Exception('Ошибка шаблона [' + self.GetTmplName() + ']', e);
                if (self.settings.tmpl.custom) {
                    delete self.settings.tmpl.custom;
                    self.BaseLoad.Tmpl(self.settings.tmpl, function () {
                        self.InsertContainer.Main();
                        self.Render(data);
                    });
                }
                else {
                    self.InsertContainer.EmptyWidget();
                    self.WidgetLoader(true);
                }
            }
        }
        else {
            self.Exception('Ошибка. Не найден контейнер [' + self.settings.containerId + ']');
            self.WidgetLoader(true);
        }
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
}

var StatusPaymentViewModel = function(){

}

var TestStatusPayment = {
    Init : function(){
        if(typeof Widget == 'function'){
            StatusPaymentWidget.prototype = new Widget();
            var status = new StatusPaymentWidget();
            status.Init(status);
        }
        else{
            setTimeout(function(){TestStatusPayment.Init()}, 100);
        }
    }
}

TestStatusPayment.Init();