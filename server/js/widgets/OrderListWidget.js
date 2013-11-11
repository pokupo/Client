var OrderListWidget = function() {
    var self = this;
    self.widgetName = 'OrderListWidget';
    self.currentPage = 1;
    self.settings = {
        containerFormId: null,
        tmpl : {
            path: null,
            id : {
                list : null,
                empty : null,
                detail : null
            }
        },
        inputParameters: {},
        style: null,
        customContainer: null
    };
    self.InitWidget = function() {
        self.settings.containerFormId = Config.Containers.orderList.widget;
        self.settings.customContainer = Config.Containers.orderList.customClass;
        self.settings.tmpl = Config.OrderList.tmpl;
        self.settings.style = Config.OrderList.style;
        self.SetInputParameters();
        self.RegisterEvents();
        self.SetPosition();
    };
    self.SetInputParameters = function() {
        var input = {};
        if (Config.Base.sourceParameters == 'string') {
            var temp = JSCore.ParserInputParameters(/OrderListWidget.js/);
            if (temp.order) {
                input = temp.order;
            }
        }
        if (Config.Base.sourceParameters == 'object' && typeof WParameters !== 'undefined' && WParameters.order) {
            input = WParameters.order;
        }

        self.settings.inputParameters = input;
    };
    self.CheckRouteListOrder = function() {
        if (Routing.route == 'purchases') {
            self.WidgetLoader(false);
            self.BaseLoad.Login(false, false, false, function(data) {
                if (!data.err) {
                    self.Update.Menu();
                    self.Update.Content();
                }
                else {
                    Parameters.cache.lastPage = Parameters.cache.history[Parameters.cache.history.length - 1];
                    Routing.SetHash('login', 'Авторизация пользователя', {});
                    self.WidgetLoader(true);
                }
            });
        }
        else
            self.WidgetLoader(true);
    };
    self.LoadTmpl = function(){
        self.BaseLoad.Tmpl(self.settings.tmpl, function(){
            self.CheckRouteListOrder();
        });
    };
    self.RegisterEvents = function() {
        if (JSLoader.loaded) {
            self.LoadTmpl();
        }
        else {
            EventDispatcher.AddEventListener('onload.scripts', function(data) {
                self.LoadTmpl();
            });
        }

        EventDispatcher.AddEventListener('widget.change.route', function() {
            self.CheckRouteListOrder();
        });
        
        EventDispatcher.AddEventListener('OrderList.order.repeat', function(opt) {
            self.BaseLoad.RepeatOrder(opt.id, function(data) {
                if (self.QueryError(data, function() {EventDispatcher.DispatchEvent('OrderList.order.repeat', opt)})){
                    self.ShowMessage(Config.OrderList.message.orderRepeat, function() {
                        Parameters.cache.orderList = null;
                        console.log(data);
                        EventDispatcher.DispatchEvent('OrderList.order.edit', {id: data.id});
                    }, false);
                }
            });
        });
        
        EventDispatcher.AddEventListener('OrderList.order.return', function(opt) {
            self.BaseLoad.ReturnOrder(opt.id, function(data) {
                if (self.QueryError(data, function() {EventDispatcher.DispatchEvent('OrderList.order.return', opt)})){
                    self.ShowMessage(Config.OrderList.message.orderReturn, function() {
                        Parameters.cache.orderList = null;
                        Routing.SetHash('cart', 'Моя корзина')
                    }, false);
                }
            });
        });
        
        EventDispatcher.AddEventListener('OrderList.order.cancel', function(opt) {
            self.Confirm(Config.OrderList.message.confirmCancelOrder, function(){
                self.BaseLoad.CancelOrder(opt.id, function(data) {
                    if (self.QueryError(data, function() {EventDispatcher.DispatchEvent('OrderList.order.cancel', opt)})){
                        self.ShowMessage(Config.OrderList.message.orderCancel, function() {
                            Parameters.cache.orderList = null;
                            opt.fn()
                        }, false);
                    }
                });
            })
        });
        
        EventDispatcher.AddEventListener('OrderList.order.check', function(opt) {
            self.BaseLoad.ConfirmOrder(opt.id, function(data) {
                if (self.QueryError(data, function() {EventDispatcher.DispatchEvent('OrderList.order.check', opt)})){
                    self.ShowMessage(Config.OrderList.message.orderCheck, function() {
                        Parameters.cache.orderList = null;
                        opt.fn()
                    }, false);
                }
            });
        });
        
        EventDispatcher.AddEventListener('OrderList.order.delete', function(opt) {
            self.Confirm(Config.OrderList.message.confirmDeleteOrder, function(){
                self.BaseLoad.DeleteOrder(opt.id, function(data) {
                    if (self.QueryError(data, function() {EventDispatcher.DispatchEvent('OrderList.order.check', opt)})){
                        self.ShowMessage(Config.OrderList.message.orderDelete, function() {
                            Parameters.cache.orderList = null;
                            opt.fn()
                        }, false);
                    }
                });
            });
        });
        
        EventDispatcher.AddEventListener('OrderList.order.edit', function(opt) {
            Routing.SetHash('order', 'Оформление заказа', {step: 2, id: opt.id});
        });
        
        EventDispatcher.AddEventListener('OrderList.order.pay', function(opt) {
            console.log('pay');
        });
    };
    self.Update = {
        Content: function() {
            self.WidgetLoader(false);
            if (Routing.params.block == 'list') {
                self.Fill.List();
                self.currentPage = Routing.GetCurrentPage();
            }
            else if (Routing.params.block == 'detail' && Routing.params.id)
                self.Fill.Detail(Routing.params.id);
        },
        Menu: function() {
            Loader.Indicator('MenuPersonalCabinetWidget', false);
            self.BaseLoad.Script('widgets/MenuPersonalCabinetWidget.js', function() {
                EventDispatcher.DispatchEvent('widget.onload.menuPersonalCabinet');
            });
        }
    };
    self.InsertContainer = {
        EmptyWidget : function(){
            var temp = $("#" + self.settings.containerFormId).find(self.SelectCustomContent().join(', ')).clone();
            $("#" + self.settings.containerFormId).empty().html(temp);
        },
        List: function() {
            self.InsertContainer.EmptyWidget();
            $("#" + self.settings.containerFormId).append($('script#' + self.settings.tmpl.id.list).html());
        },
        Detail: function() {
            self.InsertContainer.EmptyWidget();
            $("#" + self.settings.containerFormId).append($('script#' + self.settings.tmpl.id.detail).html());
        },
        EmptyList: function() {
            self.InsertContainer.EmptyWidget();
            $("#" + self.settings.containerFormId).append($('script#' + self.settings.tmpl.id.empty).html());
        }
    };
    self.Fill = {
        List: function() {
            self.BaseLoad.OrderList(function(data) {
                if (!data.err) {
                    self.InsertContainer.List();
                    var list = Parameters.cache.order.list;
                    if ($.isEmptyObject(list)) {
                        list = new OrderListViewModel();
                        Parameters.cache.order.list = list;
                    }
                    list.AddContent(data);
                    self.Render.List(list);
                }
                else {
                    self.InsertContainer.EmptyList();
                    self.Render.EmptyList();
                }
            });
        },
        Detail: function(id) {
            self.BaseLoad.OrderInfo(id + '/yes', function(data) {
                if(!data.err){
                    self.InsertContainer.Detail();
                    var order = Parameters.cache.order.info;
                    if ($.isEmptyObject(order)) {
                        OrderViewModel.prototype.Back = function(){
                            Routing.SetHash('purchases', 'Мои покупки', {block: 'list', page: Routing.GetLastPageNumber()});
                        };
                        OrderViewModel.prototype.ClickEdit = function(){
                            EventDispatcher.DispatchEvent('OrderList.order.edit', {id: id});
                        };
                        OrderViewModel.prototype.ClickDelete = function(){
                            EventDispatcher.DispatchEvent('OrderList.order.delete', {id: id, fn: function(){Routing.SetHash('purchases', 'Мои покупки', {block: 'list', page: 1})}})
                        };
                        OrderViewModel.prototype.ClickCancel = function(){
                            EventDispatcher.DispatchEvent('OrderList.order.cancel', {id: id, fn: function(){Routing.SetHash('purchases', 'Мои покупки', {block: 'list', page: 1})}})
                        };
                        OrderViewModel.prototype.ClickPay = function(){
                            EventDispatcher.DispatchEvent('OrderList.order.pay', {id: id, fn: function(){}})
                        };
                        OrderViewModel.prototype.ClickCheck = function(){
                            EventDispatcher.DispatchEvent('OrderList.order.check', {id: id, fn: function(){Routing.SetHash('purchases', 'Мои покупки', {block:'detail', id: Routing.params.id})}})
                        };
                        OrderViewModel.prototype.ClickRepeat = function(){
                            EventDispatcher.DispatchEvent('OrderList.order.repeat', {id: id})
                        };
                        OrderViewModel.prototype.ClickReturn = function(){
                            EventDispatcher.DispatchEvent('OrderList.order.return', {id: id})
                        };
                        order = new OrderViewModel();
                        Parameters.cache.order.info = order;
                    }
                    order.AddContent(data);
                    self.Render.Detail(order);
                }
                else{
                    self.WidgetLoader(true, self.settings.containerFormId);
                    self.ShowMessage(data.msg, function(){
                        Routing.SetHash('purchases', 'Мои покупки', {block: 'list', page: 1});
                    });
                }
            });
        }
    };
    self.Render = {
        List: function(data) {
            if ($("#" + self.settings.containerFormId).length > 0) {
                ko.applyBindings(data, $("#" + self.settings.containerFormId)[0]);
            }
            new AnimateOrderList();
            self.WidgetLoader(true, self.settings.containerFormId);
        },
        EmptyList: function() {
            self.WidgetLoader(true, self.settings.containerFormId);
        },
        Detail: function(data) {
            if ($("#" + self.settings.containerFormId).length > 0) {
                ko.applyBindings(data, $("#" + self.settings.containerFormId)[0]);
            }
            self.WidgetLoader(true, self.settings.containerFormId);
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

var OrderListViewModel = function() {
    var self = this;
    self.list = ko.observableArray();
    self.paging = ko.observableArray();
    self.count = 0;

    self.AddContent = function(data) {
        self.list = ko.observableArray();
        var start = Routing.GetCurrentPage() * Config.Paging.itemsPerPage - Config.Paging.itemsPerPage;
        var end = Routing.GetCurrentPage() * Config.Paging.itemsPerPage - 1;
        self.count = data.count_order;
        if (end > self.count - 1)
            end = self.count - 1;
        if (start <= self.count - 1) {
            for (var i = start; i <= end; i++) {
                self.list.push(new OrderListDetailViewModel(data[i]));
            }
        }
        self.AddPages();
    };
    self.AddPages = function() {
        var ClickLinkPage = function() {
            Loader.Indicator('OrderListWidget', false);

            Routing.UpdateHash({page: this.pageId});
        }

        self.paging = Paging.GetPaging(self.count, {paging: Config.Paging}, ClickLinkPage);
    }
    self.ClickRefresh = function(){
        Parameters.cache.orderList = null;
        Routing.SetHash('purchases', 'Мои покупки', {block:'list'})
    };
};

var OrderListDetailViewModel = function(data) {
    var self = this;
    self.id = data.id;
    self.cssFloatPopup = 'order_item';
    self.dateCreate = data.date_create;
    self.commentBuyer = data.comment_buyer;
    self.commentOperator = data.comment_operator;
    self.nameShop = data.name_shop;
    self.costShipping = data.cost_shipping;
    self.costPayment = data.cost_payment;
    self.sellCost = data.sell_cost;
    self.finalCost = data.final_cost + ' руб.';
    self.GetIconPay = function(status) {
        if (status == 'wait_check')
            return Config.Base.pathToImages + '/_check.png';
        if (status == 'wait_pay')
            return Config.Base.pathToImages + '/_receipt_invoice.png';
        if (status == 'paid')
            return Config.Base.pathToImages + '/_coins.png';
        if (status == 'cancel')
            return Config.Base.pathToImages + '/_cancel_icon.png';
        if (status == 'back')
            return Config.Base.pathToImages + '/_arrow_return.png';
        return false;
    };
    self.GetNamePay = function(status) {
        if (status == 'wait_check')
            return 'На проверке';
        if (status == 'wait_pay')
            return 'Ожидает оплаты';
        if (status == 'paid')
            return 'Оплачен';
        if (status == 'cancel')
            return 'Отменена';
        if (status == 'back')
            return 'Возвращена';
        return false;
    };
    self.GetIconOrder = function(status) {
        if (status == 'init')
            return Config.Base.pathToImages + '/_bricks.png';
        if (status == 'new')
            return Config.Base.pathToImages + '/_check.png';
        if (status == 'process')
            return Config.Base.pathToImages + '/_hourglass.png';
        if (status == 'send')
            return Config.Base.pathToImages + '/_delivery.png';
        if (status == 'delivered')
            return Config.Base.pathToImages + '/_box_receive.png';
        if (status == 'cancel')
            return Config.Base.pathToImages + '/_cancel_icon.png';
        return false;
    };
    self.GetNameOrder = function(status) {
        if (status == 'init')
            return 'Формируется';
        if (status == 'new')
            return 'Новый';
        if (status == 'process')
            return 'В просессе обработки';
        if (status == 'send')
            return 'Отправлен';
        if (status == 'delivered')
            return 'Получен покупателем';
        if (status == 'cancel')
            return 'Отменен';
        return false;
    };
    self.statusPayName = self.GetNamePay(data.status_pay);
    self.statusPayIcon = self.GetIconPay(data.status_pay);
    self.statusOrderName = self.GetNameOrder(data.status_order);
    self.statusOrderIcon = self.GetIconOrder(data.status_order);

    self.viewShow = ko.computed(function() {
        return true;
    }, this);
    self.ClickShow = function() {
        Routing.SetHash('purchases', 'Мои покупки', {block: 'detail', id: self.id});
    };
    self.viewEdit = ko.computed(function() {
        var s = data.status_order;
        if (s == 'init')
            return true;
        return false;
    }, this);
    self.ClickEdit = function() {
        EventDispatcher.DispatchEvent('OrderList.order.edit', {id: self.id});
    };
    self.viewRepeat = ko.computed(function() {
        var s = data.status_order;
        if (s == 'delivered' || s == 'send' || s == 'cancel')
            return true;
        return false;
    }, this);
    self.ClickRepeat = function() {
        EventDispatcher.DispatchEvent('OrderList.order.repeat', {id: self.id});
    };
    self.viewReturn = ko.computed(function() {
        var s = data.status_order;
        if (s == 'delivered' || s == 'send' || s == 'cancel')
            return true;
        return false;
    }, this);
    self.ClickReturn = function() {
        EventDispatcher.DispatchEvent('OrderList.order.return', {id: self.id, fn: function(){
            Routing.SetHash('purchases', 'Мои покупки', {id: self.id})
        }});
    };
    self.viewCanсel = ko.computed(function() {
        var s = data.status_order;
        if ((s == 'init' || s == 'new') && data.status_pay != 'paid')
            return true;
        return false;
    }, this);
    self.ClickCancel = function() {
        EventDispatcher.DispatchEvent('OrderList.order.cancel', {id: self.id, fn: function(){
            Routing.SetHash('purchases', 'Мои покупки', {block: 'list', page: Routing.GetCurrentPage()})
        }})
    };
    self.viewDelete = ko.computed(function() {
        var s = data.status_order;
        if (s == 'init' || s == 'cancel')
            return true;
        return false;
    }, this);
    self.ClickDelete = function() {
        EventDispatcher.DispatchEvent('OrderList.order.delete', {id: self.id, fn: function(){
            Routing.SetHash('purchases', 'Мои покупки', {block: 'list', page: Routing.GetCurrentPage()})
        }})
    };
    self.viewCheck = ko.computed(function() {
        var s = data.status_order;
        if (s == 'init')
            return true;
        return false;
    }, this);
    self.ClickCheck = function() {
       EventDispatcher.DispatchEvent('OrderList.order.check', {id: self.id, fn: function(){
            Routing.SetHash('purchases', 'Мои покупки', {block: 'list', page: Routing.GetCurrentPage()})
        }})
    };
    self.viewPay = ko.computed(function() {
        var s = data.status_order;
        if (s == 'new')
            return true;
        return false;
    }, this);
    self.ClickPay = function() {
        EventDispatcher.DispatchEvent('OrderList.order.pay', {id: self.id, fn: function(){}})
    };
    self.emptyTd = ko.observableArray();
    self.countEmptyTd = function() {
        var count = 0;
        if(self.viewShow())
            count++;
        if(self.viewEdit())
            count++;
        if(self.viewRepeat())
            count++;
        if(self.viewReturn())
            count++;
        if(self.viewCanсel())
            count++;
        if(self.viewDelete())
            count++;
        for(var i = 1; i <=5 - count; i++){
           self.emptyTd.push({id: i}); 
        }
    };
    self.countEmptyTd();
};

var TestOrderList = {
    Init: function() {
        if (typeof Widget == 'function') {
            OrderListWidget.prototype = new Widget();
            var orderList = new OrderListWidget();
            orderList.Init(orderList);
        }
        else {
            setTimeout(function() {
                TestOrderList.Init()
            }, 100);
        }
    }
};

TestOrderList.Init();


