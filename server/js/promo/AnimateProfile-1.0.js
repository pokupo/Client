var AnimateProfile = function () {
    $(":input:not(:checkbox):not(:button):not([type=hidden]):not([type=search]):not(.no-label)").floatlabel();

    jQuery(function ($) {
        $.datepicker.regional['ru'] = {
            closeText: 'Закрыть',
            prevText: '&#x3c;Пред',
            nextText: 'След&#x3e;',
            currentText: 'Сегодня',
            monthNames: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
                'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
            monthNamesShort: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн',
                'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
            dayNames: ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'],
            dayNamesShort: ['вск', 'пнд', 'втр', 'срд', 'чтв', 'птн', 'сбт'],
            dayNamesMin: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
            weekHeader: 'Не',
            dateFormat: 'dd.mm.yy',
            firstDay: 1,
            isRTL: false,
            showMonthAfterYear: false,
            yearSuffix: ''};
    });
    $.datepicker.setDefaults($.datepicker.regional['ru']);
    $("#birthDay").mask("99.99.9999", {placeholder: "_"}).datepicker({
        changeMonth: true,
        changeYear: true,
        dateFormat: 'dd.mm.yy',
        defaultDate: '-24Y',
        yearRange: "c-77:c+6",
        minDate: '-101Y',
        maxDate: '-18Y',
        onClose: function (dateText, inst) {
            $("#birthDay").val(dateText);
        }
    });
    $("#avatar_file").change(function () {
        $('#button_avatar_file span').text($(this).val());
        $('#button_trash_avatar_file').show();
    });
    $('#button_trash_avatar_file').click(function () {
        $(this).hide();
        $('#button_avatar_file span').text('Загрузить аватар');
        $("#avatar_file").val(null);
    });
    $('.masked-phone').mask("?9 999 999 99 99", {placeholder: "_"})
    $('#phone_profile').focus();
    $('body').focus();

    $('input[type="password"]').hidePassword(true);
    $("#fullname").suggestions({
        serviceUrl: "https://dadata.ru/api/v2",
        token: "d89731fbdbf67193159dff06a06a50781df243af",
        type: "NAME",
        onSelect: function (suggestion) {
            var data = suggestion.data;
            $('#fullname .suggestion-input').val('');
            if (data.surname !== null) {
                $('#fullname__surname').val(data.surname).trigger("change");
            }

            if (data.name !== null) {
                $('#fullname__name').val(data.name).trigger("change");
            }

            if (data.patronymic !== null) {
                $('#fullname__patronymic').val(data.patronymic).trigger("change");
            }

            if (data.gender !== null) {
                $('#fullname__gender-' + data.gender.toLowerCase()).attr('checked', true);
            }
        }
    });

    $('.b-order-table__item label').click(function () {
        var $this = $(this);
        $this.closest('tr').addClass('active').siblings().removeClass('active');
    });
    
    $('.country_list_profile').chosen({
        disable_search_threshold: 6,
        width: '100%'
    });
    setTimeout(function(){
        $('.country_list_profile').trigger('chosen:updated');
    }, 1000)
    $('[rel=tooltip]').tooltip();
}


