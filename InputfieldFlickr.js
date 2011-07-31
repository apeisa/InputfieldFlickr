$(document).ready(function() {
	
	var FLICKRAPIKEY = FlickrInput.APIKEY;
	var IMAGESIZE = 'Large';
	
	var images = [];
	
	var total = 0;
	var sizesFound = 0;
	var descsFound = 0;
	var $button;
	
	if(FlickrInput.nonCommercial > 0) {
		var LICENSE = "1,2,3,4,5,6,7";  //http://www.flickr.com/services/api/explore/flickr.photos.licenses.getInfo
	} else {
		var LICENSE = "4,5,6,7"; //http://www.flickr.com/services/api/explore/flickr.photos.licenses.getInfo
	}
	
	$('.flickrSearch').val($("#Inputfield_title").val());
	
	$('.flickrButton').live("click",function(){
		$results = $(this).parent().find('.flickrResults');
		$chosen = $(this).parent().find('.flickrChosen');
		$results.html('');
		field_name = $(this).parent().data('name');
		$results.addClass('flickrLoading');
		
		var tag = $(this).parent().find('.flickrSearch').val();
		$button = $(this);
		pullContent(tag);
		return false;
	});
	
	function getImageUrl(id, images_i) {
		var img_source = '';
		var orig_source = '';
		var desired_source = '';
		var backup_source = '';
		$.getJSON("http://api.flickr.com/services/rest/?method=flickr.photos.getSizes&jsoncallback=?",
					  {
						photo_id: id,
						format: "json",
						api_key: FLICKRAPIKEY
					  },
					  function(data) {
						$.each(data.sizes.size, function(i,size){
							if(size.label == "Small") {
								img_source = size.source;
							}
							if(size.label == IMAGESIZE) {
								desired_source = size.source;
							}
							if(size.label == "Original") {
								orig_source = size.source;
							}
							if(size.label == "Medium") {
								backup_source = size.source;
							}
						});
						if (desired_source == '') { desired_source = orig_source; }
						if (desired_source == '') { desired_source = backup_source; }
						
						
						sizesFound++;
						if (total == sizesFound) {
							allReady();
						}
						console.log({'thumb': img_source, 'full': desired_source});
						images[images_i].urls.thumb = img_source;
						images[images_i].urls.full = desired_source;
						if (images[images_i].desc.length > 1) {
							drawImage(images_i);
						}
						return true;
					});
	}
	
	function getImageDesc(id, images_i) {
		descsFound++;
		if (total == descsFound) {
			allReady();
		}
		images[images_i].desc = "kuvausteksti";
		if (images[images_i].urls.thumb.length > 1) {
			drawImage(images_i);
		}
		return true;
	}
	
	function drawImage(images_i) {
		if(!images[images_i].ready) {
			$("<div class='fImage' style='background: url("+ images[images_i].urls.thumb +") no-repeat 50% 50%;'></div>")
						
			// User clicks flickr image - we need to create hidden inputfield, which contains url to fullsize image
			.click(function(){
				if($(this).data('added')) {
					$(this).remove();
					return false;
				}
				$chosen.show();
				$(this).appendTo($chosen);
				$(this).data('added', true);
				$('<input type="hidden" name="'+field_name+'_flickr[]" value="'+ images[images_i].urls.full +'" />').appendTo($(this));
				
				})
			.appendTo($results);
			images[images_i].ready = true;
		}
	}
	
	function allReady() {
		if(descsFound == sizesFound) {
			$results.removeClass('flickrLoading');
			$button.removeClass('ui-state-active');
			console.log(images);
		}	
	}
	
	
	function pullContent(tag) {
		total = 0;
		sizesFound = 0;
		descsFound = 0;
		
		// We pull initial search from Flickr API - this will return image id:s for us
		$.getJSON("http://api.flickr.com/services/rest/?method=flickr.photos.search&jsoncallback=?",
		{
		  tags: tag,
		  tagmode: "any",
		  format: "json",
		  api_key: FLICKRAPIKEY,
		  license: LICENSE
		},
		// Callback function for API search - here we loop each photo and request more information for each image
		function(data) {
			
			total = data.photos.photo.length;
			
			if (total == 0) {
				allReady();
			}
			
			$.each(data.photos.photo, function(i,photo){
			
				images[i] = {'id': 0, 'urls': {'thumb': '', 'full': ''}, 'desc': '', 'ready': false};
				images[i].id = photo.id;
				getImageUrl(photo.id, i);
				getImageDesc(photo.id, i);
		  });
		});
	};
	
	function bindImages($results){
		$results.find('div').click(function(){alert("this");})
	};
	

}); 
