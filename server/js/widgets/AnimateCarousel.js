function AnimateCarousel(cssCarouselContainer){
    jQuery('td .carouselWrapper').each(function(){
            var carouselWidth = jQuery(this).width();
            jQuery(this).find(".block_front_carusel").css({'width':carouselWidth+'px'});
    });
    
    jQuery('.' + cssCarouselContainer).jcarousel({
        wrap: 'circular', 
        scroll: 1
    });

    DD_roundies.addRule('.block_front_carusel', '5px');
    DD_roundies.addRule('.block_front_carusel .all_link', '5px');
}


