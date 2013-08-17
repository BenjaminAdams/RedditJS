define([], function() {

    var model1 = {
        "model": "org.resthub.validation.model.User",
        "constraints": {
            "urlDefault": [{
                "type": "URL",
                "message": "must be a valid URL",
                "port": -1,
                "protocol": "",
                "host": "",
                "flags": [],
                "regexp": ".*"
            }],
            "assertTrue": [{
                "type": "AssertTrue",
                "message": "must be true"
            }],
            "min": [{
                "type": "Min",
                "message": "must be greater than or equal to 1",
                "value": 1
            }],
            "max": [{
                "type": "Max",
                "message": "must be less than or equal to 1000",
                "value": 1000
            }],
            "range": [{
                "type": "Range",
                "message": "must be between 0 and 200",
                "min": 0,
                "max": 200
            }],
            "stringSize": [{
                "type": "Size",
                "message": "size must be between 2 and 5",
                "min": 2,
                "max": 5
            }],
            "decimalMax": [{
                "type": "DecimalMax",
                "message": "must be less than or equal to 10.5",
                "value": "10.5"
            }],
            "decimalMin": [{
                "type": "DecimalMin",
                "message": "must be greater than or equal to 0.5",
                "value": "0.5"
            }],
            "collSize": [{
                "type": "Size",
                "message": "size must be between 2 and 10",
                "min": 2,
                "max": 10
            }],
            "url": [{
                "type": "URL",
                "message": "must be a valid URL",
                "port": 8080,
                "protocol": "http",
                "host": "localhost",
                "flags": [],
                "regexp": ".*"
            }],
            "urlRegexp": [{
                "type": "URL",
                "message": "must be a valid URL",
                "port": -1,
                "protocol": "",
                "host": "",
                "flags": [],
                "regexp": "url-test"
            }],
            "urlComplete": [{
                "type": "URL",
                "message": "must be a valid URL",
                "port": 8080,
                "protocol": "ftp",
                "host": "resthub",
                "flags": [],
                "regexp": "^.*url-test.*$"
            }],
            "pattern": [{
                "type": "Pattern",
                "message": "must match \"^(0|[1-9][0-9]*)$\"",
                "flags": [],
                "regexp": "^(0|[1-9][0-9]*)$"
            }],
            "email": [{
                "type": "Email",
                "message": "not a well-formed email address",
                "flags": [],
                "regexp": ".*"
            }],
            "notEmpty": [{
                "type": "NotEmpty",
                "message": "may not be empty"
            }],
            "assertFalse": [{
                "type": "AssertFalse",
                "message": "must be false"
            }],
            "creditCardNumber": [{
                "type": "CreditCardNumber",
                "message": "invalid credit card number"
            }],
            "nullValue": [{
                "type": "Null",
                "message": "must be null"
            }],
            "length": [{
                "type": "Length",
                "message": "length must be between 2 and 10",
                "min": 2,
                "max": 10
            }],
            "notNull": [{
                "type": "NotNull",
                "message": "may not be null"
            }],
            "notBlank": [{
                "type": "NotBlank",
                "message": "may not be empty"
            }]
        }
    };

    return model1;
});