var ModalMessageWidget = function (type, message, callbackOk, callbackFail, hide) {
    var self = this;
    self.widgetName = 'ModalMessageWidget';
    self.version = 1.0;
    self.minWidgetVersion = 1.0;
    self.maxWidgetVersion = 2.0;
    self.minTmplVersion = 1.0;
    self.maxTmplVersion = 2.0;
    self.InitWidget = InitWidget;

    var settings = {
        tmpl: {
            path: "modalMessageTmpl.html", // файл шаблонов
            id: {
                confirm: 'modalMessageConfirmTmpl',
                success: 'modalMessageSuccessTmpl',
                error: 'modalMessageErrorTmpl',
                message: 'modalMessageMessageTmpl'
            }
        },
        animate: typeof AnimateModalMessage == 'function' ? AnimateModalMessage : null
    };

    function InitWidget() {
        RegisterEvents();
        SetInputParameters();
        LoadTmpl();
    }

    function SetInputParameters() {
        var input = self.GetInputParameters('modalMessage');

        if (!$.isEmptyObject(input)) {
            settings = self.UpdateSettings1(settings, input);
        }

        Config.ModalMessage = settings;
    }

    function RegisterEvents() {
        self.AddEvent('w.change.route', function (data) {
            self.WidgetLoader(true);
        });
    }

    function LoadTmpl() {
        self.BaseLoad.Tmpl(settings.tmpl, function () {
            CreateWindow();
        });
    }

    function CreateWindow() {
        var modal = Fill(message);
        InsertContainerNewModal(modal);
        Render(modal);
    }

    function InsertContainerClearWindow(data) {
        var modal = $('#' + data.idWindow);
        if (modal.length > 0) {
            modal.children().remove();
        }
        else {
            $('body').append($('<div id="' + data.idWindow + '"></div>'));
        }
    }

    function InsertContainerNewModal(modal) {
        InsertContainerClearWindow(modal);
        $('#' + modal.idWindow).html($('script#' + self.GetTmplName1(settings, type)).html());
    }

    function Fill() {
        return new ModalMessageViewModel(message, callbackOk, callbackFail, hide);
    }

    function Render(data) {
        self.RenderTemplate(data, settings,
            function () {
                if (hide) {
                    setTimeout(function () {
                        data.Click.Close();
                    }, Config.Base.timeMessage);
                }
            },
            function (data) {
                InsertContainerNewModal(data);
                Render(data);
            },
            function () {
                InsertContainerClearWindow(data);
            },
            null,
            data.idWindow
        );
    }
}

var ModalMessageViewModel = function (message, callbackOk, callbackFail, hide) {
    var self = this;
    self.message = ko.observable(message);
    self.idWindow = 'pokupoModalMessage';
    self.Click = {
        Close: function () {
            $('#' + self.idWindow).remove();
        },
        Confirm: function () {
            if (callbackOk)
                callbackOk();
            self.Click.Close();
        },
        NotConfirm: function () {
            if (callbackFail)
                callbackFail();
            self.Click.Close();
        },
        GetMessage: function () {
            if (callbackOk)
                callbackOk(self.message());
            self.Click.Close();
        }
    }
}

var TestModalMessage = {
    Init: function () {
        if (typeof Widget == 'function') {
            ModalMessageWidget.prototype = new Widget();
        }
        else {
            setTimeout(function () {
                TestModalMessage.Init()
            }, 100);
        }
    }
}

TestModalMessage.Init();