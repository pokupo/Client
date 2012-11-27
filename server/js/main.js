$(document).ready(function(){
    $('.search_block .form_select').sSelect({
        defaultText: 'Выберите категорию'
    });
    $('.sorting_block select').sSelect({
        defaultText: 'по pейтингу'
    });
    $('.top_content_region .top_title_2 .form_select_1').sSelect({
        defaultText: 'Товары'
    });
    $('.top_content_region .top_title_2 .form_select_2').sSelect({
        defaultText: 'Все для дома и офиса'
    });
    jQuery('#jcarousel').jcarousel({
        wrap: 'circular', 
        scroll: 1
    });
    DD_roundies.addRule('.sidebar_block_menu', '5px');
    DD_roundies.addRule('.sidebar_block_menu .top_tabs .last', '0 5px 0 0');
    DD_roundies.addRule('.sidebar_block_menu .top_tabs .first', '5px 0 0 0');
    DD_roundies.addRule('.sidebar_block_menu li ul', '0 5px 5px 0');
    DD_roundies.addRule('.sidebar_block_1', '5px');
    DD_roundies.addRule('.sidebar_block_1 .all_link', '5px');
    DD_roundies.addRule('.sidebar_block_2', '5px');
    DD_roundies.addRule('.sidebar_block_2 .all_link', '5px');
    DD_roundies.addRule('.sidebar_block_3', '5px');
    DD_roundies.addRule('.sidebar_block_3 .all_link', '5px');
    DD_roundies.addRule('.sidebar_block_4', '5px');
    DD_roundies.addRule('.sidebar_block_4 .all_link', '5px');
    DD_roundies.addRule('.sidebar_block_5', '5px');
    DD_roundies.addRule('.sidebar_block_5 .all_link', '5px');
    DD_roundies.addRule('.block_front_tovars', '5px');
    DD_roundies.addRule('.block_front_tovars .all_link', '5px');
    
});

