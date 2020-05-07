/*

<button class="plenty-navbar-toggler" type="button" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation" data-fn="toggle" data-fn-target="[data-tg='navbar-collapse']">
    <i class="fa fa-navicon" aria-hidden="true"></i>
</button>

<div class="plenty-navbar-collapse" id="navbarNavDropdown" data-tg="navbar-collapse">
    ...
</div>

*/

( function( $, Utils ) {

    // toggle (e.g. main navigation container)
    $.fn.toggle = function( options ) {

        var defaults = {
            openedClass: Utils.classes.open,
            closedClass: '',
            animatingClass: Utils.classes.animating,
            triggerOpenedClass: Utils.classes.active,
            triggerClosedClass: '',
            openCallback: function() {},
            closeCallback: function() {},
            openedCallback: function() {},
            closedCallback: function() {}
        };

        options = $.extend( {}, defaults, options );

        var $elems = $( this );

        $elems.each( function() {

            var $elem = $( this );
            var targetSelector = $elem.attr( Utils.attributes.target ) || '';
            var $target = ( Utils.$targetElems.filter( targetSelector ).lenght > 0 ) ? Utils.$targetElems.filter( targetSelector ) : $( targetSelector );
            var transitionDuration = $target.getTransitionDuration();

            // get options from attr
            options = $.extend( {}, options, $elem.getOptionsFromAttr() );

            if ( $target.length > 0 ) {

                function _show() {
                    $target
                        .addClass( options.openedClass )
                        .removeClass( options.closedClass )
                    ;
                    $elem
                        .removeClass( options.triggerClosedClass )
                        .addClass( options.triggerOpenedClass )
                        .ariaExpanded( 'true' )
                    ;
                    options.openCallback();

                    // set & remove 'options.animatingClass'
                    $target.setRemoveAnimationClass( options.animatingClass, options.openedCallback );
                }

                function _hide() {
                    $target
                        .removeClass( options.openedClass )
                        .addClass( options.closedClass )
                    ;
                    $elem
                        .addClass( options.triggerClosedClass )
                        .removeClass( options.triggerOpenedClass )
                        .ariaExpanded( 'false' )
                    ;
                    options.closeCallback();
                    
                    // set & remove 'options.animatingClass'
                    $target.setRemoveAnimationClass( options.animatingClass, options.closedCallback );
                }

                // click
                $elem.on( 'click', function() {

                    // toggle 'options.openedClass' & aria-expanded (use 'options.openedClass' to check visibility since element might be ':visible' but out of viewport)
                    // allow multiple classes (which would be separated by space)
                    if ( ! $target.is( '.' + options.openedClass.replace( ' ', '.') ) ) {
                        _show()
                    }
                    else {
                        _hide()
                    }

                } );

                // show
                $elem.on( 'show', function() {
                    _show()
                } );

                // hide
                $elem.on( 'hide', function() {
                    _hide()
                } );

            }

        } );

    };

} )( jQuery, BSX_UTILS );