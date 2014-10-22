var RegistrationWidget = function() {
    var self = this;
    self.widgetName = 'RegistrationWidget';
    self.version = 1.0;
    self.minWidgetVersion = 1.0;
    self.maxWidgetVersion = 2.0;
    self.minTmplVersion = 1.0;
    self.maxTmplVersion = 2.0;
    self.settings = {
        containerFormId: null,
        tmpl : {
            path : null,
            id : {
                step1: null,
                step2: null,
                step3: null,
                step4: null
            }
        },
        animate: null,
        inputParameters: {},
        geoShop: 0,
        style: null,
        customContainer: null
    };
    self.InitWidget = function() {
        self.settings.containerFormId = Config.Containers.registration.widget;
        self.settings.customContainer = Config.Containers.registration.customClass;
        self.settings.tmpl = Config.Registration.tmpl;
        self.settings.style = Config.Registration.style;
        self.SetInputParameters();
        self.RegisterEvents();
        self.CheckRouteRegistration();
        self.SetPosition();
    };
    self.SetInputParameters = function() {
        var input = {};
        if(Config.Base.sourceParameters == 'string'){
            var temp = JSCore.ParserInputParameters(/RegistrationWidget/);
            if(temp.registration){
                input = temp.registration;
            }
        }
        if(Config.Base.sourceParameters == 'object' && typeof WParameters !== 'undefined' && WParameters.registration){
            input = WParameters.registration;
        }

        if(!$.isEmptyObject(input)){
            if(input.geoShop)
                self.settings.geoShop = input.geoShop;
            if(input.animate)
                self.settings.animate = input.animate;
        }
        self.settings.inputParameters = input;
    };
    self.CheckRouteRegistration = function() {
        if (Routing.route == 'registration') {
            self.BaseLoad.Tmpl(self.settings.tmpl, function(){
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

    self.RegisterEvents = function() {
        EventDispatcher.AddEventListener('widget.change.route', function() {
            self.CheckRouteRegistration();
        });

        EventDispatcher.AddEventListener('RegistrationWidget.step1.checking', function(step1) {
            self.WidgetLoader(false);
            var params = [];
            if (step1.username())
                params.push('username=' + encodeURIComponent(step1.username()));
            if (step1.phone())
                params.push('phone=' + step1.phone().replace(/\s/g, ''));
            if (step1.email())
                params.push('email=' + step1.email());
            if (params.length > 0)
                var str = '?' + params.join('&');

            self.BaseLoad.UniqueUser(str, function(data) {
                var test = true;
                if (self.QueryError(data, function(){EventDispatcher.DispatchEvent('RegistrationWidget.step1.checking', step1)})){
                    if (!self.Validate.Username(data, step1))
                        test = false;
                    if (!self.Validate.Email(data, step1))
                        test = false;
                    if (!self.Validate.Phone(data, step1))
                        test = false;
                }
                else
                    test = false;
                
                if (test) {
                    var params = [];
                    if (step1.username())
                        params.push('username=' + encodeURIComponent(step1.username()));
                    if (step1.phone())
                        params.push('phone=' + step1.phone().replace(/\s/g, ''));
                    if (step1.email())
                        params.push('email=' + $.trim(step1.email()));
                    if (step1.firstPassword())
                        params.push('password=' + encodeURIComponent(step1.firstPassword()));
                    if (params.length > 0)
                        var str = '?' + params.join('&');
                    self.BaseLoad.Registration(str, function(data) {
                        Parameters.cache.reg.step1 = step1;
                        Routing.SetHash('registration', 'Регистрация пользователя', {step: 2});
                    });
                }
                else
                    self.WidgetLoader(true, self.settings.containerFormId);
            });
        });

        EventDispatcher.AddEventListener('RegistrationWidget.step1.view', function() {
            Routing.SetHash('registration', 'Регистрация пользователя', {step: 1});
        });

        EventDispatcher.AddEventListener('RegistrationWidget.step2.checking', function(step2) {
            self.WidgetLoader(false);
            var params = [];
            params.push('username=' + encodeURIComponent(step2.username));
            if (!step2.mailConfirmLater())
                params.push('mail_token=' + step2.mailToken());
            if (!step2.phoneConfirmLater())
                params.push('sms_token=' + step2.phoneToken());
            var str = '?' + params.join('&');

            self.BaseLoad.ActivateUser(str, function(data) {
                var test = true;
                if (self.QueryError(data, function(){EventDispatcher.DispatchEvent('RegistrationWidget.step2.checking', step2)})){
                    if (!self.Validate.MailToken(data, step2))
                        test = false;
                    if (!self.Validate.PhoneToken(data, step2))
                        test = false;
                }
                else
                    test = false;
                
                if (test) {
                    Parameters.cache.reg.step2 = step2;
                    self.BaseLoad.Login(false, false, false, function(request) {
                        EventDispatcher.DispatchEvent('widget.authentication.ok', {request: request});
                        if (!request.err)
                            Routing.SetHash('registration', 'Регистрация пользователя', {step: 3});
                    });
                }
                else
                    self.WidgetLoader(true, self.settings.containerFormId);
            });
        });

        EventDispatcher.AddEventListener('RegistrationWidget.step2.view', function() {
            Routing.SetHash('registration', 'Регистрация пользователя', {step: 2});
        });

        EventDispatcher.AddEventListener('RegistrationWidget.step3.later', function() {
            Routing.SetHash('registration', 'Регистрация пользователя', {step: 4});
        });

        EventDispatcher.AddEventListener('RegistrationWidget.step3.checking', function(step3) {
            self.WidgetLoader(false);
            var day = step3.birthDay().split('.');
            var birthDay = day[2] + '-' + day[1] + '-' + day[0];
            step3.birthDayHiddenField(birthDay);
            self.BaseLoad.EditProfile( $('form#' + step3.cssRegistrationDataForm), function(data) {
                var test = true;
                if (!self.QueryError(data, function(){EventDispatcher.DispatchEvent('RegistrationWidget.step3.checking', step3)}))
                    test = false;

                if (test) {
                    Parameters.cache.reg.step3 = step3;
                    Routing.SetHash('registration', 'Регистрация пользователя', {step: 4});
                }
                else
                    self.WidgetLoader(true, self.settings.containerFormId);
            });
        });

        EventDispatcher.AddEventListener('RegistrationWidget.step3.view', function() {
            Routing.SetHash('registration', 'Регистрация пользователя', {step: 3});
        });

        EventDispatcher.AddEventListener('RegistrationWidget.step4.later', function(data) {
            Parameters.cache.reg = {
                step1: {},
                step2: {},
                step3: {},
                step4: {}
            }
            var link = Parameters.cache.lastPage;
            if (!$.isEmptyObject(link))
                Routing.SetHash(link.route, link.title, link.data, true);
            else
                Routing.SetHash('default', 'Домашняя', {});
        });

        EventDispatcher.AddEventListener('RegistrationWidget.step4.checking', function(step4) {
            self.WidgetLoader(false);
            var str = '?id_country=' + encodeURIComponent($.trim(step4.country()));
            if (step4.region())
                str = str + '&code_region=' + encodeURIComponent($.trim(step4.region().regioncode));
            else
                str = str + '&name_region=' + encodeURIComponent($.trim(step4.customRegion()));
            if (step4.city())
                str = str + '&code_city=' + encodeURIComponent($.trim(step4.city().aoguid));
            else
                str = str + '&name_city=' + encodeURIComponent($.trim(step4.customCity()));
            str = str + '&address=' + encodeURIComponent($.trim(step4.customAddress())) + '&post_code=' + encodeURIComponent($.trim(step4.postIndex()));

            self.BaseLoad.EditAddress(str, function(data) {
                var test = true;
                if (!self.QueryError(data, function(){EventDispatcher.DispatchEvent('RegistrationWidget.step4.checking', step4)}))
                    test = false;

                if (test) {
                    Parameters.cache.reg.step4 = step4;
                    EventDispatcher.DispatchEvent('RegistrationWidget.step4.later');
                }
                else
                    self.WidgetLoader(true, self.settings.containerFormId);
            });
        });
    };
    self.Validate = {
        Username: function(data, step1) {
            var test = false;
            if (data.check_username) {
                if (data.check_username == 'on' || data.check_username == 'ban' || data.check_username == 'off')
                    step1.errorUsername(Config.Registration.error.username.uniq);
                if (data.check_username == 'yes')
                    test = true;
            }

            return test;
        },
        Phone: function(data, step1) {
            var test = false;
            if (data.check_phone) {
                if (data.check_phone == 'on' || data.check_phone == 'ban' || data.check_phone == 'off')
                    step1.errorPhone(Config.Registration.error.phone.uniq);
                if (data.check_phone == 'yes')
                    test = true;
            }
            else
                test = true;

            return test;
        },
        Email: function(data, step1) {
            var test = false;
            if (data.check_email) {
                if (data.check_email == 'on' || data.check_email == 'ban' || data.check_email == 'off')
                    step1.errorEmail(Config.Registration.error.email.uniq);
                if (data.check_email == 'yes')
                    test = true;
            }

            return test;
        },
        MailToken: function(data, step2) {
            if (data.confirm_email) {
                if (data.confirm_email == 'no') {
                    step2.errorEmailConfirm(Config.Registration.error.emailToken.confirm);
                    return false;
                }
            }

            return true;
        },
        PhoneToken: function(data, step2) {
            if (data.confirm_phone) {
                if (data.confirm_phone == 'no') {
                    step2.errorPhoneConfirm(Config.Registration.error.phoneToken.confirm);
                    return false;
                }
            }

            return true;
        },
        Profile: function(data, step3) {
            if (data.err) {
                step3.errorAddress(data.err);
                return false;
            }

            return true;
        },
        Address: function(data, step4) {
            if (data.err) {
                step4.errorAddress(data.err);
                return false;
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
        Step3: function() {
            self.InsertContainer.Step3();
            self.Fill.Step3();
        },
        Step4: function() {
            self.InsertContainer.Step4();
            self.Fill.Step4();
        }
    };
    self.InsertContainer = {
        EmptyWidget : function(){
            var temp = $("#" + self.settings.containerFormId).find(self.SelectCustomContent().join(', ')).clone();
            $("#" + self.settings.containerFormId).empty().html(temp);
        },
        Step1: function() {
            self.InsertContainer.EmptyWidget();
            $("#" + self.settings.containerFormId).append($('script#' + self.GetTmplName('step1')).html()).children().hide();
        },
        Step2: function() {
            self.InsertContainer.EmptyWidget();
            $("#" + self.settings.containerFormId).append($('script#' + self.GetTmplName('step2')).html()).children().hide();
        },
        Step3: function() {
            self.InsertContainer.EmptyWidget();
            $("#" + self.settings.containerFormId).append($('script#' + self.GetTmplName('step3')).html()).children().hide();
        },
        Step4: function() {
            self.InsertContainer.EmptyWidget();
            $("#" + self.settings.containerFormId).append($('script#' + self.GetTmplName('step4')).html()).children().hide();
        }
    };
    self.Fill = {
        Step1: function() {
            var form = Parameters.cache.reg.step1;
            if ($.isEmptyObject(form)){
                RegistrationFormViewModel.prototype.Back = function() {
                    Parameters.cache.history.pop();
                    var link = Parameters.cache.history.pop();
                    if (link)
                        Routing.SetHash(link.route, link.title, link.data, true);
                    else
                        Routing.SetHash('default', 'Домашняя', {});
                };
                form = new RegistrationFormViewModel();
                form.submitEvent('RegistrationWidget.step1.checking');
            }
            self.Render.Step1(form);
        },
        Step2: function() {
            if (Routing.params.username && Routing.params.mail_token) {
                RegistrationFormViewModel.prototype.Back = function() {
                    Parameters.cache.history.pop();
                    var link = Parameters.cache.history.pop();
                    if (link)
                        Routing.SetHash(link.route, link.title, link.data, true);
                    else
                        Routing.SetHash('default', 'Домашняя', {});
                };
                var step1 = new RegistrationFormViewModel();
                step1.username(Routing.params.username);
                step1.submitEvent('RegistrationWidget.step1.checking');
                Parameters.cache.reg.step1 = step1;
            }

            RegistrationConfirmFormViewModel.prototype.Back = function() {
                EventDispatcher.DispatchEvent('RegistrationWidget.step1.view');
            };
            var form = new RegistrationConfirmFormViewModel(Parameters.cache.reg.step1);
            form.submitEvent('RegistrationWidget.step2.checking');
            
            if (Routing.params.username && Routing.params.mail_token) {
                form.mailToken(Routing.params.mail_token);
                EventDispatcher.DispatchEvent('RegistrationWidget.step2.checking', form);
            }
            
            self.Render.Step2(form);
        },
        Step3: function() {
            var form = Parameters.cache.reg.step3;
            if ($.isEmptyObject(form)){
                RegistrationProfileFormViewModel.prototype.Back = function() {
                    EventDispatcher.DispatchEvent('RegistrationWidget.step2.view');
                };
                RegistrationProfileFormViewModel.prototype.SpecifyLater = function() {
                    EventDispatcher.DispatchEvent('RegistrationWidget.step3.later');
                };
                form = new RegistrationProfileFormViewModel();
                form.submitEvent('RegistrationWidget.step3.checking');
            }
            self.Render.Step3(form);
        },
        Step4: function() {
            var shopId = Parameters.shopId;
            if (self.settings.geoShop == 0)
                shopId = 0;
            self.BaseLoad.Country(shopId, function(data) {
                var form = new RegistrationFormStep4ViewModel();
                form.AddCountryList(data);
                self.Render.Step4(form);
            });
        }
    };
    self.Render = {
        Step1: function(form) {
            if ($("#" + self.settings.containerFormId).length > 0) {
                try{
                    ko.cleanNode($("#" + self.settings.containerFormId)[0]);
                    ko.applyBindings(form, $("#" + self.settings.containerFormId)[0]);
                    self.WidgetLoader(true, self.settings.containerFormId);
                    if(self.settings.animate)
                        self.settings.animate();
                }
                catch(e){
                    self.Exception('Ошибка шаблона [' + self.GetTmplName('step1') + ']');
                    if(self.settings.tmpl.custom){
                        delete self.settings.tmpl.custom;
                        self.BaseLoad.Tmpl(self.settings.tmpl, function(){
                            self.InsertContainer.Step1();
                            self.Render.Step1(form);
                        });
                    }
                    else{
                        self.InsertContainer.EmptyWidget();
                        self.WidgetLoader(true, self.settings.containerFormId);
                    }
                }
            }
        },
        Step2: function(form) {
            if ($("#" + self.settings.containerFormId).length > 0) {
                try{
                    ko.cleanNode($("#" + self.settings.containerFormId)[0]);
                    ko.applyBindings(form, $("#" + self.settings.containerFormId)[0]);
                    self.WidgetLoader(true, self.settings.containerFormId);
                    if(self.settings.animate)
                        self.settings.animate();
                }
                catch(e){
                    self.Exception('Ошибка шаблона [' + self.GetTmplName('step2') + ']');
                    if(self.settings.tmpl.custom){
                        delete self.settings.tmpl.custom;
                        self.BaseLoad.Tmpl(self.settings.tmpl, function(){
                            self.InsertContainer.Step2();
                            self.Render.Step2(form);
                        });
                    }
                    else{
                        self.InsertContainer.EmptyWidget();
                        self.WidgetLoader(true, self.settings.containerFormId);
                    }
                }
            }
        },
        Step3: function(form) {
            if ($("#" + self.settings.containerFormId).length > 0) {
                try{
                    ko.cleanNode($("#" + self.settings.containerFormId)[0]);
                    ko.applyBindings(form, $("#" + self.settings.containerFormId)[0]);
                    self.WidgetLoader(true, self.settings.containerFormId);
                    if(self.settings.animate)
                        self.settings.animate();
                }
                catch(e){
                    self.Exception('Ошибка шаблона [' + self.GetTmplName('step3') + ']');
                    if(self.settings.tmpl.custom){
                        delete self.settings.tmpl.custom;
                        self.BaseLoad.Tmpl(self.settings.tmpl, function(){
                            self.InsertContainer.Step3();
                            self.Render.Step3(form);
                        });
                    }
                    else{
                        self.InsertContainer.EmptyWidget();
                        self.WidgetLoader(true, self.settings.containerFormId);
                    }
                }
            }
        },
        Step4: function(form) {
            if ($("#" + self.settings.containerFormId).length > 0) {
                try{
                    ko.cleanNode($("#" + self.settings.containerFormId)[0]);
                    ko.applyBindings(form, $("#" + self.settings.containerFormId)[0]);

                    $('#' + form.cssCountryList).change(function() {
                        form.customRegion(null);
                        form.region(null);
                        form.customCity(null);
                        form.city(null);
                        form.customAddress(null)
                        form.address(null);
                        form.postIndex(null);
                    });
                    
                    $('#' + form.cssRegionList).autocomplete({
                        source: function(request, response) {
                            self.BaseLoad.Region(form.country() + '/' + encodeURIComponent(request.term), function(data) {
                                if (!data.err) {
                                    response($.map(data, function(item) {
                                        return {
                                            value: $.trim(item.formalname + ' ' + item.shortname),
                                            region: item
                                        };
                                    }));
                                }
                                else {
                                    $('#' + form.cssRegionList).autocomplete("close");
                                    return false;
                                }
                            });
                        },
                        select: function(event, ui) {
                            form.region(ui.item.region);
                            form.customRegion(ui.item.value);
                            if (ui.item.region && ui.item.region.postalcode != 0)
                                form.postIndex(ui.item.region.postalcode);
                            else {
                                form.postIndex(null);
                            }
                        }
                    });

                    $('#' + form.cssCityList).autocomplete({
                        source: function(request, response) {
                            if (form.region()) {
                                self.BaseLoad.City(form.country() + '/' + encodeURIComponent(form.region().regioncode) + '/' + encodeURIComponent(request.term), function(data) {
                                    if (!data.err) {
                                        response($.map(data, function(item) {
                                            return {
                                                value: $.trim(item.shortname + '. ' + item.formalname),
                                                city: item
                                            };
                                        }));
                                    }
                                    else {
                                        $('#' + form.cssCityList).autocomplete("close");
                                        return false;
                                    }
                                });
                            }
                        },
                        select: function(event, ui) {
                            form.city(ui.item.city);
                            form.customCity(ui.item.value);
                            if (ui.item.city && ui.item.city.postalcode != 0)
                                form.postIndex(ui.item.city.postalcode);
                            else
                                form.postIndex(null);
                        }
                    });

                    $('#' + form.cssAddress).autocomplete({
                        source: function(request, response) {
                            if (form.region()) {
                                self.BaseLoad.Street(form.country() + '/' + encodeURIComponent(form.region().regioncode) + '/' + encodeURIComponent(form.city().aoguid) + '/' + encodeURIComponent(request.term), function(data) {
                                    if (!data.err) {
                                        response($.map(data, function(item) {
                                            return {
                                                value: $.trim(item.shortname + '. ' + item.formalname),
                                                street: item
                                            };
                                        }));
                                    }
                                    else {
                                        $('#' + form.cssAddress).autocomplete("close");
                                        return false;
                                    }
                                });
                            }
                        },
                        select: function(event, ui) {
                            form.address(ui.item.street);
                            form.customAddress(ui.item.value);
                            if (ui.item.street && ui.item.street.postalcode != 0)
                                form.postIndex(ui.item.street.postalcode);
                            else
                                form.postIndex(null);
                        }
                    });

                    $('#' + form.cssRegionList).bind('textchange', function(event, previousText) {
                        form.customRegion($(this).val());
                        form.customCity(null);
                        form.city(null);
                        form.customAddress(null)
                        form.address(null);
                        form.postIndex(null);
                    });

                    $('#' + form.cssCityList).bind('textchange', function(event, previousText) {
                        form.customCity($(this).val());
                        form.customAddress(null)
                        form.address(null);
                        form.postIndex(null);
                    });

                    self.WidgetLoader(true, self.settings.containerFormId);
                    if(self.settings.animate)
                        self.settings.animate();
                }
                catch(e){
                    self.Exception('Ошибка шаблона [' + self.GetTmplName('step4') + ']');
                    if(self.settings.tmpl.custom){
                        delete self.settings.tmpl.custom;
                        self.BaseLoad.Tmpl(self.settings.tmpl, function(){
                            self.InsertContainer.Step4();
                            self.Render.Step4(form);
                        });
                    }
                    else{
                        self.InsertContainer.EmptyWidget();
                        self.WidgetLoader(true, self.settings.containerFormId);
                    }
                }
            }
        }
    };
    self.SetPosition = function() {
        if (self.settings.inputParameters['position'] == 'absolute') {
            for (var key in self.settings.inputParameters) {
                if (self.settings.style[key])
                    self.settings.style[key] = self.settings.inputParameters[key];
            }
            $().ready(function() {
                for (var i = 0; i <= Config.Containers.registration.length - 1; i++) {
                    $("#" + Config.Containers.registration[i]).css(self.settings.style);
                }
            });
        }
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

    self.AddCountryList = function(data) {
        if (data.length > 0) {
            for (var i = 0; i <= data.length - 1; i++) {
                self.countryList.push(new CountryListViewModel(data[i]));
            }
        }
    };
    self.SpecifyLater = function() {
        EventDispatcher.DispatchEvent('RegistrationWidget.step4.later', self);
    };
    self.SubmitForm = function() {
        if (self.ValidationForm()) {
            EventDispatcher.DispatchEvent('RegistrationWidget.step4.checking', self);
        }
    };
    self.Back = function() {
        EventDispatcher.DispatchEvent('RegistrationWidget.step3.view');
    };
    self.ValidationForm = function() {
        var test = true;
        if (!self.CountryValidation())
            test = false;
        if (!self.RegionValidation())
            test = false;
        if (!self.CityValidation())
            test = false;
        if (!self.AddressValidation())
            test = false;
        if (!self.PostIndexValidation())
            test = false;

        return test;
    };
    self.CountryValidation = function() {
        if (!self.country()) {
            self.errorCountry(Config.Registration.error.country.empty);
            return false;
        }
        self.errorCountry(null);
        return true;
    };
    self.RegionValidation = function() {
        if (!self.customRegion()) {
            self.errorRegion(Config.Registration.error.region.empty);
            return false;
        }
        self.errorRegion(null);
        return true;
    };
    self.CityValidation = function() {
        if (!self.customCity()) {
            self.errorCity(Config.Registration.error.city.empty);
            return false;
        }
        self.errorCity(null);
        return true;
    };
    self.AddressValidation = function() {
        if (!self.customAddress()) {
            self.errorAddress(Config.Registration.error.address.empty);
            return false;
        }
        self.errorAddress(null);
        return true;
    };
    self.PostIndexValidation = function() {
        if (!self.postIndex()) {
            self.errorPostIndex(Config.Registration.error.postIndex.empty);
            return false;
        }
        self.errorPostIndex(null);
        return true;
    };
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


