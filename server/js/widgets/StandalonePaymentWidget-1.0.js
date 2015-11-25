var StandalonePaymentWidget = function () {
    var self = this;
    self.widgetName = 'StandalonePaymentWidget';
    self.version = 1.0;
    self.minWidgetVersion = 1.0;
    self.maxWidgetVersion = 2.0;
    self.minTmplVersion = 1.0;
    self.maxTmplVersion = 2.0;
    self.InitWidget = InitWidget;

    var settings = {
        container: {
            content: {widget: 'content', def: 'defaultStandalonePaymentWidgetId'},
            button: {widget: 'standalonePaymentWidgetId', def: 'defaultStandalonePaymentWidgetId'}
        },
        showButton: false,
        routeName: 'standalone_payment',
        title: "Оплатить", // заголовок кнопки
        captionSubmit: "Обновить",
        tmpl: {
            path: 'standalonePaymentTmpl.html', // файл шаблонов
            id: {
                content: 'standalonePaymentPageTmpl', //id шаблона страницы оплаты
                paymentList: 'standalonePaymentListTmpl',
                button: 'standalonePaymentButtonImpl', //id шаблона кнопки
                error: 'standalonePaymentErrorTmpl'
            }
        },
        Error: {
            required: 'Поле обязательно для заполнения.',
            regExp: 'Недопустимое значение.',
            maxlength: 'Максимум %s% символов.',
            email: {
                empty: 'Поле обязательно для заполнения',
                maxLength: 'Максимум 64 символа',
                regular: 'Не является адресом электронной почты',
                uniq: 'Аккаунт для этого почтового ящика уже существует, рекомендуем пройти процедуру восстановления доступа. <a href="https://pokupo.ru/resetting/request">Восстановить доступ</a>'
            },
            count: {
                empty: 'Поле обязательно для заполнения',
                count: "Введите количество товара"
            },
            coast: {
                empty: 'Поле обязательно для заполнения',
                count: "Введите стоимость услуги",
                integer: "Недопустимое значение"
            }
        },
        regular: { // регулярные выражения полей
            email: /^[-._a-zA-Z0-9]+@(?:[a-z0-9][-a-z0-9]+\.)+[a-z]{2,6}$/
        },
        animate: typeof AnimateStandalonePayment == 'function' ? AnimateStandalonePayment :null,
        containerButton: null,
        uniq: null,
        source: null,
        sourceVal: null,
        idGoods: null,
        goodsInfo: null,
        count: 1,
        showCount: false,
        idShop: null,
        amount: null,
        showAmount: true,
        uid: null,
        idShopPartner: null,
        mailUser: null,
        idMethodPayment: null,
        paymentInfo: {},
        paymentList: false,
        description: '',
        userParams: {},
        backUrl: ''
    };

    function InitWidget() {
        CheckRouteStandalonePayment();
    }

    function SetInputParameters() {
        var input = self.GetInputParameters('standalonePayment');

        if (!$.isEmptyObject(input)) {
            settings = self.UpdateSettings1(settings, input);

            var rParams = Routing.params;

            if (input.title)
                settings.title = input.title;

            if (input.idGoods) {
                settings.idGoods = input.idGoods;
                settings.showAmount = false;
            }
            else if (rParams.idGoods) {
                settings.idGoods = rParams.idGoods;
                settings.showAmount = false;
            }
            else
                settings.idShop = JSSettings.shopId;

            if (input.count) {
                settings.count = input.count;
                settings.showCount = false;
            }
            else if (rParams.count) {
                settings.count = rParams.count;
                settings.showCount = false;
            }

            if (input.amount) {
                settings.amount = input.amount;
                settings.showAmount = false;
            }
            else if (rParams.amount) {
                settings.amount = rParams.amount;
                settings.showAmount = false;
            }
            else {
                if (!settings.idGoods)
                    settings.showAmount = true;
            }

            if (input.uid)
                settings.uid = input.uid;
            if (rParams.uid)
                settings.uid = rParams.uid;

            if (input.idShopPartner)
                settings.idShopPartner = input.idShopPartner;
            if (rParams.idShopPartner)
                settings.idShopPartner = rParams.idShopPartner;

            if (input.mailUser)
                settings.mailUser = input.mailUser;
            else if (rParams.mailUser)
                settings.mailUser = rParams.mailUser;

            if (input.idMethodPayment)
                settings.idMethodPayment = input.idMethodPayment;
            if (rParams.idMethodPayment)
                settings.idMethodPayment = rParams.idMethodPayment;
            if (input.description)
                settings.description = input.description;
            if (rParams.description)
                settings.description = rParams.description;

            if (input.backUrl)
                settings.backUrl = input.backUrl;
            else if (rParams.backUrl)
                settings.backUrl = rParams.backUrl;

            if (rParams.userParams) {
                var query = decodeURIComponent(rParams.userParams);
                settings.userParams = query.replace(/(^\?)/, '').split("&")
                    .map(function (n) {
                        return n = n.split("="), this[n[0]] = n[1], this
                    }.bind({}))[0];
            }
            if (input.userParams) {
                $.each(input.userParams, function (i, one) {
                    settings.userParams[i] = one;
                })
            }

        }

        Config.Containers.standalonePayment = settings.container;
    }

    function CheckRouteStandalonePayment() {
        SetInputParameters();
        RegisterEvents();
        self.BaseLoad.Tmpl(settings.tmpl, function () {
            if (Routing.route == settings.routeName) {
                if (settings.idGoods != null) {
                    self.BaseLoad.GoodsInfo(settings.idGoods, '1000000', function (data) {
                        settings.goodsInfo = data;
                        if (settings.idShopPartner == null)
                            GetDataGoods();
                        if (settings.idShopPartner != null)
                            GetDataPartnerGoods();
                    });
                }

                if (settings.idShop != null && settings.idGoods == null)
                    GetDataService();
            }
            else if (settings.showButton && Routing.route != 'status_payment') {
                InsertContainerButton();
                FillButton();
            }
            else {
                self.WidgetLoader(true);
            }
        });
    }

    function RegisterEvents() {
        self.AddEvent('SPayment.payment.select', function (data) {
            settings.idMethodPayment = data.idMethodPayment();
            settings.paymentInfo = data.paymentInfo;
            settings.mailUser = data.mailUser();
            if (settings.idGoods != null) {
                settings.count = data.count();
                if (settings.idShopPartner == null)
                    GetDataGoods();
                if (settings.idShopPartner != null)
                    GetDataPartnerGoods();
            }
            if (settings.idShop != null) {
                settings.amount = data.amount();
                GetDataService();
            }
        });

        self.AddEvent('SPayment.back', function () {
            settings.idMethodPayment = null;
            settings.mailUser = null;
            CheckRouteStandalonePayment()
        });

        self.AddEvent('w.change.route', function () {
            CheckRouteStandalonePayment();
        });

        self.AddEvent('SPayment.payment.clear', function () {
            settings.idMethodPayment = null;
            settings.mailUser = null;
            CheckRouteStandalonePayment();
        });

        self.AddEvent('SPayment.form.submit', function (form) {
            InsertContainerContent();
            var dataStr = [];
            $.each(form.inData(), function (i) {
                if (form.inData()[i].name() == 'MOBILE_PHONE')
                    dataStr.push(form.inData()[i].name() + '=' + encodeURIComponent(form.inData()[i].value().replace(/\s/g, '').replace(/-/g, '')));
                else
                    dataStr.push(form.inData()[i].name() + '=' + encodeURIComponent(form.inData()[i].value()));
            });
            var str = dataStr.join('&');

            if (settings.idGoods != null) {
                if (settings.idShopPartner == null)
                    GetDataGoods(str);
                if (settings.idShopPartner != null)
                    GetDataPartnerGoods(str);
            }
            if (settings.idShop != null) {
                GetDataService(str);
            }
        });
    }

    function GetDataUserParametrs() {
        var res = '';
        var params = [];
        $.each(settings.userParams, function (i, one) {
            params.push(i + '=' + one);
        });
        res = encodeURIComponent(encodeURIComponent(params.join('&')));
        return res;
    }

    function GetDataPrice() {
        var str = settings.idShop + '/';
        if (settings.idShopPartner)
            str = str + settings.idShopPartner + '/';

        var parameters = [];
        if (settings.amount)
            parameters.push('amount=' + settings.amount);
        if (settings.uid)
            parameters.push('uid=' + settings.uid);
        if (settings.idMethodPayment)
            parameters.push('idMethodPayment=' + settings.idMethodPayment);

        parameters.push('description=' + settings.description);
        if (parameters.length > 0)
            str = str + '?' + parameters.join('&');

        self.BaseLoad.InvoicesService(str, function (data) {
            FillPaymentList(data);
        });
    }

    function GetDataGoods(moreStr) {
        var str = settings.idGoods + '/';
        if (settings.count)
            str = str + settings.count + '/';
        var parameters = [];
        if (settings.mailUser)
            parameters.push('mailUser=' + settings.mailUser);
        if (settings.idMethodPayment)
            parameters.push('idMethodPayment=' + settings.idMethodPayment);
        if (settings.userParams != {})
            parameters.push('userParams=' + GetDataUserParametrs());
        if(moreStr)
            parameters.push(moreStr);
        if (parameters.length > 0)
            str = str + '?' + parameters.join('&');
        self.BaseLoad.InvoicesGoods(str, function (data) {
            FillPaymentList(data);
        });
    }

    function GetDataPartnerGoods(moreStr) {
        var str = settings.idGoods + '/';
        if (settings.count)
            str = str + settings.count + '/';
        if (settings.idShopPartner)
            str = str + settings.idShopPartner + '/';
        var parameters = [];
        if (settings.mailUser)
            parameters.push('mailUser=' + settings.mailUser);
        if (settings.idMethodPayment)
            parameters.push('idMethodPayment=' + settings.idMethodPayment);
        if (settings.userParams != {})
            parameters.push('userParams=' + GetDataUserParametrs());
        if(moreStr)
            parameters.push(moreStr);
        if (parameters.length > 0)
            str = str + '?' + parameters.join('&');
        self.BaseLoad.InvoicesPartnerGoods(str, function (data) {
            FillPaymentList(data);
        });
    }

    function GetDataService(moreStr) {
        var str = settings.idShop + '/';
        if (settings.idShopPartner)
            str = str + settings.idShopPartner + '/';

        var parameters = [];
        if (settings.amount)
            parameters.push('amount=' + settings.amount);
        if (settings.uid)
            parameters.push('uid=' + settings.uid);
        if (settings.mailUser)
            parameters.push('mailUser=' + settings.mailUser);
        if (settings.idMethodPayment)
            parameters.push('idMethodPayment=' + settings.idMethodPayment);
        if (settings.userParams != {})
            parameters.push('userParams=' + GetDataUserParametrs());
        parameters.push('description=' + settings.description);
        if(moreStr)
            parameters.push(moreStr);
        if (parameters.length > 0)
            str = str + '?' + parameters.join('&');

        self.BaseLoad.InvoicesService(str, function (data) {
            FillPaymentList(data);
        });
    }

    function InsertContainerEmptyWidget(container) {
        $(container).empty().html('');
    }

    function InsertContainerButton() {
        self.InsertContainer(settings, 'button', settings.container.button.widget);
    }

    function InsertContainerPaymentList() {
        self.InsertContainer(settings, 'paymentList', settings.container.content.widget);
    }

    function InsertContainerContent() {
        self.InsertContainer(settings, 'content', settings.container.content.widget);
    }

    function InsertContainerError() {
        self.InsertContainer(settings, 'error', settings.container.content.widget);
    }

    function FillButton() {
        var button = new StandaloneButtonPaymentViewModel(settings);
        RenderButton(button);
    }

    function FillPaymentList(data) {
        if (data.hasOwnProperty('err')) {
            InsertContainerError();
            FillError(data);
        }
        else {
            if(data.caption_submit)
                settings.captionSubmit = data.caption_submit;
            if (!data.hasOwnProperty('pay_form') && !data.hasOwnProperty('in_data')) {
                var list = new StandalonePaymentListViewModel(settings);
                list.error.base('');
                list.show.errorBase(false);
                if (data) {
                    $.each(data, function (i) {
                        settings.paymentList = true;
                        list.payments.push(new StandalonePaymentItemViewModel(data[i], list));
                    });
                }

                InsertContainerPaymentList();
                RenderPaymentList(list);
            }
            else {
                InsertContainerContent();
                FillContent(data);
            }
        }
    }

    function FillContent(data) {
        var content = new StandalonePaymentViewModel(settings);

        var str = [];
        var fields = {};
        if (data.pay_form)
            fields = data.pay_form.hidden_field;
        var orderId = null;
        $.each(fields, function (i) {
            str.push(fields[i].name + '=' + encodeURIComponent(fields[i].value));
            if (fields[i].name == 'PKP_ID_ORDER')
                orderId = fields[i].value;
        });
        if (orderId)
            $.cookie(Config.Base.cookie.orderId, 'PKP_ID_ORDER=' + orderId);
        else if (str)
            $.cookie(Config.Base.cookie.orderId, str.join('&'));

        content.paymentInfo = settings.paymentInfo;
        content.AddContent(data);

        RenderContent(content);
    }

    function FillError(data) {
        var list = new StandalonePaymentErrorViewModel(data, settings);
        RenderError(list);
    }

    function RenderButton(data) {
        self.RenderTemplate(data, settings, null,
            function(data){
                InsertContainerButton();
                RenderButton(data);
            },
            function(){
                InsertContainerEmptyWidget('#' + settings.container.button.widget);
            },
            'button', null, 'button'
        );
    }

    function RenderPaymentList(data) {
        self.RenderTemplate(data, settings,
            function(data){
                if (settings.showAmount) {
                    $('#' + data.cssAmount).bind('textchange', function (event, previousText) {
                        var text = $(this).val();
                        data.amount(text);
                        settings.amount = text;
                        setTimeout(function () {
                            if (text == settings.amount) {
                                GetDataPrice();
                            }
                        }, 500);
                    })

                    $('#' + data.cssAmount).focus();
                }

                $('#' + data.cssCount).bind('textchange', function (event, previousText) {
                    data.count($(this).val());
                })
                var input = $("form input");
                if(input.length > 0)
                    $(input[0]).focus();
            },
            function(data){
                InsertContainerPaymentList()();
                RenderPaymentList(data);
            },
            function(){
                InsertContainerEmptyWidget('#' + settings.container.content.widget);
            },
            'paymentList', null, 'content'
        );
    }

    function RenderContent(data) {
        self.RenderTemplate(data, settings,
            function(data){
                $.each(data.inData(), function (i) {
                    if (data.inData()[i].mask()) {
                        $('#' + data.inData()[i].cssField()).mask(data.inData()[i].mask(), {placeholder: "_"});
                    }
                });
                if(data.inData()[0])
                    $('#' + data.inData()[0].cssField()).focus()
            },
            function(data){
                InsertContainerContent();
                RenderContent(data);
            },
            function(){
                InsertContainerEmptyWidget('#' + settings.container.content.widget);
            },
            'content', null, 'content'
        );
    }

    function RenderError(data) {
        self.RenderTemplate(data, settings, null,
            function(data){
                InsertContainerContent();
                RenderContent(data);
            },
            function(){
                InsertContainerEmptyWidget('#' + settings.container.content.widget);
            },
            'error', null, 'content'
        );
    }
};

