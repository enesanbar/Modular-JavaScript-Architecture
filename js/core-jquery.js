var CORE = (function () {
    var moduleData = {};

    to_string = function (anything) {
        return Object.prototype.toString.call(anything);
    };

    var debug = true;

    return {
        debug: function (on) {
            debug = on ? true : false;
        },

        create_module: function (moduleId, creator) {
            var temp;
            if (typeof moduleId === 'string' && typeof creator === 'function') {
                temp = creator(Sandbox.create(this, moduleId));
                if (temp.init && typeof temp.init === 'function' && temp.destroy && typeof temp.destroy === 'function') {
                    temp = null;
                    moduleData[moduleId] = {
                        create: creator,
                        instance: null
                    }
                } else {
                    // 1: Severity
                    this.log(1, "Module '" + moduleId + "' Registration : FAILED : instance has no init or destroy functions");
                }
            } else {
                this.log(1, "Module '" + to_string(moduleId) + "' Registration : FAILED : one or more arguments are or incorrect type");
            }
        },

        start: function (moduleId) {
            var mod = moduleData[moduleId];
            if (mod) {
                mod.instance = mod.create(Sandbox.create(this, moduleId));
                mod.instance.init();
            }
        },

        start_all: function () {
            var moduleId;
            for (moduleId in moduleData) {
                if (moduleData.hasOwnProperty(moduleId)) {
                    this.start(moduleId);
                }
            }
        },

        stop: function (moduleId) {
            var data;
            if (data = moduleData[moduleId] && data.instance) {
                data.instance.destroy();
                data.instance = null;
            } else {
                this.log(1, "Stop Module '" + moduleId + "': FAILED : module does not exist or has not been started");
            }
        },

        stop_all: function () {
            var moduleId;
            for (moduleId in moduleData) {
                if (moduleData.hasOwnProperty(moduleId)) {
                    this.stop(moduleId);
                }
            }
        },

        register_events: function (events, module) {
            if (this.is_obj(events) && mod) {
                if (moduleData[module]) {
                    moduleData[mod].events = events;
                } else {
                    this.log(1, "Event Registration for Module '" + module + "': FAILED : module does not exist or has not been created yet");
                }
            } else {
                this.log(1, "Event Registration for Module '" + module + "': FAILED : one or more arguments are or incorrect type");
            }
        },

        trigger_event: function (event) {
            var mod;
            if (mod in moduleData) {
                if (moduleData.hasOwnProperty(mod)) {
                    mod = moduleData[mod];
                    // if the current module is listening for this event, execute its handles function
                    if (mod.events && mod.events[event.type]) {
                        mod.events[event.type](event.data);
                    }
                }
            }
        },
        
        remove_events: function (events, mod) {
            if (this.is_obj(events) && mod && (mod = moduleData[mod]) && mod.events) {
                delete mod.events;
            }
        },
        
        log: function (severity, message) {
            if (debug) {
                console[(severity === 1) ? 'log' : (severity === 2) ? 'warn' : 'error'](message);
            } else {
                // send the error to the server
            }
        },

        dom: {
            query: function (selector, context) {
                var ret = {}, that = this, jqEls, i = 0;

                if (context && context.find) {
                    jqEls = context.find(selector);
                } else {
                    jQuery(selector);
                }

                ret = jqEls.get();
                ret.length = jqEls.length;
                ret.query = function (sel) {
                    return that.query(sel, jqEls)
                };

                return ret;
            },
            
            bind: function (element, type, fn) {
                if (element && type) {
                    // if event is function, the type is 'click' by default. sandbox.addEvent(selector, fn)
                    if (typeof type == 'function') {
                        fn = type;
                        type = 'click';
                    }
                    jQuery(element).bind(type, fn);
                } else {
                    // log wrong arguments
                }
            },

            unbind: function (element, type, fn) {
                if (element && type) {
                    // if event is function, the type is 'click' by default. sandbox.addEvent(selector, fn)
                    if (typeof type == 'function') {
                        fn = type;
                        type = 'click';
                    }
                    jQuery(element).unbind(type, fn);
                } else {
                    // log wrong arguments
                }
            },
            
            create: function (element) {
                return document.createElement(element);
            },

            apply_attrs: function (element, attrs) {
                jQuery(element).attr(attrs);
            }
        },

        is_arr: function (arr) {
            return jQuery.isArray(arr);
        },

        is_obj: function (obj) {
            return jQuery.isPlainObject(obj);
        }
    }
}());