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
        container: { widget: 'content', def: 'defaultStatusPaymentWidgetId'},
        tmpl : {
            path : 'statusPaymentTmpl.html', // файл шаблонов
            id : 'statusPaymentPageTmpl' //id шаблона страницы статуса оплаты
        },
        animate: typeof AnimateStatusPayment == 'function' ? AnimateStatusPayment : null,
        status: null,
        backUrl: ''
    };
    function InitWidget(){
        SetInputParameters();
        RegisterEvents();
        CheakRoute();
    }
    function SetInputParameters(){
        var input = self.GetInputParameters('statusPayment');

        if(!$.isEmptyObject(input))
            settings = self.UpdateSettings1(settings, input);

        Config.Containers.statusPayment = settings.container;
    }
    function InsertContainerEmptyWidget(){
        self.ClearContainer(settings);
    }
    function InsertContainerContent(){
        self.InsertContainer(settings);
    }
    function CheakRoute(){
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
                self.WidgetLoader(true, settings.container.widget);
                alert('Нет параметров инициализации!');
            }
        }
        else{
            self.WidgetLoader(true, settings.container.widget);
        }
    }
    function RegisterEvents(){
        self.AddEvent('w.change.route', function (data){
            CheakRoute();
        });
        self.AddEvent('StatusPaymentWidget.update', function (data){
            CheakRoute();
        });
    }
    function Fill(data1, data2){
        var info = new StatusPaymentViewModel(data1, data2, settings);
        InsertContainerContent();
        Render(info);
    }
    function Render(data){
        self.RenderTemplate(data, settings, null,
            function(data){
                InsertContainerContent();
                Render(data);
            },
            function(){
                InsertContainerEmptyWidget();
            }
        );
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