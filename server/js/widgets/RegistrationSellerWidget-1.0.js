var RegistrationSellerWidget = function () {
    var self = this;
    self.widgetName = 'RegistrationSellerWidget';
    self.version = 1.0;
    self.minWidgetVersion = 1.0;
    self.maxWidgetVersion = 2.0;
    self.minTmplVersion = 1.0;
    self.maxTmplVersion = 2.0;
    self.settings = {
        containerFormId: null,
        tmpl: {
            path: null,
            id: {
                step1: null,
                step2: null,
                step3: null,
                step4: null
            }
        },
        animate: null,
        inputParameters: {},
        style: null,
        customContainer: null
    };
    self.InitWidget = function () {
        self.settings.containerFormId = Config.Containers.registrationSeller.widget;
        self.settings.customContainer = Config.Containers.registrationSeller.customClass;
        self.settings.tmpl = Config.RegistrationSeller.tmpl;
        self.settings.style = Config.RegistrationSeller.style;
        self.SetInputParameters();
        self.RegisterEvents();
        self.CheckRouteRegistrationSeller();
        self.SetPosition();
    };
    self.SetInputParameters = function () {
        var input = {};
        if (Config.Base.sourceParameters == 'string') {
            var temp = JSCore.ParserInputParameters(/RegistrationSellerWidget/);
            if (temp.registrationSeller) {
                input = temp.registrationSeller;
            }
        }
        if (Config.Base.sourceParameters == 'object' && typeof WParameters !== 'undefined' && WParameters.registrationSeller) {
            input = WParameters.registrationSeller;
        }

        if (!$.isEmptyObject(input)) {
            if (input.animate)
                self.settings.animate = input.animate;
        }
        self.settings.inputParameters = input;
    };
    self.CheckRouteRegistrationSeller = function () {
        if (Routing.route == 'registration_seller') {
            if (!Routing.params.step)
                Routing.params.step = 1;
            self.BaseLoad.Tmpl(self.settings.tmpl, function () {
                if (Routing.params.step == 1)
                    self.Step.Step1();
                if (Routing.params.step == 2)
                    self.Step.Step2();
                if (Routing.params.step == 3)
                    self.Step.Step3();
                if (Routing.params.step == 4)
                    self.Step.Step4();
            });
        }
        else
            self.WidgetLoader(true);
    };
    self.RegisterEvents = function () {
        EventDispatcher.AddEventListener('widget.change.route', function () {
            self.CheckRouteRegistrationSeller();
        });

        EventDispatcher.AddEventListener('RegistrationSellerWidget.step1.register', function (step1) {
            self.WidgetLoader(false);

            var params = [];
            if (step1.nameSeller())
                params.push('name_seller=' + encodeURIComponent(step1.nameSeller()));
            if (step1.phone())
                params.push('phone_seller=' + step1.phone().replace(/\s/g, ''));
            if (step1.email())
                params.push('email_seller=' + $.trim(step1.email()));
            if (params.length > 0)
                var str = '?' + params.join('&');
            self.BaseLoad.RegistrationSeller(str, function (data) {
                if (self.QueryError(data, function(){EventDispatcher.DispatchEvent('RegistrationSellerWidget.step1.register', step1)})) {
                    Parameters.cache.regSeller.step1 = step1;
                    Routing.SetHash('registration_seller', 'Регистрация продавца', {step: 2});
                }
                else
                    self.WidgetLoader(true, self.settings.containerFormId);
            });
        });
        
        EventDispatcher.AddEventListener('RegistrationSellerWidget.step2.checking', function(step2){
            Parameters.cache.regSeller.step2 = step2;
            Routing.SetHash('registration_seller', 'Регистрация продавца', {step: 3});
        });
        
        EventDispatcher.AddEventListener('RegistrationSellerWidget.step3.checking', function(step3){
            self.WidgetLoader(false);
            var step1 = Parameters.cache.regSeller.step1;
            var step2 = Parameters.cache.regSeller.step2;
            Parameters.cache.regSeller.step3 = step3;
            
            var params = [];
            if (step1.nameSeller())
                params.push('name_seller=' + encodeURIComponent(step1.nameSeller()));
            params.push('mail_token=' + encodeURIComponent(step2.mailToken() ? step2.mailToken() : 1));
            params.push('sms_token=' + encodeURIComponent(step2.phoneToken() ? step2.phoneToken() : 1));
            if(step3.typeSeller())
                params.push('type_seller=' + step3.typeSeller());
            if(step3.invite())
                params.push('invite=' + encodeURIComponent(step3.invite()));
            if(step3.site())
                params.push('site=' + encodeURIComponent(step3.site()));
            var str = '?' + params.join('&');
            
            self.BaseLoad.ActivateSeller(str, function(data){
                if (self.QueryError(data, function(){EventDispatcher.DispatchEvent('RegistrationSellerWidget.step3.checking', step3)}))
                    Routing.SetHash('registration_seller', 'Регистрация продавца', {step: 4});
                else
                    self.WidgetLoader(true, self.settings.containerFormId);
            })
        });
    };
    self.Step = {
        Step1: function () {
            self.InsertContainer.Step1();
            self.Fill.Step1();
        },
        Step2: function () {
            self.InsertContainer.Step2();
            self.Fill.Step2();
        },
        Step3: function () {
            self.InsertContainer.Step3();
            self.Fill.Step3();
        },
        Step4: function(){
            console.log('1');
            self.InsertContainer.Step4();
            self.Fill.Step4();
        }
    };
    self.InsertContainer = {
        EmptyWidget: function () {
            var temp = $("#" + self.settings.containerFormId).find(self.SelectCustomContent().join(', ')).clone();
            $("#" + self.settings.containerFormId).empty().html(temp);
        },
        Step1: function () {
            self.InsertContainer.EmptyWidget();
            $("#" + self.settings.containerFormId).append($('script#' + self.GetTmplName('step1')).html()).children().hide();
        },
        Step2: function () {
            self.InsertContainer.EmptyWidget();
            $("#" + self.settings.containerFormId).append($('script#' + self.GetTmplName('step2')).html()).children().hide();
        },
        Step3: function () {
            self.InsertContainer.EmptyWidget();
            $("#" + self.settings.containerFormId).append($('script#' + self.GetTmplName('step3')).html()).children().hide();
        },
        Step4: function () {
            console.log('2');
            self.InsertContainer.EmptyWidget();
            $("#" + self.settings.containerFormId).append($('script#' + self.GetTmplName('step4')).html()).children().hide();
        }
    };
    self.Fill = {
        Step1: function () {
            var form = Parameters.cache.regSeller.step1;
            if ($.isEmptyObject(form)) {
                RegistrationSellerFormViewModel.prototype.Back = function () {
                    Parameters.cache.history.pop();
                    var link = Parameters.cache.history.pop();
                    if (link)
                        Routing.SetHash(link.route, link.title, link.data, true);
                    else
                        Routing.SetHash('default', 'Домашняя', {});
                };
                form = new RegistrationSellerFormViewModel();
            }
            self.Render.Step1(form);
        },
        Step2: function () {
            if (Routing.params.username && Routing.params.mail_token) {
                RegistrationSellerFormViewModel.prototype.Back = function () {
                    Parameters.cache.history.pop();
                    var link = Parameters.cache.history.pop();
                    if (link)
                        Routing.SetHash(link.route, link.title, link.data, true);
                    else
                        Routing.SetHash('default', 'Домашняя', {});
                };
                var step1 = new RegistrationSellerFormViewModel();
                step1.nameSeller(Routing.params.username);
                Parameters.cache.regSeller.step1 = step1;
            }
            
            if(!Parameters.cache.regSeller.step1.nameSeller){
                Routing.SetHash('registration_seller', 'Регистрация продавца', {});
                return true;
            }
            

            var form = new RegistrationSellerConfirmFormViewModel(Parameters.cache.regSeller.step1);

            if (Routing.params.username && Routing.params.mail_token) {
                form.mailToken(Routing.params.mail_token);
                EventDispatcher.DispatchEvent('RegistrationSellerWidget.step2.checking', form);
                return true;
            }

            self.Render.Step2(form);
        },
        Step3: function () {
            var form = Parameters.cache.regSeller.step3;
            if ($.isEmptyObject(form)){
                form = new RegistrationSellerFinishFormViewModel();
            }
            if(!Parameters.cache.regSeller.step1.nameSeller){
                Routing.SetHash('registration_seller', 'Регистрация продавца', {});
                return true;
            }
            
            self.Render.Step3(form);
        },
        Step4: function(){ 
            console.log('3');
            if(!Parameters.cache.regSeller.step1.nameSeller){
                Routing.SetHash('registration_seller', 'Регистрация продавца', {});
                return true;
            }
            Parameters.cache.regSeller = {
                step1: {},
                step2: {},
                step3: {}
            }
            console.log('4');
            self.Render.Step4();
        }
    };
    self.Render = {
        Step1: function (form) {
            if ($("#" + self.settings.containerFormId).length > 0) {
                try {
                    ko.cleanNode($("#" + self.settings.containerFormId)[0]);
                    ko.applyBindings(form, $("#" + self.settings.containerFormId)[0]);
                    self.WidgetLoader(true, self.settings.containerFormId);
                    if(typeof AnimateRegistrationSeller == 'function')
                        new AnimateRegistrationSeller();
                    if (self.settings.animate)
                        self.settings.animate();
                }
                catch (e) {
                    self.Exception('Ошибка шаблона [' + self.GetTmplName('step1') + ']', e);
                    if (self.settings.tmpl.custom) {
                        delete self.settings.tmpl.custom;
                        self.BaseLoad.Tmpl(self.settings.tmpl, function () {
                            self.InsertContainer.Step1();
                            self.Render.Step1(form);
                        });
                    }
                    else {
                        self.InsertContainer.EmptyWidget();
                        self.WidgetLoader(true, self.settings.containerFormId);
                    }
                }
            }
            else{
                self.Exception('Ошибка. Не найден контейнер [' + self.settings.containerFormId + ']');
                self.WidgetLoader(true, self.settings.containerFormId);
            }
        },
        Step2: function (form) {
            if ($("#" + self.settings.containerFormId).length > 0) {
                try {
                    ko.cleanNode($("#" + self.settings.containerFormId)[0]);
                    ko.applyBindings(form, $("#" + self.settings.containerFormId)[0]);
                    self.WidgetLoader(true, self.settings.containerFormId);
                    if(typeof AnimateRegistrationSeller == 'function')
                        new AnimateRegistrationSeller();
                    if (self.settings.animate)
                        self.settings.animate();
                }
                catch (e) {
                    self.Exception('Ошибка шаблона [' + self.GetTmplName('step2') + ']', e);
                    if (self.settings.tmpl.custom) {
                        delete self.settings.tmpl.custom;
                        self.BaseLoad.Tmpl(self.settings.tmpl, function () {
                            self.InsertContainer.Step2();
                            self.Render.Step2(form);
                        });
                    }
                    else {
                        self.InsertContainer.EmptyWidget();
                        self.WidgetLoader(true, self.settings.containerFormId);
                    }
                }
            }
            else{
                self.Exception('Ошибка. Не найден контейнер [' + self.settings.containerFormId + ']');
                self.WidgetLoader(true, self.settings.containerFormId);
            }
        },
        Step3: function (form) {
            if ($("#" + self.settings.containerFormId).length > 0) {
                try {
                    ko.cleanNode($("#" + self.settings.containerFormId)[0]);
                    ko.applyBindings(form, $("#" + self.settings.containerFormId)[0]);
                    self.WidgetLoader(true, self.settings.containerFormId);
                    if(typeof AnimateRegistrationSeller == 'function')
                        new AnimateRegistrationSeller();
                    if (self.settings.animate)
                        self.settings.animate();
                }
                catch (e) {
                    self.Exception('Ошибка шаблона [' + self.GetTmplName('step3') + ']', e);
                    if (self.settings.tmpl.custom) {
                        delete self.settings.tmpl.custom;
                        self.BaseLoad.Tmpl(self.settings.tmpl, function () {
                            self.InsertContainer.Step3();
                            self.Render.Step3(form);
                        });
                    }
                    else {
                        self.InsertContainer.EmptyWidget();
                        self.WidgetLoader(true, self.settings.containerFormId);
                    }
                }
            }
            else{
                self.Exception('Ошибка. Не найден контейнер [' + self.settings.containerFormId + ']');
                self.WidgetLoader(true, self.settings.containerFormId);
            }
        },
        Step4: function(){
            self.WidgetLoader(true, self.settings.containerFormId);
            if(typeof AnimateRegistrationSeller == 'function')
                new AnimateRegistrationSeller();
            if(self.settings.animate)
                self.settings.animate();
        }
    };
    self.SetPosition = function () {
        if (self.settings.inputParameters['position'] == 'absolute') {
            for (var key in self.settings.inputParameters) {
                if (self.settings.style[key])
                    self.settings.style[key] = self.settings.inputParameters[key];
            }
            $().ready(function () {
                for (var i = 0; i <= Config.Containers.registration.length - 1; i++) {
                    $("#" + Config.Containers.registration[i]).css(self.settings.style);
                }
            });
        }
    };
};

