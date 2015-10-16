var RegistrationSellerWidget = function () {
    var self = this;
    self.widgetName = 'RegistrationSellerWidget';
    self.version = 1.0;
    self.minWidgetVersion = 1.0;
    self.maxWidgetVersion = 2.0;
    self.minTmplVersion = 1.0;
    self.maxTmplVersion = 2.0;
    self.InitWidget = InitWidget;

    var settings = {
        container: {widget: 'content', def: 'defaultRegistrationSellerWidgetId'},
        tmpl: {
            path: "registrationSellerTmpl.html", // файл шаблонов
            id: {
                step1: "registrationSellerFromStep1Tmpl", //id шаблона формы регистрации шаг 1
                step2: "registrationSellerFromStep2Tmpl", //id шаблона формы регистрации шаг 2
                step3: "registrationSellerFromStep3Tmpl",  //id шаблона формы регистрации шаг 3
                step4: "registrationSellerFromStep4Tmpl"  //id шаблона формы регистрации шаг 4
            }
        },
        regular: { // регулярные выражения полей
            nameSeller: /^[а-яёa-zА-ЯЁA-Z0-9_\-\.\s]+$/,
            email: /^[-._a-zA-Z0-9]+@(?:[a-z0-9][-a-z0-9]+\.)+[a-z]{2,6}$/,
            phone: /^([\d]{1})\s([\d]{3})\s([\d]{3})\s([\d]{2})\s([\d]{2})(\s([\d]{2}))?$/
        },
        error: { // сообщения об ошибках при валидации формы регистрации
            nameSeller: {
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
            typeSeller: {
                empty: 'Поле обязательно для заполнения',
                minLength: 'Минимум 5 символов',
                maxLength: 'Максимум 40 символов'
            }
        },
        animate: typeof AnimateRegistrationSeller == 'function' ? AnimateRegistrationSeller : null,
    },
        alias = 'registration_seller',
        title = 'Регистрация продавца';

    function InitWidget() {
        SetInputParameters();
        RegisterEvents();
        CheckRouteRegistrationSeller();
    }

    function SetInputParameters() {
        var input = self.GetInputParameters('registrationSeller');

        if (!$.isEmptyObject(input))
            settings = self.UpdateSettings1(settings, input);
        Config.Containers.registrationSeller = settings.container;
    }

    function CheckRouteRegistrationSeller() {
        if (Routing.route == alias) {
            Loader.HideDefaultContent();
            var pRoute = Routing.params;
            if (!pRoute.step)
                pRoute.step = 1;
            self.BaseLoad.Tmpl(settings.tmpl, function () {
                if (pRoute.step == 1){
                    InsertContainerStep1();
                    FillStep1();
                }
                if (pRoute.step == 2){
                    InsertContainerStep2();
                    FillStep2();
                }
                if (pRoute.step == 3){
                    InsertContainerStep3();
                    FillStep3();
                }
                if (pRoute.step == 4){
                    InsertContainerStep4();
                    FillStep4();
                }
            });
        }
        else
            self.WidgetLoader(true);
    }

    function RegisterEvents() {
        self.AddEvent('w.change.route', function () {
            CheckRouteRegistrationSeller();
        });

        self.AddEvent('RSeller.step1.register', function (step1) {
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
                if (self.QueryError(data, function () {
                        self.DispatchEvent('RSeller.step1.register', step1)
                    })) {
                    Parameters.cache.regSeller.step1 = step1;
                    SetHash(alias, title, {step: 2});
                }
                else
                    self.WidgetLoader(true, settings.container.widget);
            });
        });

        self.AddEvent('RSeller.step2.checking', function (step2) {
            Parameters.cache.regSeller.step2 = step2;
            SetHash(alias, title, {step: 3});
        });

        self.AddEvent('RSeller.step3.checking', function (step3) {
            self.WidgetLoader(false);
            var step1 = Parameters.cache.regSeller.step1;
            var step2 = Parameters.cache.regSeller.step2;
            Parameters.cache.regSeller.step3 = step3;

            var params = [];
            if (step1.nameSeller())
                params.push('name_seller=' + encodeURIComponent(step1.nameSeller()));
            params.push('mail_token=' + encodeURIComponent(step2.mailToken() ? step2.mailToken() : 1));
            params.push('sms_token=' + encodeURIComponent(step2.phoneToken() ? step2.phoneToken() : 1));
            if (step3.typeSeller())
                params.push('type_seller=' + step3.typeSeller());
            if (step3.invite())
                params.push('invite=' + encodeURIComponent(step3.invite()));
            if (step3.site())
                params.push('site=' + encodeURIComponent(step3.site()));
            var str = '?' + params.join('&');

            self.BaseLoad.ActivateSeller(str, function (data) {
                if (self.QueryError(data, function () {
                        self.DispatchEvent('RSeller.step3.checking', step3)
                    }))
                    SetHash(alias, title, {step: 4});
                else
                    self.WidgetLoader(true, settings.container.widget);
            })
        });
    }

    function InsertContainerEmptyWidget() {
        self.ClearContainer(settings);
    }

    function InsertContainerStep1() {
        self.InsertContainer(settings, 'step1')
    }

    function InsertContainerStep2() {
        self.InsertContainer(settings, 'step2')
    }

    function InsertContainerStep3() {
        self.InsertContainer(settings, 'step3')
    }

    function InsertContainerStep4() {
        self.InsertContainer(settings, 'step4')
    }

    function InitViewModel(){
        RegistrationSellerFormViewModel.prototype.Back = function () {
            Parameters.cache.history.pop();
            var link = Parameters.cache.history.pop();
            if (link)
                SetHash(link.route, link.title, link.data, true);
            else
                SetHash('default', 'Домашняя', {});
        };
        return new RegistrationSellerFormViewModel(settings);
    }

    function FillStep1() {
        var form = Parameters.cache.regSeller.step1;
        if ($.isEmptyObject(form))
            form = InitViewModel();
        RenderStep1(form);
    }

    function FillStep2() {
        var pRoute = Routing.params;
        if (pRoute.username && pRoute.mail_token) {
            var step1 = InitViewModel();
            step1.nameSeller(pRoute.username);
            Parameters.cache.regSeller.step1 = step1;
        }

        var cache = Parameters.cache.regSeller.step1;
        if (!cache.nameSeller) {
            SetHash(alias, title, {});
            return true;
        }

        var form = new RegistrationSellerConfirmFormViewModel(cache, settings);

        if (pRoute.username && pRoute.mail_token) {
            form.mailToken(pRoute.mail_token);
            self.DispatchEvent('RSeller.step2.checking', form);
            return true;
        }

        RenderStep2(form);
    }

    function FillStep3() {
        var form = Parameters.cache.regSeller.step3;
        if ($.isEmptyObject(form)) {
            form = new RegistrationSellerFinishFormViewModel(settings);
        }
        if (!Parameters.cache.regSeller.step1.nameSeller) {
            SetHash(alias, title, {});
            return true;
        }

        RenderStep3(form);
    }

    function FillStep4() {
        if (!Parameters.cache.regSeller.step1.nameSeller) {
            SetHash(alias, title, {});
            return true;
        }
        Parameters.cache.regSeller = {
            step1: {},
            step2: {},
            step3: {}
        }
        RenderStep4();
    }

    function RenderStep1(data) {
        self.RenderTemplate(data, settings, null,
            function (data) {
                InsertContainerStep1();
                RenderStep1(data);
            },
            function (data) {
                InsertContainerEmptyWidget();
            })
    }

    function RenderStep2(data) {
        self.RenderTemplate(data, settings, null,
            function (data) {
                InsertContainerStep2();
                RenderStep2(data);
            },
            function (data) {
                InsertContainerEmptyWidget();
            })
    }

    function RenderStep3(data) {
        self.RenderTemplate(data, settings, null,
            function (data) {
                InsertContainerStep3();
                RenderStep3(data);
            },
            function (data) {
                InsertContainerEmptyWidget();
            })
    }

    function RenderStep4() {
        self.WidgetLoader(true, settings.container.widget);
        if (settings.animate)
            settings.animate();
    }

    function SetHash(alias, title, params){
        Routing.SetHash(alias, title, params)
    }
};

