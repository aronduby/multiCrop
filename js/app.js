$(document).ready(function(){

	$('#img_uploader').each(function(){
		$(this).data('fileUploader', new FileUploader($(this), {
			callback: function(file){				
				if(file.type != 'undefined' && file.type.match(/image.*/i)){
					if($('.crop-holder img').length)
							$('.crop-holder img, .crop-holder .multi-crop').remove();
					$('.crop-holder').addClass('loading');

					var reader = new FileReader();
					reader.onload = function(e){
						var img = $('<img />')
							.attr({
								src: this.result,
								alt: file.name,
								title: file.name,
								class: 'crop'
							})
							.appendTo( $('.crop-holder') );

						var mc = new MultiCrop(img, {
							bounds: [{
									"name": "fit",
									"type": 'fit',
									'finalWidth': 800,
									'finalHeight': 800
								}, {
									"name":"banner",
									"aspectRatio":1.7778,
									"finalWidth": 640,
									"finalHeight": 360
								}, {
									"name":"thumbnail",
									"aspectRatio":1,
									"finalWidth": 100,
									"finalHeight": 100				
							}]
						});						
						img.data('mc', mc);
						mc.img_loaded.then(function(){
							$('.crop-holder').removeClass('loading');
						});
					}
					reader.readAsDataURL(file);
				} else {
					alert('unsupported file type, please just use images (jpg, png, gif)');
				}				
			},
			fallbackCallback: console.log
		}));
	});
	
	/*
	$('img.crop').each(function(){
		$(this).data('mc', new MultiCrop($(this),{
			bounds: [{
					"name": "fit",
					"type": 'fit',
					'finalWidth': 800,
					'finalHeight': 800
				}, {
					"name":"banner",
					"aspectRatio":1.7778,
					"finalWidth": 640,
					"finalHeight": 360
				}, {
					"name":"thumbnail",
					"aspectRatio":1,
					"finalWidth": 100,
					"finalHeight": 100				
			}]
		}));
	});
	*/
});



function FileUploader(file_el, opts){
	var settings = {
		fileName: '',
		buttonClass: '',
		buttonValue: 'Choose a File',
		fileReaderCallback: $.noop, // full support, gets a FileReader and File as args
		fallbackCallback: $.noop // fallback for non FileReader, just gets the file name
	};
	opts = $.extend({}, settings, opts);

	var wrapper = $('<div class="file-uploader-wrap"></div>').insertBefore(file_el);

	file_el
		.css({
			'opacity':0,
			'position': 'absolute',
			'left':'-999999px'
		})
		.appendTo(wrapper);

	var filetrigger = $('<button type="button" class="'+opts.buttonClass+'">'+opts.buttonValue+'</button>')
			.on('click', function(){
				file_el.trigger('click');
			})
			.insertBefore(file_el),
		filename = $('<strong class="filename">'+opts.fileName+'</strong>').insertBefore(file_el);



	if(typeof FileList != 'undefined'){	
		file_el.on('change', function(e){
			processFiles( $(this)[0].files );
		});

		// drag and drop uploading
		// first we test the drag'n'drop (taken from modernizer)
		var div = document.createElement('div');
		if( ('draggable' in div) || ('ondragstart' in div && 'ondrop' in div) ){
			var dragOutTimer = 0;

			wrapper.append('<div class="drop_notifier">Drop Files Here</div>')
				.on({
					dragenter: function(){
						$(this).addClass('drag-over');
						$(this).data('dragentered', true);
						dragOutTimer = setInterval(function(){
							wrapper.trigger('dragout');	
						}, 1000);
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
						var files;
						$(this).removeClass('drag-over');
						
						e = e || window.event;
						e.preventDefault();
						// jQuery wraps the originalEvent, so we try to detect that here...
						e = e.originalEvent || e;

						// Using e.files with fallback because e.dataTransfer is immutable and can't be overridden in Polyfills (http://sandbox.knarly.com/js/dropfiles/).            
						files = (e.files || e.dataTransfer.files);
						processFiles(files);
						return false;
					}
				});
		}

	} else {
		file_el.on('change', function(e){
			var new_name = $(this).val().replace("C:\\fakepath\\", '');
			if(opts.fallbackCallback(new_name) !== false)
				filename.text(new_name);
		});
	}

	function processFiles(files){
		for(var i=0; i<files.length; i++){
			(function (i) { // Loop through our files with a closure so each of our FileReader's are isolated.
				var file = files[i];

				// safari catch, name = fileName, size = fileSize, no type
				if(typeof file.fileName != 'undefined'){
					file.name = file.fileName;
					file.size = file.fileSize;
				}

				if(opts.callback(file) !== false)
					filename.text(file.name);
			})(i);						
		}
	}
}





