new Slider('#slider',
    {
        itemsCount: 5,
        lazy: lazy,
        itemTemplate: template
    });

function lazy(page) {
    var data = [],
        newData = [],
        length;

    switch (page) {
        case 1:
            data = imagesRequest(1, 50);
            break;
        case 2:
            data = imagesRequest(2, 40);
            break;
        default:
            data = [];
    }

    if (!data.photos) return [];

    length = data.photos.photo.length - 1;

    for (var i = 0; i <= length; i++) {
        newData.push(data.photos.photo[i]);
    }
    return newData;
}

function template(data) {
    return '<div class="item-image"><span>' + data.title + '</span><img src="https://farm' + data.farm + '.staticflickr.com/' + data.server + '/' + data.id + '_' + data.secret + '.jpg"/></div>';
}
