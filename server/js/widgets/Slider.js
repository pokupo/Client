
var timerId = 0;

function InitSlider(cssSliderContainer){
    $('.' + cssSliderContainer).append('<div class=\'main-jc-buttons\'>');
    var timer = 0;
    $('.view-slider').find('.view-content').children().each(function(i){
        var id = i+1;
        $('.main-jc-buttons').append('<button id=\'slider-item-main'+id+'\' class=\'slider-button\'>'+id+'</button>');
        if(id != 1){
            $('.view-slider').find('.views-row-'+id+'').hide();
        }else{
            $('#slider-item-main'+id+'').addClass('active');
        }
        $('#slider-item-main'+id).livequery('click', function(){
            change_slide(id);
        });
    });
    $('.' + cssSliderContainer).append('</div>');
    function change_slide(jc){
        $('.view-slider').find('.view-content').children().each(function (a) {
            var hid = a+1;
            $('.view-slider').find('.views-row-'+jc+'').fadeIn(500);
            if(jc != hid){
                $('.view-slider').find('.views-row-'+hid).hide();
                $('#slider-item-main'+hid).removeClass('active');
            }else{
                $('#slider-item-main'+jc+'').addClass('active');
            }
        });
        timer = 0;
    }

    clearInterval(timerId);
    timerId = setInterval(function() {
    
        //if(timer > 3){
            var id = $('.slider-button.active').text();
            if(id > $('.view-slider').find('.view-content').children().size()-1){
                change_slide(1);
            }else{
                var oid = eval(id)+1;
                change_slide(oid);
            }
            timer = 50;
        //}
        timer++;
    }, 3000);
    
    DD_roundies.addRule('.block_front_slider .block_title', '5px 5px 0 0');
    DD_roundies.addRule('.block_front_slider', '0 0 5px 5px');
}