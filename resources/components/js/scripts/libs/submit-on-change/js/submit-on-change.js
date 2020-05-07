// submit (e.g. knowledge search results pages)

/*
<form class="form-inline justify-content-md-end" action="/search/" method="GET">
    <label class="mr-2 mb-0" for="searchResultsEachPage">Results each page</label>
    <select class="custom-select" name="s" id="searchResultsEachPage" data-fn="submit-on-change">
        <option value="10">10</option>
        <option value="25" selected="">25</option>
        <option value="50">50</option>
    </select>
</form>
*/

( function( $, Utils ) {

    $.fn.submitOnChange = function() {

        var $elems = $( this );

        $elems.each( function() {

            var $elem = $( this );
            var $form = $elem.closest( 'form' );

            $elem.on( 'change', function() {
                $form.submit();
            } );

        } );
    }

    // init
    Utils.$window.on( Utils.events.initJs, function() {

        Utils.$functionElems.filter( '[data-fn="submit-on-change"]' ).submitOnChange();

    } );

} )( jQuery, BSX_UTILS );