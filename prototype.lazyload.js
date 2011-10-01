var lazyload = {
	
	settings: {
		threshold    : 0,
		failurelimit : 0,
		event        : "scroll",
		effect       : "appear",
		effectopts   : {duration: 0.3},
		container    : window,
		placeholder  : null,
		selector     : 'img'
	},
	
	init: function(){
		this.settings = Object.extend(this.settings, arguments[0] || {}); 
		
		var settings = this.settings;
		this.elements = (settings.container instanceof Element ? settings.container : $$('body')[0]).select(settings.selector);
		
		this.elements.each(function(img){
			if (!img.hasAttribute('original')) {
				img.writeAttribute('original', img.readAttribute('src'));
            }
            if (settings.event != "scroll" || 
            		img.readAttribute('src') == undefined || 
            		settings.placeholder == img.readAttribute('src') || 
            		(img.abovethetop(settings) ||
            				img.leftofbegin(settings) || 
            				img.belowthefold(settings) || 
            				img.rightoffold(settings) )) {
            	if (settings.placeholder) {
            		img.writeAttribute('src', settings.placeholder);
            	} else {
            		img.writeAttribute('src', '');
            	}
            	img.loaded = false;
            } else {
            	//img.loaded = true;
            }
            
            img.observe('lazyload:show', function(event){
                if (!this.loaded) {
                	var self = this;
                	var t = new Element('img').observe('load', function(){
                		self.hide().writeAttribute('src', self.readAttribute('original'))[settings.effect](settings.effectopts);
                		self.loaded = true;
                	}).writeAttribute('src', this.readAttribute('original'));
                }
            });
            
            if (settings.event != "scroll") {
            	img.observe(settings.event, function(event) {
            		if (!img.loaded) {
            			img.fire('lazyload:show');
            		}
            	});
            }
		});
		
		if (settings.event == 'scroll') {
			Event.observe(settings.container, "scroll", this.onscroll.bind(this));
		}
		
		this.onscroll();
	},
	
	onscroll: function(e) {
		var counter = 0;
		var settings = this.settings;
		this.elements.each(function(el) {
			if (el.abovethetop(settings) || el.leftofbegin(settings)) {
				/* Nothing. */
			} else if (!el.belowthefold(settings) && !el.rightoffold(settings)) {
				el.fire('lazyload:show');
			} else {
				if (counter++ > settings.failurelimit) {
					return false;
				}
			}
		});
		/* Remove image from array so it is not looped next time. */
		this.elements = this.elements.reject(function(img){
			return img.loaded;
		});
	}
};

Element.addMethods({
	belowthefold: function(element) {
		if (!(element = $(element))) return;
		
		var settings = Object.extend(lazyload.settings, arguments[1] || {});
		var viewport = document.viewport.getAltDimensions();
		var scroll = document.viewport.getScrollOffsets();
		
		if (settings.container === undefined || settings.container === window) {
	        var fold = viewport.height + scroll.top;
	    } else {
	        var fold = $(settings.container).cumulativeScrollOffset().top + $(settings.container).getHeight();
	    }
	    return fold <= $(element).positionedOffset().top - settings.threshold;
	},
	abovethefold: function(element) {
		if (!(element = $(element))) return;
		var settings = Object.extend(lazyload.settings, arguments[1] || {});
		return ! $(element).belowthefold(settings);
	},
	
	rightoffold: function(element) {
		if (!(element = $(element))) return;
		
		var settings = Object.extend(lazyload.settings, arguments[1] || {});
		var viewport = document.viewport.getAltDimensions();
		var scroll = document.viewport.getScrollOffsets();
		
		if (settings.container === undefined || settings.container === window) {
			var fold = viewport.width + scroll.left;
		} else {
			var fold = $(settings.container).cumulativeScrollOffset().left + $(settings.container).getWidth();
		}
		return fold <= $(element).positionedOffset().left - settings.threshold;
	},
	
	abovethetop: function(element) {
		if (!(element = $(element))) return;
		
		var settings = Object.extend(lazyload.settings, arguments[1] || {});
		var viewport = document.viewport.getAltDimensions();
		var scroll = document.viewport.getScrollOffsets();
		
		if (settings.container === undefined || settings.container === window) {
	        var fold = scroll.top;
	    } else {
	        var fold = $(settings.container).positionedOffset().top;
	    }
	    return fold >= $(element).positionedOffset().top + settings.threshold  + $(element).getHeight();
	},
	leftofbegin: function(element) {
		if (!(element = $(element))) return;
		
		var settings = Object.extend(lazyload.settings, arguments[1] || {});
		var viewport = document.viewport.getAltDimensions();
		var scroll = document.viewport.getScrollOffsets();
		
		if (settings.container === undefined || settings.container === window) {
	        var fold = scroll.left;
	    } else {
	        var fold = $(settings.container).positionedOffset().left;
	    }
	    return fold >= $(element).positionedOffset().left + settings.threshold + $(element).getWidth();
	}
});


/**
 * Bugfix
 */
Object.extend(document.viewport, {
	getAltDimensions: function() {
		var viewportwidth;
		var viewportheight;
	
		if (typeof window.innerWidth != 'undefined') {
			viewportwidth = window.innerWidth,
			viewportheight = window.innerHeight
		} else if (typeof document.documentElement != 'undefined' && typeof document.documentElement.clientWidth != 'undefined' && document.documentElement.clientWidth != 0) {
			viewportwidth = document.documentElement.clientWidth,
			viewportheight = document.documentElement.clientHeight
		} else {
			viewportwidth = document.getElementsByTagName('body')[0].clientWidth,
			viewportheight = document.getElementsByTagName('body')[0].clientHeight
		}
		return { width: viewportwidth, height: viewportheight };
	}
});

