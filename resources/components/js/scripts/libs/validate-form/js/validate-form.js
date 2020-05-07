( function( $, Utils ) {

    // TEST – TODO: remove

    window.testFormSuccess = function( values, form ) {
        console.log( 'testFormSuccess' );

        $form = $( form );

        $form.addClass( 'test-success' );

        for ( var key in values ) {
            console.log( key + ': ' + values[ key ] );
        }

    }

    // /TEST

/**
 * @module Services
 */

    /**
     * Provide methods for client-side form validation.
     * @class ValidationService
     * @static
     */
    var ValidationService = {};

    ValidationService.validate = function( form, options ) {

        return validate( form, options );

        /**
         * Check if element is a form element (input, select, textarea) or search for child form elements
         * @function getFormControl
         * @private
         * @param  {object} elem the element to get the form element from
         * @return {object} a valid form element (input, select, textarea) – may contain multiple elements of the same type (only first found type if multiple types) if elem contains multiple form elements
         */
        function getFormControl( elem ) {
            var $elem = $( elem );
            if ( $elem.is( 'input' ) || $elem.is( 'select' ) || $elem.is( 'textarea' ) ) {
                return $elem;
            }
            else {
                if ( $elem.find( 'input' ).length > 0 ) {
                    return $elem.find( 'input' );
                }
                else if ( $elem.find( 'select' ).length > 0 ) {
                    return $elem.find( 'select' );
                }
                else if ( $elem.find( 'textarea' ).length > 0 ) {
                    return $elem.find( 'textarea' );
                }
                else {
                    return null;
                }
            }
        }

        /**
         * Check given element has any value
         * @function validateText
         * @private
         * @param {object} formControl the form element to validate
         * @return {boolean}
         */
        function validateText( formControl )
        {
            // check if formControl is no checkbox or radio
            if ( formControl.is( 'input' ) || formControl.is( 'select' ) || formControl.is( 'textarea' ) )
            {
                // check if length of trimmed value is greater then zero
                return $.trim( formControl.val() ).length > 0;

            }
            else
            {
                console.error( 'Validation Error: Cannot validate Text for <' + formControl.prop( "tagName" ) + '>' );
                return false;
            }
        }

        /**
         * Check given element's value is a valid email-address
         * @function validateEmail
         * @private
         * @param {object} formControl the form element to validate
         * @return {boolean}
         */
        function validateEmail( formControl )
        {
            var mailRegExp = /[a-zA-Z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?/;
            if ( validateText( formControl ) )
            {
                return mailRegExp.test( $.trim( formControl.val() ) );
            }
            else
            {
                return false;
            }
        }

        /**
         * Check given element's value is a valid number
         * @function validateNumber
         * @private
         * @param {object} formControl the form element to validate
         * @return {boolean}
         */
        function validateNumber( formControl )
        {
            if ( validateText( formControl ) )
            {
                return $.isNumeric( $.trim( formControl.val() ) );
            }
            else
            {
                return false;
            }
        }

        /**
         * Check given element's value is equal to a references value
         * @function compareValues
         * @private
         * @param {object} formControl the form element to validate
         * @param {string} reference the required value
         * @param {boolean} caseSensitive direct compare, without convert to lowerCase
         * @return {boolean}
         */
        function compareValues( formControl, reference, caseSensitive )
        {
            formControl = $.trim( formControl.val() );
            reference   = $.trim(
                $( reference ).length > 0
                    ? $( reference ).val()
                    : reference );

            if ( caseSensitive )
            {
                return formControl == reference;
            }
            return formControl.toLowerCase() == reference.toLowerCase();
        }

        function isNotVisibleOrEnabled( formControl )
        {
            return ( ! formControl.is( ':visible' ) || ! formControl.is( ':enabled' ) );
        }

        /**
         * Validate a form. Triggers event 'validationFailed' if any element has an invalid value
         * @function validate
         * @param   {object}    form The form element to validate
         * @returns {boolean}
         * @example
         *  ```html
         *      <form data-fn="validate-form" data-fn-options="{ preventDefault: true, setValidatedClass: true, invalidClass: 'is-invalid' }" data-fn-callback="testFormSuccess">
         *          <!-- check if value is "text" -->
         *          <input type="text" required>
         *
         *          <!-- check if value is a valid email-address -->
         *          <input type="email" required>
         *
         *          <!-- check if value is a valid number -->
         *          <input type="number" required>
         *
         *          <!-- check if value is "foo" -->
         *          <input type="text" required data-required="value" data-required-value="foo">
         *
         *          <!-- check if values are identical -->
         *          <input type="text" id="input1" required>
         *          <input type="text" required data-required="value" data-required-value="#input1">
         *
         *          <!-- validate radio buttons -->
         *          <input type="radio" name="radioGroup" required>
         *          <input type="radio" name="radioGroup" required>
         *          <input type="radio" name="radioGroup" required>
         *
         *          <!-- validate individual checkbox -->
         *          <input type="checkbox" required>
         *
         *          <!-- validate checkbox group (if data-required is empty min is 1) -->
         *          <fieldset data-required="{ min: 1, max: 2 }">
         *              <input type="checkbox" name="checkboxGroup">
         *              <input type="checkbox" name="checkboxGroup">
         *              <input type="checkbox" name="checkboxGroup">
         *          </fieldset>
         *
         *       </form>
         *    ```
         *
         * @example
         *      $form.one( 'validationFailed', function( missingFields ) {
         *          // handle missing fields
         *      });
         */
        function validate( form, options ) {

            var $formControl, formControls, validationKey, currentHasError, groupName, checked, checkedMin, checkedMax, validationAttrVal, validationKeys, formControlType;
            var $form         = $( form );
            var missingFields = [];
            var hasError      = false;

            var defaults = {
                invalidClass: 'is-invalid',
                validClass: 'is-valid',
                validatedClass: 'was-validated',
                validationAttr: 'data-required',
                validationKeys: 'text, email, number, value, none',
                validationReferenceAttr: 'data-required-value',
                defaultValidationKey: 'text',
                successCallback: true,
                setValidatedClass: false,
                callbackAttr: Utils.attributes.callback,
                modalIdentifier: '.modal',
                modalScrollIdentifier: '.modal-body'
            };

            options = $.extend( {}, defaults, options );

            // remove validated class if set
            if ( options.setValidatedClass && !! options.validatedClass ) {
                $form.removeClass( options.validatedClass );
            }

            // check every required input inside form

            $form.find( 'input:required, select:required, textarea:required, [' + options.validationAttr + '] input[type="checkbox"]' ).each( function( i, elem ) {

                var $elem = $( elem );
                validationAttrVal = $elem.attr( options.validationAttr );

                formControls = getFormControl( elem );

                // validationKeys seems obsolete, contains one or multiple comma separated validation keys corresponding to one or multiple form control children 
                // get validation key or set default
                validationKeys = ( !! validationAttrVal ) ? validationAttrVal : options.defaultValidationKey;

                if ( $elem.is( 'input' ) && options.validationKeys.indexOf( $elem.attr( options.validationAttr ) ) == -1 && options.validationKeys.indexOf( $elem.attr( 'type' ) ) > -1 ) {
                    // if input (not validate value) use validation key from type attribute (if type is allowed)
                    validationKeys = $elem.attr( 'type' );
                }
                validationKeys = validationKeys.split( ',' );

                for ( var i = 0; i < formControls.length; i++ ) {

                    $formControl = $( formControls[ i ] );
                    formControlType = $formControl.attr( 'type' );

                    // skip validation, if input is invisible or disabled
                    if ( isNotVisibleOrEnabled( $formControl ) )
                    {
                        return;
                    }

                    validationKey   = validationKeys[i].trim() || validationKeys[0].trim();
                    currentHasError = false;

                    // formControl is textfield (text, mail, password) or textarea
                    if ( 
                        (
                            $formControl.is( 'input' )
                            && formControlType != 'radio'
                            && formControlType != 'checkbox'
                        )
                        || $formControl.is( 'textarea' )
                    ) {
                        switch ( validationKey ) {

                            case 'text':
                                currentHasError = !validateText( $formControl );
                                break;

                            case 'email':
                                currentHasError = !validateEmail( $formControl );
                                break;

                            case 'number':
                                currentHasError = !validateNumber( $formControl );
                                break;

                            case 'value':
                                currentHasError = !compareValues( $formControl, $( elem ).attr( options.validationReferenceAttr ), ( typeof $formControl.attr( 'type' ) === 'password' ) );
                                break;

                            case 'none':
                                // do not validate
                                break;

                            default:
                                console.error( 'Form validation error: unknown validate property: "' + validationAttrVal + '"' );
                                break;
                        }
                    }
                    else if ( 
                        $formControl.is( 'input' )
                        && (formControlType == 'radio'
                        || formControlType == 'checkbox')
                    ) {
                        // validate radio buttons
                        groupName   = $formControl.attr( 'name' );
                        checked = $form.find( 'input[name="' + groupName + '"]:checked' ).length;

                        if ( formControlType == 'radio' ) {
                            checkedMin = 1;
                            checkedMax = 1;
                        }
                        else {
                            if ( checked > 1 ) {
                                // get min, max from checkbox group parent
                                validationAttrVal = $formControl.closest( '[' + options.validationAttr + ']' ).attr( options.validationAttr );
                            }
                            var minMax = (new Function( "return " + validationAttrVal ))() || {min: 1, max: 1000000};
                            checkedMin = minMax.min;
                            checkedMax = minMax.max;
                        }

                        currentHasError = ( checked < checkedMin || checked > checkedMax );

                    }
                    else if ( $formControl.is( 'select' ) ) {
                        // validate selects
                        currentHasError = ( $formControl.val() == '' || $formControl.val() == '-1' );
                    }
                    else {
                        console.error( 'Form validation error: ' + $( elem ).prop( "tagName" ) + ' does not contain an form element' );
                        return;
                    }

                    if ( currentHasError ) {
                        hasError = true;
                        missingFields.push( $formControl );

                        if ( formControls.length > 1 ) {
                            $formControl.addClass( options.invalidClass );
                            $form.find( 'label[for="' + $formControl.attr( 'id' ) + '"]' ).addClass( options.invalidClass );
                        }
                        else {
                            $( elem ).addClass( options.invalidClass );
                        }
                        if ( $formControl.attr( 'data-clone-error' ) ) {
                            // clone error state to closest selector
                            $formControl.closest( $formControl.attr( 'data-clone-error' ) ).addClass( options.invalidClass );
                        }
                    }
                }

            } );

            // scroll to element on 'validationFailed'
            $form.one( 'validationFailed', function() {

                var distanceTop   = function() {
                    return Utils.anchorOffsetTop;
                };
                var $error        = $form.find( '.' + options.invalidClass ).first();
                var errorOffset   = $error.offset().top;
                var $scrollTarget = Utils.$scrollRoot;

                // if form is inside of modal, scroll modal instead of body
                if ( $form.parents( options.modalIdentifier ).length > 0 ) {
                    $scrollTarget = $form.parents( options.modalIdentifier ).find( options.modalScrollIdentifier );
                    errorOffset   = $scrollTarget.scrollTop() - ( $scrollTarget.offset().top - $error.offset().top );
                }
                else if ( $form.is( options.modalIdentifier ) ) {
                    $scrollTarget = $form.find( options.modalScrollIdentifier );
                    errorOffset   = $scrollTarget.scrollTop() - ( $scrollTarget.offset().top - $error.offset().top );
                }

                // only scroll if error is outside of viewport
                if ( errorOffset - distanceTop() < window.pageYOffset || errorOffset > ( window.pageYOffset + window.innerHeight ) ) {
                    $scrollTarget.animate( {
                        scrollTop: errorOffset - distanceTop()
                    } );
                }
            } );

            if ( hasError )
            {
                // remove error class on focus
                $form.find( '.' + options.invalidClass ).each( function( i, elem )
                {
                    $formControl = $( getFormControl( elem ) );
                    $formControl.on( 'focus click', function()
                    {
                        var $errorElement = $( elem );
                        $errorElement.removeClass( options.invalidClass );
                        $form.find( 'label[for="' + $( this ).attr( 'id' ) + '"]' ).removeClass( options.invalidClass );

                        if ( $errorElement.attr( 'data-clone-error' ) ) {
                            // clone error state to closest selector
                            $errorElement.closest( $errorElement.attr( 'data-clone-error' ) ).removeClass( options.invalidClass );
                        }

                        // reset error class for each radio/checkbox group elem (and related label) on first elem of group focussed
                        if ( $errorElement.attr( 'type' ) == 'radio' || $errorElement.attr( 'type' ) == 'checkbox' ) {
                            var errorElementGroupName = $errorElement.attr( 'name' );
                            $form.find( 'input[name="' + errorElementGroupName + '"]' ).each( function( j, groupFormControl ) {
                                var $groupFormControl = $( groupFormControl );
                                $groupFormControl.removeClass( options.invalidClass );
                                $form.find( 'label[for="' + $groupFormControl.attr( 'id' ) + '"]' ).removeClass( options.invalidClass );
                            } );
                        }

                    } );
                } );

                $form.trigger( 'validationFailed', [missingFields] );
            }

            // set validated class after successful validation (NOTE: callback function may set error after successful validation, therefore setting class is not activated by default)
            if ( options.setValidatedClass && ! hasError && !! options.validatedClass ) {
                $form.addClass( options.validatedClass );
            }

            var callback = $form.attr( options.callbackAttr );

            if ( ! hasError && options.successCallback && !! callback && callback != "submit" && typeof window[ callback ] === "function" ) {

                var values = form.getFormValues();

                window[ callback ]( values, $form );
                return false;
            }
            else {
                return !hasError;
            }
        }
    };

    /**
     * jQuery-Plugin to calling {{#crossLink "ValidationService/validate"}}ValidationService.validate{{/crossLink}}
     * on jQuery wrapped elements.
     * @return {boolean}
     */
    $.fn.validateForm = function( options )
    {
        return ValidationService.validate( this, options );
    };

    // init
    Utils.$window.on( Utils.events.initJs, function() {

        Utils.$functionElems.filter( '[data-fn*="validate-form"]' ).each( function() {

            $( this ).on( 'submit', function( event ) {
            
                var $form = $( this );

                var options = $form.getOptionsFromAttr();

                if ( !! options.preventDefault ) {
                    event.preventDefault();
                    event.stopPropagation();
                }

                if ( ! $form.validateForm( options ) ) {
                    return false;
                }

            } );

        } );

    } );

} )( jQuery, BSX_UTILS );