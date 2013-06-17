var ProfileWidget = function() {
    var self = this;
    self.widgetName = 'ProfileWidget';
    self.settings = {
        containerFormId: null,
        tmplPath: null,
        regFormStep1TmplId: null,
        regFormStep2TmplId: null,
        regFormStep3TmplId: null,
        regFormStep4TmplId: null,
        inputParameters: {},
        geoShop: 0,
        style: null
    };
    self.InitWidget = function() {
        self.settings.containerFormId = Config.Containers.registration;
        self.settings.tmplPath = Config.Registration.tmpl.path;
        self.settings.regFormStep1TmplId = Config.Registration.tmpl.regFormStep1TmplId;
        self.settings.regFormStep2TmplId = Config.Registration.tmpl.regFormStep2TmplId;
        self.settings.regFormStep3TmplId = Config.Registration.tmpl.regFormStep3TmplId;
        self.settings.regFormStep4TmplId = Config.Registration.tmpl.regFormStep4TmplId;
        self.settings.style = Config.Registration.style;
        self.SetInputParameters();
        self.RegisterEvents();
        self.SetPosition();
    };
    self.SetInputParameters = function() {
        self.settings.inputParameters = JSCore.ParserInputParameters(/RegistrationWidget.js/);
        if (self.settings.inputParameters['params']) {
            var input = JSON.parse(self.settings.inputParameters['params']);
            self.settings.inputParameters['params'] = input;

            if (input.tmpl)
                self.settings.tmplPath = 'registration/' + input.tmpl + '.html';
            if (input.geoShop)
                self.settings.geoShop = input.geoShop;
        }
    };
    self.CheckRouteRegistration = function() {
        if (Routing.route == 'registration') {
            if (Routing.params.step == 1)
                self.Step.Step1();
            if (Routing.params.step == 2)
                self.Step.Step2();
            if (Routing.params.step == 3)
                self.Step.Step3();
            if (Routing.params.step == 4)
                self.Step.Step4();
        }
        else
            self.WidgetLoader(true);
    };
    self.RegisterEvents = function() {
        if (JSLoader.loaded) {
            self.BaseLoad.Tmpl(self.settings.tmplPath, function() {
                self.CheckRouteRegistration();
            });
        }
        else {
            EventDispatcher.AddEventListener('onload.scripts', function(data) {
                self.BaseLoad.Tmpl(self.settings.tmplPath, function() {
                    self.CheckRouteRegistration();
                });
            });
        }

        EventDispatcher.AddEventListener('widget.change.route', function() {
            self.CheckRouteRegistration();
        });
    };
    self.InsertContainer = {
        
    };
    self.Fill = {
        
    };
    self.Render = {
        
    };
    self.SetPosition = function() {
        if (self.settings.inputParameters['position'] == 'absolute') {
            for (var key in self.settings.inputParameters) {
                if (self.settings.style[key])
                    self.settings.style[key] = self.settings.inputParameters[key];
            }
            $().ready(function() {
                for (var i = 0; i <= Config.Containers.authentication.length - 1; i++) {
                    $("#" + Config.Containers.authentication[i]).css(self.settings.style);
                }
            });
        }
    };
}


