var OrderWidget = function() {
    var self = this;
    self.widgetName = 'OrderWidget';
    self.settings = {
        containerFormId: null,
        tmplPath: null,
        ordFormStep1TmplId: null,
        ordFormStep1ConfirmTmplId: null,
        ordFormStep1ProfileTmplId: null,
        ordFormStep3TmplId: null,
        ordFormStep2TmplId: null,
        ordFormStep2DeliveryTmplId: null,
        ordFormStep4TmplId: null,
        ordFormStep5TmplId: null,
        inputParameters: {},
        style: null
    };
    self.order = {
        type: null, // fromCart || directly
        id: null,
        sellerId: null,
        goodsId: null,
        count: null,
        content: null,
        delivery: {},
        shipping: {},
        payment: {}
    };
    self.InitWidget = function() {
        self.settings.containerFormId = Config.Containers.order.widget;
        self.settings.tmplPath = Config.Order.tmpl.path;
        self.settings.ordFormStep1TmplId = Config.Order.tmpl.ordFormStep1TmplId;
        self.settings.ordFormStep1ConfirmTmplId = Config.Order.tmpl.ordConfirmFormStep1TmplId;
        self.settings.ordFormStep1ProfileTmplId = Config.Order.tmpl.ordProfileFormStep1TmplId
        self.settings.ordFormStep3TmplId = Config.Order.tmpl.ordFormStep3TmplId;
        self.settings.ordFormStep2TmplId = Config.Order.tmpl.ordFormStep2TmplId;
        self.settings.ordFormStep2DeliveryTmplId = Config.Order.tmpl.ordDeliveryFormStep2TmplId;
        self.settings.ordFormStep4TmplId = Config.Order.tmpl.ordFormStep4TmplId;
        self.settings.ordFormStep5TmplId = Config.Order.tmpl.ordFormStep5TmplId;
        self.settings.style = Config.Order.style;
        self.SetInputParameters();
        self.RegisterEvents();
        self.SetPosition();
    };
    self.SetInputParameters = function() {
        var input = {};
        if (Config.Base.sourceParameters == 'string') {
            var temp = JSCore.ParserInputParameters(/OrderWidget.js/);
            if (temp.order) {
                input = temp.order;
            }
        }
        if (Config.Base.sourceParameters == 'object' && typeof WParameters !== 'undefined' && WParameters.order) {
            input = WParameters.order;
        }

        if (!$.isEmptyObject(input)) {
            if (input.tmpl)
                self.settings.tmplPath = 'order/' + input.tmpl + '.html';
        }
        self.settings.inputParameters = input;
    };
    self.CheckRouteOrder = function() {
        if (Routing.route == 'order') {
            self.WidgetLoader(false);
            if (Routing.params.create) {
                self.BaseLoad.Login(false, false, false, function(data) {
                    if (Routing.params.create == 'fromCart') {
                        if (data.err) {
                            self.order.type = 'cart';
                            self.order.sellerId = Routing.params.sellerId;
                            self.order.goodsId = null;
                            self.order.count = null

                            setTimeout(function() {
                                Routing.SetHash('order', 'Оформление заказа', {step: 1});
                            }, 1000);
                        }
                        else {
                            self.DataOrder.Create(
                                    {create: 'fromCart', sellerId: Routing.params.sellerId},
                            function() {
                                self.order.type = 'cart';
                                self.order.sellerId = Routing.params.sellerId;
                                self.DataOrder.Cart(function() {
                                    Routing.SetHash('order', 'Оформление заказа', {step: 2});
                                });
                            }
                            );
                        }
                    }
                    else if (Routing.params.create == 'directly') {
                        if (data.err) {
                            self.order.type = 'directly';
                            self.order.sellerId = Routing.params.sellerId;
                            self.order.goodsId = Routing.params.goodsId;
                            self.order.count = Routing.params.count;

                            setTimeout(function() {
                                Routing.SetHash('order', 'Оформление заказа', {step: 1});
                            }, 1000);
                        }
                        else {
                            self.DataOrder.Create(
                                    {create: 'directly', sellerId: Routing.params.sellerId, goodsId: Routing.params.goodsId, count: Routing.params.count},
                            function() {
                                self.order.type = 'directly';
                                self.order.sellerId = Routing.params.sellerId;
                                self.order.goodsId = Routing.params.goodsId;
                                self.order.count = Routing.params.count;
                                self.DataOrder.Directly(function() {
                                    Routing.SetHash('order', 'Оформление заказа', {step: 2});
                                });
                            }
                            );
                        }
                    }
                    else
                        Routing.SetHash('default', 'Домашняя', {});
                });
            }
            if (Routing.params.step) {
                self.BaseLoad.Login(false, false, false, function(data) {
                    if(Routing.params.id)
                        self.order.id = Routing.params.id;
                
                    if (Routing.params.step == 1 && !Routing.params.block) {
                        if (data.err)
                            self.Step.Step1();
                        else
                            Routing.SetHash('order', 'Оформление заказа', {step: 2});
                    }
                    else if (Routing.params.step == 1 && Routing.params.block == 'confirm') {
                        self.Step.Step1Confirm();
                    }
                    else if (!data.err && Routing.params.step == 1 && Routing.params.block == 'profile' && self.order.id) {
                        self.Step.Step1Profile();
                    }
                    else if (!data.err && Routing.params.step == 2 && !Routing.params.block && self.order.id)
                        self.Step.Step2();
                    else if (!data.err && Routing.params.step == 2 && Routing.params.block == 'add' && self.order.id)
                        self.Step.Step2Form();
                    else if (!data.err && Routing.params.step == 3 && self.order.id)
                        self.Step.Step3();
                    else if (!data.err && Routing.params.step == 4 && self.order.id)
                        self.Step.Step4();
                    else if (Routing.params.step == 5)
                        self.Step.Step5();
                    else
                        Routing.SetHash('default', 'Домашняя', {});
                });
            }
        }
        else
            self.WidgetLoader(true);
    };
    self.RegisterEvents = function() {
        if (JSLoader.loaded) {
            self.BaseLoad.Tmpl(self.settings.tmplPath, function() {
                self.CheckRouteOrder();
            });
        }
        else {
            EventDispatcher.AddEventListener('onload.scripts', function(data) {
                self.BaseLoad.Tmpl(self.settings.tmplPath, function() {
                    self.CheckRouteOrder();
                });
            });
        }

        EventDispatcher.AddEventListener('widget.change.route', function() {
            self.CheckRouteOrder();
        });

        EventDispatcher.AddEventListener('UserInformationWidget.click.logout', function() {
            Parameters.cache.order.step1.login = {};
            Parameters.cache.order.step1.reg = {};
            Parameters.cache.order.step1.confirm = {};
            Parameters.cache.order.step1.profile = {};
            Parameters.cache.order.step2 = {};
            Parameters.cache.order.step3 = {};
            Parameters.cache.order.step4 = {};
            Parameters.cache.order.step5 = {};
            Parameters.cache.payment = null;
            Parameters.cache.shipping = null;
            Parameters.cache.delivery = null;
            Parameters.cache.profile.personal = {};
            self.order.type = null;
            self.order.id = null;
            self.order.sellerId = null;
            self.order.goodsId = null;
            self.order.count = null;
            self.order.content = null;
            self.order.delivery = {};
            self.order.shipping = {};
            self.order.payment = {};
        });
        
        EventDispatcher.AddEventListener('OrderWidget.step1.authentication', function(data) {
            self.BaseLoad.Login(data.username, data.password, data.rememberMe, function(request) {
                if (request.err) {
                    Parameters.cache.order.step1.reg.loginForm.error("Ошибка в логине или пароле");
                    Parameters.cache.order.step1.reg.loginForm.password = null;
                    self.Render.Step1(Parameters.cache.order.step1.reg);
                }
                else {
                    if (self.order.type == 'directly') {
                        self.DataOrder.Create(
                                {create: 'directly', sellerId: self.order.sellerId, goodsId: self.order.goodsId, count: self.order.count},
                        function() {
                            self.DataOrder.Directly(function() {
                                Routing.SetHash('order', 'Оформление заказа', {step: 2});
                            });
                        }
                        );
                    }
                    if (self.order.type == 'cart') {
                        self.DataOrder.Create(
                                {create: 'directly', sellerId: self.order.sellerId},
                        function() {
                            self.DataOrder.Cart(function() {
                                Routing.SetHash('order', 'Оформление заказа', {step: 2});
                            });
                        }
                        );
                    }
                }
            })
        });

        EventDispatcher.AddEventListener('OrderWidget.step1.registration', function(step1) {
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
                if (self.QueryError(data, function() {
                    EventDispatcher.DispatchEvent('OrderWidget.step1.registration', step1)
                })) {
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
                        params.push('email=' + step1.email());
                    if (step1.firstPassword())
                        params.push('password=' + encodeURIComponent(step1.firstPassword()));
                    if (params.length > 0)
                        var str = '?' + params.join('&');
                    self.BaseLoad.Registration(str, function(data) {
                        Parameters.cache.order.step1.reg = step1;
                        Routing.SetHash('order', 'Оформление заказа', {step: 1, block: 'confirm'});
                    });
                }
                else
                    self.WidgetLoader(true);
            });
        });

        EventDispatcher.AddEventListener('OrderWidget.step1.confirm', function(step1confirm) {
            self.WidgetLoader(false);
            var params = [];
            params.push('username=' + encodeURIComponent(step1confirm.username));
            if (!step1confirm.mailConfirmLater())
                params.push('mail_token=' + step1confirm.mailToken());
            if (!step1confirm.phoneConfirmLater())
                params.push('sms_token=' + step1confirm.phoneToken());
            var str = '?' + params.join('&');

            self.BaseLoad.ActivateUser(str, function(data) {
                var test = true;
                if (self.QueryError(data, function() {
                    EventDispatcher.DispatchEvent('OrderWidget.step1.confirm', step1confirm)
                })) {
                    if (!self.Validate.MailToken(data, step1confirm))
                        test = false;
                    if (!self.Validate.PhoneToken(data, step1confirm))
                        test = false;
                }
                else
                    test = false;

                if (test) {
                    self.BaseLoad.Login(false, false, false, function(request) {
                        Parameters.cache.order.step1.confirm = step1confirm;
                        if (!request.err) {
                            if (self.order.type == 'directly') {
                                self.DataOrder.Create(
                                        {create: 'directly', sellerId: self.order.sellerId, goodsId: self.order.goodsId, count: self.order.count},
                                function() {
                                    self.DataOrder.Directly(function() {
                                        Routing.SetHash('order', 'Оформление заказа', {step: 1, block: 'profile'});
                                    });
                                }
                                );
                            }
                            if (self.order.type == 'fromCart') {
                                self.DataOrder.Create(
                                        {create: 'directly', sellerId: self.order.sellerId},
                                function() {
                                    self.DataOrder.Cart(function() {
                                        Routing.SetHash('order', 'Оформление заказа', {step: 1, block: 'profile'});
                                    });
                                }
                                );
                            }
                        }
                    });
                }
                else
                    self.WidgetLoader(true);
            });
        });

        EventDispatcher.AddEventListener('OrderWidget.step1.view1', function() {
            Routing.SetHash('order', 'Оформление заказа', {step: 1});
        });

        EventDispatcher.AddEventListener('OrderWidget.step1.later', function() {
            Routing.SetHash('order', 'Оформление заказа', {step: 2});
        });

        EventDispatcher.AddEventListener('OrderWidget.step1.profile', function(step1) {
            self.WidgetLoader(false);
            var day = step1.birthDay().split('.');
            var birthDay = day[2] + '-' + day[1] + '-' + day[0];
            step1.birthDayHiddenField(birthDay);
            self.BaseLoad.EditProfile($('form#' + step1.cssRegistrationDataForm), function(data) {
                var test = true;
                if (!self.QueryError(data, function() {
                    EventDispatcher.DispatchEvent('OrderWidget.step1.profile', step1)
                }))
                    test = false;

                if (test) {
                    Parameters.cache.profile.personal = {};
                    Parameters.cache.order.step1.profile = step1;
                    Routing.SetHash('order', 'Оформление заказа', {step: 2});
                }
                else
                    self.WidgetLoader(true);
            });
        });

        EventDispatcher.AddEventListener('OrderWidget.step3.change', function(data) {
            self.BaseLoad.EditOrder(self.order.id + '?id_method_shipping=' + data.id(), function(result) {
                if (self.QueryError(result, function() {EventDispatcher.DispatchEvent('OrderWidget.step3.change', data)})){
                    self.order.shipping = data;
                }
            })
        });

        EventDispatcher.AddEventListener('OrderWidget.step3.message', function() {
            self.ShowMessage(Config.Order.message.selectMethodShipping, false, false);
        });

        EventDispatcher.AddEventListener('OrderWidget.step2.add', function(data) {
            var str = '?id_country=' + encodeURIComponent($.trim(data.country().id));
            if (data.region())
                str = str + '&code_region=' + encodeURIComponent($.trim(data.region().regioncode));
            else
                str = str + '&name_region=' + encodeURIComponent($.trim(data.customRegion()));
            if (data.city())
                str = str + '&code_city=' + encodeURIComponent($.trim(data.city().aoguid));
            else
                str = str + '&name_city=' + encodeURIComponent($.trim(data.customCity()));
            str = str + '&address=' + encodeURIComponent($.trim(data.customAddress())) +
                    '&post_code=' + encodeURIComponent($.trim(data.postCode())) +
                    '&addressee=' + encodeURIComponent($.trim(data.addressee())) +
                    '&contact_phone=' + encodeURIComponent($.trim(data.contactPhone())) +
                    '&is_default=' + encodeURIComponent(data.isDefault() ? 'yes' : 'no');

            self.BaseLoad.AddDelivaryAddress(str, function(response) {
                if (response.result == 'ok') {
                    self.ShowMessage(Config.Order.message.addAddressDelivery, function() {
                        Parameters.cache.order.step2 = {};
                        Parameters.cache.delivery = null;
                        Routing.SetHash('order', 'Оформление заказа', {step: 2});
                    }, false);
                }
                else {
                    if (!response.err)
                        response.err = Config.Order.message.failAddAddressDelivery;
                    self.QueryError(response, function() {
                        EventDispatcher.DispatchEvent('OrderWidget.step2.add', data)
                    })
                }
            });
        });

        EventDispatcher.AddEventListener('OrderWidget.step2.change', function(data) {
            self.BaseLoad.EditOrder(self.order.id + '?id_shipping_address=' + data.id, function(result) {
                if (self.QueryError(result, function() {EventDispatcher.DispatchEvent('OrderWidget.step2.change', data)})) {
                    Parameters.cache.delivery = null;
                    self.order.delivery = data;
                }
            });
        });

        EventDispatcher.AddEventListener('OrderWidget.step2.delete', function(delivery) {
            self.BaseLoad.DeleteDeliveryAddress(delivery.address.id, function(data) {
                if (data.result == 'ok') {
                    self.ShowMessage(Config.Order.message.deleteAddressDelivery, function() {
                        Parameters.cache.order.step2 = {};
                        Parameters.cache.delivery = null;
                        delivery.list.remove(delivery.address);
                    }, false);
                }
                else {
                    if (!data.err)
                        data.err = Config.Order.message.failDeleteAddressDelivery;
                    self.QueryError(data, function() {
                        EventDispatcher.DispatchEvent('OrderWidget.step2.delete', delivery)
                    })
                }
            });
        });

        EventDispatcher.AddEventListener('OrderWidget.step2.message', function() {
            self.ShowMessage(Config.Order.message.selectAddress, false, false);
        });

        EventDispatcher.AddEventListener('OrderWidget.step4.change', function(data) {
            self.BaseLoad.EditOrder(self.order.id + '?id_method_payment=' + data.id(), function(result) {
                if (self.QueryError(result, function() {EventDispatcher.DispatchEvent('OrderWidget.step4.change', data)})){
                    self.order.payment = data;
                }
            });
        });

        EventDispatcher.AddEventListener('OrderWidget.step4.message', function() {
            self.ShowMessage(Config.Order.message.selectMethodPayment, false, false);
        });


        EventDispatcher.AddEventListener('OrderWidget.step5.confirm', function(text) {
            var str = self.order.id;
            if(text.comment)
                str = str + '?comment_buyer=' + encodeURIComponent(text.comment);
            self.BaseLoad.ConfirmOrder(str, function(data) {
                if (self.QueryError(data, function() {
                    EventDispatcher.DispatchEvent('OrderWidget.step5.confirm', text)
                }))
                    self.ShowMessage(Config.Order.message.orderConfirm, function() {
                        Routing.SetHash('purchases', 'Мои покупки', {block: 'detail', id: self.order.id});
                    }, false);
                })
        });
        
        EventDispatcher.AddEventListener('OrderWidget.step5.delete', function(){
            self.Confirm(Config.Order.message.confirmDeleteOrder, function(){
                self.BaseLoad.DeleteOrder(self.order.id + '/yes', function(data){
                    if (self.QueryError(data, function() {EventDispatcher.DispatchEvent('OrderWidget.step5.delete')})){
                        self.ShowMessage(Config.Order.message.deleteOrderConfirm, function() {
                            Routing.SetHash('default', 'Домашняя', {});
                        }, false);
                    }
                });
            })
        });
        
        EventDispatcher.AddEventListener('OrderWidget.send.token', function(type){
            self.BaseLoad.SendToken(type, function(data){
                if(data.result == 'ok'){
                    self.ShowMessage(Config.Order.message.sendToken, false, false);
                }
                else{
                    if(!data.err)
                        data.err = Config.Order.message.failSendToken;
                    self.QueryError(data, function(){EventDispatcher.DispatchEvent('OrderWidget.send.token', type)})
                }
            });
        });
    };
    self.Validate = {
        Username: function(data, step1) {
            var test = false;
            if (data.check_username) {
                if (data.check_username == 'on' || data.check_username == 'ban' || data.check_username == 'off')
                    step1.errorUsername(Config.Order.error.username.uniq);
                if (data.check_username == 'yes')
                    test = true;
            }

            return test;
        },
        Phone: function(data, step1) {
            var test = false;
            if (data.check_phone) {
                if (data.check_phone == 'on' || data.check_phone == 'ban' || data.check_phone == 'off')
                    step1.errorPhone(Config.Order.error.phone.uniq);
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
                    step1.errorEmail(Config.Order.error.email.uniq);
                if (data.check_email == 'yes')
                    test = true;
            }

            return test;
        },
        MailToken: function(data, step2) {
            if (data.confirm_email) {
                if (data.confirm_email == 'no') {
                    step2.errorEmailConfirm(Config.Order.error.emailToken.confirm);
                    return false;
                }
            }

            return true;
        },
        PhoneToken: function(data, step2) {
            if (data.confirm_phone) {
                if (data.confirm_phone == 'no') {
                    step2.errorPhoneConfirm(Config.Order.error.phoneToken.confirm);
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
    self.DataOrder = {
        Create: function(params, callback) {
            var str = params.sellerId;
            if (params.goodsId)
                str = str + '/' + params.goodsId + '/' + params.count;
            self.BaseLoad.NewOrder(str, function(data) {
                if (self.QueryError(data,
                        function() {Routing.SetHash('order', 'Оформление заказа', params);},
                        function() {var last = Parameters.cache.lastPage; Routing.SetHash(last.route, last.title, last.data)}))
                {
                    if (data.msg) {
                        self.ShowMessage(data.msg,
                                function() {
                                    var last = Parameters.cache.lastPage;
                                    Routing.SetHash(last.route, last.title, last.data);
                                }, false);
                    }
                    else {
                        self.order.id = data.id;
                        if (callback)
                            callback();
                    }
                }
            });
        },
        Cart: function(callback) {
            self.BaseLoad.CartGoods(self.order.sellerId, function(data) {
                self.order.content = data;
                if (callback)
                    callback();
            });
        },
        Directly: function(callback) {
            self.BaseLoad.GoodsInfo(self.order.goodsId, '1000000', function(data) {
                self.order.content = data;
                if (callback)
                    callback();
            })
        },
        IsRealGoods: function() {
            var test = false;
            var goods = [];
            if (self.order.type == 'cart') {
                goods = self.order.content[0].goods;
            }
            else {
                if(!$.isArray(self.order.content.main))
                    goods[0] = self.order.content.main;
                else
                    goods = self.order.content.main;
            }
            $.each(goods, function(i) {
                if (goods[i].is_egoods != 'yes') {
                    test = true;
                    return false;
                }
            })
            return test;
        }
    };
    self.Step = {
        Step1: function() {
            self.InsertContainer.Step1();
            self.Fill.Step1();
        },
        Step1Confirm: function() {
            self.InsertContainer.Step1Confirm();
            self.Fill.Step1Confirm();
        },
        Step1Profile: function() {
            self.BaseLoad.Profile(function(data) {
                self.InsertContainer.Step1Profile();
                self.Fill.Step1Profile(data);
            });
        },
        Step3: function() {
            if (self.DataOrder.IsRealGoods())
                self.BaseLoad.Shipping(self.order.id, function(data) {
                    self.InsertContainer.Step3();
                    self.Fill.Step3(data);
                });
            else
                Routing.SetHash('order', 'Оформление заказа', {step: 4});
        },
        Step2: function() {
            if(Routing.params.id){
                self.BaseLoad.OrderInfo(self.order.id + '/yes', function(data) {
                    if (self.QueryError(data,
                        function() {Routing.SetHash('order', 'Оформление заказа', Routing.params);},
                        function() {var last = Parameters.cache.lastPage; Routing.SetHash(last.route, last.title, last.data)}))
                    {
                        if (data.msg) {
                            self.ShowMessage(data.msg,
                                function() {
                                    var last = Parameters.cache.lastPage;
                                    if(last)
                                        Routing.SetHash(last.route, last.title, last.data);
                                    else
                                        Routing.SetHash('default', Routing.defaultTitle, {});
                                }, false);
                        }
                        else{
                            self.order.content = {};
                            self.order.content.main = data.goods;
                            self.Step.Step2Getdata();
                        }
                    }
                });
            }
            else
                self.Step.Step2Getdata();
        },
        Step2Getdata: function(){
            if (self.DataOrder.IsRealGoods())
                self.BaseLoad.DeliveryAddressList(function(data) {
                    self.InsertContainer.Step2();
                    self.Fill.Step2(data);
                });
            else
                Routing.SetHash('order', 'Оформление заказа', {step: 4});
        },
        Step2Form: function() {
            if (self.DataOrder.IsRealGoods()) {
                var form = new OrderDeliveryFormStep2ViewModel();
                var shopId = Parameters.shopId;

                self.BaseLoad.Country(shopId, function(data) {
                    self.InsertContainer.Step2Form();
                    self.Fill.Step2Form(form, data);
                });
            }
            else
                Routing.SetHash('order', 'Оформление заказа', {step: 4});
        },
        Step4: function() {
            self.BaseLoad.Payment(self.order.id, function(data) {
                self.InsertContainer.Step4();
                self.Fill.Step4(data);
            });
        },
        Step5: function() {
            self.BaseLoad.OrderInfo(self.order.id + '/yes', function(data) {
                self.InsertContainer.Step5();
                self.Fill.Step5(data);
            });
        }
    };
    self.InsertContainer = {
        Step1: function() {
            $("#" + self.settings.containerFormId).empty().append($('script#' + self.settings.ordFormStep1TmplId).html());
        },
        Step1Confirm: function() {
            $("#" + self.settings.containerFormId).empty().append($('script#' + self.settings.ordFormStep1ConfirmTmplId).html());
        },
        Step1Profile: function() {
            $("#" + self.settings.containerFormId).empty().append($('script#' + self.settings.ordFormStep1ProfileTmplId).html());
        },
        Step3: function() {
            $("#" + self.settings.containerFormId).empty().append($('script#' + self.settings.ordFormStep3TmplId).html());
        },
        Step2: function() {
            $("#" + self.settings.containerFormId).empty().append($('script#' + self.settings.ordFormStep2TmplId).html());
        },
        Step2Form: function() {
            $("#" + self.settings.containerFormId).empty().append($('script#' + self.settings.ordFormStep2DeliveryTmplId).html());
        },
        Step4: function() {
            $("#" + self.settings.containerFormId).empty().append($('script#' + self.settings.ordFormStep4TmplId).html());
        },
        Step5: function() {
            $("#" + self.settings.containerFormId).empty().append($('script#' + self.settings.ordFormStep5TmplId).html());
        }
    };
    self.Fill = {
        Step1: function() {
            var form = Parameters.cache.order.step1.reg;
            if ($.isEmptyObject(form)) {
                form = new OrderFormStep1ViewModel();
                Parameters.cache.order.step1.reg = form;
            }
            self.Render.Step1(form);
        },
        Step1Confirm: function() {
            if (Routing.params.username && Routing.params.mail_token) 
                Parameters.cache.order.step1.reg.username(Routing.params.username);

            RegistrationConfirmFormViewModel.prototype.Back = function() {
                EventDispatcher.DispatchEvent('OrderWidget.step1.view1');
            };
            var form = new RegistrationConfirmFormViewModel(Parameters.cache.order.step1.reg);
            form.submitEvent('OrderWidget.step1.confirm');
            form.ShowButtonSendToken();
            
            if (Routing.params.username && Routing.params.mail_token) {
                form.mailToken(Routing.params.mail_token);
                EventDispatcher.DispatchEvent('OrderWidget.step1.confirm', form);
            }
            self.Render.Step1Confirm(form);
        },
        Step1Profile: function(data) {
            RegistrationProfileFormViewModel.prototype.Back = function() {
                EventDispatcher.DispatchEvent('OrderWidget.step1.view2');
            };
            RegistrationProfileFormViewModel.prototype.SpecifyLater = function() {
                EventDispatcher.DispatchEvent('OrderWidget.step1.later');
            };
            var form = new RegistrationProfileFormViewModel();
            form.submitEvent('OrderWidget.step1.profile');
            form.AddContent(data);
            self.Render.Step1Profile(form);
        },
        Step2: function(data) {
            if(!data.err){
                var form = Parameters.cache.order.step2;
                if ($.isEmptyObject(form)) {
                    form = new OrderFormStep2ViewModel();
                    form.AddContent(data, self.order);
                }

                self.Render.Step2(form);
                Parameters.cache.order.step2 = form;
            }
            else
                Routing.SetHash('order', 'Оформление заказа', {step: 2, block: 'add'});
        },
        Step2Form: function(form, data) {
            form.AddCountryList(data);
            if (form.idCountry()) {
                $.grep(form.countryList(), function(data) {
                    if (data.id == form.idCountry()) {
                        form.country(data);
                    }
                })
            }
            self.Render.Step2Form(form);
        },
        Step3: function(data) {
            var form = Parameters.cache.order.step3;
            if ($.isEmptyObject(form)) {
                form = new OrderFormStep3ViewModel();
                form.AddShipping(data);
                Parameters.cache.order.step3 = form;
            }
            self.Render.Step3(form);
        },
        Step4: function(data) {
            var form = Parameters.cache.order.step4;
            if ($.isEmptyObject(form)) {
                form = new OrderFormStep4ViewModel();
                form.AddPayment(data);
                Parameters.cache.order.step4 = form;
            }
            self.Render.Step4(form);
        },
        Step5: function(data) {
            var form = Parameters.cache.order.step5;
            if ($.isEmptyObject(form)) {
                OrderViewModel.prototype.Back = function(){
                    Routing.SetHash('order', 'Оформление заказа', {step: 4});
                };
                OrderViewModel.prototype.ClickDelete = function(){
                    EventDispatcher.DispatchEvent('OrderWidget.step5.delete');
                };
                OrderViewModel.prototype.ClickStep1 = function(){
                    Routing.SetHash('order', 'Оформление заказа', {step: 1, block: 'profile'});
                };
                OrderViewModel.prototype.ClickStep2 = function() {
                    Routing.SetHash('order', 'Оформление заказа', {step: 2});
                };
                OrderViewModel.prototype.ClickStep3 = function() {
                    Routing.SetHash('order', 'Оформление заказа', {step: 3});
                };
                OrderViewModel.prototype.ClickStep4 = function() {
                    Routing.SetHash('order', 'Оформление заказа', {step: 4});
                };
                form = new OrderViewModel();
                
                Parameters.cache.order.step5 = form;
            }
            form.AddContent(data);

            self.Render.Step5(form);
        }
    };
    self.Render = {
        Step1: function(form) {
            if ($("#" + self.settings.containerFormId).length > 0) {
                ko.applyBindings(form, $("#" + self.settings.containerFormId)[0]);
            }
            $('input#' + form.registrationForm.cssPhone).mask("?9 999 999 99 99 99", {placeholder: "_"});

            delete form;
            self.WidgetLoader(true, self.settings.containerFormId);
        },
        Step1Confirm: function(form) {
            if ($("#" + self.settings.containerFormId).length > 0) {
                ko.applyBindings(form, $("#" + self.settings.containerFormId)[0]);
            }
            self.WidgetLoader(true,  self.settings.containerFormId);
        },
        Step1Profile: function(form) {
            if ($("#" + self.settings.containerFormId).length > 0) {
                ko.applyBindings(form, $("#" + self.settings.containerFormId)[0]);
            }
            $("#" + form.cssBirthDay).mask("99.99.9999", {placeholder: "_"}).datepicker({
                changeMonth: true,
                changeYear: true,
                dateFormat: 'dd.mm.yy',
                defaultDate: '-24Y',
                yearRange: "c-77:c+6",
                minDate: '-101Y',
                maxDate: '-18Y',
                onClose: function(dateText, inst) {
                    form.birthDay(dateText);
                }
            });
            self.WidgetLoader(true, self.settings.containerFormId);
        },
        Step3: function(form) {
            if ($("#" + self.settings.containerFormId).length > 0) {
                ko.applyBindings(form, $("#" + self.settings.containerFormId)[0]);
            }
            self.WidgetLoader(true, self.settings.containerFormId);
        },
        Step2: function(form) {
            if ($("#" + self.settings.containerFormId).length > 0) {
                ko.applyBindings(form, $("#" + self.settings.containerFormId)[0]);
            }
            self.WidgetLoader(true, self.settings.containerFormId);
        },
        Step2Form: function(delivery) {
            if ($("#" + self.settings.containerFormId).length > 0) {
                ko.applyBindings(delivery, $("#" + self.settings.containerFormId)[0]);
            }

            $('input#' + delivery.cssContactPhone).mask("?9 999 999 99 99 99", {placeholder: "_"});

            $('#' + delivery.cssRegionList).autocomplete({
                source: function(request, response) {
                    self.BaseLoad.Region(delivery.country().id + '/' + encodeURIComponent(request.term), function(data) {
                        if (!data.err) {
                            response($.map(data, function(item) {
                                return {
                                    value: $.trim(item.formalname + ' ' + item.shortname),
                                    region: item
                                };
                            }));
                        }
                        else {
                            $('#' + delivery.cssRegionList).autocomplete("close");
                            return false;
                        }
                    });
                },
                select: function(event, ui) {
                    delivery.region(ui.item.region);
                    delivery.customRegion(ui.item.value);
                    if (ui.item.region && ui.item.region.postalcode != 0)
                        delivery.postCode(ui.item.region.postalcode);
                    else {
                        delivery.postCode(null);
                    }
                }
            });

            $('#' + delivery.cssCityList).autocomplete({
                source: function(request, response) {
                    if (delivery.region()) {
                        self.BaseLoad.City(delivery.country().id + '/' + encodeURIComponent(delivery.region().regioncode) + '/' + encodeURIComponent(request.term), function(data) {
                            if (!data.err) {
                                response($.map(data, function(item) {
                                    return {
                                        value: $.trim(item.shortname + '. ' + item.formalname),
                                        city: item
                                    };
                                }));
                            }
                            else {
                                $('#' + delivery.cssCityList).autocomplete("close");
                                return false;
                            }
                        });
                    }
                },
                select: function(event, ui) {
                    delivery.city(ui.item.city);
                    delivery.customCity(ui.item.value);
                    if (ui.item.city && ui.item.city.postalcode != 0)
                        delivery.postCode(ui.item.city.postalcode);
                    else
                        delivery.postCode(null);
                }
            });

            $('#' + delivery.cssAddress).autocomplete({
                source: function(request, response) {
                    if (delivery.region()) {
                        self.BaseLoad.Street(delivery.country().id + '/' + encodeURIComponent(delivery.region().regioncode) + '/' + encodeURIComponent(delivery.city().aoguid) + '/' + encodeURIComponent(request.term), function(data) {
                            if (!data.err) {
                                response($.map(data, function(item) {
                                    return {
                                        value: $.trim(item.shortname + '. ' + item.formalname),
                                        street: item
                                    };
                                }));
                            }
                            else {
                                $('#' + delivery.cssAddress).autocomplete("close");
                                return false;
                            }
                        });
                    }
                },
                select: function(event, ui) {
                    delivery.address(ui.item.street);
                    delivery.customAddress(ui.item.value);
                    if (ui.item.street && ui.item.street.postalcode != 0)
                        delivery.postCode(ui.item.street.postalcode);
                    else
                        delivery.postCode(null);
                }
            });
            $('#' + delivery.cssCountryList).change(function() {
                var v = $('#' + delivery.cssCountryList + ' option:selected').val();
                $.grep(delivery.countryList(), function(data) {
                    if (data.id == v) {
                        delivery.country(data);
                        delivery.customRegion(null);
                        delivery.region(null);
                        delivery.customCity(null);
                        delivery.city(null);
                        delivery.customAddress(null)
                        delivery.address(null);
                        delivery.postCode(null);
                    }
                })
            });

            $('#' + delivery.cssRegionList).bind('textchange', function(event, previousText) {
                delivery.customRegion($(this).val());
                delivery.customCity(null);
                delivery.city(null);
                delivery.customAddress(null)
                delivery.address(null);
                delivery.postCode(null);
            });

            $('#' + delivery.cssCityList).bind('textchange', function(event, previousText) {
                delivery.customCity($(this).val());
                delivery.customAddress(null)
                delivery.address(null);
                delivery.postCode(null);
            });

            self.WidgetLoader(true, self.settings.containerFormId);
        },
        Step4: function(form) {
            if ($("#" + self.settings.containerFormId).length > 0) {
                ko.applyBindings(form, $("#" + self.settings.containerFormId)[0]);
            }
            self.WidgetLoader(true, self.settings.containerFormId);
        },
        Step5: function(form) {
            if ($("#" + self.settings.containerFormId).length > 0) {
                ko.applyBindings(form, $("#" + self.settings.containerFormId)[0]);
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
}

var OrderFormStep1ViewModel = function() {
    var self = this;
    self.loginForm = new OrderLoginFormStep1ViewModel();
    self.registrationForm = new RegistrationFormViewModel();
    self.registrationForm.submitEvent('OrderWidget.step1.registration');
};

var OrderLoginFormStep1ViewModel = function() {
    var self = this;
    self.username = null;
    self.password = null;
    self.rememberMe = null;
    self.error = ko.observable();

    self.Login = function(data) {
        self.username = $(data.username).val();
        self.password = $(data.password).val();
        self.rememberMe = $(data.remember_me).is(':checked') ? 'on' : 'off';
        EventDispatcher.DispatchEvent('OrderWidget.step1.authentication', self);
    };
    self.ForgotPassword = function() {
        window.location.href = 'https://' + window.location.hostname + '/resetting/request'
    };
};

var OrderFormStep2ViewModel = function() {
    var self = this;
    self.addressList = ko.observableArray();
    self.cssAddressList = 'delivary_address_list';
    self.checked = ko.observable();

    self.ClickAddAddress = function() {
        Routing.SetHash('order', 'Оформление заказа', {step: 2, block: 'add'});
    };
    self.AddContent = function(data, order) {
        if (!data.err)
            for (var key in data) {
                OrderItemFormStep2ViewModel.prototype = new Widget();
                var address = new OrderItemFormStep2ViewModel(data[key], self)
                self.addressList.push(address);
                if (data[key].is_default == 'yes'){
                    order.delivery = address;
                }
            }
    };
    self.HasAddress = function() {
        var test = false;
        $.each(self.addressList(), function(i) {
            if (self.addressList()[i].isDefault()) {
                test = true;
                return false;
            }
        })
        return test;
    };
    self.Back = function() {
        if($.isEmptyObject(Parameters.cache.order.step1.profile)){
            var t = Parameters.cache.history;
            for(var i = 0; i <= t.length-1; i++){
                var link = t.pop();
                if(link.route != 'order'){ 
                    Routing.SetHash(link.route, link.title, link.data, true);
                    return false;
                }
            }
        }
        else
             Routing.SetHash('order', 'Оформление заказа', {step: 1, block: 'profile'});
    };
    self.Submit = function() {
        if (self.HasAddress())
            Routing.SetHash('order', 'Оформление заказа', {step: 3});
        else
            EventDispatcher.DispatchEvent('OrderWidget.step2.message');
    };
    self.ClickStep1 = function() {
        Routing.SetHash('order', 'Оформление заказа', {step: 1, block: 'profile'});
    };
};

var OrderItemFormStep2ViewModel = function(data, list) {
    var self = this;
    if (data.id)
        self.id = data.id;
    else
        self.id = '';
    self.idCountry = data.id_country;
    self.country = data.country;
    self.codeRegion = data.code_region;
    self.region = data.region;
    self.codeCity = data.code_city;
    self.city = data.city;
    self.postCode = data.post_code;
    self.address = data.address;
    self.addressee = data.addressee;

    self.contactPhone = data.contact_phone;
    self.list = list.addressList();

    if (data.is_default == 'yes') {
        self.isDefault = ko.observable(true);
        self.cssIsDefault = ko.observable('delivery_address_is_default active');
        Parameters.cache.order.delivery = self;
        list.checked(self.id);
    }
    else {
        self.isDefault = ko.observable(false);
        self.cssIsDefault = ko.observable('delivery_address_is_default');
    }

    self.Delete = function() {
        self.Confirm(Config.Order.message.confirmDeleteAddressDelivery, function() {
            EventDispatcher.DispatchEvent('OrderWidget.step3.delete', {address: self, list: list});
        }, false);
    };
    self.ClickItem = function() {
        $.each(self.list, function(i) {
            self.list[i].cssIsDefault('delivery_address_is_default');
            self.list[i].isDefault(false);
        });

        self.cssIsDefault('delivery_address_is_default active');
        self.isDefault(true);
        list.checked(self.id);
        Parameters.cache.order.delivery = self;

        EventDispatcher.DispatchEvent('OrderWidget.step2.change', self);
    };

};

var OrderDeliveryFormStep2ViewModel = function(data) {
    var self = this;
    self.id = ko.observable();
    self.idCountry = ko.observable();
    self.country = ko.observable();
    self.cssCountryList = 'delivery_country_list';
    self.errorCountry = ko.observable(null);

    self.codeRegion = ko.observable();
    self.region = ko.observable();
    self.customRegion = ko.observable();
    self.cssRegionList = 'delivery_region';
    self.errorRegion = ko.observable(null);

    self.codeCity = ko.observable();
    self.city = ko.observable();
    self.customCity = ko.observable();
    self.cssCityList = 'delivery_city';
    self.errorCity = ko.observable(null);

    self.postCode = ko.observable();
    self.cssPostCode = 'delivery_post_index';
    self.errorPostCode = ko.observable(null);

    self.address = ko.observable();
    self.customAddress = ko.observable();
    self.cssAddress = 'delivery_cssAddress';
    self.errorAddress = ko.observable(null);

    self.addressee = ko.observable();
    self.errorAddressee = ko.observable(null);

    self.contactPhone = ko.observable();
    self.cssContactPhone = 'delivery_contact_phone';
    self.errorContactPhone = ko.observable(null)

    self.isDefault = ko.observable();

    self.countryList = ko.observableArray();

    self.AddCountryList = function(data) {
        if (data.length > 0) {
            for (var i = 0; i <= data.length - 1; i++) {
                self.countryList.push(new CountryListViewModel(data[i]));
            }
        }
    };

    self.AddContent = function(data) {
        self.id(data.id);
        self.idCountry(data.idCountry);
        self.region({regioncode: data.codeRegion});
        self.customRegion(data.region);
        self.city({aoguid: data.codeCity});
        self.customCity(data.city);
        self.postCode(data.postCode);
        self.customAddress(data.address);
        self.addressee(data.addressee);
        self.isDefault(data.isDefault());
        self.contactPhone(data.contactPhone);
    };
    self.Submit = function() {
        if (self.ValidationForm()) {
            EventDispatcher.DispatchEvent('OrderWidget.step2.add', self);
        }
    };
    self.ValidationForm = function() {
        var test = true;
        if (!self.PhoneValidation())
            test = false;
        if (!self.UsernameValidation())
            test = false;
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
            self.errorCountry(Config.Order.error.country.empty);
            return false;
        }
        self.errorCountry(null);
        return true;
    };
    self.RegionValidation = function() {
        if (!self.customRegion()) {
            self.errorRegion(Config.Order.error.region.empty);
            return false;
        }
        self.errorRegion(null);
        return true;
    };
    self.CityValidation = function() {
        if (!self.customCity()) {
            self.errorCity(Config.Order.error.city.empty);
            return false;
        }
        self.errorCity(null);
        return true;
    };
    self.AddressValidation = function() {
        if (!self.customAddress()) {
            self.errorAddress(Config.Order.error.address.empty);
            return false;
        }
        self.errorAddress(null);
        return true;
    };
    self.PostIndexValidation = function() {
        if (!self.postCode()) {
            self.errorPostCode(Config.Order.error.postIndex.empty);
            return false;
        }
        self.errorPostCode(null);
        return true;
    };
    self.UsernameValidation = function() {
        if (!self.addressee()) {
            self.errorAddressee(Config.Order.error.addressee.empty);
            return false;
        }
        if (self.addressee().length < 3) {
            self.errorAddressee(Config.Order.error.addressee.minLength);
            return false;
        }
        if (self.addressee().length > 40) {
            self.errorAddressee(Config.Order.error.addressee.maxLength);
            return false;
        }
        if (!Config.Order.regular.addressee.test(self.addressee())) {
            self.errorAddressee(Config.Registration.error.addressee.regular);
            return false;
        }
        self.errorAddressee(null);
        return true;
    };
    self.PhoneValidation = function() {
        if (!self.contactPhone()) {
            self.errorContactPhone(Config.Order.error.phone.empty);
            return false;
        }
        if (!Config.Order.regular.phone.test($.trim(self.contactPhone()))) {
            self.errorContactPhone(Config.Order.error.phone.regular);
            return false;
        }

        self.errorContactPhone(null);
        return true;
    };
    self.Back = function() {
        Routing.SetHash('order', 'Оформление заказа', {step: 2});
    };
    self.ClickStep1 = function() {
        Routing.SetHash('order', 'Оформление заказа', {step: 1, block: 'profile'});
    };
};

var OrderFormStep3ViewModel = function() {
    var self = this;
    self.shipping = ko.observableArray();
    self.checked = ko.observable();

    self.AddShipping = function(data) {
        self.shipping = ko.observableArray();
        for (var i = 0; i <= data.length - 1; i++) {
            var item = new OrderItemFormStep3ViewModel(self);
            item.AddContent(data[i]);
            self.shipping.push(item);
        }
    };
    self.HasShipping = function() {
        var test = false;
        $.each(self.shipping(), function(i) {
            if (self.shipping()[i].isActive()) {
                test = true;
                return false;
            }
        })
        return test;
    };
    self.Back = function() {
        Routing.SetHash('order', 'Оформление заказа', {step: 2});
    };
    self.Submit = function() {
        if (self.HasShipping())
            Routing.SetHash('order', 'Оформление заказа', {step: 4});
        else
            EventDispatcher.DispatchEvent('OrderWidget.step3.message');
    };
    self.ClickStep1 = function() {
        Routing.SetHash('order', 'Оформление заказа', {step: 1, block: 'profile'});
    };
    self.ClickStep2 = function() {
        Routing.SetHash('order', 'Оформление заказа', {step: 2});
    };
};

var OrderItemFormStep3ViewModel = function(parent) {
    var self = this;
    self.nameShippingCompany = ko.observable();
    self.siteShippingCompany = ko.observable();
    self.logoShippingCompany = ko.observable();
    self.id = ko.observable();
    self.nameMethodShipping = ko.observable();
    self.descMethodShipping = ko.observable();
    self.costShipping = ko.observable();
    self.cssActive = ko.observable('shipping_row');
    self.isActive = ko.observable(false);

    self.AddContent = function(data ) {
        if (data.hasOwnProperty('name_shipping_company'))
            self.nameShippingCompany(data.name_shipping_company);
        if (data.hasOwnProperty('site_shipping_company'))
            self.siteShippingCompany(data.site_shipping_company);
        if (data.hasOwnProperty('logo_shipping_company'))
            self.logoShippingCompany(Config.Base.pathToImages + data.logo_shipping_company);
        if (data.hasOwnProperty('id'))
            self.id(data.id);
        if (data.hasOwnProperty('name_method_shipping'))
            self.nameMethodShipping(data.name_method_shipping);
        if (data.hasOwnProperty('desc_method_shipping'))
            self.descMethodShipping(data.desc_method_shipping);
        if (data.hasOwnProperty('cost_shipping'))
            self.costShipping(data.cost_shipping + ' руб.');
    };
    self.ClickItem = function() {
        $.each(parent.shipping(), function(i) {
            parent.shipping()[i].cssActive('shipping_row');
            parent.shipping()[i].isActive(false);
        });

        self.cssActive('shipping_row active');
        self.isActive(true);
        parent.checked(self.id());

        EventDispatcher.DispatchEvent('OrderWidget.step3.change', self);
    }
};

var OrderFormStep4ViewModel = function() {
    var self = this;
    self.payment = ko.observableArray();
    self.checked = ko.observable();

    self.AddPayment = function(data) {
        self.payment = ko.observableArray();
        for (var i = 0; i <= data.length - 1; i++) {
            var item = new OrderItemFormStep4ViewModel(self);
            item.AddContent(data[i]);
            self.payment.push(item);
        }
    };
    self.HasPayment = function() {
        var test = false;
        $.each(self.payment(), function(i) {
            if (self.payment()[i].isActive()) {
                test = true;
                return false;
            }
        })
        return test;
    };
    self.Back = function() {
        if($.isEmptyObject(Parameters.cache.order.step1.profile)){
            var t = Parameters.cache.history;
            for(var i = 0; i <= t.length-1; i++){
                var link = t.pop();
                if(link.route != 'order'){ 
                    Routing.SetHash(link.route, link.title, link.data, true);
                    return false;
                }
            }
        }
        else
             Routing.SetHash('order', 'Оформление заказа', {step: 3});
    };
    self.Submit = function() {
        if (self.HasPayment())
            Routing.SetHash('order', 'Оформление заказа', {step: 5});
        else
            EventDispatcher.DispatchEvent('OrderWidget.step4.message');
    };
    self.ClickStep1 = function() {
        Routing.SetHash('order', 'Оформление заказа', {step: 1, block: 'profile'});
    };
    self.ClickStep2 = function() {
        Routing.SetHash('order', 'Оформление заказа', {step: 2});
    };
    self.ClickStep3 = function() {
        Routing.SetHash('order', 'Оформление заказа', {step: 3});
    };
};

var OrderItemFormStep4ViewModel = function(parent) {
    var self = this;
    self.id = ko.observable();
    self.logoPayment = ko.observable();
    self.descPayment = ko.observable();
    self.instrPayment = ko.observable();
    self.namePayment = ko.observable();
    self.costPayment = ko.observable();
    self.cssActive = ko.observable('payment_row');
    self.isActive = ko.observable(false);

    self.AddContent = function(data, parent) {
        self.id(data.id);
        if (data.hasOwnProperty('logo_payment'))
            self.logoPayment(Config.Base.pathToImages + data.logo_payment);
        if (data.hasOwnProperty('desc_payment'))
            self.descPayment(data.desc_payment);
        if (data.hasOwnProperty('instr_payment'))
            self.instrPayment(data.instr_payment);
        if (data.hasOwnProperty('name_payment'))
            self.namePayment(data.name_payment);
        if (data.hasOwnProperty('cost_payment'))
            self.costPayment(data.cost_payment + ' руб.');
    };
    self.ClickItem = function() {
        $.each(parent.payment(), function(i) {
            parent.payment()[i].cssActive('payment_row');
            parent.payment()[i].isActive(false);
        });

        self.cssActive('payment_row active');
        self.isActive(true);
        parent.checked(self.id());

        EventDispatcher.DispatchEvent('OrderWidget.step4.change', self);
    };
};

var TestOrder = {
    Init: function() {
        if (typeof Widget == 'function') {
            OrderWidget.prototype = new Widget();
            var order = new OrderWidget();
            order.Init(order);
        }
        else {
            setTimeout(function() {
                TestOrder.Init()
            }, 100);
        }
    }
};

TestOrder.Init();


