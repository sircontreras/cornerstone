import { hooks } from '@bigcommerce/stencil-utils';
import CatalogPage from './catalog';
import compareProducts from './global/compare-products';
import FacetedSearch from './common/faceted-search';
import { createTranslationDictionary } from '../theme/common/utils/translations-utils';

export default class Category extends CatalogPage {
    constructor(context) {
        super(context);
        this.validationDictionary = createTranslationDictionary(context);
    }

    onReady() {
        $('[data-button-type="add-cart"]').on('click', (e) => {
            $(e.currentTarget).next().attr({
                role: 'status',
                'aria-live': 'polite',
            });
        });

        compareProducts(this.context.urls);

        if ($('#facetedSearch').length > 0) {
            this.initFacetedSearch();
        } else {
            this.onSortBySubmit = this.onSortBySubmit.bind(this);
            hooks.on('sortBy-submitted', this.onSortBySubmit);
        }

        $('a.reset-btn').on('click', () => {
            $('span.reset-message').attr({
                role: 'status',
                'aria-live': 'polite',
            });
        });
    }

    initFacetedSearch() {
        const {
            price_min_evaluation: onMinPriceError,
            price_max_evaluation: onMaxPriceError,
            price_min_not_entered: minPriceNotEntered,
            price_max_not_entered: maxPriceNotEntered,
            price_invalid_value: onInvalidPrice,
        } = this.validationDictionary;
        const $productListingContainer = $('#product-listing-container');
        const $facetedSearchContainer = $('#faceted-search-container');
        const productsPerPage = this.context.categoryProductsPerPage;
        const requestOptions = {
            config: {
                category: {
                    shop_by_price: true,
                    products: {
                        limit: productsPerPage,
                    },
                },
            },
            template: {
                productListing: 'category/product-listing',
                sidebar: 'category/sidebar',
            },
            showMore: 'category/show-more',
        };

        this.facetedSearch = new FacetedSearch(requestOptions, (content) => {
            $productListingContainer.html(content.productListing);
            $facetedSearchContainer.html(content.sidebar);

            $('body').triggerHandler('compareReset');

            $('html, body').animate({
                scrollTop: 0,
            }, 100);
        }, {
            validationErrorMessages: {
                onMinPriceError,
                onMaxPriceError,
                minPriceNotEntered,
                maxPriceNotEntered,
                onInvalidPrice,
            },
        });
    }
}


function createCart(url, cartItems) {
    return fetch(url, {
        method: "POST",
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json"},
        body: JSON.stringify(cartItems),
    })
        .then(response => response.json());
};

function deleteCartItem(url, cartId, itemId) {
    return fetch(url + cartId + '/items/' + itemId, {
        method: "DELETE",
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json",}
    })
        .then(response => response.json());
};





document.querySelector('.addAllToCartBtn').addEventListener('click',function(e){
    // $.get("/cart.php?action=add&product_id=112");
    // window.location = "/special-items?message=A new product was added to cart";

    createCart(`/api/storefront/carts`, {
        "lineItems": [
            {
                "quantity": 1,
                "productId": 112
            },

        ]}
    )
        .then(data => {
            // console.log(JSON.stringify(data));
            // console.log(data.id);
            // console.log(data.lineItems.physicalItems[0].id);
            localStorage.setItem('cartId', data.id);
            localStorage.setItem('productItem', data.lineItems.physicalItems[0].id);

            window.location = "/special-items?message=A new product was added to cart";
        })
        .catch(error => console.error(error));







});



document.querySelector('.removeAllItemsBtn').addEventListener('click',function(){

    // console.log(localStorage.getItem('cartId'));
    let cartID  = localStorage.getItem('cartId');
    let productItem  =  localStorage.getItem('productItem');
    console.log(typeof cartID);
    console.log(typeof productItem);



    stencilUtils.api.cart.itemRemove(productItem, (err, response) => {

        // if (response.data.status === 'succeed') {
        //     this.refreshContent(true);
        // } else {
        //     swal({
        //         text: response.data.errors.join('\n'),
        //         type: 'error',
        //     });
        // }
        //
        // fetch(`/api/storefront/carts/${cartID}`, {
        //     method: "DELETE",
        //     credentials: "same-origin",
        //     headers: {
        //         "Content-Type": "application/json",}
        // }).then(response => {console.log(response)
        //
        //
        //
        // });

        // setCookie('SHOP_SESSION_TOKEN', 'value', 0);
        window.location = "/special-items?message=The cart was emptied";


    });





    // deleteCartItem(`/api/storefront/carts/`, cartID, productItem)
    //     .then(data => console.log(JSON.stringify(data)))
    //     .catch(error => console.log(error));




});



$(document).ready(function(){

    // console.log(stencilUtils.api);



    var searchParams = new URLSearchParams(window.location.href.split('?')[1]);

    if(searchParams.has('message')){

        let messageBox = document.querySelector('.c-message');
        messageBox.innerHTML = searchParams.get('message');
        messageBox.classList.remove('hide');

        setTimeout(function(){
            messageBox.classList.add('hide');
        }, 5000);

    }



    function getCart(url) {
        return fetch(url, {
            method: "GET",
            credentials: "same-origin"
        })
            .then(response => response.json());
    };

    getCart('/api/storefront/carts?include=lineItems.digitalItems.options,lineItems.physicalItems.options')
        .then(data => {
            console.log(JSON.stringify(data));

            if(data && data.length > 0 ){
                document.querySelector('.removeAllItemsBtn').classList.remove('hide');
            }


        })
        .catch(error => console.error(error));

});