var RegistrationSellerFormViewModel = function (settings) {
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
            EventDispatcher.DispatchEvent('RSeller.step1.register', self);
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
        var error = settings.error.nameSeller;
        if (!self.nameSeller()) {
            self.errorNameSeller(error.empty);
            return false;
        }
        if (self.nameSeller().length < 3) {
            self.errorNameSeller(error.minLength);
            return false;
        }
        if (self.nameSeller().length > 40) {
            self.errorNameSeller(error.maxLength);
            return false;
        }
        if (!settings.regular.nameSeller.test(self.nameSeller())) {
            self.errorNameSeller(error.regular);
            return false;
        }
        self.errorNameSeller(null);
        return true;
    };
    self.EmailValidation = function () {
        var error = settings.error.email;
        if (!self.email()) {
            self.errorEmail(error.empty);
            return false;
        }
        if (self.email().length > 64) {
            self.errorEmail(error.maxLength);
            return false;
        }
        if (!settings.regular.email.test(self.email())) {
            self.errorEmail(error.regular);
            return false;
        }
        self.errorEmail(null);
        return true;
    };
    self.PhoneValidation = function () {
        if (self.phone()) {
            if (!settings.regular.phone.test($.trim(self.phone()))) {
                self.errorPhone(settings.error.phone.regular);
                return false;
            }
        }
        self.errorPhone(null);
        return true;
    };
    self.IsCheckedValidation = function () {
        if (!self.isChecked()) {
            self.errorIsChecked(settings.error.isChecked.empty);
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

var RegistrationSellerConfirmFormViewModel = function (cache, settings) {
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
            EventDispatcher.DispatchEvent('RSeller.step2.checking', self);
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
                self.errorEmailConfirm(settings.error.emailToken.empty);
                return false;
            }
        }

        self.errorEmailConfirm(null);
        return true;
    };
    self.PhoneTokenValidation = function () {
        if (!self.phoneConfirmLater()) {
            if (!self.phoneToken()) {
                self.errorPhoneConfirm(settings.error.phoneToken.empty);
                return false;
            }
        }

        self.errorPhoneConfirm(null);
        return true;
    };
    self.EmptyConfirm = function () {
        if (self.phoneConfirmLater() && self.mailConfirmLater()) {
            self.errorConfirmLater(settings.error.confirmLater.empty);
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
        Routing.SetHash('registration_seller', 'Регистрация продавца', {step: 1});
    };
};

