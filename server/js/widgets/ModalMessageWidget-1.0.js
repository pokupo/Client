var ModalMessageWidget = function (type, message, callbackOk, callbackFail, hide) {
    var self = this;
    self.widgetName = 'ModalMessageWidget';
    self.version = 1.0;
    self.minWidgetVersion = 1.0;
    self.maxWidgetVersion = 2.0;
    self.minTmplVersion = 1.0;
    self.maxTmplVersion = 2.0;
    self.settings = {
        tmpl: {
            path: null,
            id: {
                confirm: null,
                success: null,
                error: null,
                message: null
            }
        },
        animate: null,
        inputParameters: {},
        containerId: null,
        customContainer: null
    };
    self.InitWidget = function () {
        self.settings.tmpl = Config.ModalMessage.tmpl;
        self.RegisterEvents();
        self.SetInputParameters();
        self.LoadTmpl();
    };
    self.SetInputParameters = function () {
        var input = {};
        if (Config.Base.sourceParameters == 'string') {
            var temp = JSCore.ParserInputParameters(/ModalMessageWidget/);
            if (temp.modalMessage) {
                input = temp.modalMessage;
            }
        }
        if (Config.Base.sourceParameters == 'object' && typeof WParameters !== 'undefined' && WParameters.modalMessage) {
            input = WParameters.modalMessage;
        }

        if(JSSettings.dev)
            Logger.Console.VarDump(self.widgetName, "Input parameters", input);

        if (!$.isEmptyObject(input)) {
            if (input.animate)
                self.settings.animate = input.animate;
            if(input.tmpl){
                if(input.tmpl.path)
                    self.settings.tmpl.path = input.tmpl.path;
                if(input.tmpl.id){
                    for(var key in input.tmpl.id){
                        self.settings.tmpl.id[key] = input.tmpl.id[key];
                    }
                }
            }
        }

        self.settings.inputParameters = input;
    };
    self.RegisterEvents = function () {
        EventDispatcher.AddEventListener('widget.change.route', function (data){
            self.WidgetLoader(true);
        });
    };
    self.LoadTmpl = function(){
        self.BaseLoad.Tmpl(self.settings.tmpl, function () {
            self.CreateWindow();
        });
    };
    self.CreateWindow = function(){
        self.InsertContainer.NewModal();
        self.Fill(message);
    };
    self.InsertContainer = {
        ClearWindow: function(){
            var modal = $('#pokupoModalMessage');
            if(modal.length > 0) {
                modal.children().remove();
            }
            else{
                $('body').append($('<div id="pokupoModalMessage"></div>'));
            }
        },
        NewModal: function(){
            self.InsertContainer.ClearWindow();
            $('#pokupoModalMessage').html($('script#' + self.GetTmplName(type)).html());
        }
    };
    self.Fill = function(){
        var modal = new ModalMessageViewModel(message, callbackOk, callbackFail, hide);
        self.Render(modal);
    };
    self.Render = function(data){
        if ($("#" + data.idWindow).length > 0) {
            try{
                ko.cleanNode($("#" + data.idWindow)[0]);
                ko.applyBindings(data, $("#" + data.idWindow)[0]);
                $("#" + data.idWindow).children().show();
                self.WidgetLoader(true);
                if(typeof AnimateModalMessage == 'function')
                    new AnimateModalMessage();
                if(self.settings.animate)
                    self.settings.animate();

                if(hide){
                    setTimeout(function(){
                        data.Click.Close();
                    }, Config.Base.timeMessage);
                }
            }
            catch(e){
                self.Exception('Ошибка шаблона [' + self.GetTmplName(type) + ']', e);
                if(self.settings.tmpl.custom){
                    delete self.settings.tmpl.custom;
                    self.BaseLoad.Tmpl(self.settings.tmpl, function(){
                        self.InsertContainer.NewModal();
                        self.Render(data);
                    });
                }
                else{
                    self.InsertContainer.ClearWindow();
                    self.WidgetLoader(true);
                }
            }
        }
        else{
            self.Exception('Ошибка. Не найден контейнер [' + self.settings.containerId + ']');
            self.WidgetLoader(true);
        }
    };
}

var ModalMessageViewModel = function(message, callbackOk, callbackFail, hide){
    var self = this;
    self.message = ko.observable(message);
    self.idWindow = 'pokupoModalMessage';
    self.Click = {
        Close: function(){
            $('#' + self.idWindow).remove();
        },
        Confirm: function(){
            if(callbackOk)
                 callbackOk();
            self.Click.Close();
        },
        NotConfirm: function(){
            if(callbackFail)
                callbackFail();
            self.Click.Close();
        },
        GetMessage: function(){
            if(callbackOk)
                callbackOk(self.message());
            self.Click.Close();
        }
    }
}

var TestModalMessage = {
    Init : function(){
        if(typeof Widget == 'function'){
            ModalMessageWidget.prototype = new Widget();
        }
        else{
            setTimeout(function(){TestModalMessage.Init()}, 100);
        }
    }
}

TestModalMessage.Init();