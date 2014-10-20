var AnimateGoods = function () {
    $('.tabsContent:first').show();

    if (Ya != undefined) {
        Config.Goods.share.element = 'share';
        new Ya.share(Config.Goods.share);
    }
    
    jQuery('.jcarousel').jcarousel({
        wrap: 'circular',
        scroll: 1
    });
    $(".productCarousel a, .productBigImage a").colorbox();
}

