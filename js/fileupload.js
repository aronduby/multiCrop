(function($){

	$(document).ready(function(){
		var $form = $('form.form_class');
		var dragOutTimer;

		$('.file_trigger, .file_list').show();

		$('input:file', $form).css({
			'opacity':0,
			'position': 'absolute',
			'left':'-999999px'
		});

		$('.file_trigger', $form).click(function(){
			$(this).parents('.file_holder').find('input:file').trigger('click');
			return false;
		});

		// skip things that don't understand FileList
		if(typeof FileList != 'undefined'){
			var files = null;

			$('input:file', $form).change(function(e){
				files = $(this)[0].files;
				$file_list = $(this).parents('.file_holder').find('.file_list');

				processFiles(files, $file_list);			
			});

			// drag n drop
			// first we test the drag'n'drop (taken from modernizer)
			var div = document.createElement('div');
			if( ('draggable' in div) || ('ondragstart' in div && 'ondrop' in div) ){
				$('.file_holder').append('<div class="drop_notifier">Drop Files Here</div>');
				
				$('.file_holder', $form).bind({
					dragenter: function(){
						$(this).addClass('hover');
						$(this).data('dragentered', true);
						dragOutTimer = setInterval("$('.file_holder').trigger('dragout')", 1000);
						return false;
					},
					dragover: function(){
						return false;
					},
					mouseout: function(){
						$(this).data('dragentered', false);
					},
					dragout: function(){
						if($(this).data('dragentered') == false){
							$(this).removeClass('hover');
							clearInterval(dragOutTimer);
						}
					},
					drop: function (e) {
						$(this).removeClass('hover');

						e = e || window.event;
						e.preventDefault();

						// jQuery wraps the originalEvent, so we try to detect that here...
						e = e.originalEvent || e;
						// Using e.files with fallback because e.dataTransfer is immutable and can't be overridden in Polyfills (http://sandbox.knarly.com/js/dropfiles/).            
						files = (e.files || e.dataTransfer.files);
						$file_list = $(this).find('.file_list');
						processFiles(files, $file_list);

						return false;
					}
				});
			}

		} else {
			$('input:file', $form).change(function(e){
				var $file_list = $(this).parents('.element_holder').find('.file_list');
				$file_list.html('<li>'+( $(this).val().replace("C:\\fakepath\\", '') )+'</li>');
			});
		}



		function processFiles(files, $file_list){
			var $img = $('<img src="" class="upload_pic" title="" alt="" />');			
			// if files is undefined that means we don't have the html5 file api, so simply do nothing
			var image_filter = /image.*/;
			
			for(var i=0; i<files.length; i++){
				(function (i) { // Loop through our files with a closure so each of our FileReader's are isolated.
					var file = files[i];

					// safari catch, name = fileName, size = fileSize, no type
					if(typeof file.fileName != 'undefined'){
						file.name = file.fileName;
						file.size = file.fileSize;
					}
					
					// safari doesn't do file type
					if(typeof file.type != 'undefined' && file.type.match(image_filter)) {

						var reader = new FileReader();
						reader.onload = function (event) {
							var newImg = $img.clone().attr({
								src: event.target.result,
								title: (files.name),
								alt: (files.name)
							})
							$file_list.empty().append($('<li></li>').append(newImg).append('<span class="name">'+file.name+'</span> <span class="size">'+Math.round(file.size/1024)+'kb</span>'));
						};
						reader.readAsDataURL(file);
						
					} else {
						$file_list.html('<li><span class="name">'+file.name+'</span ><span class="size">'+Math.round(file.size/1024)+'kb</span></li>');
					}

				})(i);						
			}
		}

	});
})(jQuery);