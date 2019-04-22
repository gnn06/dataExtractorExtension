myApp.factory('clipboard', function() {
    function objectToText(obj) {
			return Object.values(obj).join("\t");
		};

    var service = {
        copyPromise : function  (obj, navigator, callback) {
            var text = objectToText(obj);
			return navigator.clipboard.writeText(text);
        }
    };
    return service;
});