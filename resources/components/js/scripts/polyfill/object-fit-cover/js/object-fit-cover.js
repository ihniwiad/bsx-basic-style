/*
<!-- REAL IMAGE BANNER -->
		
<div class="multilayer-banner">
	<figure class="multilayer-absolute-layer">
		<script>document.write('<img class="object-fit-cover" src="" data-fn="lazyload" data-src="/some-example-img.jpg" alt="Some example image">');</script>
		<noscript><img class="object-fit-cover" src="/some-example-img.jpg" alt="Some example image"></noscript>
	</figure>
	<div class="multilayer-static-layer align-items-center">
		<div class="container py-5">
			<h1 class="display-1 text-white">Example Banner Text</h1>
		</div>
	</div>
</div>

*/

( function( $, Utils ) {

	var polyfillSelector = 'img.object-fit-cover';
	var polyfillAddClass = 'polyfill-object-fit-cover';

	if ( ! Modernizr.objectfit ) {

		$.fn.polyfillObjectFitCover = function() {

			var $images = $( this );

			$images.each( function ( i ) {

				var $img = $( this );
				var imgUrl;

				_setImage = function( img, imgUrl ) {

					if ( imgUrl ) {

						var $img = $( img );
						var $container = $img.parent();
						$container
							.css( { 
								backgroundImage: 'url(' + imgUrl + ')',
								backgroundPosition: 'center',
								backgroundSize: 'cover'
							} )
							.addClass( polyfillAddClass )
						;
						$img.css( 'opacity', 0 );
					}

				}

				if ( $img.is( '[data-fn="lazyload"]' ) ) {
					// is lazyload, wait for trigger loaded

					imgUrl = $img.data( 'src' );

					$img.on( 'loaded', ( function( img, imgUrl ) {
						_setImage( $img, imgUrl );
					} )( $img, imgUrl ) );
				}
				else {
					// standard img

					imgUrl = $img.prop( 'src' );

					_setImage( $img, imgUrl );
				}

			} );

		}

		// init
	
		var $images = $( polyfillSelector );
		$images.polyfillObjectFitCover();

	}

} )( jQuery, BSX_UTILS );
