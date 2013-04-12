var AuthenticationWidget = function(){
    var self = this;
    self.widgetName = 'AuthenticationWidget';
    self.settings = {
        containerFormId : null,
        containerSidebarId : null,
        containerSidebarId : null,
        tmplPath : null,
        authFormTmplId : null,
        authSidebarTmplId : null,
        regFormTmplId : null,
        regSidebarTmplId : null,
        inputParameters : {},
        style : null
    };
    self.InitWidget = function(){
        self.settings.containerFormId = Config.Containers.authentication[0]; 
        self.settings.containerSidebarId = Config.Containers.authentication[1]; 
        self.settings.tmplPath = Config.Authentication.tmpl.path;
        self.settings.authFormTmplId = Config.Authentication.tmpl.authFormTmplId;
        self.settings.authSidebarTmplId = Config.Authentication.tmpl.authSidebarTmplId;
        self.settings.regFormTmplId = Config.Authentication.tmpl.regFormTmplId;
        self.settings.regSidebarTmplId = Config.Authentication.tmpl.regSidebarTmplId;
        self.SetInputParameters();
        self.RegisterEvents();
    };
    self.SetInputParameters = function(){
        self.settings.inputParameters = JSCore.ParserInputParameters(/AuthenticationWidget.js/);
        if(self.settings.inputParameters['params']){
            var input = JSON.parse(self.settings.inputParameters['params']);
            self.settings.inputParameters = input;
            
            if(input.tmpl){
                self.settings.tmplPath = 'authentication/' + input.tmpl + '.html';
            }
        }
    };
    self.CheckRoute = function(){
        if(Routing.route == 'login' || Routing.route == 'registration'){
            self.SelectTypeContent();
        }
        else{
            self.WidgetLoader(true);
        }
    };
    self.RegisterEvents = function(){
        if(JSLoader.loaded){
            self.BaseLoad.Tmpl(self.settings.tmplPath, function(){
                 self.CheckRoute();
            });
        }
        else{
            EventDispatcher.AddEventListener('onload.scripts', function (data){
                self.BaseLoad.Tmpl(self.settings.tmplPath, function(){
                     self.CheckRoute();
                });
            });
        }
        
        EventDispatcher.AddEventListener('widget.change.route', function (){
            self.CheckRoute();
        });
        
        EventDispatcher.AddEventListener('AuthenticationWidget.authentication.submit', function (data){
           self.BaseLoad.Login(data.username, data.password, data.rememberMe, function(request){
               EventDispatcher.DispatchEvent('widget.authentication.test', {data:data, request:request});
           })
        });
        
        EventDispatcher.AddEventListener('widget.authentication.test', function(data){
            if(data.request.err){
                data.data.error = "Ошибка в логине или пароле";
                var sidebar = new AuthenticationSidebarViewModel();
                self.Render.Authentication(data.data, sidebar);
            }
            else{
                EventDispatcher.DispatchEvent('widget.authentication.ok', data);
            }
        });
        
        EventDispatcher.AddEventListener('widget.authentication.ok', function(){
            var last = Parameters.cache.lastPage;
            Routing.SetHash(last.route, last.title, last.data);
        });
        
        EventDispatcher.AddEventListener('AuthenticationWidget.registration.error', function(data){
            self.Render.Registration(data);
        });
        
        EventDispatcher.AddEventListener('AuthenticationWidget.registration.submit', function(data){
            var str = '?username=' + data.username + '&email=' + data.email + '&password=' + data.firstPassword;
            if(data.phone)
                str = str + '&phone=' + data.phone;
            if(data.fname)
                str = str + '&fname=' + data.fname;
            if(data.sname)
                str = str + '&sname=' + data.sname;
            if(data.mname)
                str = str + '&mname=' + data.mname;
            
            self.BaseLoad.Registration(str, function(request){
               EventDispatcher.DispatchEvent('widget.registration.test', request);
           })
        });
        
        EventDispatcher.AddEventListener('widget.registration.test', function(data){
            console.log(data);
        })
    };
    self.SelectTypeContent = function(){
        $("#wrapper").removeClass("with_top_border").addClass("with_sidebar");
        if(Routing.route == 'login'){
            self.InsertContainer.Authentication();
            self.Fill.Authentication();
        }
        else{
            self.InsertContainer.Registration();
            self.Fill.Registration();
        }
    };
    self.InsertContainer = {
        Authentication : function(){
            $("#" + self.settings.containerFormId).empty().append($('script#' + self.settings.authFormTmplId).html());
            $("#" + self.settings.containerSidebarId).empty().append($('script#' + self.settings.authSidebarTmplId).html());
        },
        Registration : function(){
            $("#" + self.settings.containerFormId).empty().append($('script#' + self.settings.regFormTmplId).html());
            $("#" + self.settings.containerSidebarId).empty().append($('script#' + self.settings.regSidebarTmplId).html());
        }
    };
    self.Fill = {
        Authentication : function(){
            var sidebar = new AuthenticationSidebarViewModel();
            var form = new AuthenticationFormViewModel();
            self.Render.Authentication(form, sidebar);
        },
        Registration : function(){
            var form = new RegistrationFormViewModel();
            self.Render.Registration(form);
        }
    };
    self.Render = {
        Authentication : function(form, sidebar){
            if($("#" + self.settings.containerFormId).length > 0){
                ko.applyBindings(form, $("#" + self.settings.containerFormId)[0]);
            }
            if($("#" + self.settings.containerSidebarId).length > 0){
                ko.applyBindings(sidebar, $("#" + self.settings.containerSidebarId)[0]);
            }
            self.WidgetLoader(true);
        },
        Registration : function(form){
            if($("#" + self.settings.containerFormId).length > 0){
                ko.applyBindings(form, $("#" + self.settings.containerFormId)[0]);
            }
            self.WidgetLoader(true);
        }
    };
};