var RegistrationSellerFormViewModel = function () {
    var self = this;
    self.nameSeller = ko.observable(null);
    self.errorNameSeller = ko.observable(null);

    self.email = ko.observable(null);
    self.errorEmail = ko.observable(null);

    self.cssPhone = 'phone';
    self.phone = ko.observable(null);
    self.errorPhone = ko.observable(null);

    self.isChecked = ko.observable(false);
    self.errorIsChecked = ko.observable(null);

    self.SubmitForm = function () {
        if (self.ValidationForm()) {
            EventDispatcher.DispatchEvent('RegistrationSellerWidget.step1.register', self);
        }
    };
    self.ValidationForm = function () {
        var test = true;
        if (!self.NameValidation())
            test = false;
        if (!self.EmailValidation())
            test = false;
        if (!self.PhoneValidation())
            test = false;
        if (!self.IsCheckedValidation())
            test = false;

        return test;
    };
    self.NameValidation = function () {
        if (!self.nameSeller()) {
            self.errorNameSeller(Config.RegistrationSeller.error.nameSeller.empty);
            return false;
        }
        if (self.nameSeller().length < 3) {
            self.errorNameSeller(Config.RegistrationSeller.error.nameSeller.minLength);
            return false;
        }
        if (self.nameSeller().length > 40) {
            self.errorNameSeller(Config.RegistrationSeller.error.nameSeller.maxLength);
            return false;
        }
        if (!Config.RegistrationSeller.regular.nameSeller.test(self.nameSeller())) {
            self.errorNameSeller(Config.RegistrationSeller.error.nameSeller.regular);
            return false;
        }
        self.errorNameSeller(null);
        return true;
    };
    self.EmailValidation = function () {
        if (!self.email()) {
            self.errorEmail(Config.Registration.error.email.empty);
            return false;
        }
        if (self.email().length > 64) {
            self.errorEmail(Config.Registration.error.email.maxLength);
            return false;
        }
        if (!Config.Registration.regular.email.test(self.email())) {
            self.errorEmail(Config.Registration.error.email.regular);
            return false;
        }
        self.errorEmail(null);
        return true;
    };
    self.PhoneValidation = function () {
        if (self.phone()) {
            if (!Config.Registration.regular.phone.test($.trim(self.phone()))) {
                self.errorPhone(Config.Registration.error.phone.regular);
                return false;
            }
        }
        self.errorPhone(null);
        return true;
    };
    self.IsCheckedValidation = function () {
        if (!self.isChecked()) {
            self.errorIsChecked(Config.Registration.error.isChecked.empty);
            return false;
        }

        self.errorIsChecked(null);
        return true;
    };
    self.RestoreAccess = function () {

    };
    self.agreement = 'http://' + window.location.hostname + '/rules';
    self.police = 'http://' + window.location.hostname + '/police';
    self.refund = 'http://' + window.location.hostname + '/refund';
};

