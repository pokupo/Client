var RegistrationFormViewModel = function() {
    var self = this;
    self.username = ko.observable(null);
    self.errorUsername = ko.observable(null);
    self.email = ko.observable(null);
    self.errorEmail = ko.observable(null);
    self.cssPhone = 'phone';
    self.phone = ko.observable(null);
    self.errorPhone = ko.observable(null);
    self.cssFirstPassword = 'firstPassword';
    self.firstPassword = ko.observable(null);
    self.errorFirstPassword = ko.observable(null);
    self.cssSecondPassword = 'secondPassword';
    self.secondPassword = ko.observable(null);
    self.errorSecondPassword = ko.observable(null);
    self.isChecked = ko.observable(false);
    self.errorIsChecked = ko.observable(null);

    self.submitEvent = ko.observable();

    self.SubmitForm = function() {
        if (self.ValidationForm()) {
            EventDispatcher.DispatchEvent(self.submitEvent(), self);
        }
    };
    self.ValidationForm = function() {
        var test = true;
        if (!self.UsernameValidation())
            test = false;
        if (!self.EmailValidation())
            test = false;
        if (!self.PhoneValidation())
            test = false;
        if (!self.PasswordValidation())
            test = false;
        if (!self.PasswordSecondValidation())
            test = false;
        if (!self.IsCheckedValidation())
            test = false;

        return test;
    };
    self.UsernameValidation = function() {
        if (!self.username()) {
            self.errorUsername(Config.Registration.error.username.empty);
            return false;
        }
        if (self.username().length < 3) {
            self.errorUsername(Config.Registration.error.username.minLength);
            return false;
        }
        if (self.username().length > 40) {
            self.errorUsername(Config.Registration.error.username.maxLength);
            return false;
        }
        if (!Config.Registration.regular.username.test(self.username())) {
            self.errorUsername(Config.Registration.error.username.regular);
            return false;
        }
        self.errorUsername(null);
        return true;
    };
    self.EmailValidation = function() {
        if (!self.email()) {
            self.errorEmail(Config.Registration.error.email.empty);
            return false;
        }
        if (self.email().length > 64) {
            self.errorUsername(Config.Registration.error.email.maxLength);
            return false;
        }
        if (!Config.Registration.regular.email.test(self.email())) {
            self.errorEmail(Config.Registration.error.email.regular);
            return false;
        }
        self.errorEmail(null);
        return true;
    };
    self.PhoneValidation = function() {
        if (self.phone()) {
            if (!Config.Registration.regular.phone.test($.trim(self.phone()))) {
                self.errorPhone(Config.Registration.error.phone.regular);
                return false;
            }
        }
        self.errorPhone(null);
        return true;
    };
    self.PasswordValidation = function() {
        self.firstPassword($('input#' + self.cssFirstPassword).val());
        if (!self.firstPassword()) {
            self.errorFirstPassword(Config.Registration.error.password.empty);
            return false;
        }
        if (self.firstPassword().length < 6) {
            self.errorFirstPassword(Config.Registration.error.password.minLength);
            return false;
        }
        if (self.firstPassword().length > 64) {
            self.errorFirstPassword(Config.Registration.error.password.maxLength);
            return false;
        }

        self.errorFirstPassword(null);
        return true;
    };
    self.PasswordSecondValidation = function() {
        self.secondPassword($('input#' + self.cssSecondPassword).val());
        if (!self.secondPassword()) {
            self.errorSecondPassword(Config.Registration.error.password.empty);
            return false;
        }
        if (self.firstPassword() != self.secondPassword()) {
            self.errorSecondPassword(Config.Registration.error.password.equal);
            return false;
        }
        self.errorSecondPassword(null);
        return true;
    };
    self.IsCheckedValidation = function() {
        if (!self.isChecked()) {
            self.errorIsChecked(Config.Registration.error.isChecked.empty);
            return false;
        }

        self.errorIsChecked(null);
        return true;
    };
    self.RestoreAccess = function() {

    };
};

var RegistrationConfirmFormViewModel = function(cache) {
    var self = this;
    self.username = cache.username();

    self.cssMailToken = 'mail_token_block';
    self.mailToken = ko.observable();
    self.mailIsConfirm = ko.observable(false);
    self.errorEmailConfirm = ko.observable(null);
    self.mailConfirmLater = ko.observable(false);

    self.cssPhoneToken = 'phone_token_block';
    self.phoneToken = ko.observable();
    self.phoneIsConfirm = ko.observable(false);
    self.errorPhoneConfirm = ko.observable(null);
    self.phoneConfirmLater = ko.observable(false);

    self.errorConfirmLater = ko.observable(null);

    self.isEmptyPhone = ko.computed(function() {
        if (!$.isEmptyObject(cache) && cache.phone())
            return true;
        self.phoneConfirmLater(true);
        return false;
    }, this);

    self.submitEvent = ko.observable();

    self.SubmitForm = function() {
        if (self.ValidationForm()) {
            EventDispatcher.DispatchEvent(self.submitEvent(), self);
        }
    };
    self.ValidationForm = function() {
        var test = true;
        if (!self.EmailTokenValidation())
            test = false;
        if (!self.PhoneTokenValidation())
            test = false;
        if (!self.EmptyConfirm())
            test = false;

        return test;
    };
    self.EmailTokenValidation = function() {
        if (!self.mailConfirmLater()) {
            if (!self.mailToken()) {
                self.errorEmailConfirm(Config.Registration.error.emailToken.empty);
                return false;
            }
        }

        self.errorEmailConfirm(null);
        return true;
    };
    self.PhoneTokenValidation = function() {
        if (!self.phoneConfirmLater()) {
            if (!self.phoneToken()) {
                self.errorPhoneConfirm(Config.Registration.error.phoneToken.empty);
                return false;
            }
        }

        self.errorPhoneConfirm(null);
        return true;
    };
    self.EmptyConfirm = function() {
        if (self.phoneConfirmLater() && self.mailConfirmLater()) {
            self.errorConfirmLater(Config.Registration.error.confirmLater.empty);
            return false;
        }
        else
            self.errorConfirmLater(null);

        return true;
    };
    
    self.viewButtonSendToken = ko.observable(false);
    self.ShowButtonSendToken = function(){
        self.viewButtonSendToken(false);
        setTimeout(function() {
            self.viewButtonSendToken(true);
        }, 60000);
    };
    self.ClickSendPhoneToken = function(){
        self.ShowButtonSendToken();
        EventDispatcher.DispatchEvent('OrderWidget.send.token', 'sms')
    };
    self.ClickSendMailToken = function(){
        self.ShowButtonSendToken();
        EventDispatcher.DispatchEvent('OrderWidget.send.token', 'mail')
    };
};

