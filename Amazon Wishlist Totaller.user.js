// ==UserScript==
// @name         Amazon Wishlist Totaller
// @namespace    http://www.witwicki.co.uk
// @description  Shows the total cost of Amazon wishlists (excluding delivery)
// @version      0.1
// @description  Totals your wishlists
// @author       Tharglet
// @match        *://www.amazon.co.uk/gp/registry/wishlist/*
// @match        *://www.amazon.com/gp/registry/wishlist/*
// @match        *://www.amazon.in/gp/registry/wishlist/*
// @require      https://ajax.googleapis.com/ajax/libs/jquery/1.12.0/jquery.min.js
// @grant        none
// ==/UserScript==
/* jshint -W097 */
'use strict';

function priceToVal(priceText) {
    var res = Object();
    if(priceText.match("^[0-9]")) {
        res.currency = "?";
        res.price = parseInt(priceText.replace(",","").replace(".", ""));
    } else {
        var i = 0;
        var prefix = "";
        while(!priceText[i].match("[0-9]") && i < priceText.length) {
            prefix += priceText[i];
            i++;
        }
        prefix = prefix.trim();
        res.currency = prefix;
        res.price = parseInt(priceText.substr(i).replace(",","").replace(".",""));
    }
    return res;
}

$().ready(function() {
    var unavailableCount = 0;
    var prices = Array();
    prices["main"] = Object();
    prices["offer"] = Object();
    prices["combined"] = Object();
    $("div[id^='itemInfo']").each(function(index, ele) {
        var mainPrice = $(this).find("span[id^='itemPrice']");
        var offerPrice = $(this).find("span.itemUsedAndNewPrice");
        if(mainPrice.length > 0) {
            mainPrice = mainPrice.first();
            var priceText = mainPrice.text().trim();
            if(priceText != "Unavailable") {
                if(priceText.length == 0) {
                    //No main price
                    if(offerPrice.length > 0) {
                        offerPrice = offerPrice.first();
                        var offerPriceText = offerPrice.text().trim();
                        var res = priceToVal(offerPriceText);
                        if(prices["offer"][res.currency]) {
                            prices["offer"][res.currency] += res.price;
                        } else {
                            prices["offer"][res.currency] = res.price;
                        }
                        if(prices["combined"][res.currency]) {
                            prices["combined"][res.currency] += res.price;
                        } else {
                            prices["combined"][res.currency] = res.price;
                        }
                    }
                } else {
                    var res = priceToVal(priceText);
                    if(prices["main"][res.currency]) {
                        prices["main"][res.currency] += res.price;
                    } else {
                        prices["main"][res.currency] = res.price;
                    }
                    if(prices["combined"][res.currency]) {
                        prices["combined"][res.currency] += res.price;
                    } else {
                        prices["combined"][res.currency] = res.price;
                    }
                }
            } else {
                unavailableCount++;
            }
        }
    });
    var totalTextPrefix = '<div class="a-fixed-left-grid a-spacing-large">'+
        '<div class="a-fixed-left-grid-inner" style="padding-left:220px">'+
        '<div class="a-text-center a-fixed-left-grid-col a-col-left" style="width:220px;margin-left:-220px;_margin-left:-110px;float:left;">';
    var totalTextMiddle = '</div>'+
        '<div class="a-text-left a-col-right" style="padding-left:0%;*width:99.6%;float:left;">';
    var totalTextPostfix = '</div></div></div>';
    //main prices
    var totalPrices = '<ul style="color:black;list-style:none;margin:5px">';
    var totalPricesLabels = '<ul style="color:black;list-style:none;margin:5px">';
    var firstAppend = true;
    var boldForMainPrice = '';
    if(Object.keys(prices["offer"]).length == 0) {
        boldForMainPrice = ' a-text-bold';
    }
    $.each(prices["main"], function( index, value ) {
        if(firstAppend) {
            totalPricesLabels += "<li class='" + boldForMainPrice + "' style='list-style-type:none'>Main Price Total(s):</li>";
            firstAppend = false;
        } else {
            totalPricesLabels += "<li style='list-style-type:none'>&nbsp;</li>";
        }
        totalPrices += "<li style='list-style-type:none' class='a-color-price" + boldForMainPrice + "'>" + index + (parseFloat(value/100).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})) + "</li>";
    });
    totalPrices += "</ul>";
    totalPricesLabels += "</ul>";
    //offers
    firstAppend = true;
    totalPrices += '<ul style="color:black;list-style:none;margin:5px">';
    totalPricesLabels += '<ul style="color:black;list-style:none;margin:5px">';
    $.each(prices["offer"], function( index, value ) {
        if(firstAppend) {
            totalPricesLabels += "<li style='list-style-type:none'>Offer-only Price Total(s):</li>";
            firstAppend = false;
        } else {
            totalPricesLabels += "<li style='list-style-type:none'>&nbsp;</li>";
        }
        totalPrices += "<li style='list-style-type:none' class='a-color-price'>" + index + (parseFloat(value/100).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})) + "</li>";
    });
    totalPrices += "</ul>";
    totalPricesLabels += "</ul>";
    //Le Grand Total
    firstAppend = true;
    if(Object.keys(prices["main"]).length > 0 && Object.keys(prices["offer"]).length > 0) {
        totalPrices += '<ul style="color:black;list-style:none;margin:5px">';
        totalPricesLabels += '<ul style="color:black;list-style:none;margin:5px">';
        $.each(prices["combined"], function( index, value ) {
            if(firstAppend) {
                totalPricesLabels += "<li style='list-style-type:none' class='a-text-bold'>Combined Price Total(s):</li>";
                firstAppend = false;
            } else {
                totalPricesLabels += "<li style='list-style-type:none'>&nbsp;</li>";
            }
            totalPrices += "<li style='list-style-type:none' class='a-color-price a-text-bold'>" + index + (parseFloat(value/100).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})) + "</li>";
        });
        totalPrices += "</ul>";
        totalPricesLabels += "</ul>";
    }
    //unavailable
    if(unavailableCount > 0) {
        totalPricesLabels += '<ul style="color:black;list-style:none;margin:5px"><li style="list-style-type:none">Unavailable:</li></ul>';
        totalPrices += '<ul style="color:black;list-style:none;margin:5px"><li style="list-style-type:none">' + unavailableCount + '</li></ul>';
    }
    var totalText = totalTextPrefix + totalPricesLabels + totalTextMiddle + totalPrices + totalTextPostfix;
    $(totalText).prependTo("#item-page-wrapper");
});