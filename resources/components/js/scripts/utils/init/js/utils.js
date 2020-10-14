var BSX_UTILS = ( function( $ ) {

    var Utils = {
        $document:      $( document ),
        $window:        $( window ),
        $body:          $( 'body' ),
        $scrollRoot:    $( 'html, body'),

        $functionElems: null,
        $targetElems: null,

        events: {
            initJs: 'initJs'
        },

        selectors: {
            functionElement:    '[data-fn]',
            targetElement:      '[data-tg]',
            focussableElements: 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex="0"]'
        },

        attributes: {
            functionElement:    'data-fn',
            targetElement:      'data-tg',
            target:             'data-fn-target',
            options:            'data-fn-options',
            callback:           'data-fn-callback'
        },

        classes: {
            open:           'show',
            active:         'active',
            animating:      'animating',
            animatingIn:    'animating-in',
            animatingOut:   'animating-out',
            invalid:        'is-invalid'
        },
        
        mediaSize: null,
        mediaSizes: [ 
            {
                breakpoint: 0,
                label: 'xs'
            },
            {
                breakpoint: 576,
                label: 'sm'
            },
            {
                breakpoint: 768,
                label: 'md'
            },
            {
                breakpoint: 992,
                label: 'lg'
            },
            {
                breakpoint: 1200,
                label: 'xl'
            }
        ],

        anchorOffsetTop: 0,

        lang: null,

        Alert: null,

        MessageHandler: null,

        WaitScreen: null,

        CookieHandler: null
        
    };

    // cache all functional elements
    var $functionAndTargetElems = $( Utils.selectors.functionElement + ', ' + Utils.selectors.targetElement );
    Utils.$functionElems = $functionAndTargetElems.filter( Utils.selectors.functionElement );
    Utils.$targetElems = $functionAndTargetElems.filter( Utils.selectors.targetElement );

    // anchors offset top
    var anchorOffsetTopSelector = '[data-fn~="anchor-offset-elem"]';
    var anchorOffsetTopDistance = 20;
    var $anchorOffsetTopElem = Utils.$functionElems.filter( anchorOffsetTopSelector );

    $.fn._getAnchorOffset = function() {
        // if header element position is fixed scroll below header

        var offsetTop = anchorOffsetTopDistance;

        if ( $anchorOffsetTopElem.length > 0 && $anchorOffsetTopElem.css( 'position' ) == 'fixed' ) {
            offsetTop += $anchorOffsetTopElem.outerHeight();
        }

        return offsetTop;
    }

    Utils.anchorOffsetTop = $anchorOffsetTopElem._getAnchorOffset();

    Utils.$window.on( 'sizeChange', function() {
        Utils.anchorOffsetTop = $anchorOffsetTopElem._getAnchorOffset();
    } );

    // get lang
    Utils.lang = Utils.$body.parent().attr( 'lang' ) || 'en';

    // convert type
    function _convertType( value ) {
        try {
            value = JSON.parse( value );
            return value;
        }
        catch( e ) {
            // 'value' is not a json string.
            return value
        }
    }

    // get transition duration
    $.fn.getTransitionDuration = function() {
        var duration = 0;
        var cssProperty = 'transition-duration';
        var prefixes = [ 'webkit', 'ms', 'moz', 'o' ];
        if ( this.css( cssProperty ) ) {
            duration = this.css( cssProperty );
        }
        else {
            for ( i = 0; i < prefixes.length; i++ ) {
                if ( this.css( '-' + prefixes[ i ] + '-' + cssProperty ) ) {
                    duration = this.css( '-' + prefixes[ i ] + '-' + cssProperty );
                    break;
                }
            }
        }

        if ( duration.indexOf != undefined ) {
            return ( duration.indexOf( 'ms' ) > -1 ) ? parseFloat( duration ) : parseFloat( duration ) * 1000;
        }
        else {
            return 0;
        }
        
    };

    // set and remove animation class
    $.fn.setRemoveAnimationClass = function( animatingClass, callback ) {
        var currentAnimatingClass = ( !! animatingClass ) ? animatingClass : Utils.classes.animating;
        var $this = $( this );
        var transitionDuration = $this.getTransitionDuration();
        if ( transitionDuration > 0 ) {
            $this.addClass( animatingClass );
            var timeout = setTimeout( function() {
                $this.removeClass( animatingClass );
                if ( !! callback ) {
                    callback();
                }
            }, transitionDuration );
        }
    };

    // check if element is positiones inside (x, y, width, height) of another element
    $.fn.elemPositionedInside = function( container ) {

        var $this = $( this );
        var $container = $( container );

        var elemOffsetLeft = $this.offset().left;
        var elemOffsetTop = $this.offset().top;
        var elemWidth = $this.width();
        var elemHeight = $this.height();

        var containerOffsetLeft = $container.offset().left;
        var containerOffsetTop = $container.offset().top;
        var containerWidth = $container.outerWidth(); // include border since offset will calulate only to border
        var containerHeight = $container.outerHeight();

        return elemOffsetLeft >= containerOffsetLeft
            && ( elemOffsetLeft + elemWidth ) <= ( containerOffsetLeft + containerWidth )
            && elemOffsetTop >= containerOffsetTop
            && ( elemOffsetTop + elemHeight ) <= ( containerOffsetTop + containerHeight );
    };

    // calculate sizes to fit inner element into outer element (only if inner is larger than outer) keeping distance in x & y direction
    getFitIntoSizes = function( settings ) {
        
        var outerWidth = settings.outerWidth || Utils.$window.width();
        var outerHeight = settings.outerHeight || Utils.$window.height();
        var innerWidth = settings.innerWidth;
        var innerHeight = settings.innerHeight;
        var xDistance = settings.xDistance || 0;
        var yDistance = settings.yDistance || 0;
        
        var resizeWidth;
        var resizeHeight;
        
        var outerRatio =  outerWidth / outerHeight;
        var innerRatio = ( innerWidth + xDistance ) / ( innerHeight + yDistance );
        
        if ( outerRatio > innerRatio ) {
            // limited by height
            resizeHeight = ( outerHeight >= innerHeight + yDistance ) ? innerHeight : outerHeight - yDistance;
            resizeWidth = parseInt( innerWidth / innerHeight * resizeHeight );
        }
        else {
            // limited by width
            resizeWidth = ( outerWidth >= innerWidth + xDistance ) ? innerWidth : outerWidth - xDistance;
            resizeHeight = parseInt( innerHeight / innerWidth * resizeWidth );
        }
        
        return [ resizeWidth, resizeHeight ];
    }

    // aria expanded
    $.fn.ariaExpanded = function( value ) {
        if ( typeof value !== 'undefined' ) {
            $( this ).attr( 'aria-expanded', value );
            return value;
        }
        return _convertType( $( this ).attr( 'aria-expanded' ) );
    };

    // aria
    $.fn.aria = function( ariaName, value ) {
        if ( typeof value !== 'undefined' ) {
            $( this ).attr( 'aria-' + ariaName, value );
            return value;
        }
        else {
            return _convertType( $( this ).attr( 'aria-' + ariaName ) );
        }
    };

    // hidden
    $.fn.hidden = function( value ) {
        if ( typeof value !== 'undefined' ) {
            if ( value == true ) {
                $( this ).attr( 'hidden', true );
            }
            else {
                $( this ).removeAttr( 'hidden' );
            }
        }
        else {
            return _convertType( $( this ).attr( hidden ) );
        }
    };
    
    // media size (media change event)
    var mediaSize = '';
    var mediaSizeBodyClassPrefix = 'media-';

    _getmediaSize = function() {
        var currentmediaSize;
        if ( !! window.matchMedia ) {
            // modern browsers
            for ( i = 0; i < Utils.mediaSizes.length - 1; i++ ) {
                if ( window.matchMedia( '(max-width: ' + ( Utils.mediaSizes[ i + 1 ].breakpoint - 1 ) + 'px)' ).matches ) {
                    currentmediaSize = Utils.mediaSizes[ i ].label;
                    break;
                }
                else {
                    currentmediaSize = Utils.mediaSizes[ Utils.mediaSizes.length - 1 ].label;
                }
            }
        }
        else {
            // fallback old browsers
            for ( i = 0; i < Utils.mediaSizes.length - 1; i++ ) {
                if ( Utils.$window.width() < Utils.mediaSizes[ i + 1 ].breakpoint ) {
                    currentmediaSize = Utils.mediaSizes[ i ].label;
                    break;
                }
                else {
                    currentmediaSize = Utils.mediaSizes[ Utils.mediaSizes.length - 1 ].label;
                }
            }
        }
        if ( currentmediaSize != Utils.mediaSize ) {
            // remove / set body class
            Utils.$body.removeClass( mediaSizeBodyClassPrefix + Utils.mediaSize );
            Utils.$body.addClass( mediaSizeBodyClassPrefix + currentmediaSize );

            Utils.mediaSize = currentmediaSize;
            Utils.$window.trigger( 'sizeChange' );
        }
    };
    Utils.$document.ready( function() {
        _getmediaSize();
        Utils.$window.trigger( 'sizeChangeReady' );
    } );
    Utils.$window.on( 'resize', function() {
        _getmediaSize();    
    } );
    // /media size (media change event)

    // get options from attribute
    // syntax: data-fn-options="{ focusOnOpen: '[data-tg=\'header-search-input\']', bla: true, foo: 'some text content' }"
    $.fn.getOptionsFromAttr = function() {
        var $this = $(this);
        var options = $this.attr( Utils.attributes.options );
        if ( typeof options !== 'undefined' ) {
            return ( new Function( 'return ' + options ) )();
        }
        else {
            return {};
        }
    }
    // /get options from attribute

    // get elem from selector
    getElementFromSelector = function( selector ) {
        var $elem = Utils.$functionElems.filter( selector );
        if ( $elem.length == 0 ) {
            $elem = Utils.$targetElems.filter( selector );
            if ( $elem.length == 0 ) {
                $elem = $( selector );
            }
        }
        return $elem;
    }
    // /get elem from selector

    // get form values
    $.fn.getFormValues = function() {

        var values = {};

        $formElems = $( this ).find( 'input, select, textarea' );

        $formElems.each( function( i, elem ) {

            var $elem = $( elem );

            if ( $elem.attr( 'type' ) == 'checkbox' ) {

                var checkboxName = $elem.attr( 'name' );
                var $checkboxGroup = $formElems.filter( '[name="' + checkboxName + '"]' );
                var checkboxGroupCount = $checkboxGroup.length;

                if ( checkboxGroupCount > 1 ) {
                    var checkboxGroupValues = [];
                    $checkboxGroup.each( function( j, groupElem ) {
                        var $groupElem = $( groupElem );
                        if ( $groupElem.is( ':checked' ) ) {
                            checkboxGroupValues.push( $groupElem.val() );
                        }
                    } );
                    if ( checkboxGroupValues.length > 0 ) {
                        values[ checkboxName ] = checkboxGroupValues;
                    }
                    else {
                        values[ checkboxName ] = null;
                    }
                }
                else {
                    values[ checkboxName ] = $elem.is( ':checked' ) ? $elem.val() : null;
                }
            }
            else if ( $elem.attr( 'type' ) == 'radio' ) {
                if ( $elem.is( ':checked' ) ) {
                    values[ $elem.attr( 'name' ) ] = $elem.val();
                }
            }
            else {
                values[ $elem.attr( 'name' ) ] = $elem.val();
            }
        } );
        return values;
    }
    /*
    $.fn.getFormValues = function() {

        var $form = this;
        var values = {};

        function inject( position, value ) {

            var match = position.match( /^([^\[]+)(.*)/ );

            if ( !! match[ 2 ] ) {
                var exp = /\[([^\]]+)]/g;
                var child;
                var children = [];
                children[ 0 ] = match[ 1 ];
                while ( ( child = exp.exec( match[ 2 ] ) ) !== null )
                {
                    children.push( child[ 1 ] );
                }

                for ( var i = children.length - 1; i >= 0; i-- ) {
                    var val = {};
                    val[ children[ i ] ] = value;
                    value = val;
                }

                values = $.extend( true, values, value );
            }
            else {
                values[ match[ 1 ] ] = value;
            }
        }

        $form.find( 'input, select, textarea' ).each( function( i, elem ) {

            var $elem = $( elem );

            if ( !! $elem.attr( 'name' ) ) {

                if ( $elem.attr( 'type' ) == "checkbox" ) {
                    // get checkbox group
                    var groupValues = [];
                    $form.find( '[name="' + $elem.attr( 'name' ) + '"]:checked' ).each( function( j, checkbox )
                    {
                        groupValues.push( $( checkbox ).val() );
                    } );
                    inject( $elem.attr( 'name' ), groupValues );
                }
                else if ( $elem.attr( 'type' ) == 'radio' ) {
                    if ( $elem.is( ':checked' ) ) {
                        inject( $elem.attr( 'name' ), $elem.val() );
                    }
                }
                else {
                    inject( $elem.attr( 'name' ), $elem.val() );
                }
            }

        } );
        return values;
    }
    */
    // /get form values

    // replace form by message
    $.fn.replaceFormByMessage = function( options ) {

        var $form = $( this );
        var $parent = $form.parent();
        var $message = ( !! options && !! options.$message ) ? options.$message : $form.next();

        // hide form, show message instead
        $parent.css( { height: ( parseInt( $parent.css( 'height' ) ) + 'px' ) } );
        $form.fadeOut( function() {
            $message.fadeIn();
            $parent.animate( { height: ( parseInt( $message.css( 'height' ) ) + 'px' ) }, function() {
                $parent.removeAttr( 'style' );
            } );
        } );
        $form.aria( 'hidden', true );
        $message.aria( 'hidden', false );
    }
    // /replace form by message

    // execute callback function
    $.fn.executeCallbackFunction = function() {

        var callbackStr = $( this ).attr( Utils.attributes.callback );

        if ( !! callbackStr ) {

            // get function name
            var explode = callbackStr.split( '(' );
            var callbackName = explode[ 0 ];

            var callback = Function( callbackStr );

            if ( !! callback && typeof window[ callbackName ] === 'function' ) {
                callback();
            }

        }
    }
    // /execute callback function

    return Utils;
} )( jQuery );