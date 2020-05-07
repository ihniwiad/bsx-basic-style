/*

<button class="plenty-navbar-toggler" type="button" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation" data-fn="toggle" data-fn-target="[data-tg='navbar-collapse']">
    <i class="fa fa-navicon" aria-hidden="true"></i>
</button>

<div class="plenty-navbar-collapse" id="navbarNavDropdown" data-tg="navbar-collapse">
    ...
</div>

*/

( function( $, Utils ) {

    Utils.$functionElems.filter( '[data-fn="toggle"]' ).toggle();

} )( jQuery, BSX_UTILS );