var RegistrationSellerConfirmFormViewModel = function (cache) {
    var self = this;
    self.nameSeller = cache.nameSeller();

    self.cssMailToken = 'mail_token_block';
    self.mailToken = ko.observable();
    self.mailIsConfirm = ko.observable(false);
    self.errorEmailConfirm = ko.observable(null);
    self.mailConfirmLater = ko.observable(false);

    self.cssPhoneToken = 'phone_token_block';
    self.phoneToken = ko.observable();
    self.phoneIsConfirm = ko.observable(false);
    self.errorPhoneConfirm = ko.observable(null);
    self.phoneConfirmLater = ko.observable(false);

    self.errorConfirmLater = ko.observable(null);

    self.isEmptyPhone = ko.computed(function () {
        if (!$.isEmptyObject(cache) && cache.phone())
            return false;
        self.phoneConfirmLater(true);
        return true;
    }, this);

    self.submitEvent = ko.observable();

    self.SubmitForm = function () {
        if (self.ValidationForm()) {
            EventDispatcher.DispatchEvent('RegistrationSellerWidget.step2.checking', self);
        }
    };
    self.ValidationForm = function () {
        var test = true;
        if (!self.EmailTokenValidation())
            test = false;
        if (!self.PhoneTokenValidation())
            test = false;
        if (!self.EmptyConfirm())
            test = false;
        return test;
    };
    self.EmailTokenValidation = function () {
        if (!self.mailConfirmLater()) {
            if (!self.mailToken()) {
                self.errorEmailConfirm(Config.Registration.error.emailToken.empty);
                return false;
            }
        }

        self.errorEmailConfirm(null);
        return true;
    };
    self.PhoneTokenValidation = function () {
        if (!self.phoneConfirmLater()) {
            if (!self.phoneToken()) {
                self.errorPhoneConfirm(Config.Registration.error.phoneToken.empty);
                return false;
            }
        }

        self.errorPhoneConfirm(null);
        return true;
    };
    self.EmptyConfirm = function () {
        if (self.phoneConfirmLater() && self.mailConfirmLater()) {
            self.errorConfirmLater(Config.Registration.error.confirmLater.empty);
            self.errorEmailConfirm(null);
            self.errorPhoneConfirm(null);
            return false;
        }
        else
            self.errorConfirmLater(null);

        return true;
    };
    self.Back = function () {
        Parameters.cache.regSeller.step3 = self;
        Routing.SetHash('registration_seller', 'Регистрация пользователя', {step: 1});
    };
};

