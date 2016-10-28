// Sandbox.create()
var Sandbox = {
    create: function (core, module_selector) {
        var CONTAINER = core.dom.query('#' + module_selector);
        return {
            find: function (selector) {
                return CONTAINER.query(selector);
            },

            addEvent: function (element, type, fn) {
                core.dom.bind(element, type, fn);
            },

            removeEvent: function (element, type, fn) {
                core.dom.unbind(element, type, fn)
            },

            notify: function (event) {
                if (core.is_obj(event) && event.type) {
                    core.triggerEvent(event);
                }
            },

            listen: function (events) {
                if (core.is_obj(events)) {
                    core.register(events, module_selector);
                }
            },

            ignore: function (events) {
                if (core.is_arr(events)) {
                    core.removeEvents(events, module_selector);
                }
            },

            create_element: function (el, config) {
                var i, text, child;
                el = core.dom.create(el);

                if (config) {
                    // if the element has its own elements, create them
                    if (config.children && core.is_arr(config.children)) {
                        i = 0;
                        while(child = config.children[0]) {
                            el.appendChild(child);
                            i++;
                        }

                        delete config.children;
                        if (config.text) {
                            el.appendChild(document.createTextNode(config.text));
                            delete config.text;
                        }
                        core.dom.apply_attrs(el, config);
                        return el;
                    }
                }
            }
        };
    }
};