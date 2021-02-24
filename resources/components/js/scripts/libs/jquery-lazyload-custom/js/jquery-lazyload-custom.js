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

// TODO: resize and set src / srcset only if empty, do no resize if svg placeholder

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

    $.fn.lazyload = function( options, index ) {
        var elements = this;
        var $container;
        var settings = {
            threshold                      : 0,
            failure_limit                  : 0,
            event                          : "scroll",
            effect_speed                   : '200',
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

        // get responsive sources from `data-srcset` and/or from `data-src`
        _getMediaMatchingSrc = function( srcsetJson, src ) {
            var currentSrc = '';
            for ( var i = 0; i < srcsetJson.length; i++ ) {
                //console.log( i + ': media: ' + srcsetJson[ i ].media + ', src: ' + srcsetJson[ i ].src );
                if ( typeof srcsetJson[ i ].media != 'undefined' && typeof srcsetJson[ i ].src != 'undefined' && window.matchMedia( srcsetJson[ i ].media ).matches ) {
                    //console.log( 'match: ' + srcsetJson[ i ].src );
                    currentSrc = srcsetJson[ i ].src;
                    break;
                }
            }
            if ( currentSrc == '' ) {
                currentSrc = src;
            }
            //console.log( 'currentSrc: ' + currentSrc );
            return currentSrc;
        }

        $.fn._isPicture = function() {
            return $( this ).parent().is( 'picture' );
        }

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
            var isBgImg = ! $self.is( "img" );

            self.loaded = false;
            
            // resize function
            $.fn.resizeUnloadImg = function( newImgWidth, newImgHeight ) {

                //console.log( 'resizeUnloadImg' );
                //console.log( 'data-src: ' + $self.attr( 'data-' + settings.data_attribute ) );
                //console.log( settings.placeholder );
                //console.log( 'newImgWidth: ' + newImgWidth );
                //console.log( 'newImgHeight: ' + newImgHeight );

                var $img = $( this );

                // set or reset to intended size (always, no need to remove style, just overwrite immediately)
                $img.css( { width: newImgWidth + 'px', height: newImgHeight + 'px' } );
                //console.log( 'resizeUnloadImg – width / height SET (1) (' + $img.attr( 'data-src' ) + ')' );

                // check for css size limitation
                var cssImgWidth = parseInt( $img.css( 'width' ) );

                // reduce size after set if nessesary
                if ( cssImgWidth != newImgWidth ) {
                    var calcImgWidth = cssImgWidth;
                    var calcImgHeight = newImgHeight / newImgWidth * cssImgWidth;
                    // adapt
                    $img.css( { width: calcImgWidth + 'px', height: calcImgHeight + 'px' } );
                    //console.log( 'resizeUnloadImg – width / height SET (2) (' + $img.attr( 'data-src' ) + ')' );
                }

                // trigger scroll since other unload images might have been appeared during resizing current image
                $window.trigger( 'scroll' );
            }

            // get image sizes (from width / height or data-with / data-height)
            $.fn.getSizes = function() {
                //console.log( 'getSizes' );
                var isPicture = $( this )._isPicture();
                var width = null;
                var height = null;
                if ( isPictureCompatibeBrowser && isPicture ) {
                    //console.log( 'isPictureCompatibeBrowser && isPicture' );
                    $( this ).parent().find( 'source' ).each( function( i, source ) {
                        //console.log( 'source: ' + i );
                        var media = $( source ).attr( 'media' );
                        //console.log( 'media: ' + media );

                        if ( window.matchMedia( media ).matches || media === undefined ) {
                            width = $( source ).attr( 'data-' + settings.picture_width_data_attribute );
                            height = $( source ).attr( 'data-' + settings.picture_height_data_attribute );
                            //console.log( '----- found matching media: ' + width + ' x ' + height );
                            return false; // break after first match
                        }
                    } );

                    // if no media matches get sizes from img tag
                    if ( width == null && height == null ) {
                        //console.log( '----- found NO matching media' );
                        width = $( this ).attr( 'width' );
                        height = $( this ).attr( 'height' );
                    }
                }
                else {
                    //console.log( 'else' );
                    width = $( this ).attr( 'width' );
                    height = $( this ).attr( 'height' );
                }
                return [ width, height ];
            }

            // generate event id
            var eventId = $self.attr( 'data-' + settings.data_attribute ).replace(/[/.]/g, '_') + '_' + index;

            /* If no src attribute given use data:uri. */
            if ( $self.is( 'img' ) && ( ! $self.attr( 'src' ) || $self.attr( 'src' ) == settings.placeholder ) ) {
            
                /* custom adaption: set sizes to unload images after placeholder is set */
                
                $self.attr( 'src', settings.placeholder );

                // set placeholders to sources
                if ( $self._isPicture() ) {
                    $self.parent().find( 'source' ).attr( 'srcset', settings.placeholder );
                }

                // set width & height since placeholder has square format
                var origSizes = $self.getSizes();
                var origImgWidth = origSizes[ 0 ];
                var origImgHeight = origSizes[ 1 ];

                //console.log( '--- initial sizes: ' + origImgWidth + ' x ' + origImgHeight );

                if ( 
                    (
                        $self.attr( 'src' ) == ''
                        || $self.attr( 'src' ) == settings.placeholder 
                    )
                    && !! origImgWidth && !! origImgHeight 
                ) {
                    // resize only if src is empty or png placeholder and width and height is given

                    // initial resize
                    $self.resizeUnloadImg( origImgWidth, origImgHeight );

                    // events for later resize

                    // media sm, md, lg: resize on sizeChange
                    $window.on( 'sizeChange.lazyloadUnload.' + eventId, function() {
                        //console.log( 'TRIGGERED sizeChange.lazyloadUnload.' + eventId );
                        if ( $self.attr( 'src' ) == settings.placeholder ) {
                            $self.resizeUnloadImg( origImgWidth, origImgHeight );
                        }
                    } );

                    // media xs: resize on window resize
                    $window.on( 'resize.lazyloadUnload.' + eventId, function() {
                        //console.log( 'TRIGGERED resize.lazyloadUnload.' + eventId );
                        if ( !! window.mediaSize && window.mediaSize == 'xs' ) {
                            if ( $self.attr( 'src' ) == settings.placeholder ) {
                                $self.resizeUnloadImg( origImgWidth, origImgHeight );
                            }
                        }
                    } );
                }
                
            }
            
            // if width and height given, do initial resize, handle resize events

            /* When appear is triggered load original image. */
            $self.one("appear", function() {

                if ( $self.is( 'img' ) ) {
                    // unbind unload resize events (only for imgs)

                    // destroy resize event after loading
                    $window.unbind( 'sizeChange.lazyloadUnload.' + eventId + ' resize.lazyloadUnload.' + eventId );

                    //console.log( 'unbind sizeChange ' + eventId );

                    // destroy resize event after loading
                    $window.unbind( 'sizeChange.lazyloadUnload.' + eventId + ' resize.lazyloadUnload.' + eventId );

                    //console.log( 'unbind resize ' + eventId );
 
                }

                if (!this.loaded) {
                    if (settings.appear) {
                        var elements_left = elements.length;
                        settings.appear.call(self, elements_left, settings);
                    }
                    // load hidden placeholder img in background, replace lazy img src on load
                    // prepare preload url, required before load placeholder
                    var srcAttrVal = $self.attr( 'data-' + settings.data_attribute );
                    var preloadImgSrc = srcAttrVal;
                    var preloadImgSrcset = $self.attr( 'data-' + settings.srcset_data_attribute );

                    // check if src or srcset json
                    var srcsetJson = [];
                    if ( !! preloadImgSrcset ) {
                        // get json

                        srcsetJson = ( new Function( 'return ' + preloadImgSrcset ) )();

                        // get img src to preload
                        preloadImgSrc = _getMediaMatchingSrc( srcsetJson, srcAttrVal );
                        //console.log( 'preloadImgSrc: ' + preloadImgSrc );

                    }

                    if ( isPictureCompatibeBrowser && $self._isPicture() ) {
                        var $sources = $self.parent().find( 'source' );
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

                            // if no match found preloadImgSrc remains default from img (as defined above)
                        } );
                    }

                    $("<img>")
                        .bind("load", function() {

                            if ( $self.is( "img" ) ) {
                                $self.hide();
                                //console.log( 'hidden (' + preloadImgSrc + ')' );
                                if ( isPictureCompatibeBrowser && $self._isPicture() ) {
                                    // replace all sources (of which one has already been preloaded)
                                    $sources.each( function () {
                                        var srcset = $( this ).attr( 'data-' + settings.srcset_data_attribute );
                                        $( this ).attr( 'srcset', srcset );
                                    } );
                                }
                                $self
                                    .attr( 'src', $self.attr( 'data-' + settings.data_attribute ) )
                                    .css( { width: '', height: '' } )
                                ; // custom adaption
                                //console.log( 'settings.effect: ' + settings.effect );
                                //console.log( 'settings.effect_speed: ' + settings.effect_speed );
                                $self[ settings.effect ]( settings.effect_speed );
                                //console.log( 'shown (' + preloadImgSrc + ')' );
                            }
                            else {
                                // is background image
                                var backgroundImage = $self.css("background-image");
                                if ( backgroundImage.indexOf( preloadImgSrc ) == -1 ) {
                                    $self.css( { backgroundImage: "url('" + preloadImgSrc + "'), " + backgroundImage } ); // load new image and put it before old one without removing old one
                                }
                                else {
                                    $self.css( { backgroundImage: "url('" + preloadImgSrc + "')" } );
                                }

                                // add sizeChange event listener to change background img
                                $window.on( 'sizeChange', function() {
                                    var currentImgSrc = _getMediaMatchingSrc( srcsetJson, srcAttrVal );
                                    //console.log( '----- changed to: ' + currentImgSrc );
                                    $self.css( { backgroundImage: "url('" + currentImgSrc + "')" } );
                                } );
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
        //  custom adaption: update after fonts loaded
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

            $image.lazyload( options, i );
            
        } );

    }

    // init
    Utils.$window.on( Utils.events.initJs, function() {

        Utils.$functionElems.filter( '[data-fn="lazyload"]' ).initLazyload();

    } );

} )( jQuery, BSX_UTILS );
