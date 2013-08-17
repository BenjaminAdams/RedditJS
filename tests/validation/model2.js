define([], function() {

    var model2 = {
        "model": "org.resthub.validation.model.User",
        "constraints": {
            "minMax": [{
                "type": "NotNull",
                "message": "may not be null"
            }, {
                "type": "Min",
                "message": "must be greater than or equal to 1",
                "value": 1
            }, {
                "type": "Max",
                "message": "must be less than or equal to 1000",
                "value": 1000
            }],
            "assertTrue": [{
                "type": "AssertTrue",
                "message": "must be true"
            }],
            "size": [{
                "type": "NotNull",
                "message": "may not be null"
            }, {
                "type": "Size",
                "message": "size must be between 2 and 5",
                "min": 2,
                "max": 5
            }],
            "telephoneNumber": [{
                "type": "TelephoneNumber",
                "message": "invalid telephone number"
            }]
        }
    };

    return model2;
});