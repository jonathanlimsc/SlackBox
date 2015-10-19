/**
 * Created by Jonathan Lim on 10/16/15; jonathanlimsc.github.io
 */

var httpRequest;
var dataReceived;
var urlWithoutQuery = "https://www.googleapis.com/customsearch/v1?key=AIzaSyCavnARbT_eV6f-uuOGpQqj-sCIvn2kwm0&cx=010901040375612405410:shymvxuldpa&alt=json&defaultToImageSearch=true&prettyPrint=true&q=";
var urlWithQuery;
var images = new Array();
var titles = new Array();
var index;
var hasSearched=false;

//Event handlers: bind these to specific elements
var imageClickHandler = function(){
    //instantiate overlay
    createOverlay();
    //instantiate content view with image url. Pass clicked element into method.
    createContentView(this);
};

var closeButtonClickHandler = function(){
    // Remove overlay
    closeLightBox();
};

var keyboardHandler = function(event){
    //Ignore keypresses when lightbox is not open
    if(!document.getElementById('overlay')){
        return;
    }
    var keycode = event.keyCode;
    if(keycode == 37){
        console.log('Left key pressed!');
        navigateLeft();
    }
    if(keycode == 39){
        console.log('Right key pressed!');
        navigateRight();
    }
    if(keycode == 27){
        console.log('Esc key pressed!');
        closeLightBox();
    }
};

var rightButtonClickHandler = function(){
    navigateRight();
}

var leftButtonClickHandler = function(){
    navigateLeft();
}

var searchButtonClickHandler = function(){
    //Prevent form submission
    event.preventDefault();

    //Grab form text
    var query = document.getElementById('text-field').value;
    var formattedQueryForUrl = formatQuery(query);

    //Set global url
    urlWithQuery = urlWithoutQuery + formattedQueryForUrl;
    console.log(urlWithQuery);

    //Reset text value
    document.getElementById('text-field').value = "";

    //If a search had already been done, reset gallery before another search
    if(hasSearched){
        resetGallery();
    }
    //Download images!
    setupHttpRequest();
    hasSearched = true;
}

setupSearch();

function pullImageInfoFromJson(json) {
    for (var key in json.items) {
        if(json.items.hasOwnProperty(key)){
            var obj = json.items[key];
            console.log(obj);
            var imgUrl = obj.pagemap.cse_image['0'].src;
            var imgTitle = obj.title;
            console.log(imgTitle);
            images.push(imgUrl);
            titles.push(imgTitle);
        }
    }
}

function insertImagesIntoDom() {
    if (images) {
        var gallery = document.getElementById('gallery');
        for (var i in images) {
            var url = images[i];
            var newImgNode = document.createElement('img');
            //Set url attribute of image
            newImgNode.setAttribute('src', url);
            //Set id of image
            newImgNode.id = "img-" + i;
            newImgNode.className = "gallery-img";
            newImgNode.addEventListener('click', imageClickHandler, false);
            gallery.appendChild(newImgNode);
            console.log("Inserting " + url);
        }
    }
}

function createOverlay(){
    var overlay = document.createElement('div');
    overlay.id = "overlay";

    renderLeftButton(overlay);
    renderRightButton(overlay);
    renderCloseButton(overlay);

    //Add event listener for keypress
    document.body.addEventListener('keydown', keyboardHandler, false);
    //Append overlay element to body in DOM
    document.body.appendChild(overlay);
}

function createContentView(element){
    if(element.hasAttribute('src')) {
        //Set global index
        index = getImageIndex(element);

        //Grab title
        var title = titles[index];

        //Grab url from clicked image
        var url = element.getAttribute('src');
        console.log("The url of the clicked image is: " + url);

        //Grab the overlay element
        var contentView = document.createElement('div');
        contentView.id = 'content-view';

        //Set styles
        var windowHeight = window.innerHeight;
        var windowWidth = window.innerWidth;
        var overlay = document.getElementById('overlay');

        //Add into DOM
        overlay.appendChild(contentView);
        contentView.insertAdjacentHTML('afterbegin', '<span class="caption">' + title + '</span><img class="content-view-img" src=\"'+ url + '\"/>');
    }
}

function navigateLeft(){
    if(index>0){
        index--;
        updateLightBox();
    }
}

function navigateRight(){
    //If the image being presented is at most the second last in the array
    if(index<images.length-1){
        index++;
        updateLightBox();
    }
}

function updateLightBox(){
    //Remove content view
    var overlay = document.getElementById('overlay');
    var contentView = document.getElementById('content-view');
    overlay.removeChild(contentView);

    var title = titles[index];
    var url = images[index];
    //Insert updated content view
    overlay.insertAdjacentHTML('afterbegin', '<div id="content-view"><span class="caption">'+title+'</span><img class="content-view-img" src=\"'+ url + '\"/></div>');
}

