function AnimateCarousel(cssCarouselContainer){
    jQuery('td .carouselWrapper').each(function(){
            var carouselWidth = jQuery(this).width();
            jQuery(this).find(".block_front_carusel").css({'width':carouselWidth+'px'});
    });
    
    $(".productCarousel a").colorbox();
    
    jQuery('.' + cssCarouselContainer).jcarousel({
        wrap: 'circular', 
        scroll: 1
    });
}


