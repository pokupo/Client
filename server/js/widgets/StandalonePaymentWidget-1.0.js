var StandalonePaymentWidget = function () {
    var self = this;
    self.widgetName = 'StandalonePaymentWidget';
    self.version = 1.0;
    self.minWidgetVersion = 1.0;
    self.maxWidgetVersion = 2.0;
    self.minTmplVersion = 1.0;
    self.maxTmplVersion = 2.0;
    self.settings = {
        containerId : {
            button: '',
            content: ''
        },
        customContainer: null,
        tmpl :{
            path : null,
            id : {
                button : null,
                paymentList: null,
                content : null,
                error: null
            }
        },
        animate: null,
        inputParameters: {},
        containerButton: null,
        title: null,
        uniq: null,
        source: null,
        sourceVal: null,
        idGoods: null,
        goodsInfo: null,
        count: 1,
        showCount: true,
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
        showButton: null
    };

    self.InitWidget = function () {
        self.settings.containerId = Config.Containers.standalonePayment;
        self.settings.tmpl = Config.StandalonePayment.tmpl;
        self.settings.title = Config.StandalonePayment.title;
        self.settings.showButton = Config.StandalonePayment.showButton;

        self.CheckRouteStandalonePayment();
    };
    self.SetParameters = function (data) {
        var input = {};
        if(Config.Base.sourceParameters == 'string'){
            var temp = JSCore.ParserInputParameters(/StandalonePaymentWidget/);
            if(temp.standalonePayment){
                input = temp.standalonePayment;
            }
        }
        if(Config.Base.sourceParameters == 'object' && typeof WParameters !== 'undefined' && WParameters.standalonePayment){
            input = WParameters.standalonePayment;
        }

        if(JSSettings.dev)
            Logger.Console.VarDump(self.widgetName, "Input parameters", input);

        if(!$.isEmptyObject(input)){
            if (input.title)
                self.settings.title = input.title;
            else
                self.settings.title = null;

            if (input.idGoods) {
                self.settings.idGoods = input.idGoods;
                self.settings.showAmount = false;
            }
            else if (Routing.params.idGoods) {
                self.settings.idGoods = Routing.params.idGoods;
                self.settings.showAmount = false;
            }
            else{
                self.settings.idGoods = null;
                self.settings.idShop = JSSettings.shopId;
                self.settings.showCount = false;
            }

            if (input.count ){
                self.settings.count  = input.count;
                self.settings.showCount = false;
            }
            else if(Routing.params.count){
                self.settings.count  = Routing.params.count;
                self.settings.showCount = false;
            }
            else{
                self.settings.count  = 1;
                self.settings.showCount = false;
            }

            if (input.amount) {
                self.settings.amount = input.amount;
                self.settings.showAmount = false;
            }
            else if (Routing.params.amount) {
                self.settings.amount = Routing.params.amount;
                self.settings.showAmount = false;
            }
            else{
                self.settings.amount = null;
                if(!self.settings.idGoods)
                    self.settings.showAmount = true;
            }

            if (input.uid)
                self.settings.uid  = input.uid;
            if(Routing.params.uid)
                self.settings.uid = Routing.params.uid;

            if(input.idShopPartner)
                self.settings.idShopPartner = input.idShopPartner;
            if(Routing.params.idShopPartner)
                self.settings.idShopPartner = Routing.params.idShopPartner;

            if (input.mailUser)
                self.settings.mailUser = input.mailUser;
            else if(Routing.params.mailUser)
                self.settings.mailUser = Routing.params.mailUser;

            if (input.idMethodPayment)
                self.settings.idMethodPayment = input.idMethodPayment;
            if(Routing.params.idMethodPayment)
                self.settings.idMethodPayment = Routing.params.idMethodPayment;
            if(input.description)
                self.settings.description = input.description;
            if(Routing.params.description)
                self.settings.description = Routing.params.description;

            if(input.showButton)
                self.settings.showButton = input.showButton;

            if(input.tmpl){
                if(input.tmpl.path)
                    self.settings.tmpl.path = input.tmpl.path;
                if(input.tmpl.id){
                    for(var key in input.tmpl.id){
                        self.settings.tmpl.id[key] = input.tmpl.id[key];
                    }
                }
            }
            if(input.container){
                if(input.container){
                    for(var key in input.container){
                        self.settings.containerId[key] = input.container[key];
                    }
                }
            }
            if(input.animate)
                self.settings.animate = input.animate;
        }
        self.settings.inputParameters = input;
        if(JSSettings.dev)
            Logger.Console.VarDump(self.widgetName, "Result settings", self.settings);
    };
    self.CheckRouteStandalonePayment = function () {
        self.SetParameters();
        self.RegisterEvents();
        self.BaseLoad.Tmpl(self.settings.tmpl, function () {
            if (Routing.route == 'standalone_payment') {
                if(self.settings.idGoods != null){
                    self.BaseLoad.GoodsInfo(self.settings.idGoods, '1000000', function(data){
                        self.settings.goodsInfo = data;
                        if (self.settings.idShopPartner == null)
                            self.GetData.Goods();
                        if (self.settings.idShopPartner != null)
                            self.GetData.PartnerGoods();
                    });
                }

                if (self.settings.idShop != null && self.settings.idGoods == null)
                    self.GetData.Service();
            }
            else if(self.settings.showButton && Routing.route != 'status_payment'){
                self.InsertContainer.Button();
                self.Fill.Button();
            }
            else{
                self.WidgetLoader(true);
            }
        });
    };
    self.RegisterEvents = function () {
        EventDispatcher.AddEventListener('StandalonePaymentWidget.payment.select', function(data){
            self.settings.idMethodPayment = data.idMethodPayment();
            self.settings.paymentInfo = data.paymentInfo;
            self.settings.mailUser = data.mailUser();
            if(self.settings.idGoods != null){
                self.settings.count = data.count();
                if (self.settings.idShopPartner == null)
                    self.GetData.Goods();
                if (self.settings.idShopPartner != null)
                    self.GetData.PartnerGoods();
            }
            if(self.settings.idShop != null){
                self.settings.amount = data.amount();
                self.GetData.Service();
            }
        });

        EventDispatcher.AddEventListener('StandalonePaymentWidget.back', function(){
            self.settings.idMethodPayment = null;
            self.settings.mailUser = null;
            self.CheckRouteStandalonePayment()
        });

        EventDispatcher.AddEventListener('widget.change.route', function () {
            self.CheckRouteStandalonePayment();
        });

        EventDispatcher.AddEventListener('StandalonePaymentWidget.payment.clear', function(){
            self.settings.idMethodPayment = null;
            self.settings.mailUser = null;
            self.CheckRouteStandalonePayment();
        });

        EventDispatcher.AddEventListener('StandalonePaymentWidget.form.submit', function (form) {
            self.InsertContainer.Content();
            var dataStr = [];
            $.each(form.inData(), function (i) {
                if (form.inData()[i].name() == 'MOBILE_PHONE')
                    dataStr.push(form.inData()[i].name() + '=' + encodeURIComponent(form.inData()[i].value().replace(/\s/g, '').replace(/-/g, '')));
                else
                    dataStr.push(form.inData()[i].name() + '=' + encodeURIComponent(form.inData()[i].value()));
            });
            var str = dataStr.join('&');

            if (Routing.params.orderId) {
                str = Routing.params.orderId + '?' + str;
                self.GetData.Order(str);
            }
            if (Routing.params.goodsId) {
                str = Routing.params.goodsId + '?' + str;
                self.GetData.Goods(str);
            }
            if (Routing.params.amount) {
                str = Routing.params.amount + '/' + Parameters.shopId + '?' + str;
                self.GetData.Amount(str);
            }
        });
    };
    self.GetData = {
        Price: function(){
            var str = self.settings.idShop + '/';
            if(self.settings.idShopPartner)
                str = str + self.settings.idShopPartner + '/';

            var parameters = [];
            if(self.settings.amount)
                parameters.push('amount=' + self.settings.amount);
            if(self.settings.uid)
                parameters.push('uid=' + self.settings.uid);
            if(self.settings.idMethodPayment)
                parameters.push('idMethodPayment=' + self.settings.idMethodPayment);

            parameters.push('description=' + self.settings.description);
            if(parameters.length > 0)
                str = str + '?' + parameters.join('&');

            self.BaseLoad.InvoicesService(str, function (data) {
                self.Fill.PaymentList(data);
            });
        },
        Goods: function () {
            var str = self.settings.idGoods + '/';
            if(self.settings.count)
                str = str + self.settings.count + '/';
            var parameters = [];
            if(self.settings.mailUser)
                parameters.push('mailUser=' + self.settings.mailUser);
            if(self.settings.idMethodPayment)
                parameters.push('idMethodPayment=' + self.settings.idMethodPayment);
            if(parameters.length > 0)
                str = str + '?' + parameters.join('&');
            self.BaseLoad.InvoicesGoods(str, function (data) {
                self.Fill.PaymentList(data);
            });
        },
        PartnerGoods: function(){
            var str = self.settings.idGoods + '/';
            if(self.settings.count)
                str = str + self.settings.count + '/';
            if(self.settings.idShopPartner)
                str = str + self.settings.idShopPartner + '/';
            var parameters = [];
            if(self.settings.mailUser)
                parameters.push('mailUser=' + self.settings.mailUser);
            if(self.settings.idMethodPayment)
                parameters.push('idMethodPayment=' + self.settings.idMethodPayment);
            if(parameters.length > 0)
                str = str + '?' + parameters.join('&');
            self.BaseLoad.InvoicesPartnerGoods(str, function (data) {
                self.Fill.PaymentList(data);
            });
        },
        Service: function () {
            var str = self.settings.idShop + '/';
            if(self.settings.idShopPartner)
                str = str + self.settings.idShopPartner + '/';

            var parameters = [];
            if(self.settings.amount)
                parameters.push('amount=' + self.settings.amount);
            if(self.settings.uid)
                parameters.push('uid=' + self.settings.uid);
            if(self.settings.mailUser)
                parameters.push('mailUser=' + self.settings.mailUser);
            if(self.settings.idMethodPayment)
                parameters.push('idMethodPayment=' + self.settings.idMethodPayment);

            parameters.push('description=' + self.settings.description);
            if(parameters.length > 0)
                str = str + '?' + parameters.join('&');

            self.BaseLoad.InvoicesService(str, function (data) {
                self.Fill.PaymentList(data);
            });
        }
    };
    self.InsertContainer = {
        EmptyWidget: function (container) {
            var temp = $(container).find(self.SelectCustomContent().join(', ')).clone();
            $(container).empty().html(temp);
        },
        Button: function () {
            self.InsertContainer.EmptyWidget("#" + self.settings.containerId.button.widget);
            $("#" + self.settings.containerId.button.widget).html($('script#' + self.GetTmplName('button')).html());
        },
        PaymentList: function () {
            self.InsertContainer.EmptyWidget("#" + self.settings.containerId.content.widget);
            $("#" + self.settings.containerId.content.widget).html($('script#' + self.GetTmplName('paymentList')).html());
        },
        Content: function () {
            self.InsertContainer.EmptyWidget("#" + self.settings.containerId.content.widget);
            $("#" + self.settings.containerId.content.widget).html($('script#' + self.GetTmplName('content')).html()).hide();
        },
        Error: function(){
            self.InsertContainer.EmptyWidget("#" + self.settings.containerId.content.widget);
            $("#" + self.settings.containerId.content.widget).html($('script#' + self.GetTmplName('error')).html()).hide();
        }
    };
    self.Fill = {
        Button: function () {
            var button = new StandaloneButtonPaymentViewModel(self.settings);
            self.Render.Button(button);
        },
        PaymentList: function(data){
            if(data.hasOwnProperty('err')){
                self.InsertContainer.Error();
                self.Fill.Error(data);
            }
            else {
                if (!data.hasOwnProperty('pay_form')) {
                    var list = new StandalonePaymentListViewModel(self.settings);
                    list.error.base('');
                    list.show.errorBase(false);
                    if (data) {
                        $.each(data, function (i) {
                            self.settings.paymentList = true;
                            list.payments.push(new StandalonePaymentItemViewModel(data[i], list));
                        });
                    }

                    self.InsertContainer.PaymentList();
                    self.Render.PaymentList(list);
                }
                else {
                    self.InsertContainer.Content();
                    self.Fill.Content(data);
                }
            }
        },
        Content: function (data) {
            var content = new StandalonePaymentViewModel(self.settings);

            var str = [];
            var fields = {};
            if(data.pay_form)
                fields = data.pay_form.hidden_field;
            var orderId = null;
            $.each(fields, function(i){
                str.push(fields[i].name + '=' + encodeURIComponent(fields[i].value));
                if(fields[i].name == 'PKP_ID_ORDER')
                    orderId = fields[i].value;
            });
            if(orderId)
                $.cookie(Config.Base.cookie.orderId, 'PKP_ID_ORDER=' + orderId);
            else if(str)
                $.cookie(Config.Base.cookie.orderId, str.join('&'));

            content.paymentInfo = self.settings.paymentInfo;
            content.AddContent(data);
            self.Render.Content(content);
        },
        Error: function(data){
            var list = new StandalonePaymentErrorViewModel(data, self.settings);
            self.Render.Error(list);
        }
    };
    self.Render = {
        Button: function (data) {
            if ($("#" + self.settings.containerId.button.widget).length > 0){
                try {
                    ko.cleanNode($('#' + self.settings.containerId.button.widget)[0]);
                    ko.applyBindings(data, $('#' + self.settings.containerId.button.widget)[0]);

                    self.WidgetLoader(true, self.settings.containerId.button.widget);

                    if (typeof AnimateStandalonePayment == 'function')
                        new AnimateStandalonePayment();
                    if (self.settings.animate)
                        self.settings.animate();
                }
                catch (e) {
                    self.Exception('Ошибка шаблона [' + self.GetTmplName('button') + ']', e);
                    if (self.settings.tmpl.custom) {
                        delete self.settings.tmpl.custom;
                        self.BaseLoad.Tmpl(self.settings.tmpl, function () {
                            self.InsertContainer.Button();
                            self.Render.Button(data);
                        });
                    }
                    else {
                        self.InsertContainer.EmptyWidget('#' + self.settings.containerId.button.widget);
                        self.WidgetLoader(true, self.settings.containerId.button.widget);
                    }
                }
            }
            else {
                self.WidgetLoader(true);
            }
        },
        PaymentList: function (data) {
            if ($("#" + self.settings.containerId.content.widget).length > 0) {
                try {
                    ko.cleanNode($("#" + self.settings.containerId.content.widget)[0]);
                    ko.applyBindings(data, $("#" + self.settings.containerId.content.widget)[0]);
                    $("#" + self.settings.containerId.content.widget).show();
                    self.WidgetLoader(true);
                    if (typeof AnimateStandalonePayment == 'function')
                        new AnimateStandalonePayment();
                    if (self.settings.animate)
                        self.settings.animate();

                    $('#' + data.cssAmount).bind('textchange', function(event, previousText) {
                        var text = $(this).val();
                        data.amount(text);
                        self.settings.amount = text;
                        setTimeout(function(){
                            if(text == self.settings.amount){
                                self.GetData.Price();
                            }
                        }, 500);
                    })

                    $('#' + data.cssCount).bind('textchange', function(event, previousText) {
                        data.count($(this).val());
                    })
                }
                catch (e) {
                    self.Exception('Ошибка шаблона [' + self.GetTmplName('paymentList') + ']', e);
                    if (self.settings.tmpl.custom) {
                        delete self.settings.tmpl.custom;
                        self.BaseLoad.Tmpl(self.settings.tmpl, function () {
                            self.InsertContainer.PaymentList()();
                            self.Render.PaymentList(data);
                        });
                    }
                    else {
                        self.InsertContainer.EmptyWidget("#" + self.settings.containerId.content.widget);
                        self.WidgetLoader(true, self.settings.containerId.content.widget);
                    }
                }
            }
            else {
                self.Exception('Ошибка. Не найден контейнер [' + self.settings.containerId.content.widget + ']');
                self.WidgetLoader(true);
            }
        },
        Content: function (data) {
            if ($("#" + self.settings.containerId.content.widget).length > 0) {
                try {
                    ko.cleanNode($("#" + self.settings.containerId.content.widget)[0]);
                    ko.applyBindings(data, $("#" + self.settings.containerId.content.widget)[0]);
                    $.each(data.inData(), function (i) {
                        if (data.inData()[i].mask()) {
                            $('#' + data.inData()[i].cssField()).mask(data.inData()[i].mask(), {placeholder: "_"});
                        }
                    });
                    $("#" + self.settings.containerId.content.widget).show();
                    self.WidgetLoader(true);
                    if (typeof AnimateStandalonePayment == 'function')
                        new AnimateStandalonePayment();
                    if (self.settings.animate)
                        self.settings.animate();
                }
                catch (e) {
                    self.Exception('Ошибка шаблона [' + self.GetTmplName('content') + ']', e);
                    if (self.settings.tmpl.custom) {
                        delete self.settings.tmpl.custom;
                        self.BaseLoad.Tmpl(self.settings.tmpl, function () {
                            self.InsertContainer.Content();
                            self.Render.Content(data);
                        });
                    }
                    else {
                        self.InsertContainer.EmptyWidget("#" + self.settings.containerId.content.widget);
                        self.WidgetLoader(true, self.settings.containerId.content.widget);
                    }
                }
            }
            else {
                self.Exception('Ошибка. Не найден контейнер [' + self.settings.containerId.content.widget + ']');
                self.WidgetLoader(true);
            }
        },
        Error: function (data) {
            if ($("#" + self.settings.containerId.content.widget).length > 0) {
                try {
                    ko.cleanNode($("#" + self.settings.containerId.content.widget)[0]);
                    ko.applyBindings(data, $("#" + self.settings.containerId.content.widget)[0]);

                    $("#" + self.settings.containerId.content.widget).show();
                    self.WidgetLoader(true);
                    if (typeof AnimateStandalonePayment == 'function')
                        new AnimateStandalonePayment();
                    if (self.settings.animate)
                        self.settings.animate();
                }
                catch (e) {
                    self.Exception('Ошибка шаблона [' + self.GetTmplName('error') + ']', e);
                    if (self.settings.tmpl.custom) {
                        delete self.settings.tmpl.custom;
                        self.BaseLoad.Tmpl(self.settings.tmpl, function () {
                            self.InsertContainer.Content();
                            self.Render.Content(data);
                        });
                    }
                    else {
                        self.InsertContainer.EmptyWidget("#" + self.settings.containerId.content.widget);
                        self.WidgetLoader(true, self.settings.containerId.content.widget);
                    }
                }
            }
            else {
                self.Exception('Ошибка. Не найден контейнер [' + self.settings.containerId.content.widget + ']');
                self.WidgetLoader(true);
            }
        }
    };
};