var RegistrationSellerFinishFormViewModel = function (settings) {
    var self = this;
    self.typeSeller = ko.observable();
    self.errorTypeSeller = ko.observable();

    self.invite = ko.observable();
    self.errorInvite = ko.observable();

    self.site = ko.observable('http://');
    self.errorSite = ko.observable();

    self.confirmLater = ko.observable(false);
    self.confirmLater.subscribe(function (check) {
        if (!check) {
            self.invite('');
            self.site('http://');
        }
    });
    self.errorConfirmLater = ko.observable(null);

    self.SubmitForm = function () {
        if (self.ValidationForm()) {
            EventDispatcher.DispatchEvent('RSeller.step3.checking', self);
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
    self.TypeSellerValidation = function () {
        if (!self.typeSeller()) {
            self.errorTypeSeller(settings.error.typeSeller.empty);
            return false;
        }
        self.errorTypeSeller(null);
        return true;
    };
    self.InviteValidation = function () {
        if (self.invite()) {
            if (self.invite().length < 5) {
                self.errorInvite(settings.error.invite.minLength);
                return false;
            }
            if (self.invite().length > 40) {
                self.errorInvite(settings.error.invite.maxLength);
                return false;
            }
        }
        self.errorInvite(null);
        return true;
    };
    self.SiteValidation = function () {
        if (self.site()) {
            if (self.site() == 'http://')
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

