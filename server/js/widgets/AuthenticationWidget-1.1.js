var AuthenticationWidget = function(){
    var self = this;
    self.widgetName = 'AuthenticationWidget';
    self.version = 1.1;
    self.minWidgetVersion = 1.0;
    self.maxWidgetVersion = 2.0;
    self.minTmplVersion = 1.0;
    self.maxTmplVersion = 2.0;
    self.InitWidget = InitWidget;

    var settings = {
        container : {widget: 'authenticationWidgetId', def: 'defaultAuthenticationWidgetId'},
        animate: typeof AnimateAuthentication == 'function' ? AnimateAuthentication : null,
        https : "login", // always, never, login
        tmpl : {
            path : "authenticationTmpl.html", // файл шаблонов
            id : "authenticationFormTmpl" //id шаблона формы авторизации
        },
        message : {
            pleaseLogIn : 'Необходимо авторизоваться.',
            confirmLogOut : 'Вы действительно хотите выйти?'
        }
    }

    function InitWidget(){
        SetInputParameters();
        RegisterEvents();
        CheckAuthenticationRoute();
    }
    function SetInputParameters(){
        var input = self.GetInputParameters('authentication');

        if(!$.isEmptyObject(input)){
            settings = self.UpdateSettings1(settings, input);
            if(input.https)
                Parameters.cache.https = input.https;
        }
        Config.Containers.authentication = settings.container;
    }
    function CheckAuthenticationRoute(){
        if(Routing.route == 'login'){
            self.BaseLoad.Tmpl(settings.tmpl, function(){
                SelectTypeContent();
            });
        }
        else
            self.WidgetLoader(true);
    }
    function RegisterEvents(){
        self.AddEvent('w.change.route', function (){
            CheckAuthenticationRoute();
        });
        self.AddEvent('AuthW.submit', function (data){
           self.BaseLoad.Login(data.username, data.password, data.rememberMe, function(request){
               self.DispatchEvent('w.auth.test', {data:data, request:request});
           })
        });
        self.AddEvent('w.auth.test', function(data){
            if(data.request.err){
                data.data.error = "Ошибка в логине или пароле";
                Render(data.data);
            }
            else{
                self.DispatchEvent('w.auth.ok', data);
            }
        });
        self.AddEvent('w.auth.ok', function(){
            if(Routing.route != 'registration'){
                var last = Parameters.cache.lastPage;
                if(last.route == 'login' || !last.route)
                    Routing.SetHash('default', 'Домашняя', {});
                else
                    Routing.SetHash(last.route, last.title, last.data);
            }
        });
        self.AddEvent('w.auth.close', function(){
            InsertContainerEmptyWidget();
        });
    }
    function SelectTypeContent(){
        if(Routing.route == 'login'){
            InsertContainerAuthentication();
            Fill();
        }
    }
    function InsertContainerEmptyWidget(){
        self.ClearContainer(settings);
    }
    function InsertContainerAuthentication(){
        self.InsertContainer(settings);
    }
    function Fill(){
        self.BaseLoad.Script(PokupoWidgets.model.auth, function () {
            AuthenticationViewModel.prototype.ClickRegistration = function () {
                Parameters.cache.lastPage = Parameters.cache.history[Parameters.cache.history.length - 2];
                Routing.SetHash('registration', 'Регистрация пользователя', {step: 1});
            };
            var form = new AuthenticationViewModel();
            form.subminEvent('AuthW.submit');
            Render(form);
        });
    }
    function Render(data){
        self.RenderTemplate(data, settings, null,
            function(data){
                InsertContainerAuthentication();
                Render(data);
            },
            function(){
                InsertContainerEmptyWidget();
            }
        );
    }
}

var TestAuthentication = {
    Init : function(){
        if(typeof Widget == 'function'){
            AuthenticationWidget.prototype = new Widget();
            var auth = new AuthenticationWidget();
            auth.Init(auth);
        }
        else{
            setTimeout(function(){TestAuthentication.Init()}, 100);
        }
    }
}

TestAuthentication.Init();