function MultiCrop(org_img, opts){
	var _img = org_img.clone(true),
		settings = {
			bounds: []
		};
	opts = $.extend({}, settings, opts);

	// setup out html
	var _mc_parent_el = $('<div class="multi-crop"></div>'),
		_img_holder = $('<div class="img-holder"></div>').appendTo(_mc_parent_el),
		_bounds_data_holder = $('<div class="bounds-data"></div>').appendTo(_mc_parent_el),
		_bounds_data_ul = $('<ul></ul>').appendTo(_bounds_data_holder),
		_colors = ["AliceBlue","AntiqueWhite","Aqua","Aquamarine","Azure","Beige","Bisque","Black","BlanchedAlmond","Blue","BlueViolet","Brown","BurlyWood","CadetBlue","Chartreuse","Chocolate","Coral","CornflowerBlue","Cornsilk","Crimson","Cyan","DarkBlue","DarkCyan","DarkGoldenRod","DarkGray","DarkGrey","DarkGreen","DarkKhaki","DarkMagenta","DarkOliveGreen","Darkorange","DarkOrchid","DarkRed","DarkSalmon","DarkSeaGreen","DarkSlateBlue","DarkSlateGray","DarkSlateGrey","DarkTurquoise","DarkViolet","DeepPink","DeepSkyBlue","DimGray","DimGrey","DodgerBlue","FireBrick","FloralWhite","ForestGreen","Fuchsia","Gainsboro","GhostWhite","Gold","GoldenRod","Gray","Grey","Green","GreenYellow","HoneyDew","HotPink","IndianRed","Indigo","Ivory","Khaki","Lavender","LavenderBlush","LawnGreen","LemonChiffon","LightBlue","LightCoral","LightCyan","LightGoldenRodYellow","LightGray","LightGrey","LightGreen","LightPink","LightSalmon","LightSeaGreen","LightSkyBlue","LightSlateGray","LightSlateGrey","LightSteelBlue","LightYellow","Lime","LimeGreen","Linen","Magenta","Maroon","MediumAquaMarine","MediumBlue","MediumOrchid","MediumPurple","MediumSeaGreen","MediumSlateBlue","MediumSpringGreen","MediumTurquoise","MediumVioletRed","MidnightBlue","MintCream","MistyRose","Moccasin","NavajoWhite","Navy","OldLace","Olive","OliveDrab","Orange","OrangeRed","Orchid","PaleGoldenRod","PaleGreen","PaleTurquoise","PaleVioletRed","PapayaWhip","PeachPuff","Peru","Pink","Plum","PowderBlue","Purple","Red","RosyBrown","RoyalBlue","SaddleBrown","Salmon","SandyBrown","SeaGreen","SeaShell","Sienna","Silver","SkyBlue","SlateBlue","SlateGray","SlateGrey","Snow","SpringGreen","SteelBlue","Tan","Teal","Thistle","Tomato","Turquoise","Violet","Wheat","White","WhiteSmoke","Yellow","YellowGreen"],
		_colors_i = 10;

	_img_holder.append(
		$('<div></div>')
			.addClass('padder')
			.append(_img)
	);

	org_img.hide();
	// replaceWith(_mc_parent_el);
	_mc_parent_el.insertAfter(org_img);

	// figure out what type of image we're going to be saving this as
	var img_type = null;
	if(_img.attr('src').substr(0,5)=='data:'){
		var re = /^data:(image\/\w+)\;/i;
		var matched = re.exec(_img.attr('src'));
		if(matched !== null)
			img_type = matched[1];
		
	} else {
		var ext = _img.attr('src').split('.').pop().toLowerCase();
		switch(ext){
			case 'jpg':
			case 'jpeg':
				img_type = 'image/jpeg';
				break;
			default:
				img_type = 'image/png';
		}
	}
	if(img_type == 'image/png'){
		_mc_parent_el.addClass('png');
	}

	var _obj = {
		el: _mc_parent_el,
		img: _img,
		img_type: img_type,
		org_width: 0,
		org_height: 0,
		org_img: org_img,
		img_holder: _img_holder,
		img_loaded: $.Deferred(),
		bounds_data_holder: _bounds_data_holder,
		bounds_data_ul: _bounds_data_ul,
		bounds_data: opts.bounds,
		bounds: [],
		dragging: false,
		restack: function(){
			// order the array by the area
			_obj.bounds.sort(function(a,b){
				return -(a.area - b.area);
			});
			
			// loop and set the z-index
			$.each(_obj.bounds, function(i){
				this.bound_el.css('zIndex', i+1);
			});
		},
		dim: function(){
			this.img_holder.addClass('dim');
		},
		undim: function(){
			this.img_holder.removeClass('dim');
		},
		save: function(){
			var data = {
				src: this.img.attr('src'),
				bounds: {}
			};
			$.each(this.bounds, function(){
				data.bounds[this.name] = this.save();
			});
			return data;
		}
	};

	// setup our bounds
	$.each(opts.bounds, function(){
		var b = new Bound(this, _colors[_colors_i], _obj, _obj.img.attr('src'));
		_obj.bounds.push(b);
		_colors_i+=10;
	});


	// debounce the window resize event
	var rtime = new Date(1, 1, 2000, 12,00,00),
		timeout = false,
		delta = 200;	
	$(window).on('resize.MultiCrop', function(e) {
		if(e.target !== window)
			return false;

		rtime = new Date();
		if (timeout === false) {
			$(this).triggerHandler('window.resize.start.MultiCrop');
			timeout = true;
			setTimeout(resizeend, delta);
		}
	});
	function resizeend() {
		if (new Date() - rtime < delta) {
			setTimeout(resizeend, delta);
		} else {
			timeout = false;
			$(window).triggerHandler('window.resize.end.MultiCrop');
		}               
	}

	// events
	_mc_parent_el.on({
		'restack.MultiCrop': _obj.restack
	});
	$(window).on({
		'window.resize.start.MultiCrop': function(){
			//_obj.img_holder.css('maxWidth', '');
			_obj.dim();
		},
		'window.resize.end.MultiCrop': function(){
			_obj.bounds_data_holder.css('maxHeight', _obj.img.height());
			_obj.img.attr({
				'data-start-width': _obj.img.width(),
				'data-start-height': _obj.img.height()
			});
			_obj.undim();
		}
	});
	
	org_img.on('load', function(){
		_obj.img.attr({
			'data-start-width': _obj.img.width(),
			'data-start-height': _obj.img.height(),
			'data-org-width': this.width,
			'data-org-height': this.height
		});
		_obj.bounds_data_holder.css('maxHeight', _obj.img.height());
		_obj.img_loaded.resolve();
	});

	return _obj;
}

