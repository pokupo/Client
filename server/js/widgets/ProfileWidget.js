 var ProfileWidget = function() {
    var self = this;
    self.widgetName = 'ProfileWidget';
    self.settings = {
        containerFormId: null,
        tmplPath: null,
        personalInformationTmplId: null,
        deliveryAddressTmpl: null,
        deliveryAddressFormTmpl : null,
        securityTmpl: null,
        inputParameters: {},
        geoShop: 0,
        style: null
    };
    self.InitWidget = function() {
        self.settings.containerFormId = Config.Containers.profile.widget;
        self.settings.tmplPath = Config.Profile.tmpl.path;
        self.settings.personalInformationTmplId = Config.Profile.tmpl.personalInformationTmpl;
        self.settings.deliveryAddressTmpl = Config.Profile.tmpl.deliveryAddressTmpl;
        self.settings.deliveryAddressFormTmpl = Config.Profile.tmpl.deliveryAddressFormTmpl;
        self.settings.securityTmpl = Config.Profile.tmpl.securityTmpl;
        self.settings.style = Config.Profile.style;
        self.SetInputParameters();
        self.RegisterEvents();
        self.SetPosition();
    };
    self.SetInputParameters = function() {
        var input = {};
        if(Config.Base.sourceParameters == 'string'){
            var temp = JSCore.ParserInputParameters(/ProfileWidget.js/);
            if(temp.profile){
                input = temp.profile;
            }
        }
        if(Config.Base.sourceParameters == 'object' && typeof WParameters !== 'undefined' && WParameters.profile){
            input = WParameters.profile;
        }
        
        if(!$.isEmptyObject(input)){
            if (input.tmpl)
                self.settings.tmplPath = 'profile/' + input.tmpl + '.html';
            if (input.geoShop)
                self.settings.geoShop = input.geoShop;
        }
        self.settings.inputParameters = input;
    };
    self.CheckRouteProfile = function() {
        if (Routing.route == 'profile') {
            self.WidgetLoader(false);
            self.BaseLoad.Login(false, false, false, function(data){
                if(!data.err){
                    Loader.Indicator('MenuPersonalCabinetWidget', false);
                    if (!Routing.params.info || Routing.params.info == Config.Profile.menu.personalInformation.prefix)
                        self.Info.Personal();
                    if (Routing.params.info == Config.Profile.menu.deliveryAddress.prefix && !Routing.params.form)
                        self.Info.Delivery();
                    if (Routing.params.info == Config.Profile.menu.deliveryAddress.prefix && Routing.params.form == 'add')
                        self.Info.DeliveryForm();
                    if (Routing.params.info == Config.Profile.menu.security.prefix)
                        self.Info.Security();
                    self.Info.Menu();
                }
                else{
                    Parameters.cache.lastPage = Parameters.cache.history[Parameters.cache.history.length-1];
                    Routing.SetHash('login', 'Авторизация пользователя', {});
                    self.WidgetLoader(true);
                }  
            });
        }
        else
            self.WidgetLoader(true);
    };
    self.RegisterEvents = function() {
        if (JSLoader.loaded) {
            self.BaseLoad.Tmpl(self.settings.tmplPath, function() {
                self.CheckRouteProfile();
            });
        }
        else {
            EventDispatcher.AddEventListener('onload.scripts', function(data) {
                self.BaseLoad.Tmpl(self.settings.tmplPath, function() {
                    self.CheckRouteProfile();
                });
            });
        }

        EventDispatcher.AddEventListener('widget.change.route', function() {
            self.CheckRouteProfile();
        });
        
        EventDispatcher.AddEventListener('ProfileWidget.personal.checking', function(personal){
            var day = personal.birthDayField().split('.');
            var birthDay = day[2] + '-' + day[1] + '-' + day[0];
            personal.birthDayHiddenField(birthDay);

            self.BaseLoad.EditProfile($('form#' + personal.cssRegistrationDataForm), function(data) {
                if(data.result == 'ok'){
                    Parameters.cache.profile.personal = {};
                    personal.lastName(personal.lastNameField());
                    personal.firstName(personal.firstNameField());
                    personal.middleName(personal.middleNameField());
                    personal.birthDay(personal.birthDayField());
                    self.ShowMessage(Config.Profile.message.editProfile,function(){
                        personal.isEditBlock(0);
                    }, false);
                }
                else{
                    if(!data.err)
                        data.err = Config.Profile.message.failEditProfile;
                    self.QueryError(data, function(){EventDispatcher.DispatchEvent('ProfileWidget.personal.checking', personal)})
                }
            });
        });
        
        EventDispatcher.AddEventListener('ProfileWidget.postalAddress.checking', function(data){
            var str = '?id_country=' + encodeURIComponent($.trim(data.country().id));
            if (data.region())
                str = str + '&code_region=' + encodeURIComponent($.trim(data.region().regioncode));
            else
                str = str + '&name_region=' + encodeURIComponent($.trim(data.customRegion()));
            if (data.city())
                str = str + '&code_city=' + encodeURIComponent($.trim(data.city().aoguid));
            else
                str = str + '&name_city=' + encodeURIComponent($.trim(data.customCity()));
            str = str + '&address=' + encodeURIComponent($.trim(data.customAddress())) + '&post_code=' + encodeURIComponent($.trim(data.postIndex()));

            self.BaseLoad.EditAddress(str, function(request) {
                if(request.result == 'ok'){
                    self.ShowMessage(Config.Profile.message.editProfile,  function(){
                        Parameters.cache.profile.personal = {};
                        data.countryText(data.country().name);
                        data.regionText(data.customRegion());
                        data.cityText(data.customCity());
                        data.addressText(data.customAddress());
                        data.postIndexText(data.postIndex());
                        data.isEditBlock(0);
                    }, false);
                }
                else{
                    if(!request.err)
                        request.err = Config.Profile.message.failEditProfile;
                    self.QueryError(request, function(){EventDispatcher.DispatchEvent('ProfileWidget.postalAddress.checking', data)})
                }
            });
        });
        
        EventDispatcher.AddEventListener('ProfileWidget.send.token', function(type){
            self.BaseLoad.SendToken(type, function(data){
                if(data.result == 'ok'){
                    self.ShowMessage(Config.Profile.message.sendToken, false, false);
                }
                else{
                    if(!data.err)
                        data.err = Config.Profile.message.failSendToken;
                    self.QueryError(data, function(){EventDispatcher.DispatchEvent('ProfileWidget.send.token', type)})
                }
            });
        });
        
        EventDispatcher.AddEventListener('ProfileWidget.submit.token', function(token){
            var user = Parameters.cache.userInformation;
            var params = [];
            params.push('username=' + encodeURIComponent(user.login));
            if (token.type == 'mail')
                params.push('mail_token=' + token.value.emailToken());
            if (token.type == 'sms')
                params.push('sms_token=' + token.value.phoneToken());
            var str = '?' + params.join('&');

            self.BaseLoad.ActivateUser(str, function(data) {
                Parameters.cache.profile.info = {};
                var test = true;
                if (self.QueryError(data, function(){EventDispatcher.DispatchEvent('ProfileWidget.submit.token', token)})){
                    if (self.Validate.MailToken(data, token.value))
                        token.value.emailIsConfirm(true);
                    if (self.Validate.PhoneToken(data, token.value))
                        token.value.phoneIsConfirm(true);
                }
            });
        });
        
        EventDispatcher.AddEventListener('ProfileWidget.contacts.checking', function(contacts){
            var str = '?';
            if(contacts.email() && !contacts.emailIsConfirm())
                str = str + 'email=' + encodeURIComponent(contacts.email());
            if(contacts.phone())
                str = str + '&phone=' + encodeURIComponent(contacts.phone());
            self.BaseLoad.EditContacts(str, function(data){
                if(data.result == 'ok'){
                    contacts.sentCode(true);
                    setTimeout(function() {
                        contacts.isExistPhone(true);
                    }, 60000);
                    
                    contacts.sentEmailCode(true);
                    setTimeout(function() {
                        contacts.isExistMail(true);
                    }, 60000);
                    
                    self.ShowMessage(Config.Profile.message.contactsEdit, false, false);
                }
                else{
                    if(!data.err)
                        data.err = Config.Profile.message.failContactsEdit;
                    self.QueryError(data, function(){EventDispatcher.DispatchEvent('ProfileWidget.contacts.checking', contacts)})
                }
            });
        });
        
        EventDispatcher.AddEventListener('ProfileWidget.password.change', function(sequrity){
            self.BaseLoad.ChangePassword($('form#' + sequrity.cssSequrityForm), function(data){
                if(data.result == 'ok'){
                    sequrity.oldPassword(null);
                    sequrity.newPassword(null);
                    sequrity.confirmPassword(null);
                    self.ShowMessage(Config.Profile.message.changePassword, false, false);
                }
                else{
                    if(!data.err)
                        data.err = Config.Profile.message.failChangePassord;
                    self.QueryError(data, 
                        function(){
                            EventDispatcher.DispatchEvent('ProfileWidget.password.change', sequrity)
                        },
                        function(){
                            sequrity.oldPassword(null);
                            sequrity.newPassword(null);
                            sequrity.confirmPassword(null);
                        }
                    );
                }
            });
        });
        
        EventDispatcher.AddEventListener('ProfileWidget.delivery.add', function(data){
            
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
            
            self.BaseLoad.AddDelivaryAddress(str , function(response){
                if(response.result == 'ok'){
                    self.ShowMessage(Config.Profile.message.addAddressDelivery, function(){
                        Parameters.cache.delivery = null;
                        Routing.SetHash('profile', 'Личный кабинет', {info: 'delivery'});
                    }, false);
                }
                else{
                    if(!response.err)
                        response.err = Config.Profile.message.failAddAddressDelivery;
                    self.QueryError(response, function(){EventDispatcher.DispatchEvent('ProfileWidget.delivery.add', data)})
                }
            });
        });
        
        EventDispatcher.AddEventListener('ProfileWidget.delivery.saveEdit', function(data){
            
            var str = '?id_address=' + data.id() +
            '&id_country=' + encodeURIComponent($.trim(data.country().id));
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
            
            self.BaseLoad.EditDelivaryAddress(str , function(response){
                if(response.result == 'ok'){
                    self.ShowMessage(Config.Profile.message.addAddressDelivery, function(){
                        Parameters.cache.delivery = null;
                        Routing.SetHash('profile', 'Личный кабинет', {info: 'delivery'});
                    }, false);
                }
                else{
                    if(!response.err)
                        response.err = Config.Profile.message.failAddAddressDelivery;
                    self.QueryError(response, function(){EventDispatcher.DispatchEvent('ProfileWidget.delivery.add', data)})
                }
            });
        });
        
        EventDispatcher.AddEventListener('ProfileWidget.delivery.delete', function(delivery){
            self.BaseLoad.DeleteDeliveryAddress(delivery.address.id, function(data){
                if(data.result == 'ok'){
                    self.ShowMessage(Config.Profile.message.deleteAddressDelivery,function(){
                        Parameters.cache.delivery = null;
                        delivery.list.remove(delivery.address);
                    }, false);
                }
                else{
                    if(!data.err)
                        data.err = Config.Profile.message.failDeleteAddressDelivery;
                    self.QueryError(data, function(){EventDispatcher.DispatchEvent('ProfileWidget.delivery.delete', delivery)})
                }
            });
        });
        
         EventDispatcher.AddEventListener('ProfileWidget.delivery.edit', function(data){
             var form = new DeliveryAddressFormViewModel();
             form.AddContent(data);
             self.Fill.DeliveryForm(form);
         });
         
         EventDispatcher.AddEventListener('ProfileWidget.delivery.sedDefault', function(data){
             var str = '?id_address=' + data.id +
                        '&is_default=yes';
                self.BaseLoad.SetDefaultDelivaryAddress(str, function(result){
                    if(result.result == 'ok'){
                        self.ShowMessage(Config.Profile.message.setDefaultDelivery, false, false);
                    }
                    else{
                        self.QueryError(result, function(){EventDispatcher.DispatchEvent('ProfileWidget.delivery.sedDefault', data)})
                    }
                });
         });
    };
    self.Validate = {
        Username: function(data, step1) {
            var test = false;
            if (data.check_username) {
                if (data.check_username == 'on' || data.check_username == 'ban' || data.check_username == 'off')
                    step1.errorUsername(Config.Registration.error.username.uniq);
                if (data.check_username == 'yes')
                    test = true;
            }

            return test;
        },
        Phone: function(data, step1) {
            var test = false;
            if (data.check_phone) {
                if (data.check_phone == 'on' || data.check_phone == 'ban' || data.check_phone == 'off')
                    step1.errorPhone(Config.Registration.error.phone.uniq);
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
                    step1.errorEmail(Config.Registration.error.email.uniq);
                if (data.check_email == 'yes')
                    test = true;
            }

            return test;
        },
        MailToken: function(data, contacts) {
            if (data.confirm_email) {
                if (data.confirm_email == 'no') {
                    contacts.errorEmailConfirm(Config.Profile.error.emailToken.confirm);
                    return false;
                }
            }

            return true;
        },
        PhoneToken: function(data, contacts) {
            if (data.confirm_phone) {
                if (data.confirm_phone == 'no') {
                    contacts.errorPhoneConfirm(Config.Profile.error.phoneToken.confirm);
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
    }
    self.Info = {
        Menu : function(){
            self.BaseLoad.Script('widgets/MenuPersonalCabinetWidget.js', function(){
                if (!Routing.params.info)
                     Routing.params.info = Config.Profile.menu.personalInformation.prefix;
                EventDispatcher.DispatchEvent('widget.onload.menuPersonalCabinet', {menu : Config.Profile.menu, active : Routing.params.info});
            });
        },
        Personal : function(){
            self.InsertContainer.Personal();
            var personal = new ProfilePersonalInformationViewModel();
            
            self.BaseLoad.Profile(function(registration){
                self.BaseLoad.ProfileInfo(function(data) {
                    self.Fill.Personal(registration, personal);
                    personal.registrationData.dateRegistration(data.date_reg);
                });
            });
        },
        Delivery : function(){
            self.BaseLoad.DeliveryAddressList(function(data){
                self.InsertContainer.Delivery();
                self.Fill.Delivery(data);
            });
        },
        DeliveryForm : function(){
            var form = new DeliveryAddressFormViewModel();
            self.Fill.DeliveryForm(form);
        },
        Security : function(){
            self.InsertContainer.Security();
            self.Fill.Security();
        }
    };
    self.InsertContainer = {
        Personal : function(){
            $("#" + self.settings.containerFormId).empty().append($('script#' + self.settings.personalInformationTmplId).html());
        },
        Delivery : function(){
            $("#" + self.settings.containerFormId).empty().append($('script#' + self.settings.deliveryAddressTmpl).html());
        },
        DeliveryForm : function(){
            $("#" + self.settings.containerFormId).empty().append($('script#' + self.settings.deliveryAddressFormTmpl).html());
        },
        Security : function(){
            $("#" + self.settings.containerFormId).empty().append($('script#' + self.settings.securityTmpl).html());
        }
    };
    self.Fill = {
        Personal : function(data, personal){
            personal.AddContent(data);
            
            var shopId = Parameters.shopId;
            if (self.settings.geoShop == 0)
                shopId = 0;
            self.BaseLoad.Country(shopId, function(data) {
                personal.postalAddress.AddCountryList(data);
                if(personal.postalAddress.idCountry()){
                    $.grep(personal.postalAddress.countryList(), function(data) {
                        if (data.id == personal.postalAddress.idCountry()){
                            personal.postalAddress.country(data);
                        }
                    })
                }
                self.Render.Personal(personal);
            });
        },
        Delivery : function(data){
            var delivery = new ProfileDeliveryAddressViewModel();
            delivery.AddContent(data);

            self.Render.DeliveryList(delivery);
        },
        DeliveryForm : function(form){
            var shopId = Parameters.shopId;
            if (self.settings.geoShop == 0)
                shopId = 0;
            self.BaseLoad.Country(shopId, function(data) {
                form.AddCountryList(data);
                self.InsertContainer.DeliveryForm();
                if(form.idCountry()){
                    $.grep(form.countryList(), function(data) {
                        if (data.id == form.idCountry()){
                            form.country(data);
                        }
                    })
                }
                self.Render.DeliveryForm(form);
            });
        },
        Security : function(){
            var sequrity = new ProfileSecurityViewModel();
            self.Render.Security(sequrity);
        }
    };
    self.Render = {
        Personal : function(form){
            
            if ($("#" + self.settings.containerFormId).length > 0) {
                ko.applyBindings(form, $("#" + self.settings.containerFormId)[0]);
            }
            $("#" + form.registrationData.cssBirthDay).mask("99.99.9999", {placeholder: "_"}).datepicker({
                changeMonth: true,
                changeYear: true,
                dateFormat: 'dd.mm.yy',
                defaultDate: '-24Y',
                yearRange: "c-77:c+6",
                minDate : '-101Y',
                maxDate : '-18Y',
                onClose: function(dateText, inst) {
                    form.registrationData.birthDayField(dateText);
                }
            });
            
            $('input#' + form.contacts.cssPhone).mask("?9 999 999 99 99 99", {placeholder: "_"});

            $('#' + form.postalAddress.cssRegionList).autocomplete({
                source: function(request, response) {
                    self.BaseLoad.Region(form.postalAddress.country().id + '/' + encodeURIComponent(request.term), function(data) {
                        if (!data.err) {
                            response($.map(data, function(item) {
                                return {
                                    value: $.trim(item.formalname + ' ' + item.shortname),
                                    region: item
                                };
                            }));
                        }
                        else {
                            $('#' + form.postalAddress.cssRegionList).autocomplete("close");
                            return false;
                        }
                    });
                },
                select: function(event, ui) {
                    form.postalAddress.region(ui.item.region);
                    form.postalAddress.customRegion(ui.item.value);
                    if (ui.item.region && ui.item.region.postalcode != 0)
                        form.postalAddress.postIndex(ui.item.region.postalcode);
                    else {
                        form.postalAddress.postIndex(null);
                    }
                }
            });

            $('#' + form.postalAddress.cssCityList).autocomplete({
                source: function(request, response) {
                    if (form.postalAddress.region()) {
                        self.BaseLoad.City(form.postalAddress.country().id + '/' + encodeURIComponent(form.postalAddress.region().regioncode) + '/' + encodeURIComponent(request.term), function(data) {
                            if (!data.err) {
                                response($.map(data, function(item) {
                                    return {
                                        value: $.trim(item.shortname + '. ' + item.formalname),
                                        city: item
                                    };
                                }));
                            }
                            else {
                                $('#' + form.postalAddress.cssCityList).autocomplete("close");
                                return false;
                            }
                        });
                    }
                },
                select: function(event, ui) {
                    form.postalAddress.city(ui.item.city);
                    form.postalAddress.customCity(ui.item.value);
                    if (ui.item.city && ui.item.city.postalcode != 0)
                        form.postalAddress.postIndex(ui.item.city.postalcode);
                    else
                        form.postalAddress.postIndex(null);
                }
            });

            $('#' + form.postalAddress.cssAddress).autocomplete({
                source: function(request, response) {
                    if (form.postalAddress.region()) {
                        self.BaseLoad.Street(form.postalAddress.country().id + '/' + encodeURIComponent(form.postalAddress.region().regioncode) + '/' + encodeURIComponent(form.postalAddress.city().aoguid) + '/' + encodeURIComponent(request.term), function(data) {
                            if (!data.err) {
                                response($.map(data, function(item) {
                                    return {
                                        value: $.trim(item.shortname + '. ' + item.formalname),
                                        street: item
                                    };
                                }));
                            }
                            else {
                                $('#' + form.postalAddress.cssAddress).autocomplete("close");
                                return false;
                            }
                        });
                    }
                },
                select: function(event, ui) {
                    form.postalAddress.address(ui.item.street);
                    form.postalAddress.customAddress(ui.item.value);
                    if (ui.item.street && ui.item.street.postalcode != 0)
                        form.postalAddress.postIndex(ui.item.street.postalcode);
                    else
                        form.postalAddress.postIndex(null);
                }
            });

            $('#' + form.postalAddress.cssCountryList).change(function() {
                var v = $(this).getSetSSValue();
                $.grep(form.postalAddress.countryList(), function(data) {
                    if (data.id == v){
                        form.postalAddress.country(data);
                        form.postalAddress.customRegion(null);
                        form.postalAddress.region(null);
                        form.postalAddress.customCity(null);
                        form.postalAddress.city(null);
                        form.postalAddress.customAddress(null)
                        form.postalAddress.address(null);
                        form.postalAddress.postIndex(null);
                    }
                })
            });

            $('#' + form.postalAddress.cssRegionList).bind('textchange', function(event, previousText) {
                form.postalAddress.customRegion($(this).val());
                form.postalAddress.customCity(null);
                form.postalAddress.city(null);
                form.postalAddress.customAddress(null)
                form.postalAddress.address(null);
                form.postalAddress.postIndex(null);
            });

            $('#' + form.postalAddress.cssCityList).bind('textchange', function(event, previousText) {
                form.postalAddress.customCity($(this).val());
                form.postalAddress.customAddress(null)
                form.postalAddress.address(null);
                form.postalAddress.postIndex(null);
            });
   
            self.WidgetLoader(true, self.settings.containerFormId);
            
            if(Routing.params.edit == 'postal_address'){
                self.ScrollTop(form.postalAddress.cssPostAddressForm, 700);
            }
        },
        DeliveryList : function(delivery){
            if ($("#" + self.settings.containerFormId).length > 0) {
                ko.applyBindings(delivery, $("#" + self.settings.containerFormId)[0]);
            }
            
            self.WidgetLoader(true, self.settings.containerFormId);
        },
        DeliveryForm : function(delivery){
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
                    if (data.id == v){
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
        Security : function(sequrity){
            if ($("#" + self.settings.containerFormId).length > 0) {
                ko.applyBindings(sequrity, $("#" + self.settings.containerFormId)[0]);
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
                for (var i = 0; i <= Config.Containers.authentication.length - 1; i++) {
                    $("#" + Config.Containers.authentication[i]).css(self.settings.style);
                }
            });
        }
    };
};

var ProfilePersonalInformationViewModel = function(){
    var self = this;
    self.registrationData = null;
    self.postalAddress = null;
    self.contacts = null;
    
    self.AddContent = function(data){
        var registrationData = new ProfileDataRegistrationViewModel();
        registrationData.AddContent(data);
        self.registrationData = registrationData;
        
        var postalAddress = new ProfilePostalAddressViewModel();
        postalAddress.AddContent(data);
        self.postalAddress = postalAddress;
        
        self.contacts = new ProfileContactsViewModel();
        self.contacts.AddContent();
    };
};

var ProfileDataRegistrationViewModel = function(){
    var self = this;
    self.data = null;
    self.username = ko.observable();
    self.dateRegistration = ko.observable();
    self.gender = ko.observable();
    self.genderText =  ko.computed(function(){
        if(self.gender() == 'm')
            return 'мужской';
        else
            return 'женский';
    }, this);;
    self.lastName = ko.observable();
    self.firstName = ko.observable();
    self.middleName = ko.observable();
    self.fullName = ko.computed(function(){
        var str = '';
        if(self.lastName())
            str = str + self.lastName();
        if(self.firstName())
            str = str + ' ' + self.firstName();
        if(self.middleName())
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
    
    self.cssRegistrationDataForm = 'profile_registration_data_form';
    
    self.ValidationForm = function() {
        var test = true;
        if (!self.FirstNameValidation())
            test = false;
        if (!self.LastNameValidation())
            test = false;
        if (!self.MiddleNameValidation())
            test = false;
        if (!self.BirthDayValidation())
            test = false;

        return test;
    };
    self.FirstNameValidation = function() {
        if (!self.firstNameField()) {
            self.errorFirstName(Config.Profile.error.firstName.empty);
            return false;
        }
        if (self.firstNameField().length < 2) {
            self.errorFirstName(Config.Profile.error.firstName.minLength);
            return false;
        }
        if (self.firstNameField().length > 20) {
            self.errorFirstName(Config.Profile.error.firstName.maxLength);
            return false;
        }
        if (!Config.Profile.regular.firstName.test(self.firstNameField())) {
            self.errorFirstName(Config.Profile.error.firstName.regular);
            return false;
        }
        self.errorFirstName(null);
        return true;
    };
    self.LastNameValidation = function() {
        if (!self.lastNameField()) {
            self.errorLastName(Config.Profile.error.lastName.empty);
            return false;
        }
        if (self.lastNameField().length < 2) {
            self.errorLastName(Config.Profile.error.lastName.minLength);
            return false;
        }
        if (self.lastNameField().length > 20) {
            self.errorLastName(Config.Profile.error.lastName.maxLength);
            return false;
        }
        if (!Config.Profile.regular.lastName.test(self.lastNameField())) {
            self.errorLastName(Config.Profile.error.lastName.regular);
            return false;
        }
        self.errorLastName(null);
        return true;
    };
    self.MiddleNameValidation = function() {
        if (self.middleNameField()) {
            if (self.middleNameField().length < 2) {
                self.errorMiddleName(Config.Profile.error.middleName.minLength);
                return false;
            }
            if (self.middleNameField().length > 20) {
                self.errorMiddleName(Config.Profile.error.middleName.maxLength);
                return false;
            }
            if (!Config.Profile.regular.middleName.test(self.middleNameField())) {
                self.errorMiddleName(Config.Profile.error.middleName.regular);
                return false;
            }
        }
        self.errorMiddleName(null);
        return true;
    };
    self.BirthDayValidation = function() {
        if (!self.birthDayField()) {
            self.errorBirthDay(Config.Profile.error.birthDay.empty);
            return false;
        }
        if (!Config.Profile.regular.birthDay.test(self.birthDayField())) {
            self.errorBirthDay(Config.Profile.error.birthDay.regular);
            return false;
        }
        var dateArray = self.birthDayField().split('.');
        var date = new Date(dateArray[2], dateArray[1]-1, dateArray[0]);
        
        var now = new Date();
        var minDate = new Date(now.getYear() - 18, now.getMonth(), now.getDate());
        if(minDate < date){
            self.errorBirthDay(Config.Profile.error.birthDay.minDate);
            return false;
        }
        
        var now = new Date();
        var maxDate = new Date(now.getYear() - 101, now.getMonth(), now.getDate());
        if(maxDate > date){
            self.errorBirthDay(Config.Profile.error.birthDay.maxDate);
            return false;
        }
        
        self.errorBirthDay(null);
        return true;
    };
    
    self.AddContent = function(data){
        self.data = data
        var user = Parameters.cache.userInformation;
        self.username(user.login);
        self.gender(data.gender);
        self.lastName(data.f_name);
        self.firstName(data.s_name);
        self.middleName(data.m_name);
        self.birthDay(data.birth_day); 
        self.rating(user.rating_user);
        self.lastNameField(self.data.f_name);
        self.firstNameField(self.data.s_name);
        self.middleNameField(self.data.m_name);
        self.birthDayField(self.data.birth_day);
        self.checkInfo(data.check_info);
    };
    self.Edit = function(){
        self.isEditBlock(1);
    };
    self.Back = function(){
        self.lastNameField(self.data.f_name);
        self.firstNameField(self.data.s_name);
        self.middleNameField(self.data.m_name);
        self.birthDayField(self.data.birth_day);
        self.isEditBlock(0);
    };
    self.Submit = function(){
        if (self.ValidationForm()) {
            EventDispatcher.DispatchEvent('ProfileWidget.personal.checking', self);
        }
    };
};

var ProfilePostalAddressViewModel = function(){
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

    self.cityText = ko.observable();
    self.city = ko.observable();
    self.customCity = ko.observable();
    self.cssCityList = 'city_list';
    self.errorCity = ko.observable(null);

    self.addressText = ko.observable();
    self.address = ko.observable();
    self.customAddress = ko.observable();
    self.cssAddress = 'address';
    self.errorAddress = ko.observable(null);

    self.postIndexText = ko.observable();
    self.postIndex = ko.observable();
    self.cssPostIndex = 'post_index';
    self.errorPostIndex = ko.observable(null);
    
    self.checkInfo = ko.observable();

    self.countryList = ko.observableArray();
    
    self.isEditBlock = ko.observable(0);
    
    self.AddContent = function(data){ 
        self.data = data;

        self.idCountry(data.id_country);
        self.countryText(data.country);
        
        self.regionText(data.region);
        self.region({regioncode : data.code_region});
        self.customRegion(data.region);
        
        self.cityText(data.city);
        self.city({aoguid :data.code_city});
        self.customCity(data.city);
        
        self.addressText(data.address);
        self.address(data.address);
        self.customAddress(data.address);
        
        self.postIndexText(data.post_code);
        self.postIndex(data.post_code);
        
        self.checkInfo(data.check_info);
        
        if(Routing.params.edit == 'postal_address')
            self.isEditBlock(1);
    };
    self.AddCountryList = function(data) {
        if (data.length > 0) {
            for (var i = 0; i <= data.length - 1; i++) {
                self.countryList.push(new CountryListViewModel(data[i]));
            }
        }
    };
    self.Edit = function(){
        self.isEditBlock(1);
    };
    self.Back = function(){
        self.idCountry(self.data.id_country);

        self.region({regioncode : self.data.code_region});
        self.customRegion(self.data.region);
        
        self.city({aoguid :self.data.code_city});
        self.customCity(self.data.city);

        self.address(self.data.address);
        self.customAddress(self.data.address);
        
        self.postIndexText(self.data.post_code);
        self.postIndex(self.data.post_code);

        self.checkInfo(self.data.check_info);
        self.isEditBlock(0);
    };
    self.Submit = function(){
        if (self.ValidationForm()) {
            EventDispatcher.DispatchEvent('ProfileWidget.postalAddress.checking', self);
        }
    };
    self.ValidationForm = function() {
        var test = true;
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
            self.errorCountry(Config.Profile.error.country.empty);
            return false;
        }
        self.errorCountry(null);
        return true;
    };
    self.RegionValidation = function() {
        if (!self.customRegion()) {
            self.errorRegion(Config.Profile.error.region.empty);
            return false;
        }
        self.errorRegion(null);
        return true;
    };
    self.CityValidation = function() {
        if (!self.customCity()) {
            self.errorCity(Config.Profile.error.city.empty);
            return false;
        }
        self.errorCity(null);
        return true;
    };
    self.AddressValidation = function() {
        if (!self.customAddress()) {
            self.errorAddress(Config.Profile.error.address.empty);
            return false;
        }
        self.errorAddress(null);
        return true;
    };
    self.PostIndexValidation = function() {
        if (!self.postIndex()) {
            self.errorPostIndex(Config.Profile.error.postIndex.empty);
            return false;
        }
        self.errorPostIndex(null);
        return true;
    };
};

var ProfileContactsViewModel = function(){
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
    
    self.AddContent = function(){
        var user = Parameters.cache.profile.info;
        if(user.confirm_phone == 'yes')
            self.phoneIsConfirm(true);
        if(user.confirm_email == 'yes')
            self.emailIsConfirm(true);
        if(user.phone){
            self.phone(user.phone);
            self.isExistPhone(true);
        }
        if(user.email){
            self.email(user.email);
            self.isExistEmail(true); 
        }
    };
    self.ValidationForm = function() {
        var test = true;
        if (!self.EmailValidation())
            test = false;
        if (!self.PhoneValidation())
            test = false;
        return test;
    };
    self.EmailValidation = function() {
        if (!self.email()) {
            self.errorEmail(Config.Profile.error.email.empty);
            return false;
        }
        if (self.email().length > 64) {
            self.errorEmail(Config.Profile.error.email.maxLength);
            return false;
        }
        if (!Config.Profile.regular.email.test(self.email())) {
            self.errorEmail(Config.Profile.error.email.regular);
            return false;
        }
        self.errorEmail(null);
        return true;
    };
    self.PhoneValidation = function() {
        if(self.emailIsConfirm()){
            if (!self.phone()) {
                self.errorPhone(Config.Profile.error.phone.empty);
                return false;
            }
        }
        if (self.phone()) {
            if (!Config.Profile.regular.phone.test($.trim(self.phone()))) {
                self.errorPhone(Config.Profile.error.phone.regular);
                return false;
            }
        }
        self.errorPhone(null);
        return true;
    };
    self.EmailTokenValidation = function() {
        if (!self.emailToken()) {
            self.errorEmailToken(Config.Profile.error.emailToken.empty);
            return false;
        }

        self.errorEmailToken(null);
        return true;
    };
    self.PhoneTokenValidation = function() {
        if (!self.phoneToken()) {
            self.errorPhoneToken(Config.Profile.error.phoneToken.empty);
            return false;
        }

        self.errorPhoneToken(null);
        return true;
    };
    self.SendMailToken = function(){
        self.sentEmailCode(true);
        self.isExistEmail(false);
        setTimeout(function() {
            self.isExistEmail(true);
        }, 60000);
        EventDispatcher.DispatchEvent('ProfileWidget.send.token', 'mail');
    };
    self.SendPhoneToken = function(){
        self.sentCode(true);
        self.isExistPhone(false);
        setTimeout(function() {
            self.isExistPhone(true);
        }, 60000);
        EventDispatcher.DispatchEvent('ProfileWidget.send.token', 'sms');
    };
    self.SubmitMailToken = function(){
        if (self.EmailTokenValidation()) {
            EventDispatcher.DispatchEvent('ProfileWidget.submit.token', {type: 'mail', value: self});
        }
    };
    self.SubmitPhoneToken = function(){
        if (self.PhoneTokenValidation()) {
            EventDispatcher.DispatchEvent('ProfileWidget.submit.token', {type: 'sms', value: self});
        }
    };
    self.SubmitForm = function(){
        if (self.ValidationForm()) {
            EventDispatcher.DispatchEvent('ProfileWidget.contacts.checking', self);
        }
    };
};

var ProfileDeliveryAddressViewModel = function(){
    var self = this;
    self.addressList = ko.observableArray();
    self.cssAddressList = 'delivary_address_list';
    
    self.ClickAddAddress = function(){
        Routing.SetHash('profile', 'Личный кабинет', {info: 'delivery', form: 'add'})
    };
    
    self.AddContent = function(data){
        for(var key in data){
            DeliveryAddressViewModel.prototype = new Widget();
            self.addressList.push(new DeliveryAddressViewModel(data[key], self.addressList));
        }
    }
};

var DeliveryAddressViewModel = function(data, list){
    var self = this;
    self.id = data.id;
    self.idCountry = data.id_country;
    self.country = data.country;
    self.codeRegion = data.code_region;
    self.region = data.region;
    self.codeCity = data.code_city;
    self.city = data.city;
    self.postCode = data.post_code;
    self.address = data.address;
    self.addressee = data.addressee;
    if(data.is_default == 'yes'){
        self.isDefault = ko.observable(true);
        self.cssIsDefault = ko.observable('delivery_address_is_default active');
    }
    else{
        self.isDefault = ko.observable(false);
        self.cssIsDefault = ko.observable('delivery_address_is_default');
    }
    
    self.contactPhone = data.contact_phone;
            
    self.Edit = function(){
       if(self.id)
           EventDispatcher.DispatchEvent('ProfileWidget.delivery.edit', self);
       else
           Routing.SetHash('profile', 'Личный кабинет', {info : 'personal', edit : 'postal_address'});
    };
    self.Delete = function(){
        self.Confirm(Config.Profile.message.confirmDeleteAddressDelivery, function(){
            EventDispatcher.DispatchEvent('ProfileWidget.delivery.delete', {address : self, list : list});
        }, false);
    };
    self.ClickItem = function(){
        $.each(list(), function(i){
            list()[i].cssIsDefault('delivery_address_is_default');
            list()[i].isDefault(false);
        });
        
        self.cssIsDefault('delivery_address_is_default active');
        self.isDefault(true);
        
        EventDispatcher.DispatchEvent('ProfileWidget.delivery.sedDefault', self);
    };
};

var DeliveryAddressFormViewModel = function(model){
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
    
    self.AddCountryList = function(data){
        if (data.length > 0) {
            for (var i = 0; i <= data.length - 1; i++) {
                self.countryList.push(new CountryListViewModel(data[i]));
            }
        }
    };
    
    self.AddContent = function(data){
        self.id(data.id);
        self.idCountry(data.idCountry);
        self.region({regioncode : data.codeRegion});
        self.customRegion(data.region);
        self.city({aoguid :data.codeCity});
        self.customCity(data.city);
        self.postCode(data.postCode);
        self.customAddress(data.address);
        self.addressee(data.addressee);
        self.isDefault(data.isDefault());
        self.contactPhone(data.contactPhone);
    };
    self.Submit = function(){
        if (self.ValidationForm()) {
            EventDispatcher.DispatchEvent('ProfileWidget.delivery.add', self);
        }
    };
    self.Edit = function(){
        if (self.ValidationForm()) {
            EventDispatcher.DispatchEvent('ProfileWidget.delivery.saveEdit', self);
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
            self.errorCountry(Config.Profile.error.country.empty);
            return false;
        }
        self.errorCountry(null);
        return true;
    };
    self.RegionValidation = function() {
        if (!self.customRegion()) {
            self.errorRegion(Config.Profile.error.region.empty);
            return false;
        }
        self.errorRegion(null);
        return true;
    };
    self.CityValidation = function() {
        if (!self.customCity()) {
            self.errorCity(Config.Profile.error.city.empty);
            return false;
        }
        self.errorCity(null);
        return true;
    };
    self.AddressValidation = function() {
        if (!self.customAddress()) {
            self.errorAddress(Config.Profile.error.address.empty);
            return false;
        }
        self.errorAddress(null);
        return true;
    };
    self.PostIndexValidation = function() {
        if (!self.postCode()) {
            self.errorPostCode(Config.Profile.error.postIndex.empty);
            return false;
        }
        self.errorPostCode(null);
        return true;
    };
    self.UsernameValidation = function() {
        if (!self.addressee()) {
            self.errorAddressee(Config.Profile.error.addressee.empty);
            return false;
        }
        if (self.addressee().length < 3) {
            self.errorAddressee(Config.Profile.error.addressee.minLength);
            return false;
        }
        if (self.addressee().length > 40) {
            self.errorAddressee(Config.Profile.error.addressee.maxLength);
            return false;
        }
        if (!Config.Profile.regular.addressee.test(self.addressee())) {
            self.errorAddressee(Config.Registration.error.addressee.regular);
            return false;
        }
        self.errorAddressee(null);
        return true;
    };
    self.PhoneValidation = function() {
         if (!self.contactPhone()) {
            self.errorContactPhone(Config.Profile.error.phone.empty);
            return false;
        }
        if (!Config.Profile.regular.phone.test($.trim(self.contactPhone()))) {
            self.errorContactPhone(Config.Profile.error.phone.regular);
            return false;
        }
        
        self.errorContactPhone(null);
        return true;
    };
    self.Back = function(){
        Routing.SetHash('profile', 'Личный кабинет', {info: 'delivery'});
    };
};

var ProfileSecurityViewModel = function(){
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
    
    self.Submit = function() {
        if (self.ValidationForm()) {
            EventDispatcher.DispatchEvent('ProfileWidget.password.change', self);
        }
    };
    self.ValidationForm = function() {
        var test = true;
        if (!self.OldPasswordValidation())
            test = false;
        if (!self.NewPasswordValidation())
            test = false;
        if (!self.ConfirmPasswordValidation())
            test = false;

        return test;
    };
    self.OldPasswordValidation = function(){
        self.oldPassword($('input#' + self.cssOldPassword).val());
        if (!self.oldPassword()) {
            self.errorOldPassword(Config.Profile.error.password.empty);
            return false;
        }
        if (self.oldPassword().length < 6) {
            self.errorOldPassword(Config.Profile.error.password.minLength);
            return false;
        }
        if (self.oldPassword().length > 64) {
            self.errorOldPassword(Config.Profile.error.password.maxLength);
            return false;
        }

        self.errorOldPassword(null);
        return true;
    };
    self.NewPasswordValidation = function() {
        self.newPassword($('input#' + self.cssNewPassword).val());
        if (!self.newPassword()) {
            self.errorNewPassword(Config.Profile.error.password.empty);
            return false;
        }
        if (self.newPassword().length < 6) {
            self.errorNewPassword(Config.Profile.error.password.minLength);
            return false;
        }
        if (self.newPassword().length > 64) {
            self.errorNewPassword(Config.Profile.error.password.maxLength);
            return false;
        }

        self.errorNewPassword(null);
        return true;
    };
    self.ConfirmPasswordValidation = function() {
        self.confirmPassword($('input#' + self.cssConfirmPassword).val());
        if (!self.confirmPassword()) {
            self.errorConfirmPassword(Config.Profile.error.password.empty);
            return false;
        }
        if (self.newPassword() != self.confirmPassword()) {
            self.errorConfirmPassword(Config.Profile.error.password.equal);
            return false;
        }
        self.errorConfirmPassword(null);
        return true;
    };
};

var TestProfile = {
    Init: function() {
        if (typeof Widget == 'function') {
            ProfileWidget.prototype = new Widget();
            var profile = new ProfileWidget();
            profile.Init(profile);
        }
        else {
            setTimeout(function() {
                TestProfile.Init();
            }, 100);
        }
    }
};

TestProfile.Init();