var AuthenticationSidebarViewModel = function(){
    var self = this;
    self.ClickRegistration = function(){
//        Parameters.cache.lastPage = Parameters.cache.history[Parameters.cache.history.length-1];
//        Routing.SetHash('registration', 'Регистрация пользователя', {});
    };
};

var AuthenticationFormViewModel = function(){
    var self= this;
    self.username = null;
    self.password = null;
    self.rememberMe = null;
    self.error = null;
    
    self.Login = function(data){
        self.username = $(data.username).val();
        self.password = $(data.password).val();
        self.rememberMe = $(data.remember_me).is(':checked') ? 'on' : 'off';
        Loader.Indicator('AuthenticationWidget', false);
        EventDispatcher.DispatchEvent('AuthenticationWidget.authentication.submit', self);
    };
    self.ClickZPayment = function(){
        
    };
    self.ForgotPassword = function(){
        
    };
};

var RegistrationFormViewModel = function(){
    var self = this;
    self.username = null;
    self.errorUsername = null;
    self.email  = null;
    self.errorEmail = null;
    self.firstPassword  = null;
    self.errorFirstPassword = null;
    self.secondPassword = null;
    self.errorSecondPassword = null;
    self.phone = null;
    self.errorPhone = null;
    self.fname = null;
    self.errorFname = null;
    self.sname = null;
    self.errorSname = null;
    self.mname = null;
    self.errorMname = null;
    
    self.Register = function(data){
        self.username = $(data.username).val();
        self.email  = $(data.email).val();
        self.firstPassword  = $(data.firstPassword).val();
        self.secondPassword  = $(data.secondPassword).val();
        self.phone = $(data.phone).val();
        self.fname = $(data.fname).val();
        self.sname = $(data.sname).val();
        self.mname = $(data.mname).val();
        if(self.ValidationForm()){
            console.log('submit');
            Loader.Indicator('AuthenticationWidget', false);
            EventDispatcher.DispatchEvent('AuthenticationWidget.registration.submit', self);
        }
        else{
            EventDispatcher.DispatchEvent('AuthenticationWidget.registration.error', self);
        }
    };
    self.ValidationForm = function(){
        var test = true;
        if(!self.UsernameValidation())
            test = false;
        console.log(test);
        if(!self.EmailValidation())
            test = false;
        console.log(test);
        if(!self.PasswordValidation())
            test = false;
        console.log(test);
        if(!self.PhoneValidation())
            test = false;
        console.log(test);
        if(!self.FnameValidation())
            test = false;
        console.log(test);
        if(!self.SnameValidation())
            test = false;
        console.log(test);
        if(!self.MnameValidation())
            test = false;
        console.log(test);
        return test;
    };
    self.UsernameValidation = function(){
        if(!self.username){
            self.errorUsername = Config.Authentication.error.username.empty;
            return false;
        }
        if(self.username.length < 4){
            self.errorUsername = Config.Authentication.error.username.minLength;
            return false;
        }
        if(self.username.length > 40){
            self.errorUsername = Config.Authentication.error.username.maxLength;
            return false;
        }
        if(!Config.Authentication.regular.username.test(self.username)) {
            self.errorUsername = Config.Authentication.error.username.regular;
            return false;
        }
        self.errorUsername = null;
        return true;
    };
    self.EmailValidation = function(){
        if(!self.email){
            self.errorEmail = Config.Authentication.error.email.empty;
            return false;
        }
        if(!Config.Authentication.regular.email.test(self.email)){
            self.errorEmail = Config.Authentication.error.email.regular;
            return false;
        }
        self.errorEmail = null;
        return true;
    };
    self.PasswordValidation = function(){
        if(!self.firstPassword){
            self.errorFirstPassword = Config.Authentication.error.password.empty;
            return false;
        }
        if(self.firstPassword.length < 6){
            self.errorFirstPassword = Config.Authentication.error.password.minLength;
            return false;
        }
        if(self.firstPassword.length > 64){
            self.errorFirstPassword = Config.Authentication.error.password.maxLength;
            return false;
        }
        if(self.firstPassword != self.secondPassword){
            self.errorFirstPassword = Config.Authentication.error.password.equal;
            return false;
        }
        
        self.errorFirstPassword = null;
        return true;
    };
    self.PasswordSecondValidation = function(){
        if(!self.secondPassword){
            self.errorSecondPassword = Config.Authentication.error.password.empty;
            return false;
        }
        
        self.errorSecondPassword = null;
        return true;
    };
    self.PhoneValidation = function(){
        if(self.phone){
            if(self.phone.length < 11){
                self.errorPhone = Config.Authentication.error.phone.minLength;
                return false;
            }
            if(self.phone.length > 15){
                self.errorPhone = Config.Authentication.error.phone.maxLength;
                return false;
            }
            if(!Config.Authentication.regular.phone.test(self.phone)){
                self.phone = Config.Authentication.error.phone.regular;
                return false;
            }
        }
        self.errorPhone = null;
        return true;
    };
    self.FnameValidation = function(){
        if(self.fname){
            if(self.fname.length < 2){
                self.errorFname = Config.Authentication.error.fname.minLength;
                return false;
            }
            if(self.fname.length > 20){
                self.errorFname = Config.Authentication.error.fname.maxLength;
                return false;
            }
            if(!Config.Authentication.regular.fname.test(self.fname)){
                self.errorFname = Config.Authentication.error.fname.regular;
                return false;
            }
        }
        self.errorFname = null;
        return true;
    };
    self.SnameValidation = function(){
        if(self.sname){
            if(self.sname.length < 2){
                self.errorSname = Config.Authentication.error.sname.minLength;
                return false;
            }
            if(self.sname.length > 20){
                self.errorSname = Config.Authentication.error.sname.maxLength;
                return false;
            }
            if(!Config.Authentication.regular.sname.test(self.sname)){
                self.errorSname = Config.Authentication.error.sname.regular;
                return false;
            }
        }
        self.errorSname = null;
        return true;
    };
    self.MnameValidation = function(){
        if(self.mname){
            if(self.mname.length < 2){
                self.errorMname = Config.Authentication.error.mname.minLength;
                return false;
            }
            if(self.mname.length > 20){
                self.errorMname = Config.Authentication.error.mname.maxLength;
                return false;
            }
            if(!Config.Authentication.regular.mname.test(self.mname)){
                self.errorMname = Config.Authentication.error.mname.regular;
                return false;
            }
        }
        self.errorMname = null;
        return true;
    };
};

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

