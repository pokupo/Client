var ProfileWidget = function () {
    var self = this;
    self.widgetName = 'ProfileWidget';
    self.version = 1.0;
    self.minWidgetVersion = 1.0;
    self.maxWidgetVersion = 2.0;
    self.minTmplVersion = 1.0;
    self.maxTmplVersion = 2.0;
    self.InitWidget = InitWidget;

    var settings = {
        container: {widget: 'content', def: 'defaultProfileWidgetId'},
        tmpl: {
            path: "profileTmpl.html", // файл шаблонов
            id: {
                personal: "personalInformationTmpl", //id шаблона формы персоональных данных
                delivery: "deliveryAddressTmpl", //id шаблона списка адресов доставки
                deliveryForm: "deliveryAddressFormTmpl", //id шаблона формы адресов доставки
                security: "securityTmpl" //id шаблона формы смены пароля
            }
        },
        menu: {
            personalInformation: {title: 'Персональные данные', prefix: 'personal'},
            deliveryAddress: {title: 'Адреса доставки', prefix: 'delivery'},
            security: {title: 'Безопасность', prefix: 'security'}
        },
        regular: { // регулярные выражения полей
            email: /^[-._a-zA-Z0-9]+@(?:[a-z0-9][-a-z0-9]+\.)+[a-z]{2,6}$/,
            phone: /^([\d]{1})\s([\d]{3})\s([\d]{3})\s([\d]{2})\s([\d]{2})(\s([\d]{2}))?$/,
            firstName: /^[a-zёа-яА-ЯЁA-Z]+$/,
            lastName: /^[a-zа-яёА-ЯЁA-Z]+$/,
            middleName: /^[a-zа-яёА-ЯЁA-Z]+$/,
            birthDay: /^[\d]{2}.[\d]{2}.[\d]{4}$/,
            addressee: /^[a-zа-яёА-ЯЁA-Z\s]+$/,
            postIndex: /^[0-9]+$/
        },
        message: {
            sendToken: 'Код активации успешно выслан по указанным данным.',
            failSendToken: 'Код не был отправлен. Попробуйте повторить запрос позднее.',
            contactsEdit: 'Данные успешно обновлены',
            failContactsEdit: 'Данные не обновлены. Попробуйте повторить запрос позднее.',
            editProfile: 'Данные успешно обновлены',
            failEditProfile: 'Данные не обновлены. Попробуйте повторить запрос позднее.',
            changePassword: 'Пароль успешно изменен.',
            failChangePassord: 'Пароль не изменен.',
            addAddressDelivery: 'Данные успешно сохранены.',
            failAddAddressDelivery: 'Данные не сохранены. Попробуйте повторить запрос позднее.',
            deleteAddressDelivery: 'Адрес доставки успешно удален.',
            confirmDeleteAddressDelivery: "Вы уверены, что хотите удалить адрес?",
            failDeleteAddressDelivery: 'Адрес доставки не удален. Попробуйте повторить запрос позднее.',
            setDefaultDelivery: 'Данные успешно обновлены.',
            failSetDefaultDelivery: 'Данные не обновлены.'
        },
        error: { // сообщения об ошибках при валидации формы регистрации
            iconUser: {
                extension: 'Раширение фала должно быть jpeg, png или gif'
            },
            email: {
                empty: 'Поле обязательно для заполнения',
                maxLength: 'Максимум 64 символа',
                regular: 'Строка не является адресом электронной почты',
                uniq: 'Аккаунт для этого почтового ящика уже существует, рекомендуем пройти процедуру восстановления доступа. <a href="#">Восстановить доступ</a>'
            },
            phone: {
                empty: 'Поле обязательно для заполнения',
                regular: 'Не верный формат телефона',
                uniq: 'Аккаунт для этого номера телефона уже существует, рекомендуем пройти процедуру восстановления доступа. <a href="#">Восстановить доступ</a>'
            },
            password: {
                empty: 'Поле обязательно для заполнения',
                minLength: 'Пароль должен быть не менее 6 символов',
                maxLength: 'Пароль должен быть не более 64 символов',
                equal: 'Пароль не совпадает с образцом'
            },
            emailToken: {
                empty: 'Поле обязательно для заполнения',
                confirm: 'Указанный код не принят системой'
            },
            phoneToken: {
                empty: 'Поле обязательно для заполнения',
                confirm: 'Указанный код не принят системой'
            },
            addressee: {
                empty: 'Поле обязательно для заполнения',
                minLength: 'Минимум 2 символа',
                maxLength: 'Максимум 20 символов',
                regular: 'Только буквы латинского или русского алфавита'
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
        animate: typeof AnimateProfile == 'function' ? AnimateProfile : null,
        geoShop: 0
    };
    function InitWidget() {
        SetInputParameters();
        RegisterEvents();
        self.CheckRouteProfile();
    };
    function SetInputParameters() {
        var input = self.GetInputParameters('profile');

        if (!$.isEmptyObject(input))
            settings = self.UpdateSettings1(settings, input);

        Config.Containers.profile = settings.container;
    }

    self.CheckRouteProfile = function () {
        if (Routing.route == 'profile') {
            self.WidgetLoader(false);
            self.BaseLoad.Login(false, false, false, function (data) {
                if (!data.err) {
                    Loader.Indicator('MenuPersonalCabinetWidget', false);
                    self.BaseLoad.Tmpl(settings.tmpl, function () {
                        var pRoute = Routing.params,
                            menu = settings.menu;
                        if (!pRoute.info || pRoute.info == menu.personalInformation.prefix)
                            InfoPersonal();
                        if (pRoute.info == menu.deliveryAddress.prefix && !pRoute.form)
                            InfoDelivery();
                        if (pRoute.info == menu.deliveryAddress.prefix && pRoute.form == 'add')
                            InfoDeliveryForm();
                        if (pRoute.info == menu.security.prefix)
                            InfoSecurity();
                        InfoMenu();
                    });
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
    function RegisterEvents() {
        self.AddEvent('w.change.route', function () {
            self.CheckRouteProfile();
        });

        self.AddEvent('Profile.personal.checking', function (personal) {
            var day = personal.birthDayField().split('.');
            var birthDay = day[2] + '-' + day[1] + '-' + day[0];
            personal.birthDayHiddenField(birthDay);

            self.BaseLoad.EditProfile($('form#' + personal.cssRegistrationDataForm), function (data) {
                if (data.result == 'ok') {
                    self.ShowMessage(settings.message.editProfile, function () {
                        Parameters.cache.profile.personal = {};
                        Parameters.cache.userInformation = null;
                        Parameters.cache.profile.info = {};

                        window.location.reload(true);
                    }, false);
                }
                else {
                    if (!data.err)
                        data.err = settings.message.failEditProfile;
                    self.QueryError(data, function () {
                        self.DispatchEvent('Profile.personal.checking', personal)
                    })
                }
            });
        });

        self.AddEvent('Profile.postalAddress.checking', function (data) {
            var str = '?id_country=' + PrepareData(data.country().id);
            if (data.region() && data.region().regioncode)
                str = str + '&code_region=' + PrepareData(data.region().regioncode);
            else
                str = str + '&name_region=' + PrepareData(data.customRegion());
            if (data.city() && data.city().aoguid)
                str = str + '&code_city=' + PrepareData(data.city().aoguid);
            else
                str = str + '&name_city=' + PrepareData(data.customCity());
            str = str + '&address=' + PrepareData(data.customAddress()) + '&post_code=' + PrepareData(data.postIndex());

            self.BaseLoad.EditAddress(str, function (request) {
                if (request.result == 'ok') {
                    self.ShowMessage(settings.message.editProfile, function () {
                        Parameters.cache.profile.personal = {};
                        data.countryText(data.country().name);
                        data.regionText(data.customRegion());
                        data.cityText(data.customCity());
                        data.addressText(data.customAddress());
                        data.postIndexText(data.postIndex());
                        data.isEditBlock(0);
                    }, false);
                }
                else {
                    if (!request.err)
                        request.err = settings.message.failEditProfile;
                    self.QueryError(request, function () {
                        self.DispatchEvent('Profile.postalAddress.checking', data)
                    })
                }
            });
        });

        self.AddEvent('Profile.send.token', function (type) {
            self.BaseLoad.SendToken(type, function (data) {
                if (data.result == 'ok') {
                    self.ShowMessage(settings.message.sendToken, false, false);
                }
                else {
                    if (!data.err)
                        data.err = settings.message.failSendToken;
                    self.QueryError(data, function () {
                        self.DispatchEvent('Profile.send.token', type)
                    })
                }
            });
        });

        self.AddEvent('Profile.submit.token', function (token) {
            var user = Parameters.cache.userInformation;
            var params = [];
            params.push('username=' + PrepareData(user.login));
            if (token.type == 'mail')
                params.push('mail_token=' + token.value.emailToken());
            if (token.type == 'sms')
                params.push('sms_token=' + token.value.phoneToken());
            var str = '?' + params.join('&');

            self.BaseLoad.ActivateUser(str, function (data) {
                Parameters.cache.profile.info = {};
                if (self.QueryError(data, function () {
                        self.DispatchEvent('Profile.submit.token', token)
                    })) {
                    if (ValidateMailToken(data, token.value))
                        token.value.emailIsConfirm(true);
                    if (ValidatePhoneToken(data, token.value))
                        token.value.phoneIsConfirm(true);
                }
            });
        });

        self.AddEvent('Profile.contacts.checking', function (contacts) {
            var str = '?';
            if (contacts.email() && !contacts.emailIsConfirm())
                str = str + 'email=' + PrepareData(contacts.email());
            if (contacts.phone())
                str = str + '&phone=' + PrepareData(contacts.phone());
            self.BaseLoad.EditContacts(str, function (data) {
                if (data.result == 'ok') {
                    contacts.sentCode(true);
                    setTimeout(function () {
                        contacts.isExistPhone(true);
                    }, 60000);

                    contacts.sentEmailCode(true);
                    setTimeout(function () {
                        contacts.isExistMail(true);
                    }, 60000);

                    self.ShowMessage(settings.message.contactsEdit, false, false);
                }
                else {
                    if (!data.err)
                        data.err = settings.message.failContactsEdit;
                    self.QueryError(data, function () {
                        self.DispatchEvent('Profile.contacts.checking', contacts)
                    })
                }
            });
        });

        self.AddEvent('Profile.password.change', function (sequrity) {
            self.BaseLoad.ChangePassword($('form#' + sequrity.cssSequrityForm), function (data) {
                if (data.result == 'ok') {
                    sequrity.oldPassword(null);
                    sequrity.newPassword(null);
                    sequrity.confirmPassword(null);
                    self.ShowMessage(settings.message.changePassword, false, false);
                }
                else {
                    if (!data.err)
                        data.err = settings.message.failChangePassord;
                    self.QueryError(data,
                        function () {
                            self.DispatchEvent('Profile.password.change', sequrity)
                        },
                        function () {
                            sequrity.oldPassword(null);
                            sequrity.newPassword(null);
                            sequrity.confirmPassword(null);
                        }
                    );
                }
            });
        });

        self.AddEvent('Profile.delivery.add', function (data) {

            var str = '?id_country=' + PrepareData(data.country().id);
            if (data.region() && data.region().regioncode)
                str = str + '&code_region=' + PrepareData(data.region().regioncode);
            else
                str = str + '&name_region=' + PrepareData(data.customRegion());
            if (data.city() && data.city().aoguid)
                str = str + '&code_city=' + PrepareData(data.city().aoguid);
            else
                str = str + '&name_city=' + PrepareData(data.customCity());
            str = str + '&address=' + PrepareData(data.customAddress()) +
                '&post_code=' + PrepareData(data.postIndex()) +
                '&addressee=' + PrepareData(data.addressee()) +
                '&contact_phone=' + PrepareData(data.contactPhone()) +
                '&is_default=' + encodeURIComponent(data.isDefault() ? 'yes' : 'no');

            self.BaseLoad.AddDelivaryAddress(str, function (response) {
                if (response.result == 'ok') {
                    self.ShowMessage(settings.message.addAddressDelivery, function () {
                        Parameters.cache.delivery = null;
                        Routing.SetHash('profile', 'Личный кабинет', {info: 'delivery'});
                    }, false);
                }
                else {
                    if (!response.err)
                        response.err = settings.message.failAddAddressDelivery;
                    self.QueryError(response, function () {
                        self.DispatchEvent('Profile.delivery.add', data)
                    })
                }
            });
        });

        self.AddEvent('Profile.delivery.saveEdit', function (data) {

            var str = '?id_address=' + data.id() +
                '&id_country=' + PrepareData(data.country().id);
            if (data.region() && data.region().regioncode)
                str = str + '&code_region=' + PrepareData(data.region().regioncode);
            else
                str = str + '&name_region=' + PrepareData(data.customRegion());
            if (data.city() && data.city().aoguid)
                str = str + '&code_city=' + PrepareData(data.city().aoguid);
            else
                str = str + '&name_city=' + PrepareData(data.customCity());
            str = str + '&address=' + PrepareData(data.customAddress()) +
                '&post_code=' + PrepareData(data.postIndex()) +
                '&addressee=' + PrepareData(data.addressee()) +
                '&contact_phone=' + PrepareData(data.contactPhone()) +
                '&is_default=' + encodeURIComponent(data.isDefault() ? 'yes' : 'no');

            self.BaseLoad.EditDelivaryAddress(str, function (response) {
                if (response.result == 'ok') {
                    self.ShowMessage(settings.message.addAddressDelivery, function () {
                        Parameters.cache.delivery = null;
                        Routing.SetHash('profile', 'Личный кабинет', {info: 'delivery'});
                    }, false);
                }
                else {
                    if (!response.err)
                        response.err = settings.message.failAddAddressDelivery;
                    self.QueryError(response, function () {
                        self.DispatchEvent('Profile.delivery.add', data)
                    })
                }
            });
        });

        self.AddEvent('Profile.delivery.delete', function (delivery) {
            self.BaseLoad.DeleteDeliveryAddress(delivery.address.id, function (data) {
                if (data.result == 'ok') {
                    self.ShowMessage(settings.message.deleteAddressDelivery, function () {
                        Parameters.cache.delivery = null;
                        delivery.list.addressList.remove(delivery.address);
                    }, false);
                }
                else {
                    if (!data.err)
                        data.err = settings.message.failDeleteAddressDelivery;
                    self.QueryError(data, function () {
                        self.DispatchEvent('Profile.delivery.delete', delivery)
                    })
                }
            });
        });

        self.AddEvent('Profile.delivery.edit', function (data) {
            self.BaseLoad.Script(PokupoWidgets.model.content, function () {
                var form = new DeliveryAddressFormViewModel(settings);
                form.AddContent(data);
                FillDeliveryForm(form);
            });
        });

        self.AddEvent('Profile.delivery.sedDefault', function (data) {
            var str = '?id_address=' + data.id +
                '&is_default=yes';
            self.BaseLoad.SetDefaultDelivaryAddress(str, function (result) {
                if (result.result == 'ok') {
                }
                else {
                    self.QueryError(result, function () {
                        self.DispatchEvent('Profile.delivery.sedDefault', data)
                    })
                }
            });
        });
    };
    function PrepareData(data) {
        return encodeURIComponent($.trim(data))
    }

    function ValidateMailToken(data, contacts) {
        if (data.confirm_email) {
            if (data.confirm_email == 'no') {
                contacts.errorEmailConfirm(settings.error.emailToken.confirm);
                return false;
            }
            return true;
        }

        return false;
    }

    function ValidatePhoneToken(data, contacts) {
        if (data.confirm_phone) {
            if (data.confirm_phone == 'no') {
                contacts.errorPhoneConfirm(settings.error.phoneToken.confirm);
                return false;
            }
            return true;
        }

        return false;
    }

    function InfoMenu() {
        self.BaseLoad.Script(PokupoWidgets.model.menu, function () {
            if (!Routing.params.info)
                Routing.params.info = settings.menu.personalInformation.prefix;
            self.DispatchEvent('w.onload.menu', {
                menu: settings.menu,
                active: Routing.params.info
            });
        });
    }

    function InfoPersonal() {
        InsertContainerPersonal();
        self.BaseLoad.Script(PokupoWidgets.model.content, function () {
            self.BaseLoad.Profile(function (registration) {
                self.BaseLoad.ProfileInfo(function (data) {
                    FillPersonal(registration, data);
                });
            });
        })
    }

    function InfoDelivery() {
        self.BaseLoad.DeliveryAddressList(function (data) {
            InsertContainerDelivery();
            FillDelivery(data);
        });
    }

    function InfoDeliveryForm() {
        self.BaseLoad.Script(PokupoWidgets.model.content, function () {
            var form = new DeliveryAddressFormViewModel(settings);
            FillDeliveryForm(form);
        });
    }

    function InfoSecurity() {
        InsertContainerSecurity();
        FillSecurity();
    }

    function InsertContainerEmptyWidget() {
        self.ClearContainer(settings)
    }

    function InsertContainerPersonal() {
        self.InsertContainer(settings, 'personal')
    }

    function InsertContainerDelivery() {
        self.InsertContainer(settings, 'delivery')
    }

    function InsertContainerDeliveryForm() {
        self.InsertContainer(settings, 'deliveryForm')
    }

    function InsertContainerSecurity() {
        self.InsertContainer(settings, 'security')
    }

    function FillPersonal(data, reg) {
        var personal = new ProfilePersonalInformationViewModel(settings);

        var shopId = Parameters.shopId;
        if (settings.geoShop == 0)
            shopId = 0;
        self.BaseLoad.Country(shopId, function (c) {
            personal.AddContent(data, reg, c);
            RenderPersonal(personal);
        });
    }

    function FillDelivery(data) {
        var delivery = new ProfileDeliveryAddressViewModel(settings);
        delivery.AddContent(data);
        RenderDeliveryList(delivery);
    }

    function FillDeliveryForm(form) {
        var shopId = Parameters.shopId;
        if (settings.geoShop == 0)
            shopId = 0;
        self.BaseLoad.Country(shopId, function (data) {
            form.AddCountryList(data);
            InsertContainerDeliveryForm();
            RenderDeliveryForm(form);
        });
    }

    function FillSecurity() {
        var sequrity = new ProfileSecurityViewModel(settings);
        RenderSecurity(sequrity);
    }

    function RenderPersonal(data) {
        self.RenderTemplate(data, settings,
            function (data) {
                CallbackPersonal(data);
                if (settings.animate)
                    settings.animate(data.postalAddress.country);
            },
            function (data) {
                InsertContainerPersonal();
                RenderPersonal(data);
            },
            function () {
                InsertContainerEmptyWidget();
            },
            'delivery'
        );
    }

    function RenderDeliveryList(data) {
        self.RenderTemplate(data, settings, null,
            function (data) {
                InsertContainerDelivery();
                RenderDeliveryList(data);
            },
            function () {
                InsertContainerEmptyWidget();
            },
            'delivery'
        );
    }

    function RenderDeliveryForm(data) {
        self.RenderTemplate(data, settings,
            function (data) {
                CallbackDeliveryForm(data)
                if (settings.animate)
                    settings.animate(data.country);
            },
            function (data) {
                InsertContainerDeliveryForm();
                RenderDeliveryForm(data);
            },
            function () {
                InsertContainerEmptyWidget();
            },
            'deliveryForm'
        );
    }

    function RenderSecurity(data) {
        self.RenderTemplate(data, settings, null,
            function (data) {
                InsertContainerSecurity();
                RenderSecurity(data);
            },
            function () {
                InsertContainerEmptyWidget();
            },
            'security'
        );
    }

    function CallbackPersonal(form) {
        var address = form.postalAddress;
        $('#' + address.cssCountryList).change(function () {
            var v = $('#' + address.cssCountryList + " option:selected").val();
            $.grep(address.countryList(), function (data) {
                if (data.id == v) {
                    address.country(data);
                    address.customRegion(null);
                    address.region(null);
                    address.customCity(null);
                    address.city(null);
                    address.customAddress(null)
                    address.address(null);
                    address.postIndex(null);
                }
            })
        });

        $('#' + address.cssRegionList).autocomplete({
            source: function (request, response) {
                self.BaseLoad.Region(address.country().id + '/' + PrepareData(request.term), function (data) {
                    if (!data.err) {
                        response($.map(data, function (item) {
                            return {
                                value: $.trim(item.formalname + ' ' + item.shortname),
                                region: item
                            };
                        }));
                    }
                    else {
                        $('#' + address.cssRegionList).autocomplete("close");
                        return false;
                    }
                });
            },
            select: function (event, ui) {
                address.region(ui.item.region);
                address.customRegion(ui.item.value);
                if (ui.item.region && ui.item.region.postalcode != 0)
                    address.postIndex(ui.item.region.postalcode);
                else {
                    address.postIndex(null);
                }
            }
        });

        $('#' + address.cssCityList).autocomplete({
            source: function (request, response) {
                if (address.region()) {
                    self.BaseLoad.City(address.country().id + '/' + PrepareData(address.region().regioncode) + '/' + PrepareData(request.term), function (data) {
                        if (!data.err) {
                            response($.map(data, function (item) {
                                return {
                                    value: $.trim(item.shortname + '. ' + item.formalname),
                                    city: item
                                };
                            }));
                        }
                        else {
                            $('#' + address.cssCityList).autocomplete("close");
                            return false;
                        }
                    });
                }
            },
            select: function (event, ui) {
                address.city(ui.item.city);
                address.customCity(ui.item.value);
                if (ui.item.city && ui.item.city.postalcode != 0)
                    address.postIndex(ui.item.city.postalcode);
                else
                    address.postIndex(null);
            }
        });

        $('#' + address.cssAddress).autocomplete({
            source: function (request, response) {
                if (address.region()) {
                    self.BaseLoad.Street(address.country().id + '/' + PrepareData(address.region().regioncode) + '/' + PrepareData(address.city().aoguid) + '/' + PrepareData(request.term), function (data) {
                        if (!data.err) {
                            response($.map(data, function (item) {
                                return {
                                    value: $.trim(item.shortname + '. ' + item.formalname),
                                    street: item
                                };
                            }));
                        }
                        else {
                            $('#' + address.cssAddress).autocomplete("close");
                            return false;
                        }
                    });
                }
            },
            select: function (event, ui) {
                address.address(ui.item.street);
                address.customAddress(ui.item.value);
                if (ui.item.street && ui.item.street.postalcode != 0)
                    address.postIndex(ui.item.street.postalcode);
                else
                    address.postIndex(null);
            }
        });

        $('#' + address.cssRegionList).bind('textchange', function (event, previousText) {
            address.customRegion($(this).val());
            address.customCity(null);
            address.city(null);
            address.customAddress(null)
            address.address(null);
            address.postIndex(null);
        });

        $('#' + address.cssCityList).bind('textchange', function (event, previousText) {
            address.customCity($(this).val());
            address.customAddress(null)
            address.address(null);
            address.postIndex(null);
        });

        if (Routing.params.edit == 'postal_address') {
            self.ScrollTop(address.cssPostAddressForm, 700);
        }
    }

    function CallbackDeliveryForm(delivery) {
        $('#' + delivery.cssRegionList).autocomplete({
            source: function (request, response) {
                self.BaseLoad.Region(delivery.country().id + '/' + PrepareData(request.term), function (data) {
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
                    delivery.postIndex(ui.item.region.postalcode);
                else {
                    delivery.postIndex(null);
                }
            }
        });

        $('#' + delivery.cssCityList).autocomplete({
            source: function (request, response) {
                if (delivery.region()) {
                    self.BaseLoad.City(delivery.country().id + '/' + PrepareData(delivery.region().regioncode) + '/' + PrepareData(request.term), function (data) {
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
                    delivery.postIndex(ui.item.city.postalcode);
                else
                    delivery.postIndex(null);
            }
        });

        $('#' + delivery.cssAddress).autocomplete({
            source: function (request, response) {
                if (delivery.region()) {
                    self.BaseLoad.Street(delivery.country().id + '/' + PrepareData(delivery.region().regioncode) + '/' + PrepareData(delivery.city().aoguid) + '/' + PrepareData(request.term), function (data) {
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
                    delivery.postIndex(ui.item.street.postalcode);
                else
                    delivery.postIndex(null);
            }
        });
        $('#' + delivery.cssCountryList).change(function () {
            var v = $('#' + delivery.cssCountryList + ' option:selected').val();
            $.grep(delivery.countryList(), function (data) {
                if (data.id == v) {
                    delivery.country(data);
                    delivery.customRegion(null);
                    delivery.region(null);
                    delivery.customCity(null);
                    delivery.city(null);
                    delivery.customAddress(null)
                    delivery.address(null);
                    delivery.postIndex(null);
                }
            })
        });

        $('#' + delivery.cssRegionList).bind('textchange', function (event, previousText) {
            delivery.customRegion($(this).val());
            delivery.customCity(null);
            delivery.city(null);
            delivery.customAddress(null)
            delivery.address(null);
            delivery.postIndex(null);
        });

        $('#' + delivery.cssCityList).bind('textchange', function (event, previousText) {
            delivery.customCity($(this).val());
            delivery.customAddress(null)
            delivery.address(null);
            delivery.postIndex(null);
        });
    }
};

var ProfilePersonalInformationViewModel = function (settings) {
    var self = this;
    self.registrationData = null;
    self.postalAddress = null;
    self.contacts = null;

    self.AddContent = function (data, reg, c) {
        var registrationData = new ProfileDataRegistrationViewModel(settings);
        if (!data.err)
            registrationData.AddContent(data);
        registrationData.dateRegistration(reg.date_reg);
        self.registrationData = registrationData;

        var postalAddress = new ProfilePostalAddressViewModel(settings);
        postalAddress.AddCountryList(c);
        if (!data.err)
            postalAddress.AddContent(data);
        self.postalAddress = postalAddress;

        self.contacts = new ProfileContactsViewModel(settings);
        self.contacts.AddContent();
    };
};

var ProfileDataRegistrationViewModel = function (settings) {
    var self = this;
    self.data = null;
    self.username = ko.observable();
    self.dateRegistration = ko.observable();
    self.gender = ko.observable();
    self.genderText = ko.computed(function () {
        if (self.gender() == 'm')
            return 'мужской';
        else
            return 'женский';
    }, this);
    self.errorGender = ko.observable(null);
    self.lastName = ko.observable();
    self.firstName = ko.observable();
    self.middleName = ko.observable();
    self.fullName = ko.computed(function () {
        var str = '';
        if (self.lastName())
            str = str + self.lastName();
        if (self.firstName())
            str = str + ' ' + self.firstName();
        if (self.middleName())
            str = str + ' ' + self.middleName();
        return str;
    }, this);
    self.birthDay = ko.observable();
    self.cssBirthDay = 'birthDay';
    self.rating = ko.observable();
    self.checkInfo = ko.observable();

    self.lastNameField = ko.observable();
    self.firstNameField = ko.observable();
    self.middleNameField = ko.observable();
    self.birthDayField = ko.observable();
    self.birthDayHiddenField = ko.observable();

    self.errorLastName = ko.observable(null);
    self.errorFirstName = ko.observable(null);
    self.errorMiddleName = ko.observable(null);
    self.errorBirthDay = ko.observable(null);

    self.isEditBlock = ko.observable(0);
    self.iconUser = ko.observable();
    self.cssIconUser = 'avatar_file';
    self.errorIconUser = ko.observable(null);

    self.cssRegistrationDataForm = 'profile_registration_data_form';

    function ValidationForm() {
        var test = true;
        if (!IconUserValidation())
            test = false;
        if (!FirstNameValidation())
            test = false;
        if (!LastNameValidation())
            test = false;
        if (!MiddleNameValidation())
            test = false;
        if (!BirthDayValidation())
            test = false;

        return test;
    }
    function IconUserValidation() {
        var file = $('#' + self.cssIconUser).val();
        if (file) {
            var fileAr = file.split('.');
            var ext = fileAr[fileAr.length - 1];
            ext = ext.toLowerCase();

            if ($.inArray(ext, ['jpeg', 'jpg', 'png', 'gif']) < 0) {
                self.errorIconUser(settings.error.iconUser.extension);
                return false;
            }
        }
        self.errorIconUser(null);
        return true;
    }
    function FirstNameValidation() {
        var error = settings.error.firstName;
        if (!self.firstNameField()) {
            self.errorFirstName(error.empty);
            return false;
        }
        if (self.firstNameField().length < 2) {
            self.errorFirstName(error.minLength);
            return false;
        }
        if (self.firstNameField().length > 20) {
            self.errorFirstName(error.maxLength);
            return false;
        }
        if (!settings.regular.firstName.test(self.firstNameField())) {
            self.errorFirstName(error.regular);
            return false;
        }
        self.errorFirstName(null);
        return true;
    }
    function LastNameValidation() {
        var error = settings.error.lastName;
        if (!self.lastNameField()) {
            self.errorLastName(error.empty);
            return false;
        }
        if (self.lastNameField().length < 2) {
            self.errorLastName(error.minLength);
            return false;
        }
        if (self.lastNameField().length > 20) {
            self.errorLastName(error.maxLength);
            return false;
        }
        if (!settings.regular.lastName.test(self.lastNameField())) {
            self.errorLastName(error.regular);
            return false;
        }
        self.errorLastName(null);
        return true;
    }
    function MiddleNameValidation() {
        var error = settings.error.middleName;
        if (self.middleNameField()) {
            if (self.middleNameField().length < 2) {
                self.errorMiddleName(error.minLength);
                return false;
            }
            if (self.middleNameField().length > 20) {
                self.errorMiddleName(error.maxLength);
                return false;
            }
            if (!settings.regular.middleName.test(self.middleNameField())) {
                self.errorMiddleName(error.regular);
                return false;
            }
        }
        self.errorMiddleName(null);
        return true;
    }
    function BirthDayValidation() {
        var error = settings.error.birthDay;
        if (!self.birthDayField()) {
            self.errorBirthDay(error.empty);
            return false;
        }
        if (!settings.regular.birthDay.test(self.birthDayField())) {
            self.errorBirthDay(error.regular);
            return false;
        }
        var dateArray = self.birthDayField().split('.');
        var date = new Date(dateArray[2], dateArray[1] - 1, dateArray[0]);

        var now = new Date();
        var minDate = new Date(now.getYear() - 18, now.getMonth(), now.getDate());
        if (minDate < date) {
            self.errorBirthDay(error.minDate);
            return false;
        }

        var now = new Date();
        var maxDate = new Date(now.getYear() - 101, now.getMonth(), now.getDate());
        if (maxDate > date) {
            self.errorBirthDay(error.maxDate);
            return false;
        }

        self.errorBirthDay(null);
        return true;
    };

    self.AddContent = function (data) {
        self.data = data
        var user = Parameters.cache.profile.info;
        if (user.route_icon_user)
            self.iconUser(user.route_icon_user + '?' + EventDispatcher.HashCode(EventDispatcher.GetUUID()));
        self.username(user.login);
        self.gender(data.gender);
        self.lastName(data.f_name);
        self.firstName(data.s_name);
        self.middleName(data.m_name);
        self.birthDay(data.birth_day);
        self.rating(user.rating_user);
        self.lastNameField(self.data.s_name);
        self.firstNameField(self.data.f_name);
        self.middleNameField(self.data.m_name);
        self.birthDayField(self.data.birth_day);
        self.checkInfo(data.check_info);
    };
    self.isNew = function () {
        if (data)
            return false
        return true;
    }
    self.Edit = function () {
        self.isEditBlock(1);
    };
    self.Back = function () {
        self.lastNameField(self.data.f_name);
        self.firstNameField(self.data.s_name);
        self.middleNameField(self.data.m_name);
        self.birthDayField(self.data.birth_day);
        self.isEditBlock(0);
    };
    self.Submit = function () {
        if (ValidationForm()) {
            EventDispatcher.DispatchEvent('Profile.personal.checking', self);
        }
    };
    self.ClickItem = function (val, data) {
        self.gender(val);
    }
};

var ProfilePostalAddressViewModel = function (settings) {
    var self = this;
    self.data = null;
    self.cssPostAddressForm = 'profile_postal_address_form';

    self.countryText = ko.observable();
    self.idCountry = ko.observable();
    self.country = ko.observable();
    self.cssCountryList = 'country_list_profile';
    self.errorCountry = ko.observable(null);

    self.regionText = ko.observable()
    self.region = ko.observable();
    self.customRegion = ko.observable();
    self.cssRegionList = 'region_list';
    self.errorRegion = ko.observable(null);
    self.showRegion = ko.computed(function () {
        if (self.country())
            return false;
        return true;
    }, this);

    self.cityText = ko.observable();
    self.city = ko.observable();
    self.customCity = ko.observable();
    self.cssCityList = 'city_list';
    self.errorCity = ko.observable(null);
    self.showCity = ko.computed(function () {
        if (self.customRegion())
            return false;
        return true;
    }, this);

    self.addressText = ko.observable();
    self.address = ko.observable();
    self.customAddress = ko.observable();
    self.cssAddress = 'address';
    self.errorAddress = ko.observable(null);
    self.showAddress = ko.computed(function () {
        if (self.customCity())
            return false;
        return true;
    }, this);

    self.postIndexText = ko.observable();
    self.postIndex = ko.observable();
    self.cssPostIndex = 'post_index';
    self.errorPostIndex = ko.observable(null);
    self.showPostIndex = ko.computed(function () {
        if (self.customAddress())
            return false;
        return true;
    }, this);

    self.checkInfo = ko.observable();

    self.countryList = ko.observableArray();

    self.isEditBlock = ko.observable(0);

    self.AddContent = function (data) {
        self.data = data;

        self.idCountry(data.id_country);
        self.countryText(data.country);
        $.grep(self.countryList(), function (c) {
            if (data.id_country == c.id) {
                self.country(c);
            }
        })

        self.regionText(data.region);
        self.region({regioncode: data.code_region});
        self.customRegion(data.region);

        self.cityText(data.city);
        self.city({aoguid: data.code_city});
        self.customCity(data.city);

        self.addressText(data.address);
        self.address(data.address);
        self.customAddress(data.address);

        self.postIndexText(data.post_code);
        self.postIndex(data.post_code);

        self.checkInfo(data.check_info);

        if (Routing.params.edit == 'postal_address')
            self.isEditBlock(1);
    };
    self.AddCountryList = function (data) {
        if (data.length > 0) {
            for (var i = 0; i <= data.length - 1; i++) {
                self.countryList.push(new CountryListViewModel(data[i]));
            }
        }
    };
    self.Edit = function () {
        self.isEditBlock(1);
    };
    self.Back = function () {
        self.idCountry(self.data.id_country);

        self.region({regioncode: self.data.code_region});
        self.customRegion(self.data.region);

        self.city({aoguid: self.data.code_city});
        self.customCity(self.data.city);

        self.address(self.data.address);
        self.customAddress(self.data.address);

        self.postIndexText(self.data.post_code);
        self.postIndex(self.data.post_code);

        self.checkInfo(self.data.check_info);
        self.isEditBlock(0);
    };
    self.Submit = function () {
        if (ValidationForm()) {
            EventDispatcher.DispatchEvent('Profile.postalAddress.checking', self);
        }
    };
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
    };
};

var ProfileContactsViewModel = function (settings) {
    var self = this;
    self.email = ko.observable();
    self.isExistEmail = ko.observable();
    self.sentEmailCode = ko.observable();

    self.emailToken = ko.observable();
    self.errorEmail = ko.observable(null);
    self.errorEmailToken = ko.observable(null);
    self.emailIsConfirm = ko.observable(false);

    self.phone = ko.observable();
    self.cssPhone = 'phone_profile';
    self.isExistPhone = ko.observable();
    self.sentCode = ko.observable();

    self.phoneToken = ko.observable();
    self.errorPhone = ko.observable(null);
    self.errorPhoneToken = ko.observable(null);
    self.phoneIsConfirm = ko.observable(false);

    self.AddContent = function () {
        var user = Parameters.cache.profile.info;
        if (user.confirm_phone == 'yes')
            self.phoneIsConfirm(true);
        if (user.confirm_email == 'yes')
            self.emailIsConfirm(true);
        if (user.phone) {
            self.phone(user.phone);
            self.isExistPhone(true);
        }
        if (user.email) {
            self.email(user.email);
            self.isExistEmail(true);
        }
    };
    function ValidationForm() {
        var test = true;
        if (!EmailValidation())
            test = false;
        if (!PhoneValidation())
            test = false;
        return test;
    }
    function EmailValidation() {
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
    }
    function PhoneValidation() {
        var error = settings.error.phone;
        if (self.emailIsConfirm()) {
            if (!self.phone()) {
                self.errorPhone(error.empty);
                return false;
            }
        }
        if (self.phone()) {
            if (!settings.regular.phone.test($.trim(self.phone()))) {
                self.errorPhone(error.regular);
                return false;
            }
        }
        self.errorPhone(null);
        return true;
    }
    function EmailTokenValidation() {
        var token = $.trim(self.emailToken());
        self.emailToken(token);
        if (!self.emailToken()) {
            self.errorEmailToken(settings.error.emailToken.empty);
            return false;
        }

        self.errorEmailToken(null);
        return true;
    }
    function PhoneTokenValidation() {
        var token = $.trim(self.phoneToken());
        self.phoneToken(token);
        if (!self.phoneToken()) {
            self.errorPhoneToken(settings.error.phoneToken.empty);
            return false;
        }

        self.errorPhoneToken(null);
        return true;
    };
    self.SendMailToken = function () {
        self.sentEmailCode(true);
        self.isExistEmail(false);
        setTimeout(function () {
            self.isExistEmail(true);
        }, 60000);
        DispatchEvent('Profile.send.token', 'mail');
    };
    self.SendPhoneToken = function () {
        self.sentCode(true);
        self.isExistPhone(false);
        setTimeout(function () {
            self.isExistPhone(true);
        }, 60000);
        DispatchEvent('Profile.send.token', 'sms');
    };
    self.SubmitMailToken = function () {
        if (EmailTokenValidation()) {
            DispatchEvent('Profile.submit.token', {type: 'mail', value: self});
        }
    };
    self.SubmitPhoneToken = function () {
        if (PhoneTokenValidation()) {
            DispatchEvent('Profile.submit.token', {type: 'sms', value: self});
        }
    };
    self.SubmitForm = function () {
        if (ValidationForm()) {
            DispatchEvent('Profile.contacts.checking', self);
        }
    };
    function DispatchEvent(alias, params){
        EventDispatcher.DispatchEvent(alias, params);
    }
};

var ProfileDeliveryAddressViewModel = function (settings) {
    var self = this;
    self.addressList = ko.observableArray();
    self.cssAddressList = 'delivary_address_list';
    self.checked = ko.observable();

    self.ClickAddAddress = function () {
        Routing.SetHash('profile', 'Личный кабинет', {info: 'delivery', form: 'add'})
    };

    self.AddContent = function (data) {
        for (var key in data) {
            DeliveryAddressViewModel.prototype = new Widget();
            self.addressList.push(new DeliveryAddressViewModel(data[key], self, settings));
        }
    }
};

var DeliveryAddressViewModel = function (data, list, settings) {
    var self = this;
    self.id = data.id;
    self.idCountry = data.id_country;
    self.country = data.country;
    self.codeRegion = data.code_region;
    self.region = data.region;
    self.codeCity = data.code_city;
    self.city = data.city;
    self.postIndex = data.post_code;
    self.address = data.address;
    self.addressee = data.addressee;

    self.list = list.addressList();

    if (data.is_default == 'yes') {
        self.isDefault = ko.observable(true);
        self.cssIsDefault = ko.observable('delivery_address_is_default active');
        list.checked(self.id);
    }
    else {
        self.isDefault = ko.observable(false);
        self.cssIsDefault = ko.observable('delivery_address_is_default');
    }

    self.contactPhone = data.contact_phone;

    self.Edit = function () {
        if (self.id)
            DispatchEvent('Profile.delivery.edit', self);
        else
            Routing.SetHash('profile', 'Личный кабинет', {info: 'personal', edit: 'postal_address'});
    };
    self.Delete = function () {
        self.Confirm(settings.message.confirmDeleteAddressDelivery, function () {
            DispatchEvent('Profile.delivery.delete', {address: self, list: list});
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

        DispatchEvent('Profile.delivery.sedDefault', self);
    };
    function DispatchEvent(alias, params){
        EventDispatcher.DispatchEvent(alias, params);
    }
};

var DeliveryAddressFormViewModel = function (settings) {
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

    self.postIndex = ko.observable();
    self.cssPostCode = 'delivery_post_index';
    self.errorPostCode = ko.observable(null);
    self.showPostIndex = ko.computed(function () {
        if (self.customAddress())
            return false;
        return true;
    }, this);

    self.addressee = ko.observable();
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
                if (data[i].id == self.idCountry())
                    self.country(data[i]);
            }
        }
    };

    self.AddContent = function (data) {
        self.id(data.id);
        self.idCountry = ko.observable(data.idCountry);
        self.region({regioncode: data.codeRegion});
        self.customRegion(data.region);
        self.city({aoguid: data.codeCity});
        self.customCity(data.city);
        self.postIndex(data.postIndex);
        self.customAddress(data.address);
        self.addressee(data.addressee);
        self.isDefault(data.isDefault());
        self.contactPhone(data.contactPhone);
    };
    self.Submit = function () {
        if (ValidationForm()) {
            EventDispatcher.DispatchEvent('Profile.delivery.add', self);
        }
    };
    self.Edit = function () {
        if (ValidationForm()) {
            EventDispatcher.DispatchEvent('Profile.delivery.saveEdit', self);
        }
    };
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
        if (!self.postIndex()) {
            self.errorPostCode(error.empty);
            return false;
        }
        if (5 > self.postIndex().length || self.postIndex().length > 6) {
            self.errorPostCode(error.length);
            return false;
        }
        if (!settings.regular.postIndex.test(self.postIndex())) {
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
    self.Back = function () {
        Routing.SetHash('profile', 'Личный кабинет', {info: 'delivery'});
    };
};

var ProfileSecurityViewModel = function (settings) {
    var self = this;
    self.cssSequrityForm = 'profile_sequrity_form';

    self.oldPassword = ko.observable();
    self.cssOldPassword = 'profile_old_password';
    self.errorOldPassword = ko.observable(null);

    self.newPassword = ko.observable();
    self.cssNewPassword = 'profile_new_password';
    self.errorNewPassword = ko.observable(null);

    self.confirmPassword = ko.observable();
    self.cssConfirmPassword = 'profile_confirm_password';
    self.errorConfirmPassword = ko.observable(null);

    self.Submit = function () {
        if (ValidationForm()) {
            EventDispatcher.DispatchEvent('Profile.password.change', self);
        }
    };
    function ValidationForm() {
        var test = true;
        if (!OldPasswordValidation())
            test = false;
        if (!NewPasswordValidation())
            test = false;
        if (!ConfirmPasswordValidation())
            test = false;

        return test;
    }
    function OldPasswordValidation() {
        var error = settings.error.password;
        self.oldPassword($('input#' + self.cssOldPassword).val());
        if (!self.oldPassword()) {
            self.errorOldPassword(error.empty);
            return false;
        }
        if (self.oldPassword().length < 6) {
            self.errorOldPassword(error.minLength);
            return false;
        }
        if (self.oldPassword().length > 64) {
            self.errorOldPassword(error.maxLength);
            return false;
        }

        self.errorOldPassword(null);
        return true;
    }
    function NewPasswordValidation() {
        var error = settings.error.password;
        self.newPassword($('input#' + self.cssNewPassword).val());
        if (!self.newPassword()) {
            self.errorNewPassword(error.empty);
            return false;
        }
        if (self.newPassword().length < 6) {
            self.errorNewPassword(error.minLength);
            return false;
        }
        if (self.newPassword().length > 64) {
            self.errorNewPassword(error.maxLength);
            return false;
        }

        self.errorNewPassword(null);
        return true;
    }
    function ConfirmPasswordValidation() {
        var error = settings.error.password;
        self.confirmPassword($('input#' + self.cssConfirmPassword).val());
        if (!self.confirmPassword()) {
            self.errorConfirmPassword(error.empty);
            return false;
        }
        if (self.newPassword() != self.confirmPassword()) {
            self.errorConfirmPassword(error.equal);
            return false;
        }
        self.errorConfirmPassword(null);
        return true;
    };
};

var TestProfile = {
    Init: function () {
        if (typeof Widget == 'function') {
            ProfileWidget.prototype = new Widget();
            var profile = new ProfileWidget();
            profile.Init(profile);
        }
        else {
            setTimeout(function () {
                TestProfile.Init();
            }, 100);
        }
    }
};

TestProfile.Init();