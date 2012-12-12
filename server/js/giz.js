$(document).ready(function(){
	$(".sidebar_block_menu li").hover(
		function (){
			$(this).find('ul').show();
		},function (){
			$(this).find('ul').hide();
		}
	);
	
        
        
        
       
	$('.sidebar_block_menu .top_tabs span').click(function(){
            
		$('.sidebar_block_menu .top_tabs span').removeClass('active');
		$(this).addClass('active');
                var id = $(this).attr('class').split('_')[1];
                alert(id);
                $('.sidebar_block_menu ul').hide();
		$('.sidebar_block_menu #catalogCategories_' + id).show();
		
	});
//	$('.sidebar_block_menu .top_tabs .last').click(function(){
//		$('.sidebar_block_menu .top_tabs span').removeClass('active');
//		$(this).addClass('active');
//		$('.sidebar_block_menu .sidebar_block_menu_tovars').hide();
//		$('.sidebar_block_menu .sidebar_block_menu_services').show();
//	});
	
        
        
        
        
        
        
	$('#news_menu_1 .first').click(function(){
		$('#news_menu_1 li').removeClass('active');
		$(this).addClass('active');
		$('.news_block_1 .content_1').show();
		$('.news_block_1 .content_2').hide();
	});
	$('#news_menu_1 .last').click(function(){
		$('#news_menu_1 li').removeClass('active');
		$(this).addClass('active');
		$('.news_block_1 .content_1').hide();
		$('.news_block_1 .content_2').show();
	});
	
	$('.salespeople_serch .form_text').click(function(){
		if ($('.salespeople_serch .form_text').val()=='Поиск продавцов'){
			$('.salespeople_serch .form_text').val('');
		}
	});
	$('.salespeople_serch .form_text').blur(function(){
		if ($('.salespeople_serch .form_text').val()==''){
			$('.salespeople_serch .form_text').val('Поиск продавцов');
		}
	});

	if ($('.search_block .form_text').val()==''){
		$('.search_block .form_text').val('Введите название товара для его поиска...');
	}
	$('.search_block .form_text').click(function(){
		if ($('.search_block .form_text').val()=='Введите название товара для его поиска...'){
			$('.search_block .form_text').val('');
		}
	});
	$('.search_block .form_text').blur(function(){
		if ($('.search_block .form_text').val()==''){
			$('.search_block .form_text').val('Введите название товара для его поиска...');
		}
	});
	
	$('.block_front_tovars .bay').mouseenter(function() {
		$(this).parent().find('.price').css('color', '#ED710D');
	}).mouseleave(function() {
		$(this).parent().find('.price').css('color', '#099033');
	});
	
	$('.block_front_carusel .bay').mouseenter(function() {
		$(this).parent().find('.price').css('color', '#ED710D');
	}).mouseleave(function() {
		$(this).parent().find('.price').css('color', '#099033');
	});
	
	$('.faq_block_1 .row_title').click(function(){
		$('.faq_block_1 .row_content').hide();
		$(this).parent().find('.row_content').show();
		$('.faq_block_1 .row').removeClass('active');
		$(this).parent().addClass('active');
	});
	
	$('.profile_block_1 .profile_table_1 td input:checked').parents('tr').addClass('active');
	$('.profile_block_1 .profile_table_1 td input').change(function(){
		$(this).parents('table').find('tr').each(function(){
		$(this).removeClass('active');
	})
		$(this).parents('tr').addClass('active');
	});
	
	$('.profile_block_1 a.add_ick').click(function(){
		$('.ick_block').show();
	});
	$('.ick_block .block_title a').click(function(){
		$('.ick_block').hide();
	});
	
	$('.profile_block_1 .profile_table_7 td input:checked').parents('tr').addClass('active');
	$('.profile_block_1 .profile_table_7 td input').click(function(){
		if($(this).attr('checked') == 'checked'){
			$(this).parents('tr').addClass('active');
		}else{
			$(this).parents('tr').removeClass('active');
		}
	})
	
	$('.top_content_region .newListSelected a').livequery(function(){
		$(this).click(function(){
			$('.top_content_region .newListSelected').removeClass('active');
		});
	});
	
//	$('#block-views-slider-block_1').append('<div class=\'main-jc-buttons\'>');
//	var timer = 0;
//	$('.view-slider').find('.view-content').children().each(function(i){
//		var id = i+1;
//		$('.main-jc-buttons').append('<button id=\'slider-item-main'+id+'\' class=\'slider-button\'>'+id+'</button>');
//		if(id != 1){
//			$('.view-slider').find('.views-row-'+id+'').hide();
//		}else{
//			$('#slider-item-main'+id+'').addClass('active');
//		}
//		$('#slider-item-main'+id).livequery('click', function(){
//			change_slide(id);
//		});
//	});
//	$('#block-views-slider-block_1').append('</div>');
//	function change_slide(jc){
//		$('.view-slider').find('.view-content').children().each(function (a) {
//			var hid = a+1;
//			$('.view-slider').find('.views-row-'+jc+'').fadeIn(500);
//			if(jc != hid){
//				$('.view-slider').find('.views-row-'+hid).hide();
//				$('#slider-item-main'+hid).removeClass('active');
//			}else{
//				$('#slider-item-main'+jc+'').addClass('active');
//			}
//		});
//		timer = 0;
//	}
//	timer = setInterval(function() {
//		if(timer > 3){
//			var id = $('.slider-button.active').text();
//			if(id > $('.view-slider').find('.view-content').children().size()-1){
//				change_slide(1);
//			}else{
//				var oid = eval(id)+1;
//				change_slide(oid);
//			}
//			timer = 50;
//		}
//		timer++;
//	}, 3000);
//	
	$('.category_block_2 .bay').mouseenter(function() {
		$(this).parent().find('.price').css('color', '#ED710D');
	}).mouseleave(function() {
		$(this).parent().find('.price').css('color', '#099033');
	});
	
	$('.add_grup_block_2 td.row_5 input:checked').parents('tr').addClass('active');
	$('.add_grup_block_2 td.row_5 input').change(function(){
		$(this).parents('table').find('tr').each(function(){
		$(this).removeClass('active');
	})
		$(this).parents('tr').addClass('active');
	});

	$('.user_tovars_category input:checked').parents('.row').addClass('active_row');
	$('.user_tovars_category input:checked').parents('.rows').addClass('active');
	$('.user_tovars_category input').click(function(){
		if($(this).attr('checked') == 'checked'){
			$(this).parents('.row').addClass('active_row');
		}else{
			$(this).parents('.row').removeClass('active_row');
		}
	})
	$('.user_tovars_category .rows_title').click(function(){
		if($(this).parent().find('.rows_content').css('display') == 'none'){
			$(this).parent().find('.rows_content').show();
			$(this).parent().addClass('active');
		}else{
			$(this).parent().find('.rows_content').hide();
			$(this).parent().removeClass('active');
		}
	});
	
	$('.user_tovars_add input:checked').parents('.row').addClass('active_row');
	$('.user_tovars_add input:checked').parents('.rows').addClass('active');
	$('.user_tovars_add input').click(function(){
		if($(this).attr('checked') == 'checked'){
			$(this).parents('.row').addClass('active_row');
		}else{
			$(this).parents('.row').removeClass('active_row');
		}
	})
	
	$('.user_tovars_galery .photo_name input').val('Название изображения');
	$('.user_tovars_galery .photo_name input').click(function(){
		if ($(this).val()=='Название изображения'){
			$(this).val('');
		}
	});
	$('.user_tovars_galery .photo_name input').blur(function(){
		if ($(this).val()==''){
			$(this).val('Название изображения');
		}
	});
	
	$('#header .bottom_menu .form_text').val('Поиск по товарам');
	$('#header .bottom_menu .form_text').click(function(){
		if ($(this).val()=='Поиск по товарам'){
			$(this).val('');
		}
	});
	$('#header .bottom_menu .form_text').blur(function(){
		if ($(this).val()==''){
			$(this).val('Поиск по товарам');
		}
	});
});