var RegistrationWidget = function() {
    var self = this;
    self.widgetName = 'RegistrationWidget';
    self.settings = {
        containerFormId: null,
        tmplPath: null,
        regFormStep1TmplId: null,
        regFormStep2TmplId: null,
        regFormStep3TmplId: null,
        regFormStep4TmplId: null,
        inputParameters: {},
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

            if (input.tmpl) {
                self.settings.tmplPath = 'registration/' + input.tmpl + '.html';
            }
        }
    };
    self.CheckRouteRegistration = function() {
        if (Routing.route == 'registration'){
            if(Routing.params.step == 1)
                self.Step.Step1();
            if(Routing.params.step == 2)
                self.Step.Step2();
            if(Routing.params.step == 3)
                self.Step.Step3();
            if(Routing.params.step == 4)
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

        EventDispatcher.AddEventListener('RegistrationWidget.step1.checking', function(step1) {
            self.WidgetLoader(false);
            var params = [];
            if(step1.username())
                params.push('username=' + step1.username());
            if(step1.phone())
                params.push('phone=' + step1.phone().replace(/\s/g, '')); 
            if(step1.email())
                params.push('email=' + step1.email());
            if(params.length > 0)
                var str = '?' + params.join('&');

            self.BaseLoad.UniqueUser(str, function(data) {
                var test = true;
                if (!self.Validate.Username(data, step1))
                    test = false;
                if (!self.Validate.Email(data, step1))
                    test = false;
                if (!self.Validate.Phone(data, step1))
                    test = false;
                if (test) {
                    var params = [];
                    if (step1.username())
                        params.push('username=' + step1.username());
                    if (step1.phone())
                        params.push('phone=' + step1.phone().replace(/\s/g, ''));
                    if (step1.email())
                        params.push('email=' + step1.email());
                    if (step1.firstPassword())
                        params.push('password=' + step1.firstPassword());
                    if (params.length > 0)
                        var str = '?' + params.join('&');
                    self.BaseLoad.Registration(str, function(data) {
                        Parameters.cache.reg.step1 = step1;
                        Routing.SetHash('registration', 'Регистрация пользователя', {step: 2});
                    });
                }
                else
                    self.WidgetLoader(true);
            });
        });
        
        EventDispatcher.AddEventListener('RegistrationWidget.step1.view', function(){
            Routing.SetHash('registration', 'Регистрация пользователя', {step: 1});
        });

        EventDispatcher.AddEventListener('RegistrationWidget.step2.checking', function(step2) {
            self.WidgetLoader(false);
            var params = [];
            params.push('username=' + step2.username());
            if (!step2.mailConfirmLater())
                params.push('mail_token=' + step2.mailToken());
            if (!step2.phoneConfirmLater())
                params.push('sms_token=' + step2.phoneToken());
            var str = '?' + params.join('&');

            self.BaseLoad.ActivateUser(str, function(data) {
                var test = true;
                if (!self.Validate.MailToken(data, step2))
                    test = false;
                if (!self.Validate.PhoneToken(data, step2))
                    test = false;

                if (test) {
                    Parameters.cache.reg.step2 = step2;
                    self.BaseLoad.Login(Parameters.cache.reg.step1.username(), Parameters.cache.reg.step1.firstPassword(), false , function(request){
                        EventDispatcher.DispatchEvent('widget.authentication.ok', {request : request});
                        if(!request.err)
                            Routing.SetHash('registration', 'Регистрация пользователя', {step: 3});
                    });
                }
                else
                    self.WidgetLoader(true);
            });
        });
        
        EventDispatcher.AddEventListener('RegistrationWidget.step2.view', function(){
            Routing.SetHash('registration', 'Регистрация пользователя', {step: 2});
        });
        
        EventDispatcher.AddEventListener('RegistrationWidget.step3.later', function(data){
            Routing.SetHash('registration', 'Регистрация пользователя', {step: 4});
        });
        
        EventDispatcher.AddEventListener('RegistrationWidget.step3.checking', function(step3) {
            self.WidgetLoader(false);
            var day = step3.birthDay().split('.');
            var birthDay = day[2] + '-' + day[1] + '-' + day[0];
            var str = '?sname=' + step3.lastName() + 
                      '&fname=' + step3.firstName() + 
                      '&mname=' + step3.firstName() +
                      '&bday=' + birthDay +
                      '&gender=' + step3.gender();

            self.BaseLoad.EditProfile(str, function(data){
                if(data == true || (data.result && data.result == 'ok')){
                    Parameters.cache.reg.step3 = step3;
                    Routing.SetHash('registration', 'Регистрация пользователя', {step: 4});
                }
            });
        });
        
        EventDispatcher.AddEventListener('RegistrationWidget.step4.later', function(data){
            Routing.SetHash('private_office', 'Личный кабинет', {});
        });
        
        EventDispatcher.AddEventListener('RegistrationWidget.step4.checking', function(step4) {
            self.WidgetLoader(false);
            var str = '?id_country=' + step4.country().id;
            if(step4.region())
                str = str + '&code_region=' + step4.region().regioncode;
            else
                str = str + '&name_region=' + step4.customRegion();
            if(step4.city())
                str = str + '&code_city=' + step4.city().aoguid;
            else
                str = str + '&name_city=' + step4.customCity();     
            str = str + '&address=' + step4.customAddress() + '&post_code=' + step4.postIndex();

            self.BaseLoad.EditAddress(str, function(data){
                if(data == true || (data.result && data.result == 'ok')){
                    Parameters.cache.reg.step4 = step4;
                    EventDispatcher.DispatchEvent('RegistrationWidget.step4.later');
                }
            });
        });
    };
    self.Validate = {
        Username: function(data, step1) {
            var test = false;
            if (data.check_username) {
                if (data.check_username == 'on' || data.check_username == 'ban')
                    step1.errorUsername(Config.Registration.error.username.uniq);
                if (data.check_username == 'yes' || data.check_username == 'off')
                    test = true;
            }

            return test;
        },
        Phone: function(data, step1) {
            var test = true;
            if (data.check_phone) {
                if (data.check_phone == 'on' || data.check_phone == 'ban')
                    step1.errorPhone(Config.Registration.error.phone.uniq);
                if (data.check_phone == 'yes' || data.check_phone == 'off')
                    test = true;
            }

            return test;
        },
        Email: function(data, step1) {
            var test = false;
            if (data.check_email) {
                if (data.check_email == 'on' || data.check_email == 'ban')
                    step1.errorEmail(Config.Registration.error.email.uniq);
                if (data.check_email == 'yes' || data.check_email == 'off')
                    test = true;
            }

            return test;
        },
        MailToken: function(data, step2) {
            if (data.confirm_email) {
                if (data.confirm_email == 'no'){
                    step2.errorEmailConfirm(Config.Registration.error.emailToken.confirm);
                    return false;
                }
            }
            
            return true;
        },
        PhoneToken: function(data, step2) {
            if (data.confirm_phone) {
                if (data.confirm_phone == 'no'){
                    step2.errorPhoneConfirm(Config.Registration.error.phoneToken.confirm);
                    return false;
                }
            }

            return true;
        }
    };
    self.Step = {
        Step1: function() { 
            self.InsertContainer.Step1();
            self.Fill.Step1();
        },
        Step2: function() {
            self.InsertContainer.Step2();
            self.Fill.Step2();
        },
        Step3 : function(){
            self.InsertContainer.Step3();
            self.Fill.Step3();
        },
        Step4 : function(){ 
            self.InsertContainer.Step4();
            self.Fill.Step4();
        }
    };
    self.InsertContainer = {
        Step1: function() {
            if (Config.Containers.catalog)
                $("#" + Config.Containers.catalog).hide();
            $("#wrapper").removeClass("with_sidebar").addClass("with_top_border");
            $("#" + self.settings.containerFormId).empty().append($('script#' + self.settings.regFormStep1TmplId).html());
        },
        Step2: function() {
            if (Config.Containers.catalog)
                $("#" + Config.Containers.catalog).hide();
            $("#wrapper").removeClass("with_sidebar").addClass("with_top_border");
            $("#" + self.settings.containerFormId).empty().append($('script#' + self.settings.regFormStep2TmplId).html());
        },
        Step3 : function(){
            if (Config.Containers.catalog)
                $("#" + Config.Containers.catalog).hide();
            $("#wrapper").removeClass("with_sidebar").addClass("with_top_border");
            $("#" + self.settings.containerFormId).empty().append($('script#' + self.settings.regFormStep3TmplId).html());
        },
        Step4 : function(){
            if (Config.Containers.catalog)
                $("#" + Config.Containers.catalog).hide();
            $("#wrapper").removeClass("with_sidebar").addClass("with_top_border");
            $("#" + self.settings.containerFormId).empty().append($('script#' + self.settings.regFormStep4TmplId).html());
        }
    };
    self.Fill = {
        Step1: function() {
            var form = new RegistrationFormStep1ViewModel();
            self.Render.Step1(form);
        },
        Step2: function(username) {
            var form = new RegistrationFormStep2ViewModel(username);
            self.Render.Step2(form);
        },
        Step3 : function(){
            var form = new RegistrationFormStep3ViewModel();
            self.Render.Step3(form);
        },
        Step4 : function(){
            self.BaseLoad.Country(function(data){
                var form = new RegistrationFormStep4ViewModel();
                form.AddCountryList(data);
                self.Render.Step4(form);
            });
        }
    };
    self.Render = {
        Step1: function(form) {
            if ($("#" + self.settings.containerFormId).length > 0) {
                ko.applyBindings(form, $("#" + self.settings.containerFormId)[0]);
            }
            $('input#' + form.cssPhone).mask("?9 999 999 99 99", {placeholder: "_"});
            self.WidgetLoader(true);
        },
        Step2: function(form) {
            if ($("#" + self.settings.containerFormId).length > 0) {
                ko.applyBindings(form, $("#" + self.settings.containerFormId)[0]);
            }
            self.WidgetLoader(true);
        },
        Step3 : function(form){
            if ($("#" + self.settings.containerFormId).length > 0) {
                ko.applyBindings(form, $("#" + self.settings.containerFormId)[0]);
            }
            $("#" + form.cssBirthDay).mask("99.99.9999", {placeholder: "_"}).datepicker({
                changeMonth: true,
                changeYear: true,
                dateFormat: 'dd.mm.yy',
                defaultDate: '-24Y',
                onClose: function(dateText, inst) {
                    form.birthDay(dateText);
                }
            });
            self.WidgetLoader(true);
        },
        Step4: function(form) {
            if ($("#" + self.settings.containerFormId).length > 0) {
                ko.applyBindings(form, $("#" + self.settings.containerFormId)[0]);
            }
            $('#' + form.cssCountryList).sSelect({defaultText: ' '}).change(function(){});
            $('#' + form.cssRegionList).autocomplete({
                source: function (request, response) {
                    self.BaseLoad.Region(form.country().id + '/' + request.term, function(data){
                        if(!data.err){
                            response($.map(data, function (item) {
                                return {
                                    value: $.trim(item.formalname + ' ' + item.shortname),
                                    region: item
                                };
                            }));
                        }
                        else{
                            $('#' + form.cssRegionList).autocomplete( "close" );
                            return false;
                        }
                    });
                },
                select: function( event, ui ) {
                    form.region(ui.item.region);
                    form.customRegion(ui.item.value);
                    if(ui.item.region && ui.item.region.postalcode != 0)
                        form.postIndex(ui.item.region.postalcode); 
                    else{
                        form.postIndex(null);
                    }
                }
            });
            
            $('#' + form.cssCityList).autocomplete({
                source: function (request, response) {
                    self.BaseLoad.City(form.country().id + '/' + form.region().regioncode + '/' + request.term, function(data){
                        if(!data.err){
                            response($.map(data, function (item) {
                                return {
                                    value: $.trim(item.shortname + '. ' + item.formalname),
                                    city: item
                                };
                            }));
                        }
                        else{
                            $('#' + form.cssCityList).autocomplete( "close" );
                            return false;
                        }
                    });
                },
                select: function( event, ui ) {
                    form.city(ui.item.city);
                    form.customCity(ui.item.value);
                    if(ui.item.city && ui.item.city.postalcode != 0)
                        form.postIndex(ui.item.city.postalcode); 
                    else
                        form.postIndex(null);
                }
            });
            
            $('#' + form.cssAddress).autocomplete({
                source: function (request, response) {
                    self.BaseLoad.Street(form.country().id + '/' + form.region().regioncode + '/' + form.city().aoguid + '/' + request.term, function(data){
                        if(!data.err){
                            response($.map(data, function (item) {
                                return {
                                    value: $.trim(item.shortname + '. ' + item.formalname),
                                    street: item
                                };
                            }));
                        }
                        else{
                            $('#' + form.cssAddress).autocomplete( "close" );
                            return false;
                        }
                    });
                },
                select: function( event, ui ) {
                    form.address(ui.item.street);
                    form.customAddress(ui.item.value);
                    if(ui.item.street && ui.item.street.postalcode != 0)
                        form.postIndex(ui.item.street.postalcode); 
                    else
                        form.postIndex(null);
                }
            });
            
            self.WidgetLoader(true);
        }
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
};

var RegistrationFormStep1ViewModel = function() {
    var self = this;
    self.username = ko.observable(null);
    self.errorUsername = ko.observable(null);
    self.email = ko.observable(null);
    self.errorEmail = ko.observable(null);
    self.cssPhone = 'phone';
    self.phone = ko.observable(null);
    self.errorPhone = ko.observable(null);
    self.cssFirstPassword = 'firstPassword';
    self.firstPassword = ko.observable(null);
    self.errorFirstPassword = ko.observable(null);
    self.cssSecondPassword = 'secondPassword';
    self.secondPassword = ko.observable(null);
    self.errorSecondPassword = ko.observable(null);
    self.isChecked = ko.observable(false);
    self.errorIsChecked = ko.observable(null);


    self.SubmitForm = function() {
        if (self.ValidationForm()) {
            EventDispatcher.DispatchEvent('RegistrationWidget.step1.checking', self);
        }
    };
    self.Back = function() {

    };
    self.ValidationForm = function() {
        var test = true;
        if (!self.UsernameValidation())
            test = false;
        if (!self.EmailValidation())
            test = false;
        if (!self.PhoneValidation())
            test = false;
        if (!self.PasswordValidation())
            test = false;
        if (!self.PasswordSecondValidation())
            test = false;
        if (!self.IsCheckedValidation())
            test = false;

        return test;
    };
    self.UsernameValidation = function() {
        if (!self.username()) {
            self.errorUsername(Config.Registration.error.username.empty);
            return false;
        }
        if (self.username().length < 3) {
            self.errorUsername(Config.Registration.error.username.minLength);
            return false;
        }
        if (self.username().length > 40) {
            self.errorUsername(Config.Registration.error.username.maxLength);
            return false;
        }
        if (!Config.Registration.regular.username.test(self.username())) {
            self.errorUsername(Config.Registration.error.username.regular);
            return false;
        }
        self.errorUsername(null);
        return true;
    };
    self.EmailValidation = function() {
        if (!self.email()) {
            self.errorEmail(Config.Registration.error.email.empty);
            return false;
        }
        if (self.email().length > 64) {
            self.errorUsername(Config.Registration.error.email.maxLength);
            return false;
        }
        if (!Config.Registration.regular.email.test(self.email())) {
            self.errorEmail(Config.Registration.error.email.regular);
            return false;
        }
        self.errorEmail(null);
        return true;
    };
    self.PhoneValidation = function() {
        if (self.phone()) {
            if (!Config.Registration.regular.phone.test(self.phone())) {
                self.errorPhone(Config.Registration.error.phone.regular);
                return false;
            }
        }
        self.errorPhone(null);
        return true;
    };
    self.PasswordValidation = function() {
        self.firstPassword($('input#' + self.cssFirstPassword).val());
        if (!self.firstPassword()) {
            self.errorFirstPassword(Config.Registration.error.password.empty);
            return false;
        }
        if (self.firstPassword().length < 6) {
            self.errorFirstPassword(Config.Registration.error.password.minLength);
            return false;
        }
        if (self.firstPassword().length > 64) {
            self.errorFirstPassword(Config.Registration.error.password.maxLength);
            return false;
        }

        self.errorFirstPassword(null);
        return true;
    };
    self.PasswordSecondValidation = function() {
        self.secondPassword($('input#' + self.cssSecondPassword).val());
        if (!self.secondPassword()) {
            self.errorSecondPassword(Config.Registration.error.password.empty);
            return false;
        }
        if (self.firstPassword() != self.secondPassword()) {
            self.errorSecondPassword(Config.Registration.error.password.equal);
            return false;
        }
        self.errorSecondPassword(null);
        return true;
    };
    self.IsCheckedValidation = function() {
        if (!self.isChecked()) {
            self.errorIsChecked(Config.Registration.error.isChecked.empty);
            return false;
        }

        self.errorIsChecked(null);
        return true;
    };
};

var RegistrationFormStep2ViewModel = function() {
    var self = this;
    self.username = Parameters.cache.reg.step1.username;

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

    self.Back = function() {
        EventDispatcher.DispatchEvent('RegistrationWidget.step1.view');
    };
    self.SubmitForm = function() {
        if (self.ValidationForm()) {
            EventDispatcher.DispatchEvent('RegistrationWidget.step2.checking', self);
        }
    };
    self.ValidationForm = function() {
        var test = true;
        if (!self.EmailTokenValidation())
            test = false;
        if (!self.PhoneTokenValidation())
            test = false;
        if (!self.EmptyConfirm())
            test = false;

        return test;
    };
    self.EmailTokenValidation = function() {
        if (!self.mailConfirmLater()) {
            if (!self.mailToken()) {
                self.errorEmailConfirm(Config.Registration.error.emailToken.empty);
                return false;
            }
        }

        self.errorEmailConfirm(null);
        return true;
    };
    self.PhoneTokenValidation = function() {
        if (!self.phoneConfirmLater()) {
            if (!self.phoneToken()) {
                self.errorPhoneConfirm(Config.Registration.error.phoneToken.empty);
                return false;
            }
        }

        self.errorPhoneConfirm(null);
        return true;
    };
    self.EmptyConfirm = function() {
        if (self.phoneConfirmLater() && self.mailConfirmLater()) {
            self.errorConfirmLater(Config.Registration.error.confirmLater.empty);
            return false;
        }
        else
            self.errorConfirmLater(null);

        return true;
    };
};

var RegistrationFormStep3ViewModel = function() {
    var self = this;
    self.lastName = ko.observable();
    self.errorLastName = ko.observable(null);
    
    self.firstName = ko.observable();
    self.errorFirstName = ko.observable(null);
    
    self.middleName = ko.observable();
    self.errorMiddleName = ko.observable(null);
    
    self.birthDay = ko.observable();
    self.errorBirthDay = ko.observable(null);
    self.cssBirthDay = 'birthDay';
    
    self.gender = ko.observable('m');
    self.errorGender = ko.observable(null);
    
    self.Back = function(){
        EventDispatcher.DispatchEvent('RegistrationWidget.step2.view');
    };
    self.SpecifyLater = function(){
        EventDispatcher.DispatchEvent('RegistrationWidget.step3.later', self);
    };
    self.SubmitForm = function(){
        if (self.ValidationForm()) {
            EventDispatcher.DispatchEvent('RegistrationWidget.step3.checking', self);
        }
    };
    self.ValidationForm = function(){
        var test = true;
        if(!self.FirstNameValidation())
            test = false;
        if(!self.LastNameValidation())
            test = false;
        if(!self.MiddleNameValidation())
            test = false;
        if(!self.BirthDayValidation())
            test = false;
        if(!self.GanderValidation())
            test = false;
        
        return test;
    };
    self.FirstNameValidation = function(){
        if(!self.firstName()){
            self.errorFirstName(Config.Registration.error.firstName.empty);
            return false;
        }
        if(self.firstName().length < 2){
            self.errorFirstName(Config.Registration.error.firstName.minLength);
            return false;
        }
        if(self.firstName().length > 20){
            self.errorFirstName(Config.Registration.error.firstName.maxLength);
            return false;
        }
        if(!Config.Registration.regular.firstName.test(self.firstName())){
            self.errorFirstName(Config.Registration.error.firstName.regular);
            return false;
        }
        self.errorFirstName(null);
        return true;
    };
    self.LastNameValidation = function(){
        if(!self.lastName()){
            self.errorLastName(Config.Registration.error.lastName.empty);
            return false;
        }
        if(self.lastName().length < 2){
            self.errorLastName(Config.Registration.error.lastName.minLength);
            return false;
        }
        if(self.lastName().length > 20){
            self.errorLastName(Config.Registration.error.lastName.maxLength);
            return false;
        }
        if(!Config.Registration.regular.lastName.test(self.lastName())){
            self.errorLastName(Config.Registration.error.lastName.regular);
            return false;
        }
        self.errorLastName(null);
        return true;
    };
    self.MiddleNameValidation = function(){
        if(!self.middleName()){
            self.errorMiddleName(Config.Registration.error.middleName.empty);
            return false;
        }
        if(self.middleName().length < 2){
            self.errorMiddleName(Config.Registration.error.middleName.minLength);
            return false;
        }
        if(self.middleName().length > 20){
            self.errorMiddleName(Config.Registration.error.middleName.maxLength);
            return false;
        }
        if(!Config.Registration.regular.middleName.test(self.middleName())){
            self.errorMiddleName(Config.Registration.error.middleName.regular);
            return false;
        }
        self.errorMiddleName(null);
        return true;
    };
    self.BirthDayValidation = function(){
        if(!self.birthDay()){
            self.errorBirthDay(Config.Registration.error.birthDay.empty);
            return false;
        }
        if(!Config.Registration.regular.birthDay.test(self.birthDay())){
            self.errorBirthDay(Config.Registration.error.birthDay.regular);
            return false;
        }
        self.errorBirthDay(null);
        return true;
    };
    self.GanderValidation = function(){
        if(!self.gender()){
            self.errorGender(Config.Registration.error.gender.empty);
            return false;
        }
        if(!Config.Registration.regular.gender.test(self.gender())){
            self.errorGender(Config.Registration.error.gender.regular);
            return false;
        }
        self.errorGender(null);
        return true;
    };
};

var RegistrationFormStep4ViewModel = function() {
    var self = this;
    self.country = ko.observable();
    self.cssCountryList = 'country_list';
    self.errorCountry = ko.observable(null);
    self.region = ko.observable();
    self.customRegion = ko.observable();
    self.cssRegionList = 'region_list';
    self.errorRegion = ko.observable(null);
    self.city = ko.observable();
    self.customCity = ko.observable();
    self.cssCityList = 'city_list';
    self.errorCity = ko.observable(null);
    self.address = ko.observable();
    self.customAddress = ko.observable();
    self.cssAddress = 'address';
    self.errorAddress = ko.observable(null);
    self.postIndex = ko.observable();
    self.cssPostIndex = 'post_index';
    self.errorPostIndex = ko.observable(null);
    
    self.countryList = ko.observableArray();
    
    self.AddCountryList = function(data){
        if(data.length > 0){
            for(var i = 0; i <= data.length-1; i++){
                self.countryList.push(new CountryListViewModel(data[i]));
            }
        }
    };
    self.SpecifyLater = function(){
        EventDispatcher.DispatchEvent('RegistrationWidget.step4.later', self);
    };
    self.SubmitForm = function(){
        if (self.ValidationForm()) {
            EventDispatcher.DispatchEvent('RegistrationWidget.step4.checking', self);
        }
    };
    self.Back = function(){
        
    };
    self.ValidationForm = function(){
        var test = true;
        if(!self.CountryValidation())
            test = false;
        if(!self.RegionValidation())
            test = false;
        if(!self.CityValidation())
            test = false;
        if(!self.AddressValidation())
            test = false;
        if(!self.PostIndexValidation())
            test = false;
        
        return test;
    };
    self.CountryValidation = function(){
        if(!self.country()){
            self.errorCountry(Config.Registration.error.country.empty);
            return false;
        }
        self.errorCountry(null);
        return true;
    };
    self.RegionValidation = function(){
        if(!self.customRegion()){
            self.errorRegion(Config.Registration.error.region.empty);
            return false;
        }
        self.errorRegion(null);
        return true;
    };
    self.CityValidation = function(){
        if(!self.customCity()){
            self.errorCity(Config.Registration.error.city.empty);
            return false;
        }
        self.errorCity(null);
        return true;
    };
    self.AddressValidation = function(){
        if(!self.address()){
            self.errorAddress(Config.Registration.error.address.empty);
            return false;
        }
        self.errorAddress(null);
        return true;
    };
    self.PostIndexValidation = function(){
        if(!self.postIndex()){
            self.errorPostIndex(Config.Registration.error.postIndex.empty);
            return false;
        }
        self.errorPostIndex(null);
        return true;
    };
};

var CountryListViewModel = function(data){
    var self = this;
    self.id = data.id;
    self.name = data.name;
    self.fullName = data.full_name;
    self.partWorld = data.part_world;
    self.location = data.location;
};


var TestRegistration = {
    Init: function() {
        if (typeof Widget == 'function') {
            RegistrationWidget.prototype = new Widget();
            var reg = new RegistrationWidget();
            reg.Init(reg);
        }
        else {
            setTimeout(function() {
                TestRegistration.Init()
            }, 100);
        }
    }
}

TestRegistration.Init();


