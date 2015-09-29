var StatusPaymentWidget = function () {
    var self = this;
    self.widgetName = 'StatusPaymentWidget';
    self.version = 1.0;
    self.minWidgetVersion = 1.0;
    self.maxWidgetVersion = 2.0;
    self.minTmplVersion = 1.0;
    self.maxTmplVersion = 2.0;
    self.InitWidget = InitWidget;

    var settings = {
        container: null,
        customContainer: null,
        tmpl: {
            path: null,
            id: null
        },
        status: null,
        backUrl: ''
    };
    function InitWidget(){
        settings.container = Config.Containers.statusPayment.widget;
        settings.customContainer = Config.Containers.statusPayment.customClass;
        settings.tmpl = Config.StatusPayment.tmpl;
        RegisterEvents();
        CheckRouteSearch();
        SetInputParameters();
    }
    function SetInputParameters(){
        var input = {};
        if(Config.Base.sourceParameters == 'string'){
            var temp = JSCore.ParserInputParameters(/StatusPaymentWidget/);
            if(temp.statusPayment){
                input = temp.statusPayment;
            }
        }
        if(Config.Base.sourceParameters == 'object' && typeof WParameters !== 'undefined' && WParameters.statusPayment){
            input = WParameters.statusPayment;
        }

        if(JSSettings.dev)
            Logger.Console.VarDump(self.widgetName, "Input parameters", input);

        if(!$.isEmptyObject(input)){

            if(input.tmpl){
                if(input.tmpl.path)
                    settings.tmpl.path = input.tmpl.path;
                if(input.tmpl.id)
                    settings.tmpl.id = input.tmpl.id;
            }
            if(input.animate)
                settings.animate = input.animate;

            if (input.backUrl )
                settings.backUrl  = input.backUrl;
        }

        if(JSSettings.dev)
            Logger.Console.VarDump(self.widgetName, "Result settings", settings);

        self.settings = settings;
    }
    function InsertContainerEmptyWidget(){
        var temp = $("#" + settings.container).find(self.SelectCustomContent().join(', ')).clone();
        $("#" + settings.container).empty().html(temp);
    }
    function InsertContainerContent(){
        InsertContainerEmptyWidget();
        $("#" + settings.container).append($('script#' + self.GetTmplName()).html()).children().hide();
    }
    function CheckRouteSearch(){
        if(Routing.route == 'status_payment'){
            var orderId = $.cookie(Config.Base.cookie.orderId);
            var mailUser = $.cookie(Config.Base.cookie.userEmail);
            if(orderId){
                var path = Routing.GetParameter('name');
                var status = Routing.GetParameter('status');
                if(status)
                    path = path + '/' + status;
                var str = path + '/?' + orderId + '&mailUser=' + mailUser;
                self.BaseLoad.Tmpl(settings.tmpl, function () {
                    self.BaseLoad.StatusPayment(str, function (data1) {
                        self.BaseLoad.ShopInfo(function (data2) {
                            Fill(data1, data2);
                        });
                    })
                });
            }
            else{
                self.WidgetLoader(true, settings.container);
                alert('Нет параметров инициализации!');
            }
        }
        else{
            self.WidgetLoader(true, settings.container);
        }
    }
    function RegisterEvents(){
        EventDispatcher.AddEventListener('w.change.route', function (data){
            CheckRouteSearch();
        });
        EventDispatcher.AddEventListener('StatusPaymentWidget.update', function (data){
            CheckRouteSearch();
        });
    }
    function Fill(data1, data2){
        var info = new StatusPaymentViewModel(data1, data2, settings);
        InsertContainerContent();
        Render(info);
    }
    function Render(data){
        if ($('#' + settings.container).length > 0) {
            try{
                ko.cleanNode($('#' + settings.container)[0]);
                ko.applyBindings(data, $('#' + settings.container)[0]);
                self.WidgetLoader(true, settings.container);
                if(typeof AnimateStatusPayment == 'function')
                    new AnimateStatusPayment();
                if (settings.animate)
                    settings.animate();
            }
            catch (e) {
                self.Exception('Ошибка шаблона [' + self.GetTmplName() + ']', e);
                if (settings.tmpl.custom) {
                    delete settings.tmpl.custom;
                    self.BaseLoad.Tmpl(settings.tmpl, function () {
                        InsertContainerContent();
                        Render(data);
                    });
                }
                else {
                    InsertContainerEmptyWidget();
                    self.WidgetLoader(true, settings.container);
                }
            }
        }
        else {
            self.Exception('Ошибка. Не найден контейнер [' + settings.container + ']');
            self.WidgetLoader(true, settings.container);
        }
    }
}

var StatusPaymentViewModel = function(data, shop, settings){
    var self = this;

    self.orderId = data.id_order;
    self.instruction = data.instruction;
    self.cssOrder = 'order_print_block';
    self.status = data.status;

    self.isPaid = ko.observable(false);
    if(self.status == 'paid')
        self.isPaid(true);

    self.isWait = ko.observable(false);
    if(self.status == 'wait_pay')
        self.isWait(true);

    self.isCancel = ko.observable(false);
    if(self.status == 'cancel')
        self.isCancel(true);

    self.isBack = ko.observable(false);
    if(self.status == 'back')
        self.isBack(true);

    self.outData = ko.observableArray();
    $.each(data.out_data, function(i){
        self.outData.push(new StatusPaymentParametersViewModel(data.out_data[i]));
    });

    self.egoods = [];
    if(data.egoods){
        $.each(data.egoods, function(i){
            if(!data.egoods[i]['max_upload'])
                data.egoods[i]['max_upload'] = false;
            if(!data.egoods[i]['expiration'])
                data.egoods[i]['expiration'] = false;
        })
        self.egoods = data.egoods;
    }


    self.Print = function (id) {
        var w = window.open();
        w.document.write($('#' + id).html());
        w.print();
        w.close();
    };
    self.ClickPrintOrder = function () {
        self.Print(self.cssOrder);
    };
    self.ClickBack = function(){
        var link = shop.site_shop;
        if(settings.backUrl)
            link = settings.backUrl;
        window.location.href = link;
    };
    self.ClickRefresh =function(){
        EventDispatcher.DispatchEvent('StatusPaymentWidget.update');
    };
    self.showRefresh = false;
    if(Routing.GetParameter('status') == 'success' && self.status == 'wait_pay')
        self.showRefresh = true;

    function StatusPaymentParametersViewModel(data){
        var self = this;
        self.label = ko.observable(data.label);
        self.value = ko.observable(data.value);
        self.help = ko.observable(data.help);
    }
}

var TestStatusPayment = {
    Init : function(){
        if(typeof Widget == 'function'){
            StatusPaymentWidget.prototype = new Widget();
            var status = new StatusPaymentWidget();
            status.Init(status);
        }
        else{
            setTimeout(function(){TestStatusPayment.Init()}, 100);
        }
    }
}

TestStatusPayment.Init();