function Bound(d, color, _parent, bg_src){
	var bound_el = $('<div class="bound"></div>').attr('id', 'bound'+Bound.count).append( $('<div class="bg"></div>').css('backgroundImage', 'url('+bg_src+')') ),
		data_el = $('<li></li>'),
		canvas = $('<canvas></canvas>');

	var opts = {
		type: 'exact',
		finalWidth: 100,
		finalHeight: 100,
		width: 100,
		height: 100,
		top: 0,
		left: 0,
		borderColor: color,
		color: color,
		handles: 'all',
		aspectRatio: 0,
		maximizeOnStart: true
	};
	$.extend(opts, d);

	// private methods
	var triggerParentEvent = function(event){
		_parent.el.trigger(event+'.MultiCrop');
	}

	var _calculateArea = function(el){
		// we can ignore the borders here since they'll be the same and this is just used for ordering
		return el.width() * el.height();
	}
	
	var _positionBackground = function(el){
		// ignore borders here since our background-clip is to the padding, not the border
		var top = -(el.position().top),
			left = -(el.position().left);
		
		el.find('.bg').css('backgroundPosition', left+'px '+top+'px');
	}

	var _updateThumb = function(el){
		var ctx = _obj.canvas[0].getContext('2d'),
			p = el.position(),
			ratio = _parent.img.width() / _parent.img.attr('data-org-width'),
			bW = parseInt(_obj.bound_el.css('borderLeftWidth'),10) + parseInt(_obj.bound_el.css('borderRightWidth'), 10),
			bH = parseInt(_obj.bound_el.css('borderTopWidth'),10) + parseInt(_obj.bound_el.css('borderBottomWidth'), 10),
			dWidth, dHeight;

		if(_parent.img_type == 'image/png'){
			ctx.clearRect(0,0,_obj.canvas.attr('width'),_obj.canvas.attr('height'));
		}

		// update the canvas size based on the size of the bounds
		// change the finalWidth/height to the new size
		if(_obj.opts.type == 'fit'){

			if(el.width()/_obj.opts.finalWidth > el.height()/_obj.opts.finalHeight){
				dWidth = _obj.opts.finalWidth;
				dHeight = el.height() * (_obj.opts.finalWidth / el.width());
			} else {
				dWidth = el.width() * (_obj.opts.finalHeight / el.height());
				dHeight = _obj.opts.finalHeight;
			}

			_obj.canvas.attr({
				'width': Math.round(dWidth),
				'height': Math.round(dHeight)
			});
		} else {
			dWidth = _obj.opts.finalWidth;
			dHeight = _obj.opts.finalHeight;
		}

		var o = {
			sX: Math.round(p.left / ratio),
			sY: Math.round(p.top / ratio),
			sWidth: Math.round((el.width() - bW) / ratio),
			sHeight: Math.round((el.height() - bH) / ratio),
			dX: 0,
			dY: 0,
			dWidth: dWidth,
			dHeight: dHeight
		};
		
		ctx.drawImage(_parent.org_img[0], o.sX, o.sY, o.sWidth, o.sHeight, o.dX, o.dY, o.dWidth, o.dHeight);
	};


	var _obj = {
		name: opts.name,
		bound_el: bound_el,
		data_el: data_el,
		canvas: canvas,
		opts: opts,
		area: _calculateArea(bound_el),
		setActive: function(){
			this.bound_el.addClass('active');
			this.data_el.addClass('active');
			_parent.dim();
		},
		removeActive: function(){
			this.bound_el.removeClass('active');
			this.data_el.removeClass('active');
			_parent.undim();
		},
		calculateArea: function(){
			this.area = _calculateArea(this.bound_el);
			return this.area;
		},
		update: function(){
			_positionBackground(this.bound_el);
			_updateThumb(this.bound_el);
			this.calculateArea();
		},
		getBounds: function(){
			return {
				top: this.bound_el.position().top,
				left: this.bound_el.position().left,
				width: this.bound_el.width(),
				height: this.bound_el.height()
			}
		},
		toDataURL: function(){ return this.toDataUrl(); },
		toDataUrl: function(){
			return this.canvas[0].toDataURL(_parent.img_type, Bound.jpgQuality);
		},
		save: function(){
			return {
				bounds: this.getBounds(),
				data: this.toDataUrl()
			};
		},
		bringToFront: function(){
			triggerParentEvent('restack');
			this.bound_el.css('zIndex', Bound.count + 1);
		},
		alignTop: function(){
			$(this.bound_el).css('top', 0);
			this.update();
		},
		alignMiddle: function(){
			var el = this.bound_el,
				top = (_parent.img.height()/2) - (el.height()/2);
			el.css('top',top);
			this.update();
		},
		alignBottom: function(){
			this.bound_el.css('top', _parent.img.height() - this.bound_el.height() );
			this.update();
		},
		alignLeft: function(){
			this.bound_el.css('left', 0);
			this.update();
		},
		alignCenter: function(){
			var el = this.bound_el,
				left = (_parent.img.width()/2) - (el.width()/2);
			el.css('left',left);
			this.update();
		},
		alignRight: function(){
			this.bound_el.css('left', _parent.img.width() - this.bound_el.width() );
			this.update();
		},
		maximize: function(){
			var el = this.bound_el,
				pW = _parent.img.width(),
				pH = _parent.img.height(),
				pR = pW/pH,
				mW = pW,
				mH = pH,
				eW = this.bound_el.width(),
				eH = this.bound_el.height(),
				eR = this.opts.aspectRatio!==null ? this.opts.aspectRatio : 0,
				dims = [];

			// rs > ri ? (wi * hs/hi, hs) : (ws, hi * ws/wi)
			// ratioScreen > ratioImage ? (widthImage * heightScreen/heightImage, heightScreen) : (widthScreen, heightImage * widthScreen/widthImage)
			if(eR !== 0){
				dims = pR > eR ? [eW * mH/eH, mH] : [mW, eH * mW/eW];
			} else {
				dims = [mW, mH];
			}
			
			this.bound_el.css({
				'width': dims[0],
				'height' : dims[1]
			});
			this.alignCenter();
			this.alignMiddle();

			triggerParentEvent('restack');
		}
	};

	// buttons
	var btns = $(),
		actions = [
			{
				'bringToFront': 'Bring to Front'
			}, {
				'alignTop': 'Top',
				'alignMiddle': 'Middle',
				'alignBottom': 'Bottom',
				'alignLeft': 'Left',
				'alignCenter': 'Center',
				'alignRight': 'Right',
			}, {
				'maximize': 'Max'
			}
		];
	$.each(actions, function(){
		var btngroup = $('<span class="btn-group"></span>');
		$.each(this, function(action, label){
			btngroup.append($('<button class="btn"></button>').text(label).addClass(action).on('click', _obj[action].bind(_obj)));
		});
		btns = btns.add(btngroup);
	});

	data_el
		.append($('<header>'+d.name+'</header>').css('backgroundColor',color))
		.append(
			$('<div></div>')
				.append($('<p class="btns"></p>').append(btns))
				.append(canvas)
				.append('<p class="note">'+(opts.type=='fit' ? 'fit within: ':"final size: ")+opts.finalWidth+'x'+opts.finalHeight+'</p>')
		);
	bound_el.append('<label>'+(d.name ? d.name : 'untitled')+'</label>');

	bound_el.appendTo(_parent.img_holder);
	data_el.appendTo(_parent.bounds_data_ul);

	var _onResize = function(){
		var sW = _parent.img.attr('data-start-width'),
			eW = _parent.img.width(),
			eH = _parent.img.height(),
			delta = eW/sW,
			nT = Math.round(_obj.bound_el.position().top * delta),
			nL = Math.round(_obj.bound_el.position().left * delta),
			nW = Math.round(_obj.bound_el.width() * delta),
			nH = Math.round(_obj.bound_el.height() * delta);
		
		_obj.bound_el.css({
			top: nT,
			left: nL,
			width: nW,
			height: nH,
		});
		_obj.bound_el.find('.bg').css('backgroundSize', eW+'px '+eH+'px');

		_obj.update();
	};

	$(window).on({
		'window.resize.start.MultiCrop': function(){
			
		},
		'window.resize.end.MultiCrop': function(){
			_onResize();
		}
	});

	data_el.on('click', 'header', function(){
		$(this).parent('li').toggleClass('open');
	});

	_parent.img_loaded.then(function(){
		_onResize();
		if(_obj.opts.maximizeOnStart)
			_obj.maximize();
		_obj.update();
	});

	// canvas size
	canvas.attr({
		'width': opts.finalWidth,
		'height': opts.finalHeight
	});
	

	// hover sharing
	bound_el.hover(function(){
		if(!_parent.dragging){
			$(this).addClass('hover');
			data_el.addClass('hover');
		}
	}, function(){
		$(this).removeClass('hover');
		data_el.removeClass('hover');
	});

	data_el.hover(function(){
		bound_el.addClass('hover');
		_parent.dim();
	}, function(){
		bound_el.removeClass('hover');
		_parent.undim();
	});

	//css
	if(opts.aspectRatio){
		if(opts.width / opts.height != opts.aspectRatio)
			opts.height = opts.width / opts.aspectRatio;
	}
	bound_el.css({
		height: opts.height,
		width: opts.width,
		top: opts.top,
		left: opts.left,
		borderColor: opts.borderColor,
		color: opts.color
	});

	// resizable
	bound_el.resizable({
		containment: '.multi-crop .img-holder',
		handles: opts.handles,
		aspectRatio: opts.aspectRatio,
		minWidth: opts.minWidth,
		minHeight: opts.minHeight,
		
		resize: function(){
			_obj.update();
		},

		start: function(){
			_obj.setActive();
			_parent.dragging = true;
		},

		stop: function(){
			_obj.removeActive();
			_obj.area = _calculateArea($(this));			
			triggerParentEvent('restack');
			_parent.dragging = false;
		}
	});

	// draggable
	bound_el.draggable({
		containment: '.multi-crop .img-holder',		
		drag: function(){
			_obj.update();
		},

		start: function(){
			_parent.dragging = true;
			_obj.setActive();
		},

		stop: function(){
			_obj.removeActive();
			_obj.update();
			_parent.dragging = false;			
		}
	});

	// _obj.update();
	Bound.count++;
	
	return _obj;
}
Bound.count = 0;
Bound.jpgQuality = .75;