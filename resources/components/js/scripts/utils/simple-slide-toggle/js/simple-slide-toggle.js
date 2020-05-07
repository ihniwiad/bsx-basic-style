// simple slide toggle (e.g. accordion)

/*
<div data-fn="slidetoggle">
    <div role="heading">
        <!-- aria-labelledby="..." may refer to a discribing headline outside the trigger -->
        <button id="accordion-1-trigger-1" data-g-tg="slidetoggle-trigger" aria-controls="accordion-1-target-1" aria-expanded="false">Click me to slidetoggle content</button>
    </div>
    <div id="accordion-1-target-1" data-g-tg="slidetoggle-target" aria-labelledby="accordion-1-trigger-1" style="display: none;">
        Here is some content...
    </div>
</div>
*/

( function( $, Utils ) {

    $.fn.simpleSlideToggle = function( options ) {

        var defaults = {
            effectIn: 'slideDown',
            effectOut: 'slideUp',
            effectDuration: 400,
            openedClass: Utils.classes.open,
            triggerOpenedClass: Utils.classes.active,
            bodyOpenedClass: '',
            animatingClass: Utils.classes.animating,
            animatingInClass: Utils.classes.animatingIn,
            animatingOutClass: Utils.classes.animatingOut,
            preventDefault: true
        };

        options = $.extend( {}, defaults, options );

        var $elems = $( this );

        $elems.each( function() {

            var $elem = $( this );
            var $elemTrigger = $elem.find( options.triggerSelector ).first();
            var $elemBody = $elem.find( options.bodySelector ).first();

            // initial set closed
            if ( ! $elem.is( '.' + options.openedClass ) ) {
                $elemBody.css( { display: 'none' } );
            }

            // bind click event
            $elemTrigger.on( 'click', function( event) {

                if ( options.preventDefault ) {
                    event.preventDefault();
                }

                if ( ! $elem.is( '.' + options.openedClass ) ) {
                    // open
                    $elem
                        .addClass( options.animatingClass )
                        .addClass( options.animatingInClass );
                    $elemTrigger
                        .addClass( options.triggerOpenedClass )
                        .ariaExpanded( 'true' );
                    $elemBody.stop()[ options.effectIn ]( options.effectDuration, function() {
                        $elem
                            .addClass( options.openedClass )
                            .removeClass( options.animatingClass )
                            .removeClass( options.animatingInClass );
                        $elemBody.addClass( options.bodyOpenedClass );
                    } );
                }
                else {
                    // close
                    $elem
                        .addClass( options.animatingClass )
                        .addClass( options.animatingOutClass )
                        .removeClass( options.openedClass );
                    $elemTrigger
                        .removeClass( options.triggerOpenedClass )
                        .ariaExpanded( 'false' );
                    $elemBody.removeClass( options.bodyOpenedClass );
                    $elemBody.stop()[ options.effectOut ]( options.effectDuration, function() {
                        $elem
                            .removeClass( options.animatingClass )
                            .removeClass( options.animatingOutClass );
                    } );
                }

            } );

        } );

    };

} )( jQuery, BSX_UTILS );