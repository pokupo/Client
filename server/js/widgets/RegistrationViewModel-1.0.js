var RegistrationFormViewModel = function(settings) {
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
        if (ValidationForm()) {
            EventDispatcher.DispatchEvent(self.submitEvent(), self);
        }
    };
    function ValidationForm() {
        var test = true;
        if (!UsernameValidation())
            test = false;
        if (!EmailValidation())
            test = false;
        if (!PhoneValidation())
            test = false;
        if (!PasswordValidation())
            test = false;
        if (!PasswordSecondValidation())
            test = false;
        if (!IsCheckedValidation())
            test = false;

        return test;
    }
    function UsernameValidation() {
        var error = settings.error.username;
        if (!self.username()) {
            self.errorUsername(error.empty);
            return false;
        }
        if (self.username().length < 3) {
            self.errorUsername(error.minLength);
            return false;
        }
        if (self.username().length > 40) {
            self.errorUsername(error.maxLength);
            return false;
        }
        if (!settings.regular.username.test(self.username())) {
            self.errorUsername(error.regular);
            return false;
        }
        self.errorUsername(null);
        return true;
    }
    function EmailValidation() {
        var error = settings.error.email;
        if (!self.email()) {
            self.errorEmail(error.empty);
            return false;
        }
        if (self.email().length > 64) {
            self.errorUsername(error.maxLength);
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
        if (self.phone()) {
            if (!settings.regular.phone.test($.trim(self.phone()))) {
                self.errorPhone(settings.error.phone.regular);
                return false;
            }
        }
        self.errorPhone(null);
        return true;
    }
    function PasswordValidation() {
        var error = settings.error.password;
        self.firstPassword($('input#' + self.cssFirstPassword).val());
        if (!self.firstPassword()) {
            self.errorFirstPassword(error.empty);
            return false;
        }
        if (self.firstPassword().length < 6) {
            self.errorFirstPassword(error.minLength);
            return false;
        }
        if (self.firstPassword().length > 64) {
            self.errorFirstPassword(Config.error.maxLength);
            return false;
        }

        self.errorFirstPassword(null);
        return true;
    }
    function PasswordSecondValidation() {
        var error = settings.error.password;
        self.secondPassword($('input#' + self.cssSecondPassword).val());
        if (!self.secondPassword()) {
            self.errorSecondPassword(error.empty);
            return false;
        }
        if (self.firstPassword() != self.secondPassword()) {
            self.errorSecondPassword(error.equal);
            return false;
        }
        self.errorSecondPassword(null);
        return true;
    }
    function IsCheckedValidation() {
        if (!self.isChecked()) {
            self.errorIsChecked(settings.error.isChecked.empty);
            return false;
        }

        self.errorIsChecked(null);
        return true;
    };
    self.RestoreAccess = function() {

    };
    self.agreement = 'http://' + window.location.hostname + '/rules';
    self.police = 'http://' + window.location.hostname + '/police';
    self.refund = 'http://' + window.location.hostname + '/refund';
};

var RegistrationConfirmFormViewModel = function(cache, settings) {
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
            return false;
        self.phoneConfirmLater(true);
        return true;
    }, this);

    self.submitEvent = ko.observable();

    self.SubmitForm = function() {
        if (ValidationForm()) {
            EventDispatcher.DispatchEvent(self.submitEvent(), self);
        }
    };
    function ValidationForm() {
        var test = true;
        if (!EmailTokenValidation())
            test = false;
        if (!PhoneTokenValidation())
            test = false;
        if (!EmptyConfirm())
            test = false;
        return test;
    }
    function EmailTokenValidation() {
        self.mailToken($.trim(self.mailToken()));
        if (!self.mailConfirmLater()) {
            if (!self.mailToken()) {
                self.errorEmailConfirm(settings.error.emailToken.empty);
                return false;
            }
        }

        self.errorEmailConfirm(null);
        return true;
    }
    function PhoneTokenValidation() {
        if (!self.phoneConfirmLater()) {
            self.phoneToken($.trim(self.phoneToken()));
            if (!self.phoneToken()) {
                self.errorPhoneConfirm(settings.error.phoneToken.empty);
                return false;
            }
        }

        self.errorPhoneConfirm(null);
        return true;
    }
    function EmptyConfirm() {
        if (self.phoneConfirmLater() && self.mailConfirmLater()) {
            self.errorConfirmLater(settings.error.confirmLater.empty);
            self.errorEmailConfirm(null);
            self.errorPhoneConfirm(null);
            return false;
        }
        else
            self.errorConfirmLater(null);

        return true;
    }
    
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

var RegistrationProfileFormViewModel = function(settings) {
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
        if (ValidationForm()) {
            EventDispatcher.DispatchEvent(self.submitEvent(), self);
        }
    };
    function ValidationForm() {
        var test = true;
        if (!FirstNameValidation())
            test = false;
        if (!LastNameValidation())
            test = false;
        if (!MiddleNameValidation())
            test = false;
        if (!BirthDayValidation())
            test = false;
        if (!GanderValidation())
            test = false;

        return test;
    }
    function FirstNameValidation() {
        var error = settings.error.firstName;
        if (!self.firstName()) {
            self.errorFirstName(error.empty);
            return false;
        }
        if (self.firstName().length < 2) {
            self.errorFirstName(error.minLength);
            return false;
        }
        if (self.firstName().length > 20) {
            self.errorFirstName(error.maxLength);
            return false;
        }
        if (!settings.regular.firstName.test(self.firstName())) {
            self.errorFirstName(error.regular);
            return false;
        }
        self.errorFirstName(null);
        return true;
    }
    function LastNameValidation() {
        var error = settings.error.lastName;
        if (!self.lastName()) {
            self.errorLastName(error.empty);
            return false;
        }
        if (self.lastName().length < 2) {
            self.errorLastName(error.minLength);
            return false;
        }
        if (self.lastName().length > 20) {
            self.errorLastName(error.maxLength);
            return false;
        }
        if (!settings.regular.lastName.test(self.lastName())) {
            self.errorLastName(error.regular);
            return false;
        }
        self.errorLastName(null);
        return true;
    }
    function MiddleNameValidation() {
        var error = settings.error.middleName;
        if (self.middleName()) {
            if (self.middleName().length < 2) {
                self.errorMiddleName(error.minLength);
                return false;
            }
            if (self.middleName().length > 20) {
                self.errorMiddleName(error.maxLength);
                return false;
            }
            if (!settings.regular.middleName.test(self.middleName())) {
                self.errorMiddleName(error.regular);
                return false;
            }
        }
        self.errorMiddleName(null);
        return true;
    }
    function BirthDayValidation() {
        var error = settings.error.birthDay;
        if (!self.birthDay()) {
            self.errorBirthDay(error.empty);
            return false;
        }
        if (!settings.regular.birthDay.test(self.birthDay())) {
            self.errorBirthDay(error.regular);
            return false;
        }
        var dateArray = self.birthDay().split('.');
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
    }
    function GanderValidation() {
        var error = settings.error.gender;
        if (!self.gender()) {
            self.errorGender(error.empty);
            return false;
        }
        if (!settings.regular.gender.test(self.gender())) {
            self.errorGender(error.regular);
            return false;
        }
        self.errorGender(null);
        return true;
    }
};


