let data_2gis = [
    {
        icon: 'http://ilta.svitsoft.com/wp-content/themes/ilta/resources/assets/img/icon-marker.svg',
        lat: "50.4059204",
        lng: "30.5355657",
        address: "Залізничне шосе, 10",
        title: "ІЛТА ІЛТА на Печерську",
        zoom: 14,
        id: 0,
    },
    {
        icon: 'http://ilta.svitsoft.com/wp-content/themes/ilta/resources/assets/img/icon-marker.svg',
        lat: "50.5221778",
        lng: "30.5065993",
        address: "Героїв Дніпра, 40",
        title: "ІЛТА ІЛТА на оболоні",
        zoom: 14,
        id: 1,
    },
    {
        icon: 'http://ilta.svitsoft.com/wp-content/themes/ilta/resources/assets/img/icon-marker.svg',
        lat: "50.3909464",
        lng: "30.6509383",
        address: "вул. Ревуцького, 56",
        title: "ІЛТА на харківському",
        zoom: 14,
        id: 2
    }
];


let $map2gis = new maps2gis('#map',data_2gis);

let openPopupBtn = document.querySelectorAll('.marker_btn');
Array.from(openPopupBtn).forEach(link => {
    link.addEventListener('click', (event) => {
        let el = event.target;
        let id = el.attributes['data-id'].nodeValue;
        $map2gis.setActive(id);
        $map2gis.mapElement.scrollIntoView({
            behavior: 'smooth'
        });
    });
});
