var CORE = (function () {
    var moduleData = {};

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
                this.log(1, "Module '" + moduleId + "' Registration : FAILED : one or more arguments are or incorrect type");
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
            if (this.is_obj(events) && module) {
                if (moduleData[module]) {
                    moduleData[module].events = events;
                } else {
                    this.log(1, "Event Registration for Module '" + module + "': FAILED : module does not exist or has not been created yet");
                }
            } else {
                this.log(1, "Event Registration for Module '" + module + "': FAILED : one or more arguments are or incorrect type");
            }
        },

        trigger_event: function (event) {
            console.log('triggering event...');
            var module;
            for (module in moduleData) {
                if (moduleData.hasOwnProperty(module)) {
                    module = moduleData[module];
                    // if the current module is listening for this event, execute its handles function
                    if (module.events && module.events[event.type]) {
                        module.events[event.type](event.data);
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
                var ret = {}, that = this, len, i = 0, djEls;

                djEls = dojo.query(((context) ? context + " ": "") + selector);
                len = djEls.length;

                while (i < len) {
                    ret[i] = djEls[i++];
                }

                ret.length = len;
                ret.query = function (sel) {
                    // (selector, context)
                    return that.query(sel, selector)
                };

                return ret;
            },

            eventStore: {},

            bind: function (element, type, fn) {
                if (element.length) {
                    var i = 0, len = element.length;
                    for ( ; i < len; i++) {
                        this.eventStore[element[i] + type + fn] = dojo.connect(element[i], type, element[i], fn);
                    }
                } else {
                    this.eventStore[element + type + fn] = dojo.connect(element, type, element, fn);
                }
            },

            unbind: function (element, type, fn) {
                if (element.length) {
                    var i = 0, len = element.length;
                    for ( ; i < len; i++) {
                        dojo.disconnect(this.eventStore[element[i] + type + fn]);
                        delete this.eventStore[element[i] + type + fn];
                    }
                } else {
                    dojo.disconnect(this.eventStore[element + type + fn]);
                    delete this.eventStore[element + type + fn];
                }
            },
            
            create: function (element) {
                return document.createElement(element);
            },

            apply_attrs: function (element, attrs) {
                var attr;
                for(attr in attrs) {
                    dojo.attr(element, attr, attrs[attr]);
                }
            }
        },

        is_arr: function (arr) {
            return dojo.isArray(arr);
        },

        is_obj: function (obj) {
            return dojo.isObject(obj);
        }
    }
}());