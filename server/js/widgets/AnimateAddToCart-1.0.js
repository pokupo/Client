var AnimateAddToCart = function (goodsId) {
    $('.b-item__order-button .btn').on('click', function () {
        var $this = $(this);
        var item = $this.closest('.b-item__popover');

        var x = item.offset().left,
                y = item.offset().top,
                tx = $('.menu-login').offset().left + 60;


        item.clone()
                .appendTo($('body'))
                .addClass('hallucination')
                .css({
                    position: 'absolute',
                    left: x,
                    top: y,
                    zIndex: 999
                })
                .animate({
                    opacity: 0.5,
                    left: tx,
                    top: 0,
                    width: 50,
                    height: 100
                },
                600,
                        function () {
                            $(this).remove();
                        }
                );
    });
}