var StandaloneButtonPaymentViewModel = function (opt) {
    var self = this;
    self.title = opt.title;

    self.ClickPay = function () {
        Parameters.cache.lastPage = Parameters.cache.history[Parameters.cache.history.length - 1];
        Routing.SetHash('standalone_payment', 'Оплата товара', {});
    };
};

var StandalonePaymentListViewModel = function(settings){
    var self = this;

    self.isGoodsId = ko.observable();
    self.title = ko.observable();
    self.count = ko.observable();
    self.amount = ko.observable();
    self.formatAmount = ko.observable();
    self.cssAmount = 'pokupo_amount';
    self.cssCount = 'pokupo_count';

    if(settings.idGoods){
        self.title(settings.goodsInfo.main.chort_name);
        self.count(settings.count);
        var coast = settings.count * parseFloat(settings.goodsInfo.main.sell_end_cost);
        self.amount(coast);
        self.isGoodsId(true);
    }
    if(settings.idShop){
        self.title(settings.description);
        self.amount(settings.amount);
        self.isGoodsId(false);
    }
    if(self.amount())
        self.formatAmount = parseFloat(self.amount()).toFixed(2);

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
            UserEmail: function(email){
                $.cookie(Config.Base.cookie.userEmail, email);
            }
        },
        Get: {
            UserEmail: function() {
                return $.cookie(Config.Base.cookie.userEmail);
            }
        }
    };
    var mail = '';
    if(settings.mailUser)
        mail = settings.mailUser;
    else if(self.Cookie.Get.UserEmail())
        mail = self.Cookie.Get.UserEmail();
    self.mailUser(mail);

    self.CountValidation = function(){
        if (!self.count()) {
            self.error.count(Config.StandalonePayment.Error.count.empty);
            self.show.errorCount(true);
            return false;
        }
        if (parseInt(self.count()) != self.count()) {
            self.error.count(Config.StandalonePayment.Error.count.integer);
            self.show.errorCount(true);
            return false;
        }
        self.error.count(null);
        self.show.errorCount(false);
        return true;
    };
    self.AmountValidation = function(){
        if (!self.amount()) {
            self.error.amount(Config.StandalonePayment.Error.coast.empty);
            self.show.errorAmount(true);
            return false;
        }
        if(isNaN(self.amount())){
            self.error.amount(Config.StandalonePayment.Error.coast.integer);
            self.show.errorAmount(true);
            return false;
        }
        if (parseFloat(self.amount()) != self.amount()) {
            self.error.amount(Config.StandalonePayment.Error.coast.integer);
            self.show.errorAmount(true);
            return false;
        }
        self.error.amount(null);
        self.show.errorAmount(false);
        return true;
    };
    self.EmailValidation = function() {
        if (!self.mailUser()) {
            self.error.email(Config.StandalonePayment.Error.email.empty);
            self.show.errorEmail(true);
            return false;
        }
        if (self.mailUser().length > 64) {
            self.error.email(Config.StandalonePayment.Error.email.maxLength);
            self.show.errorEmail(true);
            return false;
        }
        if (!Config.StandalonePayment.regular.email.test(self.mailUser())) {
            self.error.email(Config.StandalonePayment.Error.email.regular);
            self.show.errorEmail(true);
            return false;
        }
        self.error.email(null);
        self.show.errorEmail(false);
        return true;
    };

    EventDispatcher.AddEventListener('StandalonePaymentWidget.payment.validate', function(data){
        var test = true;
        if(!self.EmailValidation())
            test = false;
        if(!self.CountValidation() && self.isGoodsId())
            test = false;
        if(!self.AmountValidation() && !self.isGoodsId())
            test = false;
        if(test) {
            self.Cookie.Set.UserEmail(self.mailUser());
            data.callback();
        }
    });
}

