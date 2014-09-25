var AnimateProfile = function () {
    $(":input:not(:checkbox):not(:button):not([type=hidden]):not([type=search]):not(.no-label)").floatlabel();
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

    $('.masked-phone').mask("?9 999 999 99 99 99", {placeholder: "_"})

    $('select').chosen({
        disable_search_threshold: 6,
        width: '100%'
    });

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
//
//    $("#address").suggestions({
//        serviceUrl: "https://dadata.ru/api/v2",
//        token: "d89731fbdbf67193159dff06a06a50781df243af",
//        type: "ADDRESS",
//        onSelect: function (suggestion) {
//            var data = suggestion.data;
//            $('#address .suggestion-input').val('');
//
//            if (data.postal_code !== null) {
//                $('#address__postalcode').val(data.postal_code).trigger("change");
//            }
//
//            if (data.country !== null) {
//                $('#address__country').val(data.country).trigger("change");
//            }
//
//            if (data.region !== null) {
//                $('#address__region').val(data.region + ' ' + data.region_type + '.').trigger("change");
//            }
//
//            if (data.city === null) {
//                if (data.settlement !== null) {
//                    $('#address__city').val(data.settlement_type + '. ' + data.settlement).trigger("change");
//                }
//            } else {
//                $('#address__city').val(data.city_type + '. ' + data.city).trigger("change");
//            }
//
//            if (data.street !== null) {
//                $('#address__street').val(data.street).trigger("change");
//            }
//
//            if (data.house !== null) {
//                $('#address__street').val(data.street + ', ' + data.house).trigger("change");
//            }
//
//            if (data.flat !== null) {
//                $('#address__street').val(data.street + ', ' + data.house + ', ' + data.flat).trigger("change");
//            }
//        }  
//    });

    $('.b-order-table__item label').click(function () {
        var $this = $(this);

        $this.closest('tr').addClass('active').siblings().removeClass('active');
    });
}


