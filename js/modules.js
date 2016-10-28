CORE.create_module("search-box", function (sandbox) {
    var input, button, reset;

    return {
        init: function () {
            // query will return a jQuery object with the matched results,
            // so we get the 0th element to get the search box element
            input = sandbox.find("#search_input")[0];
            button = sandbox.find("#search_button")[0];
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

CORE.create_module("filters-bar", function (sandbox) {
    var filters;

    return {
        init: function () {
            filters = sandbox.find('a');
            sandbox.addEvent(filters, "click", this.filterProducts);
        },

        destroy: function () {
            sandbox.removeEvent(filters, "click", this.filterProducts);
            filters = null;
        },

        filterProducts: function (e) {
            sandbox.notify({
                type: 'change-filter',
                data: e.currentTarget.innerHTML
            });
        }
    };
});

CORE.create_module("products-panel", function (sandbox) {
    var products;

    function eachProduct(fn) {
        var i = 0, product;
        for( ; product = products[i++] ; ) {
            fn(product);
        }
    }

    // reset the styling of the products
    function reset() {
        eachProduct(function (product) {
            product.style.opacity = '1';
        })
    }

    return {
        init: function () {
            products = sandbox.find("li");
            sandbox.listen({
                'change-filter': this.change_filter,
                'reset-filter': this.reset,
                'perform-search': this.search,
                'quit-search': this.reset
            });
            var addToCard = this.addToCard;
            eachProduct(function (product) {
                sandbox.addEvent(product, 'click', addToCard);
            })
        },

        destroy: function () {
            var that = this;
            eachProduct(function (product) {
                sandbox.removeEvent(product, 'click', that.addToCart);
            });

            sandbox.ignore([
                'change-filter',
                'reset-filter',
                'perform-search',
                'quit-search'
            ]);
        },

        reset: reset,

        change_filter: function (filter) {
            reset();
            eachProduct(function (product) {
                // reduce the opacity of the other products to stand out the filtered ones
                if (product.getAttribute("data-8088-keyword").toLowerCase().indexOf(filter.toLowerCase()) < 0) {
                        product.style.opacity = '0.2';
                }
            });
        },

        search: function (query) {
            reset();
            query = query.toLowerCase();
            eachProduct(function (product) {
                // reduce the opacity of the other products to stand out the filtered ones
                if (product.getElementsByTagName('p')[0].innerHTML.toLowerCase().indexOf(query.toLowerCase()) < 0) {
                    product.style.opacity = '0.2';
                }
            });

        },
        
        addToCard: function (e) {
            var li = e.currentTarget;

            // notifying item added to the card
            sandbox.notify({
                type: 'add-item',
                data: {
                    id: li.id,
                    name: li.getElementsByTagName('p')[0].innerHTML,
                    // product with the id of 1 will be $1
                    price: parseInt(li.id, 10)
                }
            });
        }
    }
});

CORE.create_module("shopping-cart", function (sandbox) {
    var cart, cartItems;

    return {
        init: function () {
            cart = sandbox.find('ul')[0];
            cartItems = {};

            sandbox.listen({
                'add-item': this.addItem
            });
        },

        destroy: function () {
            cart = cartItems = null;
            sandbox.ignore(['add-item']);
        },

        addItem: function (product) {
            var entry, price;
            entry = sandbox.find('#cart-' + product.id + ' .quantity')[0];
            // if the product added is already in the cart, increment the quantity
            if (entry) {
                entry.innerHTML = parseInt(entry.innerHTML, 10) + 1;
                cartItems[product.id]++;
                price = sandbox.find('#cart-' + product.id + ' .price')[0];
                var newPrice = cartItems[product.id] * product.price;
                price.innerHTML = '$' + newPrice.toFixed(2);
            } else {
                /*
                 <li id="cart-1", class="cart-entry">
                     <span class="product-name">Name<span>
                     <span class="quantity">1<span>
                     <span class="price">$1<span>
                 </li>
                 */
                entry = sandbox.create_element("li", {
                    'id': "cart-" + product.id,
                    'class': 'cart-entry',
                    'children': [
                        sandbox.create_element("span", {
                            'class': 'product_name',
                            'text': product.name
                        }),
                        sandbox.create_element("span", {
                            'class': 'quantity',
                            'text': '1'
                        }),
                        sandbox.create_element("span", {
                            'class': 'price',
                            'text': '$' + product.price.toFixed(2)
                        })
                    ]
                });

                cart.appendChild(entry);
                cartItems[product.id] = 1;
            }
        }
    }
});

CORE.start_all();