/*
 * Lazy Load - jQuery plugin for lazy loading images
 *
 * Copyright (c) 2007-2013 Mika Tuupola
 *
 * Licensed under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 * Project home:
 *   http://www.appelsiini.net/projects/lazyload
 *
 * Version:  1.9.3
 * 
 */

( function( $, window, document, Utils ) {
    var $window = $(window);
    var $document = $(document);

    // check ios version fo using picture srcset
    var isPictureCompatibeBrowser = true;

    if ( Utils.AnalyzeBrowser !== undefined ) {
        if ( Utils.AnalyzeBrowser.isIos && Utils.AnalyzeBrowser.iosVersion && Utils.AnalyzeBrowser.iosFullVersion ) {
            // check ios
            if ( Utils.AnalyzeBrowser.iosVersion < 9 ) {
                isPictureCompatibeBrowser = false;
            }
            else if ( Utils.AnalyzeBrowser.iosVersion == 9 ) {
                // check minor version (format `12_3_1`)
                var iosFullVersion = Utils.AnalyzeBrowser.iosFullVersion;
                var iosVersionNumbers = iosFullVersion.split( '_' );
                // requires minimum 9.3.x
                if ( iosVersionNumbers[ 1 ] < 3 ) {
                    isPictureCompatibeBrowser = false;
                }
            }
        }
        else if ( Utils.AnalyzeBrowser.isIe && Utils.AnalyzeBrowser.ieVersion ) {
            // check ie, requires minimum 13
            if ( Utils.AnalyzeBrowser.ieVersion <= 12 ) {
                isPictureCompatibeBrowser = false;
            }
        }
    }

    $.fn.lazyload = function(options) {
        var elements = this;
        var $container;
        var settings = {
            threshold                      : 0,
            failure_limit                  : 0,
            event                          : "scroll",
            effect                         : "show",
            container                      : window,
            data_attribute                 : "original",
            skip_invisible                 : true,
            appear                         : null,
            load                           : null,
            placeholder                    : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAQAAAAnOwc2AAAAEUlEQVR42mNk4GHAAIxDWRAAOokAg37Zbo4AAAAASUVORK5CYII=",
            srcset_data_attribute          : "srcset",
            picture_width_data_attribute   : "width",
            picture_height_data_attribute  : "height"
        };

        function update() {
            
            var counter = 0;

            elements.each(function() {
                var $this = $(this);
                if (settings.skip_invisible && !$this.is(":visible")) {
                    return;
                }
                if ($.abovethetop(this, settings) ||
                    $.leftofbegin(this, settings)) {
                        /* Nothing. */
                } else if (!$.belowthefold(this, settings) &&
                    !$.rightoffold(this, settings)) {
                        $this.trigger("appear");
                        /* if we found an image we'll load, reset the counter */
                        counter = 0;
                } else {
                    if (++counter > settings.failure_limit) {
                        return false;
                    }
                }
            });

        }

        if(options) {
            /* Maintain BC for a couple of versions. */
            if (undefined !== options.failurelimit) {
                options.failure_limit = options.failurelimit;
                delete options.failurelimit;
            }
            if (undefined !== options.effectspeed) {
                options.effect_speed = options.effectspeed;
                delete options.effectspeed;
            }

            $.extend(settings, options);
        }

        /* Cache container as jQuery as object. */
        $container = (settings.container === undefined ||
                      settings.container === window) ? $window : $(settings.container);

        /* Fire one scroll event per scroll. Not one scroll event per image. */
        if (0 === settings.event.indexOf("scroll")) {
            $container.bind(settings.event, function() {
                return update();
            });
        }

        this.each(function() {
            var self = this;
            var $self = $(self);
            // check for picture tag as parent
            var $parent = $self.parent();
            var isPicture = $parent.is( 'picture' );

            self.loaded = false;
            
            // resize function
            $.fn.resizeUnloadImg = function( newImgWidth, newImgHeight ) {
                var $img = $( this );

                if ( !! newImgWidth && !! newImgHeight ) {

                    // set or reset to intended size (always, no need to remove style, just overwrite immediately)
                    $img.css( { width: newImgWidth + 'px', height: newImgHeight + 'px' } );

                    // check for css size limitation
                    var cssImgWidth = parseInt( $img.css( 'width' ) );

                    // reduce size after set if nessesary
                    if ( cssImgWidth != newImgWidth ) {
                        var calcImgWidth = cssImgWidth;
                        var calcImgHeight = newImgHeight / newImgWidth * cssImgWidth;
                        // adapt
                        $img.css( { width: calcImgWidth + 'px', height: calcImgHeight + 'px' } );
                    }

                    // trigger scroll since other unload images might have been appeared during resizing current image
                    $window.trigger( 'scroll' );

                }
            }

            // get image sizes (from width / height or data-with / data-height)
            $.fn.getSizes = function( isPicture ) {
                var width = null;
                var height = null;
                if ( isPictureCompatibeBrowser && isPicture ) {
                    $parent.find( 'source' ).each( function() {

                        var media = $( this ).attr( 'media' );

                        if ( window.matchMedia( media ).matches || media === undefined ) {
                            width = $( this ).attr( 'data-' + settings.picture_width_data_attribute );
                            height = $( this ).attr( 'data-' + settings.picture_height_data_attribute );
                            return false; // break after first match
                        }
                    } );
                }
                else if ( isPicture ) {
                    width = $( this ).attr( 'data-' + settings.picture_width_data_attribute );
                    height = $( this ).attr( 'data-' + settings.picture_height_data_attribute );
                }
                else {
                    width = $( this ).attr( 'width' );
                    height = $( this ).attr( 'height' );
                }
                return [ width, height ];
            }


            /* If no src attribute given use data:uri. */
            if ( $self.is( 'img' ) && ! $self.attr( 'src' ) ) {
            
                /* plenty adaption: set sizes to unload images after placeholder is set */
                
                $self               
                    .one( 'load', function() {
                
                        var origSizes = $self.getSizes( isPicture );
                        var origImgWidth = origSizes[ 0 ];
                        var origImgHeight = origSizes[ 1 ];

                        if ( !! origImgWidth && !! origImgHeight ) {

                            // generate event id
                            var eventId = $self.attr( 'data-' + settings.data_attribute ).replace(/[/.]/g, '_');

                            // initial resize
                            $self.resizeUnloadImg( origImgWidth, origImgHeight, true );

                            // events for later resize

                            // media sm, md, lg: resize on sizeChange
                            $window.on( 'sizeChange.lazyloadUnload.' + eventId, function() {
                                if ( ! self.loaded ) {
                                    $self.resizeUnloadImg( origImgWidth, origImgHeight );
                                }
                                else {
                                    // destroy resize event after loading
                                    $window.unbind( 'sizeChange.lazyloadUnload.' + eventId + ' resize.lazyloadUnload.' + eventId );
                                }
                            } );

                            // media xs: resize on window resize
                            $window.on( 'resize.lazyloadUnload.' + eventId, function() {
                                if ( !! window.mediaSize && window.mediaSize == 'xs' ) {
                                    if ( ! self.loaded ) {
                                        $self.resizeUnloadImg( origImgWidth, origImgHeight );
                                    }
                                    else {
                                        // destroy resize event after loading
                                        $window.unbind( 'sizeChange.lazyloadUnload.' + eventId + ' resize.lazyloadUnload.' + eventId );
                                    }
                                }
                            } );

                        }
                         
                    } )
                    .attr( 'src', settings.placeholder );

                    // set placeholders to sources
                    if ( isPicture ) {
                        $parent.find( 'source' ).attr( 'srcset', settings.placeholder );
                    }

                
            }
            
            // if width and height given, do initial resize, handle resize events

            /* When appear is triggered load original image. */
            $self.one("appear", function() {
                if (!this.loaded) {
                    if (settings.appear) {
                        var elements_left = elements.length;
                        settings.appear.call(self, elements_left, settings);
                    }
                    // load hidden placeholder img in background, replace lazy img src on load
                    // prepare preload url, required before load placeholder
                    var preloadImgSrc = $self.attr( 'data-' + settings.data_attribute );

                    if ( isPictureCompatibeBrowser && isPicture ) {

                        var $sources = $parent.find( 'source' );
                        var mediaSourceMap = [];
                        var mediaMatchFound = false;

                        $sources.each( function () {

                            var media = $( this ).attr( 'media' );
                            var srcset = $( this ).attr( 'data-' + settings.srcset_data_attribute );

                            if ( ! mediaMatchFound && ( window.matchMedia( media ).matches || ! media ) ) {

                                mediaMatchFound = true; // use first match

                                // load following srcset instead of img original
                                preloadImgSrc = srcset;
                            }

                        } );

                    }

                    $("<img>")
                        .bind("load", function() {

                            if ( $self.is( "img" ) ) {
                                $self.hide();
                                if ( isPictureCompatibeBrowser && isPicture ) {
                                    // replace all sources (of which one has already been preloaded)
                                    $sources.each( function () {
                                        var srcset = $( this ).attr( 'data-' + settings.srcset_data_attribute );
                                        $( this ).attr( 'srcset', srcset );
                                    } );
                                }
                                $self.attr( 'src', $self.attr( 'data-' + settings.data_attribute ) );
                                $self.css( { width: '', height: '' } ); // plenty adaption
                                $self[ settings.effect ]( settings.effect_speed );
                            }
                            else {
                                // is background image
                                var backgroundImage = $self.css("background-image");
                                $self.css( { backgroundImage: "url('" + preloadImgSrc + "'), " + backgroundImage } ); // plenty adaption: load new image and put it before old one without removing old one
                            }

                            // don't know if this event is still used or obsolete, but if required should be triggered here
                            $self.trigger( 'loaded' );

                            self.loaded = true;
                                     
                            /* Remove image from array so it is not looped next time. */
                            var temp = $.grep(elements, function(element) {
                                return !element.loaded;
                            });
                            elements = $(temp);

                            if (settings.load) {
                                var elements_left = elements.length;
                                settings.load.call(self, elements_left, settings);
                            }
                        
                        })
                        .attr( 'src', preloadImgSrc );
                        // TODO: what about removing img after use?
                    //$self.trigger("loaded");
                    
                }
            });

            /* When wanted event is triggered load original image */
            /* by triggering appear.                              */
            if (0 !== settings.event.indexOf("scroll")) {
                $self.bind(settings.event, function() {
                    if (!self.loaded) {
                        $self.trigger("appear");
                    }
                });
            }
        });

        /* Force initial check if images should appear. */
        $document.ready(function() {
            update();
        });
        //  plenty adaption: update after fonts loaded
        $window.on( 'load resize', function() {
            update();
        } );

        return this;
    };

    /* Convenience methods in jQuery namespace.           */
    /* Use as  $.belowthefold(element, {threshold : 100, container : window}) */

    $.belowthefold = function(element, settings) {
        var fold;

        if (settings.container === undefined || settings.container === window) {
            fold = (window.innerHeight ? window.innerHeight : $window.height()) + $window.scrollTop();
        } else {
            fold = $(settings.container).offset().top + $(settings.container).height();
        }

        return fold <= $(element).offset().top - settings.threshold;
    };

    $.rightoffold = function(element, settings) {
        var fold;

        if (settings.container === undefined || settings.container === window) {
            fold = $window.width() + $window.scrollLeft();
        } else {
            fold = $(settings.container).offset().left + $(settings.container).width();
        }

        return fold <= $(element).offset().left - settings.threshold;
    };

    $.abovethetop = function(element, settings) {
        var fold;

        if (settings.container === undefined || settings.container === window) {
            fold = $window.scrollTop();
        } else {
            fold = $(settings.container).offset().top;
        }

        return fold >= $(element).offset().top + settings.threshold  + $(element).height();
    };

    $.leftofbegin = function(element, settings) {
        var fold;

        if (settings.container === undefined || settings.container === window) {
            fold = $window.scrollLeft();
        } else {
            fold = $(settings.container).offset().left;
        }

        return fold >= $(element).offset().left + settings.threshold + $(element).width();
    };

    $.inviewport = function(element, settings) {
         return !$.rightoffold(element, settings) && !$.leftofbegin(element, settings) &&
                !$.belowthefold(element, settings) && !$.abovethetop(element, settings);
    };

    /* Custom selectors for your convenience.   */
    /* Use as $("img:below-the-fold").something() or */
    /* $("img").filter(":below-the-fold").something() which is faster */

    $.extend($.expr[":"], {
        "below-the-fold" : function(a) { return $.belowthefold(a, {threshold : 0}); },
        "above-the-top"  : function(a) { return !$.belowthefold(a, {threshold : 0}); },
        "right-of-screen": function(a) { return $.rightoffold(a, {threshold : 0}); },
        "left-of-screen" : function(a) { return !$.rightoffold(a, {threshold : 0}); },
        "in-viewport"    : function(a) { return $.inviewport(a, {threshold : 0}); },
        /* Maintain BC for couple of versions. */
        "above-the-fold" : function(a) { return !$.belowthefold(a, {threshold : 0}); },
        "right-of-fold"  : function(a) { return $.rightoffold(a, {threshold : 0}); },
        "left-of-fold"   : function(a) { return !$.rightoffold(a, {threshold : 0}); }
    });

} )( jQuery, window, document, BSX_UTILS );


// init function
( function( $, Utils ) {

    $.fn.initLazyload = function( options ) {

        var defaults = {
            effect: 'fadeIn',
            event: ( typeof Modernizr !== "undefined" && Modernizr.touchevents ) ? 'scroll touchmove' : 'scroll',
            data_attribute: 'src'
        };

        options = $.extend( {}, defaults, options );

        var $elems = $( this );

        $elems.each( function( i, image ) {

            var $image = $( image );

            if ( !! $image.attr( 'data-fn-effect' ) ) {
                options.effect = $image.attr( 'data-fn-effect' );
            }

            $image.lazyload( options );
            
        } );

    }

    // init
    Utils.$window.on( Utils.events.initJs, function() {

        Utils.$functionElems.filter( '[data-fn="lazyload"]' ).initLazyload();

    } );

} )( jQuery, BSX_UTILS );
