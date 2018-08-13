function imagesRequest(page, perPage) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://api.flickr.com/services/rest/?method=flickr.photos.getRecent&nojsoncallback=1&api_key=1a94a9b4a0235a7cc5355b524bf37a3b&per_page=' + perPage + '&page=' + page + '&format=json', false);
    xhr.send();

    if (xhr.status != 200) {
        alert(xhr.status + ': ' + xhr.statusText);
    } else {
        return JSON.parse(xhr.responseText);
    }
}