/*
tabs structure:

<!-- 
	bootstrap js unfortunately requires class .nav for tab functionality:

	https://github.com/twbs/bootstrap/blob/v4-dev/js/src/tab.js 
	line 42: 
	NAV_LIST_GROUP : '.nav, .list-group',
-->
<ul class="nav" role="tablist" data-fn="hash-tablist">
	<li class="arrow-tab-item">
		<a class="arrow-tab-link-white-to-red active" id="topic-1-tab" href="#topic-1" role="tab" aria-controls="home" aria-selected="true" data-fn="hash-tab" data-fn-callback="ga( 'send', 'event', 'TEST', 'submit' )">Tab 1</a>
	</li>
	<li class="arrow-tab-item">
		<a class="arrow-tab-link-white-to-red" id="topic-2-tab" href="#topic-2" role="tab" aria-controls="profile" aria-selected="false" data-fn="hash-tab" data-fn-callback="ga( 'send', 'event', 'TEST', 'submit' )">Tab 2</a>
	</li>
	<li class="arrow-tab-item">
		<a class="arrow-tab-link-white-to-red" id="topic-3-tab" href="#topic-3" role="tab" aria-controls="messages" aria-selected="false" data-fn="hash-tab" data-fn-callback="ga( 'send', 'event', 'TEST', 'submit' )">Tab 3</a>
	</li>
</ul>

<div class="tab-content">
	<div class="tab-pane fade active show" id="topic-1" role="tabpanel" aria-labelledby="topic-1-tab">
		Content 1
	</div>
	<div class="tab-pane fade" id="topic-2" role="tabpanel" aria-labelledby="topic-2-tab">
		Content 2
	</div>
	<div class="tab-pane fade" id="topic-3" role="tabpanel" aria-labelledby="topic-3-tab">
		Content 3
	</div>
</div>

*/


/*
link into hash tab:

<a href="#topic-1" aria-controls="topic-1-tab" data-fn="link-into-hash-tab">Link into hash tab</a>

*/

( function( $, Utils ) {

	var hashTablistSelector = '[data-fn="hash-tablist"]';
	var hashTabSelector = '[data-fn="hash-tab"]';

	var linkIntoHashTabSelector = '[data-fn="link-into-hash-tab"]';

    $.fn.hashTabs = function() {
		
		var $hashTablist = $( this );
		var $hashTabs = $hashTablist.children().children( hashTabSelector );
		
		// init hash tabs
		$hashTabs.click( function( event ) {
			
			event.preventDefault();

			var $tab = $( this );
			$tab.tab( 'show' );

			// check if callback function (e.g. tracking)
            $tab.executeCallbackFunction();
		} );
		
		// trigger window events after tab change finished (required to trigger lazyload etc.)
		$hashTabs.on( 'shown.bs.tab', function() {
			Utils.$window.trigger( 'sizeChange' );
			Utils.$window.trigger( 'scroll' );
		} );
		
		// initial adaption if hash, set scroll top 0
		var hash = window.location.hash;
		
		if ( hash ) {
			// wait init tabs to be finished (otherwise fade effect will disappear)
				
			var $currentHashTab = Utils.$functionElems.filter( 'a' + hashTabSelector + '[href="' + hash + '"]' );
			
			if ( $currentHashTab.length > 0 ) {
			
				setTimeout( function() {
					$currentHashTab.tab( 'show' );

					// check if callback function (e.g. tracking)
            		$currentHashTab.executeCallbackFunction();
				} );
				
				// scroll to top
				function scrollToTop() {
					window.scrollTo( 0, 0 );
				}
				
				// allow 2 events to make firefox happy
				var initialScrollToHash = 0;
				var allowEventsNumber = 2;
				Utils.$window.on( 'scroll.initialScrollToHash', function() {
					if ( initialScrollToHash < allowEventsNumber ) {
						scrollToTop();
						initialScrollToHash++;
					}
					else {
						Utils.$window.off( 'scroll.initialScrollToHash' );
					}
				} );
			}
			
		}
		
		// adapt tab to changed hash
		window.addEventListener( 'hashchange', function() {
			var hash = window.location.hash;
			var $targetTab = Utils.$functionElems.filter( 'a' + hashTabSelector + '[href="' + hash + '"]' )
			if ( hash && $targetTab.length > 0 ) {
				$targetTab.tab( 'show' );
			}
		}, false );
		
		// adapt hash to changed tab
		$hashTabs.on( 'shown.bs.tab', function( event ) {
			if ( history.pushState ) {
				history.pushState( null, null, '#'+ $( event.target ).attr( 'href' ).substr( 1 ) );
			} 
			else {
				window.location.hash = '#'+ $( event.target ).attr( 'href' ).substr( 1 );
			}
		} );

    };


    // link into hash tab
    $.fn.linkIntoHashTab = function() {

		var $hashTabLinks = $( this );

		$hashTabLinks.each( function() {
			
			var $link = $( this );

			$link.click( function( event ) {

				// stop link execution, trigger click instead
				event.preventDefault();

				var hash = $link.attr( 'href' );
				var $tab = Utils.$functionElems.filter( 'a' + hashTabSelector + '[href="' + hash + '"]' );

				// trigger click
				$tab.trigger( 'click' );

				// check scrolling
		        var distanceTop = Utils.anchorOffsetTop;
				var tabOffset = $tab.offset().top;
				// only scroll if tab is outside of viewport
				if ( tabOffset - distanceTop < window.pageYOffset || tabOffset > ( window.pageYOffset + window.innerHeight ) ) {
					Utils.$scrollRoot.animate( { scrollTop: tabOffset - distanceTop } );
				}

			} );

		} );
	};

    // init

    // (tabs)
    Utils.$functionElems.filter( hashTablistSelector ).each( function() {
        $( this ).hashTabs();
    } );

    // (links)
    Utils.$functionElems.filter( linkIntoHashTabSelector ).linkIntoHashTab();

} )( jQuery, BSX_UTILS );