var RegistrationSellerFinishFormViewModel = function(){
    var self = this;
    self.typeSeller = ko.observable();
    self.errorTypeSeller = ko.observable();
    
    self.invite = ko.observable();
    self.errorInvite = ko.observable();
    
    self.site = ko.observable('http://');
    self.errorSite = ko.observable();
    
    self.confirmLater = ko.observable(false);
    self.confirmLater.subscribe(function(check) {
        if(!check){
            self.invite('');
            self.site('');
        }
    });
    self.errorConfirmLater = ko.observable(null);
    
    self.SubmitForm = function () {
        if (self.ValidationForm()) {
            EventDispatcher.DispatchEvent('RegistrationSellerWidget.step3.checking', self);
        }
    };
    self.ValidationForm = function () {
        var test = true;
        if (!self.TypeSellerValidation())
            test = false;
        if (!self.InviteValidation())
            test = false;
        if (!self.SiteValidation())
            test = false;
        return test;
    };
    self.Back = function () {
        Routing.SetHash('registration_seller', 'Регистрация пользователя', {step: 2});
    };
    self.TypeSellerValidation = function(){
        if(!self.typeSeller()){
            self.errorTypeSeller(Config.RegistrationSeller.error.typeSeller.empty);
            return false;
        }
        self.errorTypeSeller(null);
        return true;
    };
    self.InviteValidation = function(){
        if(self.invite()){
            if (self.invite().length < 5) {
                self.errorInvite(Config.RegistrationSeller.error.invite.minLength);
                return false;
            }
            if (self.invite().length > 40) {
                self.errorInvite(Config.RegistrationSeller.error.invite.maxLength);
                return false;
            }
        }
        self.errorInvite(null);
        return true;
    };
    self.SiteValidation = function(){
        if(self.site()){
            if(self.site() == 'http://')
                self.site('');
        }
        self.errorSite(null);
        return true;
    };
}


var TestRegistrationSeller = {
    Init: function () {
        if (typeof Widget == 'function') {
            RegistrationSellerWidget.prototype = new Widget();
            var reg = new RegistrationSellerWidget();
            reg.Init(reg);
        }
        else {
            setTimeout(function () {
                TestRegistrationSeller.Init()
            }, 100);
        }
    }
}

TestRegistrationSeller.Init();

