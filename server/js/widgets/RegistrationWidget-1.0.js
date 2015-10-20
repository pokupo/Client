var RegistrationWidget = function () {
    var self = this;
    self.widgetName = 'RegistrationWidget';
    self.version = 1.0;
    self.minWidgetVersion = 1.0;
    self.maxWidgetVersion = 2.0;
    self.minTmplVersion = 1.0;
    self.maxTmplVersion = 2.0;
    self.InitWidget = InitWidget;
    var settings = {
            container: {widget: 'content', def: 'defaultRegistrationWidgetId'},
            tmpl : {
                path : "registrationTmpl.html", // файл шаблонов
                id: {
                    step1 : "registrationFromStep1Tmpl", //id шаблона формы регистрации шаг 1
                    step2 : "registrationFromStep2Tmpl", //id шаблона формы регистрации шаг 2
                    step3 : "registrationFromStep3Tmpl", //id шаблона формы регистрации шаг 3
                    step4 : "registrationFromStep4Tmpl" //id шаблона формы регистрации шаг 4
                }
            },
            regular: { // регулярные выражения полей
                username: /^[а-яёa-zА-ЯЁA-Z0-9_\-\.\s]+$/,
                email: /^[-._a-zA-Z0-9]+@(?:[a-z0-9][-a-z0-9]+\.)+[a-z]{2,6}$/,
                phone: /^([\d]{1})\s([\d]{3})\s([\d]{3})\s([\d]{2})\s([\d]{2})(\s([\d]{2}))?$/,
                firstName: /^[a-zёа-яА-ЯЁA-Z]+$/,
                lastName: /^[a-zа-яёА-ЯЁA-Z]+$/,
                middleName: /^[a-zа-яёА-ЯЁA-Z]+$/,
                birthDay: /^[\d]{2}.[\d]{2}.[\d]{4}$/,
                gender: /^[mw]$/,
                postIndex: /^[0-9]+$/
            },
            message: {
                registrationSuccessful: "Вы успешно зарегистрировались в магазине"
            },
            error: { // сообщения об ошибках при валидации формы регистрации
                username: {
                    empty: 'Поле обязательно для заполнения',
                    minLength: 'Минимум 4 символа',
                    maxLength: 'Максимум 40 символов',
                    regular: 'Только буквы латинского или русского алфавита',
                    uniq: 'К сожалению это имя уже занято, попробуйте указать другой вариант'
                },
                email: {
                    empty: 'Поле обязательно для заполнения',
                    maxLength: 'Максимум 64 символа',
                    regular: 'Строка не является адресом электронной почты',
                    uniq: 'Аккаунт для этого почтового ящика уже существует, рекомендуем пройти процедуру восстановления доступа. <a href="https://pokupo.ru/resetting/request">Восстановить доступ</a>'
                },
                phone: {
                    regular: 'Не верный формат телефона',
                    uniq: 'Аккаунт для этого номера телефона уже существует, рекомендуем пройти процедуру восстановления доступа. <a href="https://pokupo.ru/resetting/request">Восстановить доступ</a>'
                },
                password: {
                    empty: 'Поле обязательно для заполнения',
                    minLength: 'Пароль должен быть не менее 6 символов',
                    maxLength: 'Пароль должен быть не более 64 символов',
                    equal: 'Пароль не совпадает с образцом'
                },
                isChecked: {
                    empty: 'Вам необходимо прочитать и принять условия соглашения'
                },
                emailToken: {
                    empty: 'Поле обязательно для заполнения',
                    confirm: 'Указанный код не принят системой'
                },
                phoneToken: {
                    empty: 'Поле обязательно для заполнения',
                    confirm: 'Указанный код не принят системой'
                },
                confirmLater: {
                    empty: 'Для активации аккаунта требуется подтвердить хотя бы один из способов связи'
                },
                firstName: {
                    empty: 'Поле обязательно для заполнения',
                    minLength: 'Минимум 2 символа',
                    maxLength: 'Максимум 20 символов',
                    regular: 'Только буквы латинского или русского алфавита'
                },
                lastName: {
                    empty: 'Поле обязательно для заполнения',
                    minLength: 'Минимум 2 символа',
                    maxLength: 'Максимум 20 символов',
                    regular: 'Только буквы латинского или русского алфавита'
                },
                middleName: {
                    empty: 'Поле обязательно для заполнения',
                    minLength: 'Минимум 2 символа',
                    maxLength: 'Максимум 20 символов',
                    regular: 'Только буквы латинского или русского алфавита'
                },
                birthDay: {
                    empty: 'Поле обязательно для заполнения',
                    minDate: 'Возраст пользователя должен быть не менее 18 лет.',
                    maxDate: 'Возраст пользователя может быть не старше 101 года'
                },
                gender: {
                    empty: 'Поле обязательно для заполнения'
                },
                country: {
                    empty: 'Поле обязательно для заполнения'
                },
                region: {
                    empty: 'Поле обязательно для заполнения'
                },
                city: {
                    empty: 'Поле обязательно для заполнения'
                },
                address: {
                    empty: 'Поле обязательно для заполнения'
                },
                postIndex: {
                    empty: 'Поле обязательно для заполнения',
                    length: 'В почтовом индексе должно быть 5 или 6 цифр',
                    regular: 'Только цифры'
                }
            },
            animate: typeof AnimateRegistration == 'function' ? AnimateRegistration : null,
            geoShop: 0,
        },
        alias = 'registration',
        title = 'Регистрация пользователя';

    function InitWidget() {
        SetInputParameters();
        RegisterEvents();
        CheckRouteRegistration();
    }

    function SetInputParameters() {
        var input = self.GetInputParameters(alias);

        if (!$.isEmptyObject(input))
            settings = self.UpdateSettings1(settings, input);

        Config.Containers.registration = settings.container;
    }

    function CheckRouteRegistration() {
        if (Routing.route == alias) {
            var pRoute = Routing.params;
            self.BaseLoad.Tmpl(settings.tmpl, function () {
                self.BaseLoad.Script(PokupoWidgets.model.registration, function () {
                    if (pRoute.step == 1) {
                        InsertContainerStep1();
                        FillStep1();
                    }
                    if (pRoute.step == 2) {
                        InsertContainerStep2();
                        FillStep2();
                    }
                    if (pRoute.step == 3) {
                        InsertContainerStep3();
                        FillStep3();
                    }
                    if (pRoute.step == 4) {
                        InsertContainerStep4();
                        FillStep4();
                    }
                });
            });
        }
        else
            self.WidgetLoader(true);
    }

    function RegisterEvents() {
        self.AddEvent('w.change.route', function () {
            CheckRouteRegistration();
        });

        self.AddEvent('RegistrationWidget.step1.checking', function (step1) {
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

            self.BaseLoad.UniqueUser(str, function (data) {
                var test = true;
                if (self.QueryError(data, function () {
                        self.DispatchEvent('RegistrationWidget.step1.checking', step1)
                    })) {
                    if (!ValidateUsername(data, step1))
                        test = false;
                    if (!ValidateEmail(data, step1))
                        test = false;
                    if (!ValidatePhone(data, step1))
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
                    self.BaseLoad.Registration(str, function (data) {
                        self.BaseLoad.LoginForProxy(step1.username(), step1.firstPassword(), 'no', function (request2) {
                            Parameters.cache.reg.step1 = step1;
                            SetHash(alias, title, {step: 2});
                        })
                    });
                }
                else
                    self.WidgetLoader(true, settings.container.widget);
            });
        });

        self.AddEvent('RegistrationWidget.step1.view', function () {
            SetHash(alias, title, {step: 1});
        });

        self.AddEvent('RegistrationWidget.step2.checking', function (step2) {
            self.WidgetLoader(false);
            var params = [];
            params.push('username=' + encodeURIComponent(step2.username));
            if (!step2.mailConfirmLater())
                params.push('mail_token=' + step2.mailToken());
            if (!step2.phoneConfirmLater())
                params.push('sms_token=' + step2.phoneToken());
            var str = '?' + params.join('&');

            self.BaseLoad.ActivateUser(str, function (data) {
                var test = true;
                if (self.QueryError(data, function () {
                        EventDispatcher.DispatchEvent('RegistrationWidget.step2.checking', step2)
                    })) {
                    if (!ValidateMailToken(data, step2))
                        test = false;
                    if (!ValidatePhoneToken(data, step2))
                        test = false;
                }
                else
                    test = false;

                if (test) {
                    Parameters.cache.reg.step2 = step2;
                    self.BaseLoad.Login(false, false, false, function (request) {
                        self.DispatchEvent('w.auth.ok', {request: request});
                        if (!request.err)
                            SetHash(alias, title, {step: 3});
                    });
                }
                else
                    self.WidgetLoader(true, settings.container.widget);
            });
        });

        self.AddEvent('RegistrationWidget.step2.view', function () {
            SetHash(alias, title, {step: 2});
        });

        self.AddEvent('RegistrationWidget.step3.later', function () {
            SetHash(alias, title, {step: 4});
        });

        self.AddEvent('RegistrationWidget.step3.checking', function (step3) {
            self.WidgetLoader(false);
            var day = step3.birthDay().split('.');
            var birthDay = day[2] + '-' + day[1] + '-' + day[0];
            step3.birthDayHiddenField(birthDay);
            self.BaseLoad.EditProfile($('form#' + step3.cssRegistrationDataForm), function (data) {
                var test = true;
                if (!self.QueryError(data, function () {
                        EventDispatcher.DispatchEvent('RegistrationWidget.step3.checking', step3)
                    }))
                    test = false;

                if (test) {
                    Parameters.cache.reg.step3 = step3;
                    SetHash(alias, title, {step: 4});
                }
                else
                    self.WidgetLoader(true, settings.container.widget);
            });
        });

        self.AddEvent('RegistrationWidget.step3.view', function () {
            SetHash(alias, title, {step: 3});
        });

        self.AddEvent('RegistrationWidget.step4.later', function (data) {
            self.ShowMessage(settings.message.registrationSuccessful, function () {
                Parameters.cache.reg = {
                    step1: {},
                    step2: {},
                    step3: {},
                    step4: {}
                }
                var link = Parameters.cache.lastPage;
                if (!$.isEmptyObject(link))
                    SetHash(link.route, link.title, link.data, true);
                else
                    SetHash('default', 'Домашняя', {});

            })
            self.WidgetLoader(true, settings.container.widget);
        });

        self.AddEvent('RegistrationWidget.step4.checking', function (step4) {
            self.WidgetLoader(false);
            var str = '?id_country=' + encodeURIComponent($.trim(step4.idCountry()));
            if (step4.region() && step4.region().regioncode)
                str = str + '&code_region=' + encodeURIComponent($.trim(step4.region().regioncode));
            else
                str = str + '&name_region=' + encodeURIComponent($.trim(step4.customRegion()));
            if (step4.city() && step4.city().aoguid)
                str = str + '&code_city=' + encodeURIComponent($.trim(step4.city().aoguid));
            else
                str = str + '&name_city=' + encodeURIComponent($.trim(step4.customCity()));
            str = str + '&address=' + encodeURIComponent($.trim(step4.customAddress())) + '&post_code=' + encodeURIComponent($.trim(step4.postIndex()));

            self.BaseLoad.EditAddress(str, function (data) {
                var test = true;
                if (!self.QueryError(data, function () {
                        EventDispatcher.DispatchEvent('RegistrationWidget.step4.checking', step4)
                    }))
                    test = false;
                if (test) {
                    Parameters.cache.reg.step4 = step4;
                    EventDispatcher.DispatchEvent('RegistrationWidget.step4.later');
                }
                else
                    self.WidgetLoader(true, settings.container.widget);
            });
        });
    }

    function ValidateUsername(data, step1) {
        var test = false;
        if (data.check_username) {
            if (data.check_username == 'on' || data.check_username == 'ban' || data.check_username == 'off')
                step1.errorUsername(settings.error.username.uniq);
            if (data.check_username == 'yes')
                test = true;
        }

        return test;
    }

    function ValidatePhone(data, step1) {
        var test = false;
        if (data.check_phone) {
            if (data.check_phone == 'on' || data.check_phone == 'ban' || data.check_phone == 'off')
                step1.errorPhone(settings.error.phone.uniq);
            if (data.check_phone == 'yes')
                test = true;
        }
        else
            test = true;

        return test;
    }

    function ValidateEmail(data, step1) {
        var test = false;
        if (data.check_email) {
            if (data.check_email == 'on' || data.check_email == 'ban' || data.check_email == 'off')
                step1.errorEmail(settings.error.email.uniq);
            if (data.check_email == 'yes')
                test = true;
        }

        return test;
    }

    function ValidateMailToken(data, step2) {
        if (data.confirm_email) {
            if (data.confirm_email == 'no') {
                step2.errorEmailConfirm(settings.error.emailToken.confirm);
                return false;
            }
        }

        return true;
    }

    function ValidatePhoneToken(data, step2) {
        if (data.confirm_phone) {
            if (data.confirm_phone == 'no') {
                step2.errorPhoneConfirm(settings.error.phoneToken.confirm);
                return false;
            }
        }

        return true;
    }

    function ValidateProfile(data, step3) {
        if (data.err) {
            step3.errorAddress(data.err);
            return false;
        }

        return true;
    }

    function ValidateAddress(data, step4) {
        if (data.err) {
            step4.errorAddress(data.err);
            return false;
        }

        return true;
    }

    function InsertContainerEmptyWidget() {
        self.ClearContainer(settings);
    }

    function InsertContainerStep1() {
        self.InsertContainer(settings, 'step1');
    }

    function InsertContainerStep2() {
        self.InsertContainer(settings, 'step2');
    }

    function InsertContainerStep3() {
        self.InsertContainer(settings, 'step3');
    }

    function InsertContainerStep4() {
        self.InsertContainer(settings, 'step4');
    }

    function FillStep1() {
        var form = Parameters.cache.reg.step1;
        if ($.isEmptyObject(form)) {
            RegistrationFormViewModel.prototype.Back = function () {
                Parameters.cache.history.pop();
                var link = Parameters.cache.history.pop();
                if (link)
                    SetHash(link.route, link.title, link.data, true);
                else
                    SetHash('default', 'Домашняя', {});
            };
            form = new RegistrationFormViewModel(settings);
            form.submitEvent('RegistrationWidget.step1.checking');
        }
        RenderStep1(form);
    }

    function FillStep2() {
        var pRoute = Routing.params;
        if (pRoute.username && pRoute.mail_token) {
            RegistrationFormViewModel.prototype.Back = function () {
                Parameters.cache.history.pop();
                var link = Parameters.cache.history.pop();
                if (link)
                    SetHash(link.route, link.title, link.data, true);
                else
                    SetHash('default', 'Домашняя', {});
            };
            var step1 = new RegistrationFormViewModel(settings);
            step1.username(pRoute.username);
            step1.submitEvent('RegistrationWidget.step1.checking');
            Parameters.cache.reg.step1 = step1;
        }

        RegistrationConfirmFormViewModel.prototype.Back = function () {
            self.DispatchEvent('RegistrationWidget.step1.view');
        };
        var form = new RegistrationConfirmFormViewModel(Parameters.cache.reg.step1, settings);
        form.submitEvent('RegistrationWidget.step2.checking');

        if (pRoute.username && pRoute.mail_token) {
            form.mailToken(pRoute.mail_token);
            self.DispatchEvent('RegistrationWidget.step2.checking', form);
        }

        RenderStep2(form);
    }

    function FillStep3() {
        var form = Parameters.cache.reg.step3;
        if ($.isEmptyObject(form)) {
            RegistrationProfileFormViewModel.prototype.Back = function () {
                self.DispatchEvent('RegistrationWidget.step2.view');
            };
            RegistrationProfileFormViewModel.prototype.SpecifyLater = function () {
                self.DispatchEvent('RegistrationWidget.step3.later');
            };
            form = new RegistrationProfileFormViewModel(settings);
            form.submitEvent('RegistrationWidget.step3.checking');
        }
        RenderStep3(form);
    }

    function FillStep4() {
        var shopId = Parameters.shopId;
        if (settings.geoShop == 0)
            shopId = 0;
        self.BaseLoad.Country(shopId, function (data) {
            var form = new RegistrationFormStep4ViewModel(settings);
            form.AddCountryList(data);
            RenderStep4(form);
        });
    }

    function RenderStep1(data) {
        self.RenderTemplate(data, settings, null,
            function (data) {
                InsertContainerStep1();
                RenderStep1(data);
            },
            function () {
                InsertContainerEmptyWidget();
            },
            'step1'
        );
    }

    function RenderStep2(data) {
        self.RenderTemplate(data, settings, null,
            function (data) {
                InsertContainerStep2();
                RenderStep2(data);
            },
            function () {
                InsertContainerEmptyWidget();
            },
            'step2');
    }

    function RenderStep3(data) {
        self.RenderTemplate(data, settings, null,
            function (data) {
                InsertContainerStep3();
                RenderStep3(data);
            },
            function () {
                InsertContainerEmptyWidget();
            },
            'step3');
    }

    function RenderStep4(data) {
        self.RenderTemplate(data, settings,
            function(data){
                CallbackRenderStep4(data);
            },
            function (data) {
                InsertContainerStep4();
                RenderStep4(data);
            },
            function () {
                InsertContainerEmptyWidget();
            },
            'step4');
    }

    function CallbackRenderStep4(form){
        $('#' + form.cssRegionList).autocomplete({
            source: function (request, response) {
                self.BaseLoad.Region(form.idCountry() + '/' + encodeURIComponent(request.term), function (data) {
                    if (!data.err) {
                        response($.map(data, function (item) {
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
            select: function (event, ui) {
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
            source: function (request, response) {
                if (form.region()) {
                    self.BaseLoad.City(form.idCountry() + '/' + encodeURIComponent(form.region().regioncode) + '/' + encodeURIComponent(request.term), function (data) {
                        if (!data.err) {
                            response($.map(data, function (item) {
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
            select: function (event, ui) {
                form.city(ui.item.city);
                form.customCity(ui.item.value);
                if (ui.item.city && ui.item.city.postalcode != 0)
                    form.postIndex(ui.item.city.postalcode);
                else
                    form.postIndex(null);
            }
        });

        $('#' + form.cssAddress).autocomplete({
            source: function (request, response) {
                if (form.region()) {
                    self.BaseLoad.Street(form.idCountry() + '/' + encodeURIComponent(form.region().regioncode) + '/' + encodeURIComponent(form.city().aoguid) + '/' + encodeURIComponent(request.term), function (data) {
                        if (!data.err) {
                            response($.map(data, function (item) {
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
            select: function (event, ui) {
                form.address(ui.item.street);
                form.customAddress(ui.item.value);
                if (ui.item.street && ui.item.street.postalcode != 0)
                    form.postIndex(ui.item.street.postalcode);
                else
                    form.postIndex(null);
            }
        });

        $('#' + form.cssCountryList).change(function () {
            if (form.idCountry()) {
                form.errorCountry('');
                form.errorRegion('');
                form.errorCity('');
                form.errorAddress('');
                form.errorPostIndex('');
            }
            $.grep(form.countryList(), function (data) {
                if (data.id == form.idCountry()) {
                    form.customRegion(null);
                    form.region(null);
                    form.customCity(null);
                    form.city(null);
                    form.customAddress(null)
                    form.address(null);
                    form.postIndex(null);
                }
            })
        });

        $('#' + form.cssRegionList).bind('textchange', function (event, previousText) {
            form.errorRegion('');
            form.errorCity('');
            form.errorAddress('');
            form.errorPostIndex('');
            form.customRegion($(this).val());
            form.customCity(null);
            form.city(null);
            form.customAddress(null)
            form.address(null);
            form.postIndex(null);
        });

        $('#' + form.cssCityList).bind('textchange', function (event, previousText) {
            form.errorCity('');
            form.errorAddress('');
            form.errorPostIndex('');
            form.customCity($(this).val());
            form.customAddress(null)
            form.address(null);
            form.postIndex(null);
        });

        $('#' + form.cssAddress).bind('textchange', function (event, previousText) {
            form.errorAddress('');
            form.errorPostIndex('');
        });

        $('#' + form.cssPostIndex).bind('textchange', function (event, previousText) {
            form.errorPostIndex('');
        });
    }

    function SetHash(alias, title, params) {
        Routing.SetHash(alias, title, params)
    }
};

var RegistrationFormStep4ViewModel = function (settings) {
    var self = this;
    self.idCountry = ko.observable();
    self.cssCountryList = 'country_list';
    self.errorCountry = ko.observable(null);

    self.region = ko.observable();
    self.customRegion = ko.observable();
    self.cssRegionList = 'region_list';
    self.errorRegion = ko.observable(null);
    self.showRegion = ko.computed(function () {
        if (self.idCountry())
            return false;
        return true;
    }, this);

    self.city = ko.observable();
    self.customCity = ko.observable();
    self.cssCityList = 'city_list';
    self.errorCity = ko.observable(null);
    self.showCity = ko.computed(function () {
        if (self.customRegion())
            return false;
        return true;
    }, this);

    self.address = ko.observable();
    self.customAddress = ko.observable();
    self.cssAddress = 'address';
    self.errorAddress = ko.observable(null);
    self.showAddress = ko.computed(function () {
        if (self.customCity())
            return false;
        return true;
    }, this);

    self.postIndex = ko.observable();
    self.cssPostIndex = 'post_index';
    self.errorPostIndex = ko.observable(null);
    self.showPostIndex = ko.computed(function () {
        if (self.customAddress())
            return false;
        return true;
    }, this);

    self.countryList = ko.observableArray();

    self.AddCountryList = function (data) {
        if (data.length > 0) {
            for (var i = 0; i <= data.length - 1; i++) {
                self.countryList.push(new CountryListViewModel(data[i]));
            }
        }
    };
    self.SpecifyLater = function () {
        DispatchEvent('RegistrationWidget.step4.later', self);
    };
    self.SubmitForm = function () {
        if (ValidationForm()) {
            DispatchEvent('RegistrationWidget.step4.checking', self);
        }
    };
    self.Back = function () {
        DispatchEvent('RegistrationWidget.step3.view');
    };

    function DispatchEvent(alias, params){
        EventDispatcher.DispatchEvent(alias, params)
    }
    function ValidationForm() {
        var test = true;
        if (!CountryValidation())
            test = false;
        if (!RegionValidation())
            test = false;
        if (!CityValidation())
            test = false;
        if (!AddressValidation())
            test = false;
        if (!PostIndexValidation())
            test = false;

        return test;
    }
    function CountryValidation() {
        if (!self.idCountry()) {
            self.errorCountry(settings.error.country.empty);
            return false;
        }
        self.errorCountry(null);
        return true;
    }
    function RegionValidation() {
        if (!self.customRegion()) {
            self.errorRegion(settings.error.region.empty);
            return false;
        }
        self.errorRegion(null);
        return true;
    }
    function CityValidation() {
        if (!self.customCity()) {
            self.errorCity(settings.error.city.empty);
            return false;
        }
        self.errorCity(null);
        return true;
    }
    function AddressValidation() {
        if (!self.customAddress()) {
            self.errorAddress(settings.error.address.empty);
            return false;
        }
        self.errorAddress(null);
        return true;
    }
    function PostIndexValidation() {
        var error = settings.error.postIndex;
        if (!self.postIndex()) {
            self.errorPostIndex(error.empty);
            return false;
        }
        if (5 > self.postIndex().length || self.postIndex().length > 6) {
            self.errorPostIndex(error.length);
            return false;
        }
        if (!settings.regular.postIndex.test(self.postIndex())) {
            self.errorPostIndex(error.regular);
            return false;
        }
        self.errorPostIndex(null);
        return true;
    }
};

var TestRegistration = {
    Init: function () {
        if (typeof Widget == 'function') {
            RegistrationWidget.prototype = new Widget();
            var reg = new RegistrationWidget();
            reg.Init(reg);
        }
        else {
            setTimeout(function () {
                TestRegistration.Init()
            }, 100);
        }
    }
}

TestRegistration.Init();


