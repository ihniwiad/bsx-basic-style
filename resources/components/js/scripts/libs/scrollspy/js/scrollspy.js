/*
<aside data-scrollspy-target>
    <ul>
        <li>
            <a href="#anchor_1">Anchor 1<a>
        </li>
        ...
    </ul>
</aside>
<main>
    <section id="anchor_1">
        <h2>Headline anchor 1</h2>
        <p>Some content...</p>
    </section>
    ...
</main>
*/

( function( $, Utils ) {

    var ScrollSpy = function( element, config )
    {
        var self = this;
        this.element = element;
        this.config = config;

        if ( $( this.config.target ).length > 0 ) {
            this.scrollElement = element.tagName === 'BODY' ? window : element;
            $(this.scrollElement).on(this.config.event, function( event ) {
                return self.process( event );
            });
            this.refresh();
            this.process();
        }
    };

    ScrollSpy.prototype.refresh = function()
    {
        this.offsets = [];
        this.targets = [];
        this.scrollHeight = this.getScrollHeight();

        var self = this;
        var offsetMethod = this.scrollElement !== window ? 'position' : 'offset';
        var offsetBase = offsetMethod === 'position' ? this.getScrollTop() : 0;

        $.makeArray( $(this.config.target).find("a") )
            .map( function( targetLink ) {
                var target;
                var targetSelector = targetLink.getAttribute('href');
                if ( targetSelector && targetSelector.charAt(0) === "#" )
                {
                    target = $(targetSelector)[0];
                }

                if ( target && (target.offsetWidth || target.offsetHeight) )
                {
                    return [
                        $(target)[offsetMethod]().top + offsetBase,
                        targetSelector
                    ]
                }

                return null
            })
            .filter( function( item ) {
                return !!item;
            })
            .sort( function( itemA, itemB ) {
                return itemA[0] - itemB[0];
            })
            .forEach( function( item ) {
                self.offsets.push(item[0]);
                self.targets.push(item[1]);
            });

    };

    ScrollSpy.prototype.getScrollTop = function()
    {
        return this.scrollElement === window ?
            this.scrollElement.pageYOffset : this.scrollElement.scrollTop;
    };

    ScrollSpy.prototype.getScrollHeight = function()
    {
        return this.scrollElement.scrollHeight || Math.max(
                document.body.scrollHeight,
                document.documentElement.scrollHeight
            );
    };

    ScrollSpy.prototype.getOffsetHeight = function()
    {
        return this.scrollElement === window ?
            window.innerHeight : this.scrollElement.offsetHeight;
    };

    ScrollSpy.prototype.process = function( event )
    {
        var scrollTop = this.getScrollTop();
        var scrollHeight = this.getScrollHeight();
        var maxScroll = this.config.offset() + scrollHeight - this.getOffsetHeight();

        if( this.scrollHeight !== scrollHeight )
        {
            this.refresh();
        }

        if ( scrollTop + this.config.offset() >= maxScroll )
        {
            var target = this.targets[this.targets.length - 1];
            this.activate( target );
            return;
        }

        if ( this.activeTarget && scrollTop + this.config.offset() < this.offsets[0] && this.offsets[0] > 0 )
        {
            this.activeTarget = null;
            this.clear();
            return;
        }

        for ( var i = this.offsets.length; i--; )
        {
            var isActiveTarget = this.activeTarget !== this.targets[i]
                && scrollTop + this.config.offset() >= this.offsets[i]
                && (this.offsets[i + 1] === undefined || scrollTop + this.config.offset() < this.offsets[i + 1]);

            if ( isActiveTarget )
            {
                this.activate( this.targets[i] );
            }
        }
    };

    ScrollSpy.prototype.activate = function( target )
    {
        if ( this.activeTarget === target )
        {
            return;
        }

        this.activeTarget = target;

        this.clear();

        $( this.config.target ).find("[href=\"" + target + "\"]").parents("li").addClass( this.config.activeClass );
    };

    ScrollSpy.prototype.clear = function()
    {
        $( this.config.target ).find( '.' + this.config.activeClass ).removeClass( this.config.activeClass );
    };

    $.fn.scrollspy = function( config ) {
        this.each(function() {
            new ScrollSpy( this, config );
        });
        // return new ScrollSpy( this, config );
    };

    // init
    Utils.$window.on( Utils.events.initJs, function() {

        $( 'body' ).scrollspy( { 
            target: '[data-scrollspy-target]',
            activeClass: Utils.classes.active,
            offset: function() {
                return Utils.anchorOffsetTop;
            },
            event: ( typeof Modernizr !== "undefined" && Modernizr.touchevents ) ? 'scroll touchmove' : 'scroll'
        } );

    } );

} )( jQuery, BSX_UTILS );