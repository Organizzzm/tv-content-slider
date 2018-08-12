function imagesRequest(page, perPage) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://api.flickr.com/services/rest/?method=flickr.photos.getRecent&nojsoncallback=1&api_key=40819e71e9f5d2970fab212b6fe92e25&per_page=' + perPage + '&page=' + page + '&format=json', false);
    xhr.send();

    if (xhr.status != 200) {
        alert(xhr.status + ': ' + xhr.statusText);
    } else {
        return JSON.parse(xhr.responseText);
    }
}