var RegistrationProfileFormViewModel = function() {
    var self = this;
    self.lastName = ko.observable();
    self.errorLastName = ko.observable(null);

    self.firstName = ko.observable();
    self.errorFirstName = ko.observable(null);

    self.middleName = ko.observable();
    self.errorMiddleName = ko.observable(null);

    self.birthDay = ko.observable();
    self.birthDayHiddenField = ko.observable();
    self.errorBirthDay = ko.observable(null);
    self.cssBirthDay = 'birthDay';

    self.gender = ko.observable('m');
    self.errorGender = ko.observable(null);

    self.cssRegistrationDataForm = 'personal_information_' + EventDispatcher.HashCode(new Date().getTime().toString());

    self.submitEvent = ko.observable();

    self.AddContent = function(data) {
        if(!data.err){
            self.gender(data.gender);
            self.lastName(data.f_name);
            self.firstName(data.s_name);
            self.middleName(data.m_name);
            self.birthDay(data.birth_day);
        }
    };
    self.SubmitForm = function() {
        if (self.ValidationForm()) {
            EventDispatcher.DispatchEvent(self.submitEvent(), self);
        }
    };
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
        if (!self.GanderValidation())
            test = false;

        return test;
    };
    self.FirstNameValidation = function() {
        if (!self.firstName()) {
            self.errorFirstName(Config.Order.error.firstName.empty);
            return false;
        }
        if (self.firstName().length < 2) {
            self.errorFirstName(Config.Order.error.firstName.minLength);
            return false;
        }
        if (self.firstName().length > 20) {
            self.errorFirstName(Config.Order.error.firstName.maxLength);
            return false;
        }
        if (!Config.Registration.regular.firstName.test(self.firstName())) {
            self.errorFirstName(Config.Order.error.firstName.regular);
            return false;
        }
        self.errorFirstName(null);
        return true;
    };
    self.LastNameValidation = function() {
        if (!self.lastName()) {
            self.errorLastName(Config.Order.error.lastName.empty);
            return false;
        }
        if (self.lastName().length < 2) {
            self.errorLastName(Config.Order.error.lastName.minLength);
            return false;
        }
        if (self.lastName().length > 20) {
            self.errorLastName(Config.Order.error.lastName.maxLength);
            return false;
        }
        if (!Config.Registration.regular.lastName.test(self.lastName())) {
            self.errorLastName(Config.Order.error.lastName.regular);
            return false;
        }
        self.errorLastName(null);
        return true;
    };
    self.MiddleNameValidation = function() {
        if (self.middleName()) {
            if (self.middleName().length < 2) {
                self.errorMiddleName(Config.Order.error.middleName.minLength);
                return false;
            }
            if (self.middleName().length > 20) {
                self.errorMiddleName(Config.Order.error.middleName.maxLength);
                return false;
            }
            if (!Config.Order.regular.middleName.test(self.middleName())) {
                self.errorMiddleName(Config.Order.error.middleName.regular);
                return false;
            }
        }
        self.errorMiddleName(null);
        return true;
    };
    self.BirthDayValidation = function() {
        if (!self.birthDay()) {
            self.errorBirthDay(Config.Order.error.birthDay.empty);
            return false;
        }
        if (!Config.Order.regular.birthDay.test(self.birthDay())) {
            self.errorBirthDay(Config.Order.error.birthDay.regular);
            return false;
        }
        var dateArray = self.birthDay().split('.');
        var date = new Date(dateArray[2], dateArray[1] - 1, dateArray[0]);

        var now = new Date();
        var minDate = new Date(now.getYear() - 18, now.getMonth(), now.getDate());
        if (minDate < date) {
            self.errorBirthDay(Config.Order.error.birthDay.minDate);
            return false;
        }

        var now = new Date();
        var maxDate = new Date(now.getYear() - 101, now.getMonth(), now.getDate());
        if (maxDate > date) {
            self.errorBirthDay(Config.Order.error.birthDay.maxDate);
            return false;
        }

        self.errorBirthDay(null);
        return true;
    };
    self.GanderValidation = function() {
        if (!self.gender()) {
            self.errorGender(Config.Order.error.gender.empty);
            return false;
        }
        if (!Config.Order.regular.gender.test(self.gender())) {
            self.errorGender(Config.Order.error.gender.regular);
            return false;
        }
        self.errorGender(null);
        return true;
    };
};