var StandaloneButtonPaymentViewModel = function (opt) {
    var self = this;
    self.title = opt.title;

    self.ClickPay = function () {
        Parameters.cache.lastPage = Parameters.cache.history[Parameters.cache.history.length - 1];
        Routing.SetHash(opt.routeName, 'Оплата товара', {});
    };
};

var StandalonePaymentListViewModel = function (settings) {
    var self = this;

    self.isGoodsId = ko.observable();
    self.title = ko.observable();
    self.count = ko.observable();
    self.amount = ko.observable();
    self.formatAmount = ko.observable();
    self.cssAmount = 'pokupo_amount';
    self.cssCount = 'pokupo_count';

    if (settings.idGoods) {
        self.title(settings.goodsInfo.main.chort_name);
        self.count(settings.count);
        var coast = settings.count * parseFloat(settings.goodsInfo.main.sell_end_cost);
        self.amount(coast);
        self.isGoodsId(true);
    }
    if (settings.idShop && !settings.idGoods) {
        self.title(settings.description);
        if (settings.amount)
            self.amount(parseFloat(settings.amount));
        self.isGoodsId(false);
    }
    if (self.amount())
        self.formatAmount = self.amount().toFixed(2);

    self.mailUser = ko.observable();
    self.idMethodPayment = ko.observable(settings.idMethodPayment);
    self.payments = ko.observableArray();

    self.error = {
        base: ko.observable(),
        email: ko.observable(),
        count: ko.observable(),
        amount: ko.observable()
    };
    self.show = {
        errorBase: ko.observable(false),
        errorEmail: ko.observable(false),
        errorCount: ko.observable(false),
        errorAmount: ko.observable(false),
        showCount: ko.observable(settings.showCount),
        showAmount: ko.observable(settings.showAmount)
    };
    self.Cookie = {
        Set: {
            UserEmail: function (email) {
                $.cookie(Config.Base.cookie.userEmail, email);
            }
        },
        Get: {
            UserEmail: function () {
                return $.cookie(Config.Base.cookie.userEmail);
            }
        }
    };
    var mail = '';
    if (settings.mailUser)
        mail = settings.mailUser;
    else if (self.Cookie.Get.UserEmail())
        mail = self.Cookie.Get.UserEmail();
    self.mailUser(mail);

    function CountValidation() {
        if (!self.count()) {
            self.error.count(settings.Error.count.empty);
            self.show.errorCount(true);
            return false;
        }
        if (parseInt(self.count()) != self.count()) {
            self.error.count(settings.Error.count.integer);
            self.show.errorCount(true);
            return false;
        }
        self.error.count(null);
        self.show.errorCount(false);
        return true;
    }
    function AmountValidation() {
        var error = settings.Error.coast;
        if (!self.amount()) {
            self.error.amount(error.empty);
            self.show.errorAmount(true);
            return false;
        }
        if (isNaN(self.amount())) {
            self.error.amount(error.integer);
            self.show.errorAmount(true);
            return false;
        }
        if (parseFloat(self.amount()) != self.amount()) {
            self.error.amount(error.integer);
            self.show.errorAmount(true);
            return false;
        }
        if (self.amount() < 0.01) {
            self.error.amount(error.integer);
            self.show.errorAmount(true);
            return false;
        }
        self.error.amount(null);
        self.show.errorAmount(false);
        return true;
    }
    function EmailValidation() {
        var error = settings.Error.email;
        if (!self.mailUser()) {
            self.error.email(error.empty);
            self.show.errorEmail(true);
            return false;
        }
        if (self.mailUser().length > 64) {
            self.error.email(error.maxLength);
            self.show.errorEmail(true);
            return false;
        }
        if (!settings.regular.email.test(self.mailUser())) {
            self.error.email(error.regular);
            self.show.errorEmail(true);
            return false;
        }
        self.error.email(null);
        self.show.errorEmail(false);
        return true;
    }

    EventDispatcher.AddEventListener('SPayment.payment.validate', function (data) {
        var test = true;
        if (!EmailValidation())
            test = false;
        if (!CountValidation() && self.isGoodsId())
            test = false;
        if (!AmountValidation() && !self.isGoodsId())
            test = false;
        if (test) {
            self.Cookie.Set.UserEmail(self.mailUser());
            data.callback();
        }
    });
    self.Back = function () {
        window.location.href = settings.backUrl;
    }
    self.AmountValidation = AmountValidation;
}