function closeLightBox(){
    var lightbox = document.getElementById('overlay');
    //Apply fadeout CSS
    lightbox.className = 'overlay-fadeout';
    //Remove lightbox just before CSS animation completes to prevent jitter.
    window.setTimeout(function(){document.body.removeChild(lightbox);}, 600);
}

function renderLeftButton(overlay){
    var leftButton = document.createElement('span');
    leftButton.className = 'fa fa-angle-left fa-5x';
    leftButton.id = 'left-button';
    overlay.appendChild(leftButton);
    //Attach left button click handler
    leftButton.addEventListener('click', leftButtonClickHandler, false);
}

function renderRightButton(overlay){
    var rightButton = document.createElement('span');
    rightButton.className = 'fa fa-angle-right fa-5x';
    rightButton.id = 'right-button';
    overlay.appendChild(rightButton);
    //Attach right button click handler
    rightButton.addEventListener('click', rightButtonClickHandler, false);
}

function renderCloseButton(overlay){
    var closeButton = document.createElement('span');
    closeButton.className = 'fa fa-times fa-3x';
    closeButton.id = 'close-button';
    overlay.appendChild(closeButton);
    closeButton.addEventListener('click', closeButtonClickHandler, false);
}

function getImageIndex(image){
    var imageId = image.id;
    var separator = '-';
    var imageIndexString = image.id.split(separator)[1];
    return parseInt(imageIndexString);
}

function formatQuery(query){
    //Replaces every instance of space with %20
    return query.replace(/\s/g, '%20');
}

function setupSearch(){
    //Add click listener to search button
    var searchButton = document.getElementById('search-button');
    searchButton.addEventListener('click', searchButtonClickHandler, false);
}

function setupHttpRequest(){
    httpRequest = new XMLHttpRequest();

    httpRequest.onreadystatechange = function () {
        //Server is ready
        if (httpRequest.readyState == 4) {
            //Request is OK
            if (httpRequest.status == 200) {
                dataReceived = httpRequest.responseText;
                console.log("Data received: " + dataReceived);
                var json = JSON.parse(dataReceived);
                console.log(json);
                pullImageInfoFromJson(json);
                console.log("Images urls grabbed!");
                insertImagesIntoDom();
            }
        } else {
            console.log("Server is not ready. State: " + httpRequest.readyState);
        }
    };

    httpRequest.open('GET', urlWithQuery);
    httpRequest.send();
}

function resetGallery(){
    var gallery = document.getElementById('gallery');
    //Remove all images in gallery
    while(gallery.firstChild){
        gallery.removeChild(gallery.firstChild);
    }

    images = new Array();
    titles = new Array();
    index = undefined;
}

//Deprecated image search API: "https://ajax.googleapis.com/ajax/services/search/images?v=1.0&q=yosemite";

//Static test data to prevent busting Google Search API limit
/*var images = ["http://cdn.abclocal.go.com/content/kgo/images/cms/951814_1280x720.jpg",
 "http://i.ytimg.com/vi/lyFVxRn7zzQ/hqdefault.jpg",
 "http://static01.nyt.com/images/2015/01/12/us/BRIDGE/BRIDGE-facebookJumbo.jpg",
 "http://i.ytimg.com/vi/FKU1PTyHtbM/hqdefault.jpg",
 "http://static01.nyt.com/images/2014/03/27/us/BRIDGE1/BRIDGE1-videoSixteenByNine1050.jpg",
 "http://dewith.com/wp-content/uploads/2013/07/Yosemite-1.jpg",
 "http://cdn.abclocal.go.com/content/kgo/images/cms/418819_1280x720.jpg",
 "http://www.kcra.com/image/view/-/20891708/highRes/6/-/maxh/630/maxw/1200/-/exuo3oz/-/Generic-SF-jpg.jpg",
 "https://i.ytimg.com/vi/s-FohgijTuw/maxresdefault.jpg",
 "http://www.yosemitepark.com/Images/home-img-01.jpg"];
 var titles = ['GoPro Spherical: Indycars over the Golden Gate Bridge - YouTube',
 'Officials approve steel net on Golden Gate Bridge to prevent suicides',
 'Golden Gate Bridge - YouTube',
 'New Golden Gate Bridge Barrier Draws Sighs of Relief - The New',
 'Building The Golden Gate Bridge - YouTube',
 'Suicides Mounting, Golden Gate Looks to Add a Safety Net',
 'Golden Gate Bridge taking first-ever weekend off',
 'DUI driver wedges car into pedestrian walkway on Golden Gate Bridge',
 'Golden Gate Bridge toll set to increase | News - KCRA Home',
 'Golden Gate Bridge moveable median barrier installation: closeup'];
 */