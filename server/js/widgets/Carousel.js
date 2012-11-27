function InitCarousel(cssCarouselContainer){
    jQuery('.' + cssCarouselContainer).jcarousel({
        wrap: 'circular', 
        scroll: 1
    });
    DD_roundies.addRule('.block_front_carusel', '5px');
    DD_roundies.addRule('.block_front_carusel .all_link', '5px');
}