var StandalonePaymentItemViewModel = function (obj, data) {
    var self = this;
    self.id = obj.id;
    self.namePayment = obj.name_payment;
    self.costPayment = obj.cost_payment;
    self.descPayment = obj.desc_payment;
    self.instrPayment = obj.instr_payment;
    self.logoPayment = obj.logo_payment;
    self.timePayment = obj.time_payment;
    self.itog = ko.computed(function () {
        if (data.amount() && !data.AmountValidation())
            return 0;
        var result = (data.amount() ? parseFloat(data.amount()) : 0) + (self.costPayment ? parseFloat(self.costPayment) : 0);
        if (result == 0 || isNaN(result))
            return 0;
        else {
            result = result.toFixed(2);
            return result;
        }
    }, this);
    self.errorEmail = ko.observable();

    self.Click = {
        SelectPayment: function () {
            data.idMethodPayment(self.id);
            data.paymentInfo = self;
            EventDispatcher.DispatchEvent('SPayment.payment.validate', {
                data: data,
                callback: function () {
                    EventDispatcher.DispatchEvent('SPayment.payment.select', data);
                }
            });
        }
    }

}

var StandalonePaymentViewModel = function (settings) {
    var self = this;
    self.paymentInfo = {};
    self.showPaymentInfo = false;
    self.instruction = ko.observable();
    self.cssInstruction = 'instructtion_print_block';
    self.idMethodPayment = settings.idMethodPayment;

    self.outData = ko.observableArray();

    self.inData = ko.observableArray();
    self.isInData = ko.observable(false);
    self.cssInDataForm = 'in_data_block';
    self.captionSubmit = settings.captionSubmit;

    self.payForm = {
        action: ko.observable(),
        method: ko.observable(),
        target: ko.observable('_self'),
        cssPayForm: 'payform_block',
        field: ko.observableArray()
    };
    self.isPayForm = ko.observable(false);

    self.urlInvoice = ko.observable();
    self.cssInvoice = 'invoice_print_block';

    self.Print = function (id) {
        var w = window.open();
        w.document.write($('#' + id).html());
        w.print();
        w.close();
    };
    self.ClickPrintInstruction = function () {
        self.Print(self.cssInstruction);
    };
    self.ClickPrintInvoice = function () {
        self.Print(self.cssInvoice);
    };
    self.Back = function () {
        if(settings.paymentList)
            EventDispatcher.DispatchEvent('SPayment.back');
        else
            window.location.href = settings.backUrl;
    };
    self.ClickPay = function () {
        $('#' + self.payForm.cssPayForm).submit();
    };
    self.ClickRefresh = function () {
        Routing.SetHash(Routing.route, Routing.title, Routing.params, true);
    };
    self.ClickSubmit = function () {
        if (ValidationFrom()) {
            EventDispatcher.DispatchEvent('SPayment.form.submit', self);
        }
    };
    self.AddContent = function (data) {
        self.instruction(null);
        if (data.hasOwnProperty('instruction'))
            self.instruction(data.instruction);
        self.outData = ko.observableArray();
        if (data.hasOwnProperty('out_data')) {
            $.each(data.out_data, function (i) {
                self.outData.push(data.out_data[i]);
            });
        }
        self.isPayForm(false);
        self.payForm = {
            action: ko.observable(),
            method: ko.observable(),
            target: ko.observable('_self'),
            cssPayForm: 'payform_block',
            field: ko.observableArray()
        };
        self.isPayForm(false);
        if (data.hasOwnProperty('pay_form')) {
            self.isPayForm(true);
            self.payForm.action(data.pay_form.action);
            self.payForm.method(data.pay_form.method);
            if (data.pay_form.hasOwnProperty('new_window') && data.pay_form.new_window == 'yes') {
                self.payForm.target('_blank');
            }

            $.each(data.pay_form.hidden_field, function (i) {
                var field = {
                    name: '',
                    value: ''
                };
                if (data.pay_form.hidden_field[i].name)
                    field.name = data.pay_form.hidden_field[i].name;
                if (data.pay_form.hidden_field[i].value)
                    field.value = data.pay_form.hidden_field[i].value;
                self.payForm.field.push(field);
            });
        }
        self.isInData(false);
        self.inData = ko.observableArray();
        if (data.hasOwnProperty('in_data')) {
            self.isInData(true);
            $.each(data.in_data, function (i) {
                var field = new StandalonePaymentFieldViewModel(settings);
                field.AddContent(data.in_data[i])
                self.inData.push(field);
            });
        }
        self.urlInvoice(null);
        if (data.hasOwnProperty('url_invoice')) {
            self.urlInvoice(data.url_invoice);
        }
        if (!$.isEmptyObject(self.paymentInfo))
            self.showPaymentInfo = true;
    };
    function ValidationFrom() {
        var test = true;
        $.each(self.inData(), function (i) {
            if (!self.inData()[i].ValidateField()) {
                test = false;
                return false;
            }
        })
        return test;
    }
};

