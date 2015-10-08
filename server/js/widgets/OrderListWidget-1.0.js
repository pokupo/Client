var OrderListWidget = function () {
    var self = this;
    self.widgetName = 'OrderListWidget';
    self.version = 1.0;
    self.minWidgetVersion = 1.0;
    self.maxWidgetVersion = 2.0;
    self.minTmplVersion = 1.0;
    self.maxTmplVersion = 2.0;
    self.currentPage = 1;
    self.InitWidget = InitWidget;

    var settings = {
        container:  {widget: 'content', def: 'defaultOrderListWidgetId'},
        tmpl : {
            path : "orderListTmpl.html", // файл шаблонов
            id : {
                list : "orderListTmpl", //id шаблона списка заказов
                empty : 'orderEmptyListTmpl', //id шаблона пустого списка
                detail : "orderDetailTmpl" //id шаблона списка заказов
            }
        },
        message : {
            orderConfirm : 'Ваш заказ подтвержден.',
            orderRepeat : "Ваш заказ повторен.",
            orderReturn : "Ваш заказ скопирован в корзину.",
            orderDelete : "Ваш заказ удален.",
            orderCancel : "Ваш заказ отменен.",
            confirmCancelOrder : 'Вы уверены, что хотите отменить заказ?',
            confirmDeleteOrder : 'Вы уверены, что хотите удалить заказ?'
        },
        show: {
            menu: true
        },
        animate: typeof AnimateOrderList == 'function' ? AnimateOrderList : null
    },
        alias = 'order',
        title = 'Оформление заказа';
    function InitWidget() {
        SetInputParameters();
        RegisterEvents();
        CheckRouteListOrder();
    }
    function SetInputParameters() {
        var input = self.GetInputParameters('orderList');

        if (!$.isEmptyObject(input)) {
            settings = self.UpdateSettings1(settings, input);
            if (input.show) {
                if (input.show.hasOwnProperty('menu')) {
                    settings.show.menu = input.show.menu;
                }
            }
        }

        Config.OrderList = settings;
    }

    function CheckRouteListOrder() {
        if (Routing.route == 'purchases') {
            self.WidgetLoader(false);
            self.BaseLoad.Login(false, false, false, function (data) {
                if (!data.err) {
                    self.BaseLoad.Tmpl(settings.tmpl, function () {
                        if (settings.show.menu)
                            UpdateMenu();
                        UpdateContent();
                    });
                }
                else {
                    Parameters.cache.lastPage = {route: 'default'};
                    SetHash('login', 'Авторизация пользователя', {});
                    self.WidgetLoader(true);
                }
            });
        }
        else
            self.WidgetLoader(true);
    }

    function RegisterEvents() {
        self.AddEvent('w.change.route', function () {
            CheckRouteListOrder();
        });

        self.AddEvent('LOrder.repeat', function (opt) {
            self.BaseLoad.RepeatOrder(opt.id, function (data) {
                if (self.QueryError(data, function () {
                        self.DispatchEvent('LOrder.repeat', opt)
                    })) {
                    self.ShowMessage(settings.message.orderRepeat, function () {
                        Parameters.cache.orderList = {};
                        self.DispatchEvent('LOrder.edit', {id: data.id});
                    }, false);
                }
            });
        });

        self.AddEvent('LOrder.return', function (opt) {
            self.BaseLoad.ReturnOrder(opt.id, function (data) {
                if (self.QueryError(data, function () {
                        self.DispatchEvent('LOrder.return', opt)
                    })) {
                    self.ShowMessage(settings.message.orderReturn, function () {
                        Parameters.cache.orderList = {};
                        SetHash('cart', 'Моя корзина')
                    }, false);
                }
            });
        });

        self.AddEvent('LOrder.cancel', function (opt) {
            self.Confirm(settings.message.confirmCancelOrder, function () {
                self.BaseLoad.CancelOrder(opt.id, function (data) {
                    if (self.QueryError(data, function () {
                            self.DispatchEvent('LOrder.cancel', opt)
                        })) {
                        self.ShowMessage(settings.message.orderCancel, function () {
                            Parameters.cache.orderList = {};
                            opt.fn()
                        }, false);
                    }
                });
            })
        });

        self.AddEvent('LOrder.check', function (opt) {
            self.BaseLoad.ConfirmOrder(opt.id, function (data) {
                if (data.err) {
                    self.ShowMessage(data.msg, function () {
                        if (data.err == "Not defined Payment Method")
                            SetHash(alias, title, {step: 4, id: opt.id});
                        else
                            SetHash(alias, title, {step: 2, id: opt.id});
                    });
                }
                else {
                    self.ShowMessage(settings.message.orderConfirm, function () {
                        Parameters.cache.orderList = {};
                        opt.fn()
                    });
                }
            });
        });

        self.AddEvent('LOrder.delete', function (opt) {
            self.Confirm(settings.confirmDeleteOrder, function () {
                self.BaseLoad.DeleteOrder(opt.id, function (data) {
                    if (self.QueryError(data, function () {
                            self.DispatchEvent('LOrder.delete', opt)
                        })) {
                        self.ShowMessage(settings.message.orderDelete, function () {
                            Parameters.cache.orderList = {};
                            opt.fn()
                        }, false);
                    }
                });
            });
        });

        self.AddEvent('LOrder.edit', function (opt) {
            SetHash(alias, title, {step: 2, id: opt.id});
        });

        self.AddEvent('LOrder.pay', function (opt) {
        });
    }

    function UpdateContent() {
        self.WidgetLoader(false);
        if (Routing.params.block == 'list') {
            self.currentPage = Routing.GetCurrentPage();
            FillList();
        }
        else if (Routing.params.block == 'detail' && Routing.params.id)
            self.BaseLoad.Script(PokupoWidgets.model.order, function () {
                FillDetail(Routing.params.id);
            });
    }

    function UpdateMenu() {
        self.BaseLoad.Script(PokupoWidgets.model.menu, function () {
            self.DispatchEvent('w.onload.menu', {menu: {}, active: ''});
        });
    }

    function InsertContainerEmptyWidget() {
        self.ClearContainer(settings);
    }

    function InsertContainerList() {
        self.InsertContainer(settings, 'list');
    }

    function InsertContainerDetail() {
        self.InsertContainer(settings, 'detail');
    }

    function InsertContainerEmptyList() {
        self.InsertContainer(settings, 'empty');
    }

    function FillList() {
        var start = Routing.GetCurrentPage() * Config.Paging.itemsPerPage - Config.Paging.itemsPerPage;
        var query = '/' + start + '/' + Config.Paging.itemsPerPage;
        self.BaseLoad.OrderList(query, function (data) {
            if (!data.err) {
                InsertContainerList();
                var list = new OrderListViewModel();
                list.AddContent(data);
                RenderList(list);
            }
            else {
                InsertContainerEmptyList();
                RenderEmptyList();
            }
        });
    }

    function FillDetail(id) {
        self.BaseLoad.OrderInfo(id + '/yes', function (data) {
            if (!data.err) {
                if (data.goods.length > 0) {
                    InsertContainerDetail();
                    var order = Parameters.cache.order.info,
                        pAlias = 'purchases',
                        pTitle = 'Мои покупки';
                    if ($.isEmptyObject(order)) {
                        OrderViewModel.prototype.Back = function () {
                            SetHash(pAlias, pTitle, {
                                block: 'list',
                                page: Routing.GetLastPageNumber()
                            });
                        };
                        OrderViewModel.prototype.ClickEdit = function () {
                            self.DispatchEvent('LOrder.edit', {id: id});
                        };
                        OrderViewModel.prototype.ClickDelete = function () {
                            self.DispatchEvent('LOrder.delete', {
                                id: id, fn: function () {
                                    SetHash(pAlias, pTitle, {block: 'list', page: 1})
                                }
                            })
                        };
                        OrderViewModel.prototype.ClickCancel = function () {
                            self.DispatchEvent('LOrder.cancel', {
                                id: id, fn: function () {
                                    SetHash(pAlias, pTitle, {block: 'list', page: 1})
                                }
                            })
                        };
                        OrderViewModel.prototype.ClickPay = function () {
                            self.DispatchEvent('LOrder.pay', {
                                id: id, fn: function () {
                                }
                            })
                        };
                        OrderViewModel.prototype.ClickCheck = function () {
                            self.DispatchEvent('LOrder.check', {
                                id: id, fn: function () {
                                    SetHash(pAlias, pTitle, {
                                        block: 'detail',
                                        id: Routing.params.id
                                    })
                                }
                            })
                        };
                        OrderViewModel.prototype.ClickRepeat = function () {
                            self.DispatchEvent('LOrder.repeat', {id: id})
                        };
                        OrderViewModel.prototype.ClickReturn = function () {
                            self.DispatchEvent('LOrder.return', {id: id})
                        };
                        order = new OrderViewModel(settings);
                        Parameters.cache.order.info = order;
                    }
                    order.AddContent(data);
                    RenderDetail(order);
                }
            }
            else {
                self.WidgetLoader(true, settings.container.widget);
                self.ShowMessage(data.msg, function () {
                    SetHash('purchases', 'Мои покупки', {block: 'list', page: 1});
                });
            }
        });
    }

    function RenderList(data) {
        self.RenderTemplate(data, settings, null,
            function(data){
                InsertContainerList();
                RenderList(data)
            },
            function(){
                InsertContainerEmptyWidget();
            },
            'list'
        );
    }

    function RenderEmptyList() {
        self.WidgetLoader(true, settings.container.widget);
        if (settings.animate)
            settings.animate();
    }

    function RenderDetail(data) {
        self.RenderTemplate(data, settings, null,
            function(data){
                InsertContainerDetail();
                RenderDetail(data);
            },
            function(){
                InsertContainerEmptyWidget();
            },
            'detail'
        );
    }

    function SetHash(alias, title, params){
        Routing.SetHash(alias, title, params);
    }
};

