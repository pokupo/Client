var OrderWidget = function () {
    var self = this;
    self.widgetName = 'OrderWidget';
    self.version = 1.1;
    self.minWidgetVersion = 1.0;
    self.maxWidgetVersion = 2.0;
    self.minTmplVersion = 1.0;
    self.maxTmplVersion = 2.0;
    var settings = {
        container: {widget: 'content', def: 'defaultOrderWidgetId'},
        tmpl: {
            path: "orderTmpl.html", // файл шаблонов
            id: {
                step1: "orderFormStep1Tmpl", //id шаблона формы заказа шаг 1
                step1Confirm: "orderConfirmFormStep1Tmpl", //id шаблона формы активации аккаунта при заказе шаг 1
                step1Profile: 'orderProfileFormStep1Tmpl', // id шаблона формы персоональных данных
                step2: "orderFormStep2Tmpl", //id шаблона формы заказа шаг 2
                step2Form: 'orderDeliveryFormStep2Tmpl',
                step3: "orderFormStep3Tmpl", //id шаблона формы заказа шаг 3
                step4: "orderFormStep4Tmpl", //id шаблона формы заказа шаг 4
                step5: "orderFormStep5Tmpl" //id шаблона формы заказа шаг 5
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
            addressee: /^[a-zа-яёА-ЯЁA-Z\s]+$/,
            postIndex: /^[0-9]+$/
        },
        message: {
            addAddressDelivery: 'Данные успешно сохранены.',
            failAddAddressDelivery: 'Данные не сохранены. Попробуйте повторить запрос позднее.',
            deleteAddressDelivery: 'Адрес доставки успешно удален.',
            confirmDeleteAddressDelivery: "Вы уверены, что хотите удалить адрес?",
            failDeleteAddressDelivery: 'Адрес доставки не удален. Попробуйте повторить запрос позднее.',
            setDefaultDelivery: 'Данные успешно обновлены.',
            failSetDefaultDelivery: 'Данные не обновлены.',
            orderConfirm: 'Ваш заказ подтвержден.',
            selectMethodPayment: 'Необходимо выбрать способ оплаты.',
            selectAddress: 'Необходимо выбрать метод доставки.',
            selectMethodShipping: 'Необходимо выбрать метод доставки.',
            confirmDeleteOrder: 'Вы уверны, что хотите удалить заказ?',
            deleteOrderConfirm: 'Ваш заказ удален.',
            sendToken: 'Код активации успешно выслан по указанным данным.',
            failSendToken: 'Код не был отправлен. Попробуйте повторить запрос позднее.'
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
            password: {
                empty: 'Поле обязательно для заполнения',
                minLength: 'Пароль должен быть не менее 6 символов',
                maxLength: 'Пароль должен быть не более 64 символов',
                equal: 'Пароль не совпадает с образцом'
            },
            isChecked: {
                empty: 'Вам необходимо прочитать и принять условия соглашения'
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
            },
            addressee: {
                empty: 'Поле обязательно для заполнения',
                minLength: 'Минимум 2 символа',
                maxLength: 'Максимум 20 символов',
                regular: 'Только буквы латинского или русского алфавита'
            },
            phone: {
                empty: 'Поле обязательно для заполнения',
                regular: 'Не верный формат телефона',
                uniq: 'Аккаунт для этого номера телефона уже существует, рекомендуем пройти процедуру восстановления доступа. <a href="#">Восстановить доступ</a>'
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
        },
        animate: typeof AnimateOrder == 'function' ? AnimateOrder : null
    },
    order = {
        type: null, // fromCart || directly
        id: null,
        sellerId: null,
        goodsId: null,
        count: null,
        content: null,
        delivery: {},
        shipping: {},
        payment: {}
    },
        alias = 'order',
        title = 'Оформление заказа';


    self.InitWidget = InitWidget;

    function InitWidget() {
        SetInputParameters();
        RegisterEvents();
        CheckRouteOrder();
    }

    function SetInputParameters() {
        var input = self.GetInputParameters(order);

        if (!$.isEmptyObject(input))
            settings = self.UpdateSettings1(settings, input);

        Config.Containers.order = settings.container;
    }

    function CheckRouteOrder() {
        var pRoute = Routing.params,
            cache = Parameters.cache;
        if (Routing.route == alias) {
            self.WidgetLoader(false);
            if (pRoute.sellerId)
                order.sellerId = pRoute.sellerId;
            if (pRoute.create) {
                self.BaseLoad.Login(false, false, false, function (data) {
                    if (pRoute.create == 'fromCart') {
                        if (data.err) {
                            order.type = 'cart';
                            order.goodsId = null;
                            order.count = null

                            setTimeout(function () {
                                cache.history.pop();
                                var link = cache.history.pop();
                                if (link.route == alias && link.data.create)
                                    link = cache.history.pop();
                                if (link.route == 'login')
                                    link = cache.history.pop();
                                SetHash(link.route, link.title, link.data, true);
                            }, 1000);
                        }
                        else {
                            DataOrderCreate(
                                {create: 'fromCart', sellerId: order.sellerId},
                                function () {
                                    order.type = 'cart';
                                    DataOrderCart(function () {
                                        SetHash(alias, title, {step: 2});
                                    });
                                }
                            );
                        }
                    }
                    else if (pRoute.create == 'directly') {
                        if (data.err) {
                            order.type = 'directly';
                            order.goodsId = pRoute.goodsId;
                            order.count = pRoute.count;

                            setTimeout(function () {
                                cache.history.pop();
                                var link = cache.history.pop();
                                if (link.route == alias && link.data.create)
                                    link = cache.history.pop();
                                if (link.route == 'login')
                                    link = cache.history.pop();
                                SetHash(link.route, link.title, link.data, true);
                            }, 1000);
                        }
                        else {
                            DataOrderCreate(
                                {
                                    create: 'directly',
                                    sellerId: order.sellerId,
                                    goodsId: pRoute.goodsId,
                                    count: pRoute.count
                                },
                                function () {
                                    order.type = 'directly';
                                    order.goodsId = pRoute.goodsId;
                                    order.count = pRoute.count;
                                    DataOrderDirectly(function () {
                                        SetHash(alias, title, {step: 2});
                                    });
                                }
                            );
                        }
                    }
                    else
                        SetHash('default', 'Домашняя', {});
                });
            }
            if (pRoute.step) {
                self.BaseLoad.Login(false, false, false, function (data) {
                    self.BaseLoad.Tmpl(settings.tmpl, function () {
                        if (pRoute.id)
                            order.id = pRoute.id;

                        if (pRoute.step == 1 && !pRoute.block) {
                            if (data.err)
                                Step1();
                            else
                                SetHash(alias, title, {step: 2});
                        }
                        else if (pRoute.step == 1 && pRoute.block == 'confirm') {
                            Step1Confirm();
                        }
                        else if (!data.err && pRoute.step == 1 && pRoute.block == 'profile' && order.id) {
                            Step1Profile();
                        }
                        else if (!data.err && pRoute.step == 2 && !pRoute.block && order.id)
                            Step2();
                        else if (!data.err && pRoute.step == 2 && pRoute.block == 'add' && order.id)
                            Step2Form();
                        else if (!data.err && pRoute.step == 3 && order.id)
                            Step3();
                        else if (!data.err && pRoute.step == 4 && order.id)
                            Step4();
                        else if (pRoute.step == 5)
                            Step5();
                        else
                            SetHash('default', 'Домашняя', {});
                    });
                });
            }
        }
        else
            self.WidgetLoader(true);
    }
    function RegisterEvents() {
        self.AddEvent('w.change.route', function () {
            CheckRouteOrder();
        });

        self.AddEvent('UInfo.logout', function () {
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
            order.type = null;
            order.id = null;
            order.sellerId = null;
            order.goodsId = null;
            order.count = null;
            order.content = null;
            order.delivery = {};
            order.shipping = {};
            order.payment = {};
        });

        self.AddEvent('Order.step1.authentication', function (data) {
            self.BaseLoad.Login(data.username, data.password, data.rememberMe, function (request) {
                if (request.err) {
                    Parameters.cache.order.step1.reg.loginForm.error("Ошибка в логине или пароле");
                    Parameters.cache.order.step1.reg.loginForm.password = null;
                    RenderStep1(Parameters.cache.order.step1.reg);
                }
                else {
                    if (order.type == 'directly') {
                        DataOrderCreate(
                            {create: 'directly', sellerId: order.sellerId, goodsId: order.goodsId, count: order.count},
                            function () {
                                DataOrderDirectly(function () {
                                    SetHash(alias, title, {step: 2});
                                });
                            }
                        );
                    }
                    if (order.type == 'cart') {
                        DataOrderCreate(
                            {create: 'directly', sellerId: order.sellerId},
                            function () {
                                DataOrderCart(function () {
                                    SetHash(alias, title, {step: 2});
                                });
                            }
                        );
                    }
                }
            })
        });

        self.AddEvent('Order.step1.registration', function (step1) {
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
                        EventDispatcher.DispatchEvent('Order.step1.registration', step1)
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
                        params.push('email=' + step1.email());
                    if (step1.firstPassword())
                        params.push('password=' + encodeURIComponent(step1.firstPassword()));
                    if (params.length > 0)
                        var str = '?' + params.join('&');
                    self.BaseLoad.Registration(str, function (data) {
                        Parameters.cache.order.step1.reg = step1;
                        SetHash(alias, title, {step: 1, block: 'confirm'});
                    });
                }
                else
                    self.WidgetLoader(true, settings.container.widget);
            });
        });

        self.AddEvent('Order.step1.confirm', function (step1confirm) {
            self.WidgetLoader(false);
            var params = [];
            params.push('username=' + encodeURIComponent(step1confirm.username));
            if (!step1confirm.mailConfirmLater())
                params.push('mail_token=' + step1confirm.mailToken());
            if (!step1confirm.phoneConfirmLater())
                params.push('sms_token=' + step1confirm.phoneToken());
            var str = '?' + params.join('&');

            self.BaseLoad.ActivateUser(str, function (data) {
                var test = true;
                if (self.QueryError(data, function () {
                        EventDispatcher.DispatchEvent('Order.step1.confirm', step1confirm)
                    })) {
                    if (!ValidateMailToken(data, step1confirm))
                        test = false;
                    if (!ValidatePhoneToken(data, step1confirm))
                        test = false;
                }
                else
                    test = false;

                if (test) {
                    self.BaseLoad.Login(false, false, false, function (request) {
                        Parameters.cache.order.step1.confirm = step1confirm;
                        if (!request.err) {
                            if (order.type == 'directly') {
                                DataOrderCreate(
                                    {
                                        create: 'directly',
                                        sellerId: order.sellerId,
                                        goodsId: order.goodsId,
                                        count: order.count
                                    },
                                    function () {
                                        DataOrderDirectly(function () {
                                            SetHash(alias, title, {step: 1, block: 'profile'});
                                        });
                                    }
                                );
                            }
                            if (order.type == 'fromCart') {
                                DataOrderCreate(
                                    {create: 'directly', sellerId: order.sellerId},
                                    function () {
                                        DataOrderCart(function () {
                                            SetHash(alias, title, {step: 1, block: 'profile'});
                                        });
                                    }
                                );
                            }
                        }
                    });
                }
                else
                    self.WidgetLoader(true, settings.container.widget);
            });
        });

        self.AddEvent('Order.step1.view1', function () {
            SetHash(alias, title, {step: 1});
        });

        self.AddEvent('Order.step1.later', function () {
            SetHash(alias, title, {step: 2});
        });

        self.AddEvent('Order.step1.profile', function (step1) {
            self.WidgetLoader(false);
            var day = step1.birthDay().split('.');
            var birthDay = day[2] + '-' + day[1] + '-' + day[0];
            step1.birthDayHiddenField(birthDay);
            self.BaseLoad.EditProfile($('form#' + step1.cssRegistrationDataForm), function (data) {
                var test = true;
                if (!self.QueryError(data, function () {
                        self.DispatchEvent('Order.step1.profile', step1)
                    }))
                    test = false;

                if (test) {
                    Parameters.cache.profile.personal = {};
                    Parameters.cache.order.step1.profile = step1;
                    SetHash(alias, title, {step: 2});
                }
                else
                    self.WidgetLoader(true, settings.container.widget);
            });
        });

        self.AddEvent('Order.step3.change', function (data) {
            self.BaseLoad.EditOrder(order.id + '/?id_method_shipping=' + data.id, function (result) {
                if (self.QueryError(result, function () {
                        self.DispatchEvent('Order.step3.change', data)
                    })) {
                    order.shipping = data.selected;
                    data.fn();
                }
            })
        });

        self.AddEvent('Order.step3.message', function () {
            self.ShowError(settings.message.selectMethodShipping, false, false);
        });

        self.AddEvent('Order.step2.add', function (data) {
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

            self.BaseLoad.AddDelivaryAddress(str, function (response) {
                if (response.result == 'ok') {
                    self.ShowMessage(settings.message.addAddressDelivery, function () {
                        Parameters.cache.order.step2 = {};
                        Parameters.cache.delivery = null;
                        SetHash(alias, title, {step: 2});
                    }, false);
                }
                else {
                    if (!response.err)
                        response.err = settings.message.failAddAddressDelivery;
                    self.QueryError(response, function () {
                        self.DispatchEvent('Order.step2.add', data)
                    })
                }
            });
        });

        self.AddEvent('Order.step2.change', function (data) {
            self.BaseLoad.EditOrder(order.id + '/?id_shipping_address=' + data.id, function (result) {
                if (self.QueryError(result, function () {
                        self.DispatchEvent('Order.step2.change', data)
                    })) {
                    Parameters.cache.delivery = null;
                    order.delivery = data.selected;
                    data.fn();
                }
            });
        });

        self.AddEvent('Order.step2.delete', function (delivery) {
            self.BaseLoad.DeleteDeliveryAddress(delivery.address.id, function (data) {
                if (data.result == 'ok') {
                    self.ShowMessage(settings.message.deleteAddressDelivery, function () {
                        Parameters.cache.order.step2 = {};
                        Parameters.cache.delivery = null;
                        delivery.list.remove(delivery.address);

                    }, false);
                }
                else {
                    if (!data.err)
                        data.err = settings.message.failDeleteAddressDelivery;
                    self.QueryError(data, function () {
                        self.DispatchEvent('Order.step2.delete', delivery)
                    })
                }
            });
        });

        self.AddEvent('Order.step2.message', function () {
            self.ShowError(settings.message.selectAddress, false, false);
        });

        self.AddEvent('Order.step4.change', function (data) {
            self.BaseLoad.EditOrder(order.id + '/?id_method_payment=' + data.id, function (result) {
                if (self.QueryError(result, function () {
                        self.DispatchEvent('Order.step4.change', data)
                    })) {
                    order.payment = data.selected;
                    data.fn();
                }
            });
        });

        self.AddEvent('Order.step4.message', function () {
            self.ShowError(settings.message.selectMethodPayment, false, false);
        });


        self.AddEvent('Order.step5.confirm', function (text) {
            var str = order.id;
            if (text.comment)
                str = str + '?comment_buyer=' + encodeURIComponent(text.comment);
            self.BaseLoad.ConfirmOrder(str, function (data) {
                if (self.QueryError(data, function () {
                        self.DispatchEvent('Order.step5.confirm', text)
                    }))
                    self.ShowMessage(settings.message.orderConfirm, function () {
                        SetHash('purchases', 'Мои покупки', {block: 'detail', id: order.id});
                    }, false);
            })
        });

        self.AddEvent('Order.step5.delete', function () {
            self.Confirm(settings.message.confirmDeleteOrder, function () {
                self.BaseLoad.DeleteOrder(order.id + '/yes', function (data) {
                    if (self.QueryError(data, function () {
                            self.DispatchEvent('Order.step5.delete')
                        })) {
                        self.ShowMessage(settings.message.deleteOrderConfirm, function () {
                            SetHash('default', 'Домашняя', {});
                        }, false);
                    }
                });
            })
        });

        self.AddEvent('Order.send.token', function (type) {
            self.BaseLoad.SendToken(type, function (data) {
                if (data.result == 'ok') {
                    self.ShowMessage(settings.message.sendToken, false, false);
                }
                else {
                    if (!data.err)
                        data.err = settings.message.failSendToken;
                    self.QueryError(data, function () {
                        self.DispatchEvent('Order.send.token', type)
                    })
                }
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

    function DataOrderCreate(params, callback) {
        var str = params.sellerId;
        if (params.goodsId)
            str = str + '/' + params.goodsId + '/' + params.count;
        self.BaseLoad.NewOrder(str, function (data) {
            if (self.QueryError(data,
                    function () {
                        SetHash(alias, title, params);
                    },
                    function () {
                        var last = Parameters.cache.lastPage;
                        SetHash(last.route, last.title, last.data)
                    })) {
                if (data.msg) {
                    self.ShowMessage(data.msg,
                        function () {
                            var last = Parameters.cache.lastPage;
                            SetHash(last.route, last.title, last.data);
                        }, false);
                }
                else {
                    order.id = data.id;
                    if (callback)
                        callback();
                }
            }
        });
    }

    function DataOrderCart(callback) {
        self.BaseLoad.CartGoods(order.sellerId, function (data) {
            order.content = data;
            order.content.main = data[0].goods;
            if (callback)
                callback();
        });
    }

    function DataOrderDirectly(callback) {
        self.BaseLoad.GoodsInfo(order.goodsId, '1000000', function (data) {
            order.content = data;
            order.content.main = [data.main];
            if (callback)
                callback();
        })
    }

    function DataOrderIsRealGoods() {
        var test = false;
        var goods = [];
        if (order.type == 'cart') {
            goods = order.content[0].goods;
        }
        else {
            if (!$.isArray(order.content.main))
                goods[0] = order.content.main;
            else
                goods = order.content.main;
        }
        $.each(goods, function (i) {
            if (goods[i].is_egoods != 'yes') {
                test = true;
                return false;
            }
        })
        return test;
    }

    function Step1() {
        InsertContainerStep1();
        FillStep1();
    }

    function Step1Confirm() {
        InsertContainerStep1Confirm();
        FillStep1Confirm();
    }

    function Step1Profile() {
        self.BaseLoad.Profile(function (data) {
            InsertContainerStep1Profile();
            FillStep1Profile(data);
        });
    }

    function Step2() {
        if (Routing.params.id) {
            self.BaseLoad.OrderInfo(order.id + '/yes', function (data) {
                if (self.QueryError(data,
                        function () {
                            SetHash(alias, title, Routing.params);
                        },
                        function () {
                            var last = Parameters.cache.lastPage;
                            SetHash(last.route, last.title, last.data)
                        })) {
                    if (data.msg) {
                        self.ShowMessage(data.msg,
                            function () {
                                var last = Parameters.cache.lastPage;
                                if (last)
                                    SetHash(last.route, last.title, last.data);
                                else
                                    SetHash('default', Routing.defaultTitle, {});
                            }, false);
                    }
                    else {
                        order.content = {};
                        order.content.main = data.goods;
                        Step2Getdata();
                    }
                }
            });
        }
        else
            Step2Getdata();
    }

    function Step2Getdata() {
        if (DataOrderIsRealGoods())
            self.BaseLoad.DeliveryAddressList(function (data) {
                InsertContainerStep2();
                FillStep2(data);
            });
        else
            SetHash(alias, title, {step: 4});
    }

    function Step2Form() {
        if (DataOrderIsRealGoods()) {
            var form = new OrderDeliveryFormStep2ViewModel(settings);
            var shopId = Parameters.shopId;

            self.BaseLoad.Country(shopId, function (data) {
                InsertContainerStep2Form();
                FillStep2Form(form, data);
            });
        }
        else
            SetHash(alias, title, {step: 4});
    }

    function Step3() {
        if (DataOrderIsRealGoods()) {
            self.BaseLoad.GoodsInfo(order.content.main[0].id, '1010000', function (goodsInfo) {
                order.sellerId = goodsInfo.shop.id;
                self.BaseLoad.Shipping(order.sellerId + '/' + order.id + '/', function (data) {
                    InsertContainerStep3();
                    FillStep3(data);
                });
            });
        }
        else
            SetHash(alias, title, {step: 4});
    }

    function Step4() {
        self.BaseLoad.GoodsInfo(order.content.main[0].id, '1010000', function (goodsInfo) {
            order.sellerId = goodsInfo.shop.id;
            self.BaseLoad.Payment(order.sellerId + '/' + order.id, function (data) {
                InsertContainerStep4();
                FillStep4(data);
            });
        });
    }

    function Step5() {
        self.BaseLoad.Script(PokupoWidgets.model.order, function () {
            self.BaseLoad.OrderInfo(order.id + '/yes', function (data) {
                InsertContainerStep5();
                FillStep5(data);
            });
        });
    }

    function InsertContainerEmptyWidget() {
        self.ClearContainer(settings);
    }

    function InsertContainerStep1() {
        self.InsertContainer(settings, 'step1');
    }

    function InsertContainerStep1Confirm() {
        self.InsertContainer(settings, 'step1Confirm');
    }

    function InsertContainerStep1Profile() {
        self.InsertContainer(settings, 'step1Profile');
    }

    function InsertContainerStep2() {
        self.InsertContainer(settings, 'step2');
    }

    function InsertContainerStep2Form() {
        self.InsertContainer(settings, 'step2Form');
    }

    function InsertContainerStep3() {
        self.InsertContainer(settings, 'step3');
    }

    function InsertContainerStep4() {
        self.InsertContainer(settings, 'step4');
    }

    function InsertContainerStep5() {
        self.InsertContainer(settings, 'step5');
    }


    function FillStep1() {
        var form = Parameters.cache.order.step1.reg;
        if ($.isEmptyObject(form)) {
            self.BaseLoad.Script(PokupoWidgets.model.registration, function () {
                self.BaseLoad.Script(PokupoWidgets.model.auth, function () {
                    form = new OrderFormStep1ViewModel(settings);
                    Parameters.cache.order.step1.reg = form;
                });
            });
        }
        RenderStep1(form);
    }

    function FillStep1Confirm() {
        var pRoute = Routing.params,
            cache = Parameters.cache.order.step1;
        if (pRoute.username && pRoute.mail_token)
            cache.reg.username(pRoute.username);

        RegistrationConfirmFormViewModel.prototype.Back = function () {
            self.DispatchEvent('Order.step1.view1');
        };
        var form = new RegistrationConfirmFormViewModel(cache.reg, settings);
        form.submitEvent('Order.step1.confirm');
        form.ShowButtonSendToken();

        if (pRoute.username && pRoute.mail_token) {
            form.mailToken(pRoute.mail_token);
            self.DispatchEvent('Order.step1.confirm', form);
        }
        RenderStep1Confirm(form);
    }

    function FillStep1Profile(data) {
        RegistrationProfileFormViewModel.prototype.Back = function () {
            self.DispatchEvent('Order.step1.view2');
        };
        RegistrationProfileFormViewModel.prototype.SpecifyLater = function () {
            self.DispatchEvent('Order.step1.later');
        };
        var form = new RegistrationProfileFormViewModel(settings);
        form.submitEvent('Order.step1.profile');
        form.AddContent(data);
        RenderStep1Profile(form);
    }

    function FillStep2(data) {
        if (!data.err) {
            var form = Parameters.cache.order.step2;
            if ($.isEmptyObject(form)) {
                form = new OrderFormStep2ViewModel(settings);
            }
            form.AddContent(data, order);

            RenderStep2(form);
            Parameters.cache.order.step2 = form;
        }
        else
            SetHash(alias, title, {step: 2, block: 'add'});
    }

    function FillStep2Form(form, data) {
        form.AddCountryList(data);
        if (form.idCountry()) {
            $.grep(form.countryList(), function (data) {
                if (data.id == form.idCountry()) {
                    form.country(data);
                }
            })
        }
        RenderStep2Form(form);
    }

    function FillStep3(data) {
        var form = Parameters.cache.order.step3;
        if ($.isEmptyObject(form)) {
            form = new OrderFormStep3ViewModel();
        }
        form.AddShipping(data);
        Parameters.cache.order.step3 = form;
        RenderStep3(form);
    }

    function FillStep4(data) {
        var form = Parameters.cache.order.step4;
        if ($.isEmptyObject(form)) {
            form = new OrderFormStep4ViewModel();
        }
        form.AddPayment(data);
        Parameters.cache.order.step4 = form;
        RenderStep4(form);
    }

    function FillStep5(data) {
        var form = Parameters.cache.order.step5;
        if ($.isEmptyObject(form)) {
            OrderViewModel.prototype.Back = function () {
                SetHash(alias, title, {step: 4});
            };
            OrderViewModel.prototype.ClickDelete = function () {
                self.DispatchEvent('Order.step5.delete');
            };
            OrderViewModel.prototype.ClickStep1 = function () {
                SetHash(alias, title, {step: 1, block: 'profile'});
            };
            OrderViewModel.prototype.ClickStep2 = function () {
                SetHash(alias, title, {step: 2});
            };
            OrderViewModel.prototype.ClickStep3 = function () {
                SetHash(alias, title, {step: 3});
            };
            OrderViewModel.prototype.ClickStep4 = function () {
                SetHash(alias, title, {step: 4});
            };
            OrderViewModel.prototype.ClickAddAddress = function () {
                SetHash(alias, title, {step: 1, block: 'add'});
            };
            form = new OrderViewModel();

            Parameters.cache.order.step5 = form;
        }
        form.AddContent(data);

        RenderStep5(form);
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

    function RenderStep1Confirm(data) {
        self.RenderTemplate(data, settings, null,
            function (data) {
                InsertContainerStep1Confirm();
                RenderStep1Confirm(data);
            },
            function () {
                InsertContainerEmptyWidget();
            },
            'step1Confirm'
        );
    }

    function RenderStep1Profile(data) {
        self.RenderTemplate(data, settings, null,
            function (data) {
                InsertContainerStep1Profile();
                RenderStep1Profile(data);
            },
            function () {
                InsertContainerEmptyWidget();
            },
            'step1Profile'
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
            'step2'
        );
    }

    function RenderStep2Form(delivery) {
        self.RenderTemplate(delivery, settings,
            function () {
                CallbackRenderStep2Form(delivery)
            },
            function (delivery) {
                InsertContainerStep2Form();
                RenderStep2Form(delivery);
            },
            function () {
                InsertContainerEmptyWidget();
            },
            'step2Form'
        );
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
            'step3'
        );
    }

    function RenderStep4(data) {
        self.RenderTemplate(data, settings, null,
            function (data) {
                InsertContainerStep4();
                RenderStep4(data);
            },
            function () {
                InsertContainerEmptyWidget();
            },
            'step4'
        );
    }

    function RenderStep5(data) {
        self.RenderTemplate(data, settings, null,
            function (data) {
                InsertContainerStep5();
                RenderStep5(data);
            },
            function () {
                InsertContainerEmptyWidget();
            },
            'step5'
        );
    }

    function CallbackRenderStep2Form(delivery) {
        $('#' + delivery.cssRegionList).autocomplete({
            source: function (request, response) {
                self.BaseLoad.Region(delivery.country().id + '/' + encodeURIComponent(request.term), function (data) {
                    if (!data.err) {
                        response($.map(data, function (item) {
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
            select: function (event, ui) {
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
            source: function (request, response) {
                if (delivery.region()) {
                    self.BaseLoad.City(delivery.country().id + '/' + encodeURIComponent(delivery.region().regioncode) + '/' + encodeURIComponent(request.term), function (data) {
                        if (!data.err) {
                            response($.map(data, function (item) {
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
            select: function (event, ui) {
                delivery.city(ui.item.city);
                delivery.customCity(ui.item.value);
                if (ui.item.city && ui.item.city.postalcode != 0)
                    delivery.postCode(ui.item.city.postalcode);
                else
                    delivery.postCode(null);
            }
        });

        $('#' + delivery.cssAddress).autocomplete({
            source: function (request, response) {
                if (delivery.region()) {
                    self.BaseLoad.Street(delivery.country().id + '/' + encodeURIComponent(delivery.region().regioncode) + '/' + encodeURIComponent(delivery.city().aoguid) + '/' + encodeURIComponent(request.term), function (data) {
                        if (!data.err) {
                            response($.map(data, function (item) {
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
            select: function (event, ui) {
                delivery.address(ui.item.street);
                delivery.customAddress(ui.item.value);
                if (ui.item.street && ui.item.street.postalcode != 0)
                    delivery.postCode(ui.item.street.postalcode);
                else
                    delivery.postCode(null);
            }
        });
        $('#' + delivery.cssCountryList).change(function () {
            var v = $('#' + delivery.cssCountryList + ' option:selected').val();
            if (v) {
                delivery.errorCountry('');
                delivery.errorRegion('');
                delivery.errorCity('');
                delivery.errorAddress('');
                delivery.errorPostCode('');
            }
            $.grep(delivery.countryList(), function (data) {
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

        $('#' + delivery.cssRegionList).bind('textchange', function (event, previousText) {
            delivery.errorRegion('');
            delivery.errorCity('');
            delivery.errorAddress('');
            delivery.errorPostCode('');
            delivery.customRegion($(this).val());
            delivery.customCity(null);
            delivery.city(null);
            delivery.customAddress(null)
            delivery.address(null);
            delivery.postCode(null);
        });

        $('#' + delivery.cssCityList).bind('textchange', function (event, previousText) {
            delivery.errorCity('');
            delivery.errorAddress('');
            delivery.errorPostCode('');
            delivery.customCity($(this).val());
            delivery.customAddress(null)
            delivery.address(null);
            delivery.postCode(null);
        });

        $('#' + delivery.cssAddressList).bind('textchange', function (event, previousText) {
            delivery.errorAddress('');
            delivery.errorPostCode('');
        });

        $('#' + delivery.cssPostCode).bind('textchange', function (event, previousText) {
            delivery.errorPostCode('');
        });

        $('#' + delivery.cssAddressee).bind('textchange', function (event, previousText) {
            delivery.errorAddressee('');
        });

        $('#' + delivery.cssContactPhone).bind('textchange', function (event, previousText) {
            delivery.errorContactPhone('');
        })
    }

    function SetHash(alias, title, params){
        Routing.SetHash(alias, title, params);
    }
}

var OrderFormStep1ViewModel = function (settings) {
    var self = this;
    var form = new AuthenticationViewModel();
    form.subminEvent('Order.step1.authentication');
    self.loginForm = form;
    self.registrationForm = new RegistrationFormViewModel(settings);
    self.registrationForm.submitEvent('Order.step1.registration');
};

var OrderFormStep2ViewModel = function (settings) {
    var self = this,
        title = 'Оформление заказа',
        alias = 'order';
    self.addressList = ko.observableArray();
    self.cssAddressList = 'delivary_address_list';
    self.checked = ko.observable();
    self.selectedItem = ko.observable();

    self.ClickAddAddress = function () {
        SetHash(alias, title, {step: 2, block: 'add'});
    };
    self.AddContent = function (data, order) {
        if (!data.err)
            self.addressList = ko.observableArray();
        for (var key in data) {
            OrderItemFormStep2ViewModel.prototype = new Widget();
            var address = new OrderItemFormStep2ViewModel(data[key], self, settings)
            self.addressList.push(address);
            if (data[key].is_default == 'yes') {
                order.delivery = address;
            }
            if (data.length == 1)
                address.ClickItem();
        }
    };
    self.Back = function () {
        if ($.isEmptyObject(Parameters.cache.order.step1.profile)) {
            var t = Parameters.cache.history;
            for (var i = 0; i <= t.length - 1; i++) {
                var link = t.pop();
                if (link.route != 'order') {
                    SetHash(link.route, link.title, link.data, true);
                    return false;
                }
            }
        }
        else
            SetHash(alias, title, {step: 1, block: 'profile'});
    };
    self.Submit = function () {
        if (HasAddress()) {
            EventDispatcher.DispatchEvent('Order.step2.change', {
                id: self.checked(),
                selected: self.selectedItem(),
                fn: function () {
                    SetHash(alias, title, {step: 3});
                }
            });
        }
        else
            EventDispatcher.DispatchEvent('Order.step2.message');
    };
    self.ClickStep1 = function () {
        SetHash(alias, title, {step: 1, block: 'profile'});
    };

    function HasAddress() {
        var test = false;
        $.each(self.addressList(), function (i) {
            if (self.addressList()[i].isDefault()) {
                test = true;
                return false;
            }
        })
        return test;
    }
    function SetHash(alias, title, params){
        Routing.SetHash(alias, title, params);
    }
};

var OrderItemFormStep2ViewModel = function (data, list, settings) {
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

    self.isDefault = ko.observable(true);
    if (data.is_default == 'yes') {
        self.cssIsDefault = ko.observable('delivery_address_is_default active');
        Parameters.cache.order.delivery = self;
        list.checked(self.id);
    }
    else {
        self.isDefault = ko.observable(false);
        self.cssIsDefault = ko.observable('delivery_address_is_default');
    }

    self.Delete = function () {
        self.Confirm(settings.message.confirmDeleteAddressDelivery, function () {
            EventDispatcher.DispatchEvent('Order.step2.delete', {address: self, list: list.addressList});
        }, false);
    };
    self.ClickItem = function () {
        $.each(self.list, function (i) {
            self.list[i].cssIsDefault('delivery_address_is_default');
            self.list[i].isDefault(false);
        });

        self.cssIsDefault('delivery_address_is_default active');
        self.isDefault(true);
        list.checked(self.id);
        list.selectedItem(self);
        Parameters.cache.order.delivery = self;
    };

};

var OrderDeliveryFormStep2ViewModel = function (settings) {
    var self = this,
        title = 'Оформление заказа',
        alias = 'order';
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
    self.showRegion = ko.computed(function () {
        if (self.country())
            return false;
        return true;
    }, this);

    self.codeCity = ko.observable();
    self.city = ko.observable();
    self.customCity = ko.observable();
    self.cssCityList = 'delivery_city';
    self.errorCity = ko.observable(null);
    self.showCity = ko.computed(function () {
        if (self.customRegion())
            return false;
        return true;
    }, this);

    self.address = ko.observable();
    self.customAddress = ko.observable();
    self.cssAddress = 'delivery_cssAddress';
    self.errorAddress = ko.observable(null);
    self.showAddress = ko.computed(function () {
        if (self.customCity())
            return false;
        return true;
    }, this);

    self.postCode = ko.observable();
    self.cssPostCode = 'delivery_post_index';
    self.errorPostCode = ko.observable(null);
    self.showPostIndex = ko.computed(function () {
        if (self.customAddress())
            return false;
        return true;
    }, this);

    self.addressee = ko.observable();
    self.cssAddressee = 'delivery_addressee';
    self.errorAddressee = ko.observable(null);

    self.contactPhone = ko.observable();
    self.cssContactPhone = 'delivery_contact_phone';
    self.errorContactPhone = ko.observable(null)

    self.isDefault = ko.observable();

    self.countryList = ko.observableArray();

    self.AddCountryList = function (data) {
        if (data.length > 0) {
            for (var i = 0; i <= data.length - 1; i++) {
                self.countryList.push(new CountryListViewModel(data[i]));
            }
        }
    };

    self.AddContent = function (data) {
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
    self.Submit = function () {
        if (ValidationForm()) {
            EventDispatcher.DispatchEvent('Order.step2.add', self);
        }
    };
    self.Back = function () {
        SetHash(alias, title, {step: 2});
    };
    self.ClickStep1 = function () {
        SetHash(title, alias, {step: 1, block: 'profile'});
    };
    self.ClickStep2 = function () {
        SetHash(title, alias, {step: 2});
    };
    function SetHash(alias, title, params){
        Routing.SetHash(alias, title, params);
    }
    function ValidationForm() {
        var test = true;
        if (!PhoneValidation())
            test = false;
        if (!UsernameValidation())
            test = false;
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
        if (!self.country()) {
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
        if (!self.postCode()) {
            self.errorPostCode(error.empty);
            return false;
        }
        if (5 > self.postCode().length || self.postCode().length > 6) {
            self.errorPostCode(error.length);
            return false;
        }
        if (!settings.regular.postIndex.test(self.postCode())) {
            self.errorPostCode(error.regular);
            return false;
        }
        self.errorPostCode(null);
        return true;
    }
    function UsernameValidation() {
        var error = settings.error.addressee;
        if (!self.addressee()) {
            self.errorAddressee(error.empty);
            return false;
        }
        if (self.addressee().length < 3) {
            self.errorAddressee(error.minLength);
            return false;
        }
        if (self.addressee().length > 40) {
            self.errorAddressee(error.maxLength);
            return false;
        }
        if (!settings.regular.addressee.test(self.addressee())) {
            self.errorAddressee(error.regular);
            return false;
        }
        self.errorAddressee(null);
        return true;
    }
    function PhoneValidation() {
        var error = settings.error.phone;
        if (!self.contactPhone()) {
            self.errorContactPhone(error.empty);
            return false;
        }
        if (!settings.regular.phone.test($.trim(self.contactPhone()))) {
            self.errorContactPhone(error.regular);
            return false;
        }

        self.errorContactPhone(null);
        return true;
    }
};

var OrderFormStep3ViewModel = function () {
    var self = this,
        title = 'Оформление заказа',
        alias = 'order';
    self.shipping = ko.observableArray();
    self.checked = ko.observable();
    self.selectedItem = ko.observable();

    self.AddShipping = function (data) {
        self.shipping = ko.observableArray();
        for (var i = 0; i <= data.length - 1; i++) {
            var item = new OrderItemFormStep3ViewModel(self);
            item.AddContent(data[i]);
            self.shipping.push(item);
            if (data.length == 1)
                item.ClickItem();
        }
    };
    self.Back = function () {
        SetHash(alias, title, {step: 2});
    };
    self.Submit = function () {
        if (HasShipping()) {
            EventDispatcher.DispatchEvent('Order.step3.change', {
                id: self.checked(),
                selected: self.selectedItem(),
                fn: function () {
                    SetHash(alias, title, {step: 4});
                }
            });
        }
        else
            EventDispatcher.DispatchEvent('Order.step3.message');
    };
    self.ClickStep1 = function () {
        SetHash(alias, title, {step: 1, block: 'profile'});
    };
    self.ClickStep2 = function () {
        SetHash(alias, title, {step: 2});
    };
    self.ClickAddAddress = function () {
        SetHash(alias, title, {step: 2, block: 'add'});
    };
    function HasShipping() {
        var test = false;
        $.each(self.shipping(), function (i) {
            if (self.shipping()[i].isActive()) {
                test = true;
                return false;
            }
        })
        return test;
    }
    function SetHash(alias, title, params){
        Routing.SetHash(alias, title, params);
    }
};

var OrderItemFormStep3ViewModel = function (parent) {
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

    self.AddContent = function (data) {
        if (data.hasOwnProperty('name_shipping_company'))
            self.nameShippingCompany(data.name_shipping_company);
        if (data.hasOwnProperty('site_shipping_company'))
            self.siteShippingCompany(data.site_shipping_company);
        if (data.hasOwnProperty('logo_shipping_company'))
            self.logoShippingCompany(data.logo_shipping_company);
        if (data.hasOwnProperty('id'))
            self.id(data.id);
        if (data.hasOwnProperty('name_method_shipping'))
            self.nameMethodShipping(data.name_method_shipping);
        if (data.hasOwnProperty('desc_method_shipping'))
            self.descMethodShipping(data.desc_method_shipping);
        if (data.hasOwnProperty('cost_shipping'))
            self.costShipping(data.cost_shipping);
    };
    self.ClickItem = function () {
        $.each(parent.shipping(), function (i) {
            parent.shipping()[i].cssActive('shipping_row');
            parent.shipping()[i].isActive(false);
        });

        self.cssActive('shipping_row active');
        self.isActive(true);
        parent.checked(self.id());
        parent.selectedItem(self);
    }
};

var OrderFormStep4ViewModel = function () {
    var self = this,
        title = 'Оформление заказа',
        alias = 'order';
    self.payment = ko.observableArray();
    self.checked = ko.observable();
    self.selectedItem = ko.observable();

    self.AddPayment = function (data) {
        self.payment = ko.observableArray();
        for (var i = 0; i <= data.length - 1; i++) {
            var item = new OrderItemFormStep4ViewModel(self);
            item.AddContent(data[i]);
            self.payment.push(item);
            if (data.length == 1)
                item.ClickItem();
        }
    };
    self.Back = function () {
        if ($.isEmptyObject(Parameters.cache.order.step1.profile)) {
            var t = Parameters.cache.history;
            for (var i = 0; i <= t.length - 1; i++) {
                var link = t.pop();
                if (link.route != 'order') {
                    SetHash(link.route, link.title, link.data, true);
                    return false;
                }
                else
                    SetHash(alias, title, {step: 3});
            }
        }
        else
            SetHash(alias, title, {step: 3});
    };
    self.Submit = function () {
        if (HasPayment()) {
            EventDispatcher.DispatchEvent('Order.step4.change', {
                id: self.checked(),
                selected: self.selectedItem(),
                fn: function () {
                    SetHash(alias, title, {step: 5});
                }
            });
        }
        else
            EventDispatcher.DispatchEvent('Order.step4.message');
    };
    self.ClickStep1 = function () {
        SetHash(alias, title, {step: 1, block: 'profile'});
    };
    self.ClickStep2 = function () {
        SetHash(alias, title, {step: 2});
    };
    self.ClickStep3 = function () {
        SetHash(alias, title, {step: 3});
    };
    self.ClickAddAddress = function () {
        SetHash(alias, title, {step: 2, block: 'add'});
    };
    function HasPayment() {
        var test = false;
        $.each(self.payment(), function (i) {
            if (self.payment()[i].isActive()) {
                test = true;
                return false;
            }
        })
        return test;
    }
    function SetHash(alias, title, params){
        Routing.SetHash(alias, title, params);
    }
};

var OrderItemFormStep4ViewModel = function (parent) {
    var self = this;
    self.id = ko.observable();
    self.logoPayment = ko.observable();
    self.descPayment = ko.observable();
    self.instrPayment = ko.observable();
    self.namePayment = ko.observable();
    self.costPayment = ko.observable();
    self.cssActive = ko.observable('payment_row');
    self.isActive = ko.observable(false);

    self.AddContent = function (data, parent) {
        self.id(data.id);
        if (data.hasOwnProperty('logo_payment'))
            self.logoPayment(data.logo_payment);
        if (data.hasOwnProperty('desc_payment'))
            self.descPayment(data.desc_payment);
        if (data.hasOwnProperty('instr_payment'))
            self.instrPayment(data.instr_payment);
        if (data.hasOwnProperty('name_payment'))
            self.namePayment(data.name_payment);
        if (data.hasOwnProperty('cost_payment'))
            self.costPayment(data.cost_payment);
    };
    self.ClickItem = function () {
        $.each(parent.payment(), function (i) {
            parent.payment()[i].cssActive('payment_row');
            parent.payment()[i].isActive(false);
        });

        self.cssActive('payment_row active');
        self.isActive(true);
        parent.checked(self.id());
        parent.selectedItem(self);
    };
};

var TestOrder = {
    Init: function () {
        if (typeof Widget == 'function') {
            OrderWidget.prototype = new Widget();
            var order = new OrderWidget();
            order.Init(order);
        }
        else {
            setTimeout(function () {
                TestOrder.Init()
            }, 100);
        }
    }
};

TestOrder.Init();


