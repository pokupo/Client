var timerId = 0;

function AnimateSlider() {
    var slider = $('.sliderContainer');
    if (!slider.hasClass('init')) {
        slider.addClass('init').append('<div class=\'main-jc-buttons\'>');
        var timer = 0;
        $('.view-slider').find('.view-content').children().each(function (i) {
            var id = i + 1;
            $('.main-jc-buttons').append('<button id=\'slider-item-main' + id + '\' class=\'slider-button\'>' + id + '</button>');
            if (id != 1) {
                $('.view-slider').find('.views-row-' + id + '').hide();
            } else {
                $('#slider-item-main' + id + '').addClass('active');
            }
            $('#slider-item-main' + id).livequery('click', function () {
                change_slide(id);
            });
        });
        slider.append('</div>');
        function change_slide(jc) {
            $('.view-slider').find('.view-content').children().each(function (a) {
                var hid = a + 1;
                $('.view-slider').find('.views-row-' + jc + '').fadeIn(500);
                if (jc != hid) {
                    $('.view-slider').find('.views-row-' + hid).hide();
                    $('#slider-item-main' + hid).removeClass('active');
                } else {
                    $('#slider-item-main' + jc + '').addClass('active');
                }
            });
            timer = 0;
        }

        clearInterval(timerId);
        timerId = setInterval(function () {

            //if(timer > 3){
            var id = $('.slider-button.active').text();
            if (id > $('.view-slider').find('.view-content').children().size() - 1) {
                change_slide(1);
            } else {
                var oid = eval(id) + 1;
                change_slide(oid);
            }
            timer = 50;
            //}
            timer++;
        }, 3000);
    }
}

var AnimateContent = function () {
    jQuery('td .carouselWrapper').each(function () {
        var carouselWidth = jQuery(this).width();
        jQuery(this).find(".block_front_carusel").css({'width': carouselWidth + 'px'});
    });

    $(".productCarousel a, .productBigImage a").colorbox();

    jQuery('.carouselContainer').jcarousel({
        wrap: 'circular',
        scroll: 1
    });

    new AnimateSlider();
    
    $('#sort_list ul').each(function() {
        var w = $(this).width();
        $(this).parent().css({'width': w + 'px'});
        $(this).parent().removeClass('active');
    });
    $('#sort_list').toggle(function() {
        $(this).addClass('active');
        return false;
    }, function() {
        $(this).removeClass('active');
    });
};


