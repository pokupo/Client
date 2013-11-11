var UserInformationWidget = function(){
    var self = this;
    self.widgetName = 'UserInformationWidget';
    self.settings = {
        containerId : null, 
        tmpl :{
            path : null,
            id : {
                info : null,
                auth : null 
            }
        },
        inputParameters : {},
        showBlocks : null,
        style : null,
        customContainer: null
    };
    self.InitWidget = function(){
        self.settings.containerId = Config.Containers.userInformation.widget; 
        self.settings.customContainer = Config.Containers.userInformation.customClass;
        self.settings.tmpl = Config.UserInformation.tmpl;
        self.settings.showBlocks = Config.UserInformation.showBlocks;
        self.settings.style = Config.UserInformation.style;
        self.RegisterEvents();
        self.SetInputParameters();
        self.SetPosition();
    };
    self.SetInputParameters = function(){
        var input = {};
        if(Config.Base.sourceParameters == 'string'){
            var temp = JSCore.ParserInputParameters(/UserInformationWidget.js/);
            if(temp.userInformation){
                input = temp.userInformation;
            }
        }
        if(Config.Base.sourceParameters == 'object' && typeof WParameters !== 'undefined' && WParameters.userInformation){
            input = WParameters.userInformation;
        }
        
        if(!$.isEmptyObject(input)){
            if(input.show){
                for(var i = 0; i <= input.show.length-1; i++){
                    if($.inArray(input.show[i], self.settings.showBlocks) < 0)
                        self.settings.showBlocks.push(input.show[i]);
                }
            }
        }
        self.settings.inputParameters = input;
    };
    self.LoadTmpl = function(){
        self.BaseLoad.Tmpl(self.settings.tmpl, function(){
            EventDispatcher.DispatchEvent('onload.userInformation.tmpl')
        });
    };
    self.RegisterEvents = function(){
        if(JSLoader.loaded){
            self.LoadTmpl();
        }
        else{
            EventDispatcher.AddEventListener('onload.scripts', function (){ 
                self.LoadTmpl();
            });
        }
        
        EventDispatcher.AddEventListener('onload.userInformation.tmpl', function (){
            self.BaseLoad.Login(false, false, false, function(data){
                self.CheckAuthorization(data);
            });
        });
        
        EventDispatcher.AddEventListener('widget.authentication.ok', function(data){
               self.CheckAuthorization(data.request);
        });
        
        EventDispatcher.AddEventListener('UserInformationWidget.click.logout', function(){
            self.BaseLoad.Logout(function(data){
                if(data.result == 'ok' || data.result == 'fail'){
                    Routing.SetHash('default', 'Домашняя', {});
                }
            });
        });
        
        EventDispatcher.AddEventListener('widget.change.route', function (data){
            EventDispatcher.DispatchEvent('onload.userInformation.tmpl');
        });
    };
    self.CheckAuthorization = function(data){
        if(Routing.IsDefault() && self.HasDefaultContent()){
            self.WidgetLoader(true);
        }
        else{
            if(!data.err){
                self.InsertContainer.InfoBlock();
                self.Fill.InfoBlock(data);
            }
            else{
                self.InsertContainer.AuthBlock();
                self.Fill.AuthBlock();
            }
        }
    };
    self.InsertContainer = {
        EmptyWidget : function(){
            var temp = $("#" + self.settings.containerId).find(self.SelectCustomContent().join(', ')).clone();
            $("#" + self.settings.containerId).empty().html(temp);
        },
        AuthBlock : function(){
            self.InsertContainer.EmptyWidget();
            $("#" + self.settings.containerId).append($('script#' + self.settings.tmpl.id.auth).html());
        },
        InfoBlock : function(){
            self.InsertContainer.EmptyWidget();
            $("#" + self.settings.containerId).append($('script#' + self.settings.tmpl.id.info).html());
        }
    };
    self.Fill = {
        AuthBlock : function(){
            var block = new UserAuthorizationBlockViewModel();
            self.Render.AuthBlock(block);
        },
        InfoBlock : function(data){
            UserInformationBlockViewModel.prototype = new Widget();
            var block = new UserInformationBlockViewModel(data);
            self.Render.InfoBlock(block);
        }
    };
    self.Render = {
        AuthBlock : function(data){
            if($("#" + self.settings.containerId).length > 0){
                ko.applyBindings(data, $("#" + self.settings.containerId)[0]);
            }
            self.WidgetLoader(true, self.settings.containerId);
        },
        InfoBlock : function(data){
            if($("#" + self.settings.containerId).length > 0){
                ko.applyBindings(data, $("#" + self.settings.containerId)[0]);
            }
            self.WidgetLoader(true, self.settings.containerId);
        }
    }
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

var UserAuthorizationBlockViewModel = function(){
    var self = this;
    self.ClickLogin = function(){
        Parameters.cache.lastPage = Parameters.cache.history[Parameters.cache.history.length-1];
        Routing.SetHash('login', 'Авторизация пользователя', {});
    };
    self.ClickRegistration = function(){
        Parameters.cache.lastPage = Parameters.cache.history[Parameters.cache.history.length-1];
        Routing.SetHash('registration', 'Регистрация пользователя', {step:1}); 
    };
};

var UserInformationBlockViewModel = function(data){
    var self = this;
    self.email = data.email;
    self.login = data.login;
    self.phone = data.phone;
    self.showIcon = function(){
        if(!data.route_icon_user || $.inArray('icon', Config.UserInformation.showBlocks) < 0)
            return false;
        return true;
    };
    self.iconUser = Parameters.pathToImages + data.route_icon_user;
    
    self.showRaiting = function(){
        if($.inArray('raiting', Config.UserInformation.showBlocks) < 0)
            return false;
        return true;
    };
    self.ratingUser = data.rating_user;
    
    self.ClickLogout = function(){
        self.Confirm(Config.Authentication.message.confirmLogOut, function(){
            Loader.Indicator('UserInformationWidget', false);
            EventDispatcher.DispatchEvent('UserInformationWidget.click.logout');
        }, false);
    };
    self.ClickPrivateOffice = function(){
        Routing.SetHash('profile', 'Личный кабинет', {});
    };
};

var TestUserInformation = {
    Init : function(){
        if(typeof Widget == 'function'){
            UserInformationWidget.prototype = new Widget();
            var information = new UserInformationWidget();
            information.Init(information);
        }
        else{
            setTimeout(function(){TestUserInformation.Init()}, 100);
        }
    }
}

TestUserInformation.Init();


