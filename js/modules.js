CORE.create_module("search-box", function (sandbox) {
    var input, button, reset;

    return {
        init: function () {
            // query will return a jQuery object with the matched results,
            // so we get the 0th element to get the search box element
            input = sandbox.find("#search-input")[0];
            button = sandbox.find("#search-button")[0];
            reset = sandbox.find("#quit_search")[0];

            sandbox.addEvent(button, "click", this.handleSearch);
            sandbox.addEvent(reset, "click", this.quitSearch);
        },
        
        destroy: function () {
            sandbox.removeEvent(button, "click", this.handleSearch);
            sandbox.removeEvent(reset, "click", this.quitSearch);
            input = button = reset = null;
        },

        handleSearch: function () {
            var query = input.value;
            if (query) {
                sandbox.notify({
                    type: 'perform-search',
                    data: query
                })
            }
        },

        quitSearch: function () {
            input.value = "";
            sandbox.notify({
                type: 'quit-search',
                data: null
            });
        }
    };
});