var OrderListViewModel = function () {
    var self = this;
    self.list = ko.observableArray();
    self.paging = ko.observableArray();
    self.count = 0;

    self.AddContent = function (data) {
        self.list = ko.observableArray();
        $.each(data, function (i) {
            if (i == 'count_order')
                self.count = data[i];
            else
                self.list.push(new OrderListDetailViewModel(data[i]));
        });
        self.AddPages();
    };
    self.AddPages = function () {
        var ClickLinkPage = function () {
            Loader.Indicator('OrderListWidget', false);

            Routing.UpdateHash({page: this.pageId});
        }

        self.paging = Paging.GetPaging(self.count, {paging: Config.Paging}, ClickLinkPage);
    }
    self.ClickRefresh = function () {
        Parameters.cache.orderList = {};
        Routing.SetHash('purchases', 'Мои покупки', {block: 'list'})
    };
};

var OrderListDetailViewModel = function (data) {
    var self = this,
        alias = 'purchases',
        title = 'Мои покупки';
    self.id = data.id;
    self.cssFloatPopup = 'order_item';
    self.dateCreate = data.date_create;
    self.commentBuyer = data.comment_buyer;
    self.commentOperator = data.comment_operator;
    self.nameShop = data.name_shop;
    self.costShipping = data.cost_shipping;
    self.costPayment = data.cost_payment;
    self.sellCost = data.sell_cost;
    self.finalCost = data.final_cost;
    self.GetNamePay = function (status) {
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
    self.GetNameOrder = function (status) {
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
    self.statusPay = data.status_pay;
    self.statusPayName = self.GetNamePay(data.status_pay);
    self.statusOrder = data.status_order;
    self.statusOrderName = self.GetNameOrder(data.status_order);

    self.viewShow = ko.computed(function () {
        return true;
    }, this);
    self.ClickShow = function () {
        SetHash(alias, title, {block: 'detail', id: self.id});
    };
    self.viewEdit = ko.computed(function () {
        var s = data.status_order;
        if (s == 'init')
            return true;
        return false;
    }, this);
    self.ClickEdit = function () {
        DispatchEvent('LOrder.edit', {id: self.id});
    };
    self.viewRepeat = ko.computed(function () {
        var s = data.status_order;
        if (s == 'delivered' || s == 'send' || s == 'cancel')
            return true;
        return false;
    }, this);
    self.ClickRepeat = function () {
        DispatchEvent('LOrder.repeat', {id: self.id});
    };
    self.viewReturn = ko.computed(function () {
        var s = data.status_order;
        if (s == 'delivered' || s == 'send' || s == 'cancel')
            return true;
        return false;
    }, this);
    self.ClickReturn = function () {
        DispatchEvent('LOrder.return', {
            id: self.id, fn: function () {
                SetHash(alias, title, {id: self.id})
            }
        });
    };
    self.viewCanсel = ko.computed(function () {
        var s = data.status_order;
        if ((s == 'init' || s == 'new') && data.status_pay != 'paid')
            return true;
        return false;
    }, this);
    self.ClickCancel = function () {
        DispatchEvent('LOrder.cancel', {
            id: self.id, fn: function () {
                SetHash(alias, title, {block: 'list', page: Routing.GetCurrentPage()})
            }
        })
    };
    self.viewDelete = ko.computed(function () {
        var s = data.status_order;
        if (s == 'init' || s == 'cancel')
            return true;
        return false;
    }, this);
    self.ClickDelete = function () {
        DispatchEvent('LOrder.delete', {
            id: self.id, fn: function () {
                SetHash(alias, title, {block: 'list', page: Routing.GetCurrentPage()})
            }
        })
    };
    self.viewCheck = ko.computed(function () {
        var s = data.status_order;
        if (s == 'init')
            return true;
        return false;
    }, this);
    self.ClickCheck = function () {
        DispatchEvent('LOrder.check', {
            id: self.id, fn: function () {
                SetHash(alias, title, {block: 'list', page: Routing.GetCurrentPage()})
            }
        })
    };
    self.viewPay = ko.computed(function () {
        var s = data.status_order;
        if (s == 'new')
            return true;
        return false;
    }, this);
    self.ClickPay = function () {
        DispatchEvent('LOrder.pay', {
            id: self.id, fn: function () {
            }
        })
    };
    self.emptyTd = ko.observableArray();
    function countEmptyTd() {
        var count = 0;
        if (self.viewShow())
            count++;
        if (self.viewEdit())
            count++;
        if (self.viewRepeat())
            count++;
        if (self.viewReturn())
            count++;
        if (self.viewCanсel())
            count++;
        if (self.viewDelete())
            count++;
        for (var i = 1; i <= 5 - count; i++) {
            self.emptyTd.push({id: i});
        }
    }

    function DispatchEvent(event, data){
        EventDispatcher.DispatchEvent(event, data);
    }
    function SetHash(alias, title, params){
        Routing.SetHash(alias, title, params);
    }

    countEmptyTd();
};

var TestOrderList = {
    Init: function () {
        if (typeof Widget == 'function') {
            OrderListWidget.prototype = new Widget();
            var orderList = new OrderListWidget();
            orderList.Init(orderList);
        }
        else {
            setTimeout(function () {
                TestOrderList.Init()
            }, 100);
        }
    }
};

TestOrderList.Init();