var StandalonePaymentFieldViewModel = function (settings) {
    var self = this;
    self.label = ko.observable();
    self.help = ko.observable();
    self.error = ko.observable();
    self.name = ko.observable();
    self.value = ko.observable();
    self.required = ko.observable(false);
    self.typeField = ko.observable();
    self.listSelect = ko.observableArray();
    self.regExp = ko.observable();
    self.mask = ko.observable();
    self.maxlength = ko.observable();
    self.cssField = ko.observable();

    self.AddContent = function (data) {
        if (data.hasOwnProperty('label'))
            self.label(data.label);
        if (data.hasOwnProperty('help'))
            self.help(data.help);
        if (data.hasOwnProperty('error'))
            self.error(data.error);
        if (data.hasOwnProperty('name')) {
            self.name(data.name);
            self.cssField('field_' + data.name);
        }
        if (data.hasOwnProperty('value'))
            self.value(data.value);
        if (data.hasOwnProperty('required'))
            if (data.required == 'yes')
                self.required(true);
        if (data.hasOwnProperty('type_field'))
            self.typeField(data.type_field)
        if (data.hasOwnProperty('list_select')) {
            $.each(data.list_select, function (i) {
                self.listSelect.push(data.list_select[i]);
            })
        }
        if (data.hasOwnProperty('reg_exp'))
            self.regExp(data.reg_exp);
        if (data.hasOwnProperty('mask'))
            self.mask(data.mask);
        if (data.hasOwnProperty('maxlength'))
            self.maxlength(data.maxlength);
    };
    self.ValidateField = function () {
        if($('#' + self.cssField()).length)
            self.value($('#' + self.cssField()).val());
        if (self.required()) {
            if (!self.value()) {
                self.error(settings.Error.required);
                return false;
            }
        }
        if (self.maxlength()) {
            if (self.value().length > self.maxlength()) {
                self.error(settings.Error.maxlength.replace('%s%', self.maxlength()));
                return false;
            }
        }
        if(self.regExp()){
            var pattern = new RegExp(self.regExp(), 'i');
            if(!pattern.test(self.value())) {
                self.error(settings.Error.regExp);
                return false;
            }
        }
        return true;
    };
}

var StandalonePaymentErrorViewModel = function (data, settings) {
    var self = this;
    self.code = data.err;
    self.message = data.msg;
    self.hasPaymentList = settings.paymentList;

    self.ClickClearPayment = function () {
        EventDispatcher.DispatchEvent('SPayment.payment.clear');
    }
    self.ClickBack = function () {

    }
}

var TestStandalonePayment = {
    Init: function () {
        if (typeof Widget == 'function') {
            StandalonePaymentWidget.prototype = new Widget();
            var payment = new StandalonePaymentWidget();
            payment.Init(payment);
        }
        else {
            setTimeout(function () {
                TestStandalonePayment.Init()
            }, 100);
        }
    }
}

TestStandalonePayment.Init();