var StandalonePaymentItemViewModel = function(obj, data){
    var self = this;
    self.id = obj.id;
    self.namePayment = obj.name_payment;
    self.costPayment = obj.cost_payment;
    self.descPayment = obj.desc_payment;
    self.instrPayment = obj.instr_payment;
    self.logoPayment = obj.logo_payment;
    self.timePayment = obj.time_payment;
    self.itog = ko.computed(function() {
        var result = (data.amount() ? parseFloat(data.amount()) : 0) + (self.costPayment ? parseFloat(self.costPayment) : 0);
        if(result == 0 || isNaN(result))
            return 0;
        else {
            result = result.toFixed(2);
            return result;
        }
    }, this);
    self.errorEmail = ko.observable();

    self.Click = {
        SelectPayment: function(){
            data.idMethodPayment(self.id);
            data.paymentInfo = self;
            EventDispatcher.DispatchEvent('StandalonePaymentWidget.payment.validate', {
                data: data,
                callback: function(){
                    EventDispatcher.DispatchEvent('StandalonePaymentWidget.payment.select', data);
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
        EventDispatcher.DispatchEvent('StandalonePaymentWidget.back');
    };
    self.ClickPay = function () {
        $('#' + self.payForm.cssPayForm).submit();
    };
    self.ClickRefresh = function () {
        Routing.SetHash(Routing.route, Routing.title, Routing.params, true);
    };
    self.ClickSubmit = function () {
        if (self.ValidationFrom()) {
            EventDispatcher.DispatchEvent('StandalonePaymentWidget.form.submit', self);
        }
    };
    self.ValidationFrom = function () {
        var test = true;
        $.each(self.inData(), function (i) {
            if (!self.inData()[i].ValidateField()) {
                test = false;
                return false;
            }
        })
        return test;
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
                if(data.pay_form.hidden_field[i].name)
                    field.name = data.pay_form.hidden_field[i].name;
                if(data.pay_form.hidden_field[i].value)
                    field.value = data.pay_form.hidden_field[i].value;
                self.payForm.field.push(field);
            });
        }
        self.isInData(false);
        self.inData = ko.observableArray();
        if (data.hasOwnProperty('in_data')) {
            self.isInData(true);
            $.each(data.in_data, function (i) {
                var field = new StandalonePaymentFieldViewModel();
                field.AddContent(data.in_data[i])
                self.inData.push(field);
            });
        }
        self.urlInvoice(null);
        if (data.hasOwnProperty('url_invoice')) {
            self.urlInvoice(data.url_invoice);
        }
        if(!$.isEmptyObject(self.paymentInfo))
            self.showPaymentInfo = true;
    };
};

var StandalonePaymentFieldViewModel = function () {
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
        if (self.required()) {
            if (!self.value()) {
                self.error(Config.ButtonPayment.Error.required);
                return false;
            }
        }
        if (self.maxlength()) {
            if (self.value().length > self.maxlength()) {
                self.error(Config.ButtonPayment.Error.maxlength.replace('%s%', self.maxlength()));
                return false;
            }
        }
        return true;
    };
}

var StandalonePaymentErrorViewModel = function(data, settings){
    var self = this;
    self.code = data.err;
    self.message = data.msg;
    self.hasPaymentList = settings.paymentList;

    self.ClickClearPayment = function(){
        EventDispatcher.DispatchEvent('StandalonePaymentWidget.payment.clear');
    };
}

var TestStandalonePayment = {
    Init : function(){
        if(typeof Widget == 'function'){
            StandalonePaymentWidget.prototype = new Widget();
            var payment = new StandalonePaymentWidget();
            payment.Init(payment);
        }
        else{
            setTimeout(function(){TestStandalonePayment.Init()}, 100);
        }
    }
}

TestStandalonePayment.Init();