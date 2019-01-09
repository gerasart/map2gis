class maps2gis {
    constructor(mapSelector, data = false) {
        this.name = this.constructor.name;
        console.info(`${this.name} init!`);

        this.markers = [];
        this.data = data;

        this.mapSelector = mapSelector;
        this.mapElement = document.querySelector(mapSelector);

        this.center = [50.4501, 30.523400000000038];

        if (this.mapElement) {
            this.imageUrl = this.mapElement.getAttribute('data-icon');

            if (!window.DG) {
                this.loadScript();

                setTimeout(() => {
                    this.initMap();
                }, 450);
            } else {
                this.initMap();
            }
        }
    }

    loadScript() {
        const script = document.createElement('script');
        script.src = `//maps.api.2gis.ru/2.0/loader.js?pkg=full`;
        script.async = true;

        document.head.appendChild(script);
    }

    initMap() {
        window.DG.then(() => {
            this.createHoverTooltip();

            this.getParams();

            this.buildMap();
        });
    }

    getParams() {
        if (this.mapElement.getAttribute('data-markers') && !this.data) {
            let dataName = this.mapElement.getAttribute('data-markers');
            let windowData = window[dataName];

            if (windowData) {
                this.data = windowData;
            }
        }

        this.zoom = this.mapElement.getAttribute('data-zoom');

        if (this.mapElement.getAttribute('data-marker')) {
            this.mainMarker = JSON.parse(this.mapElement.getAttribute('data-marker'));
            this.mainMarker['id'] = 1;

            if (this.imageUrl) {
                this.mainMarker['icon'] = this.imageUrl;
            }

            this.center = this.mainMarker;
        }

        if (this.mapElement.getAttribute('data-center')) {
            this.center = JSON.parse( this.mapElement.getAttribute('data-center') );
        }
    }

    buildMap() {
        this.map = window.DG.map(this.mapElement, {
            center: this.center,
            zoom: this.zoom ? this.zoom : 13,
            touchZoom: true,
            scrollWheelZoom: false,
            dragging: !this._isMobileDevice(),
            tap: false
        });

        if (this.mainMarker) {
            this.setMarker(this.mainMarker);
        }

        if (this.data && this.data.length) {
            for (const key in this.data) {
                let markerData = this.data[key];

                this.setMarker(markerData);
            }
        }

        if (this.imageUrl) {
            this.setIcon(this.imageUrl);
        }

        this.setEvents();
    }

    setEvents() {
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Control') {
                e.preventDefault();

                this.map.scrollWheelZoom.enable();
            }
        });

        window.addEventListener('keyup', (e) => {
            e.preventDefault();

            this.map.scrollWheelZoom.disable();
        });

        window.addEventListener('scroll', () => {
            let hovers = document.querySelectorAll(":hover"),
                current = hovers[hovers.length - 1];

            if (current && (current.id === this.mapSelector || current.className === 'hover-tooltip')) {
                this.hoverTooltip.style.opacity = 1;
                this.hoverTooltip.style['z-index'] = 500;

                if (!this._hasClass(this.hoverTooltip, 'active')) {
                    this.hoverTooltip.classList.add("active");
                    setTimeout(() => {
                        this.hoverTooltip.style.opacity = 0;
                        setTimeout(() => {
                            this.hoverTooltip.style['z-index'] = 300;
                            this.hoverTooltip.classList.remove("active");
                        }, this.tooltipDuration);
                    }, this.tooltipDuration);
                }
            }
        });
    }

    _hasClass(element, cls) {
        return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
    }

    _setStyles(element, styles) {
        for (let property in styles) {
            element.style[property] = styles[property];
        }
    }

    _isMobileDevice() {
        return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
    }

    setMarker(markerData) {
        let content = this.creatPopup(markerData);
        let markerLocation = false;

        if (markerData.location) {
            markerLocation = markerData.location;
        } else if (markerData.lat) {
            markerLocation = [markerData.lat, markerData.lng];
        }

        if ( markerLocation ) {
            let marker = window.DG.marker(markerLocation, {
                label: markerData.title ? markerData.title : markerData.address,
                type: markerData.type
            }).addTo(this.map).bindPopup(content);

            this.markers[markerData.id] = marker;

            if (markerData.icon) {
                this.setIcon(markerData.icon, marker);
            }
        }
    }

    setIcon(iconUrl, marker = false) {
        let imageObj = new Image();
        imageObj.src = iconUrl;

        imageObj.onload = () => {
            this.iconSize = {
                w: imageObj.width,
                h: imageObj.height
            };

            this.markerIcon = window.DG.icon({
                iconUrl: iconUrl,
                iconSize: [this.iconSize.w, this.iconSize.h],
                iconAnchor: [this.iconSize.w / 2, this.iconSize.h]
            });

            if (marker) {
                marker.setIcon(this.markerIcon);
            } else {
                this.markers.forEach((marker) => {
                    marker.setIcon(this.markerIcon);
                });
            }
        }
    }

    setActive(id) {
        this.markers[id].openPopup();
        this.map.setView([this.markers[id]['_latlng'].lat, this.markers[id]['_latlng'].lng]);
    }

    creatPopup(info) {
        let container = document.createElement("div");

        if (info.title) {
            let p = document.createElement("p");
            p.style['margin-bottom'] = '5px';
            p.innerHTML = info.title;
            container.appendChild(p);
        }
        if (info.address) {
            let p = document.createElement("p");
            p.style['margin-bottom'] = '5px';
            p.innerHTML = info.address;
            container.appendChild(p);
        }

        return container;
    }

    createHoverTooltip() {
        this.mapElement.style.position = 'relative';
        this.tooltipDuration = 1400;

        let container = document.createElement("div");
        container.className = 'hover-tooltip';

        let styles = {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            'z-index': 300,
            'justify-content': 'center',
            'align-items': 'center',
            transition: 'opacity ease-in-out',
            'background-color': 'rgba(0,0,0,0.45)',
            opacity: 0,
            'transition-duration': this.tooltipDuration / 1000 + 's'
        };

        this._setStyles(container, styles);

        let p = document.createElement("p");
        p.textContent = 'Use ctrl + scroll to zoom the map';
        p.style.color = '#fff';

        container.appendChild(p);
        this.mapElement.appendChild(container);
        this.hoverTooltip = container;
    }

    filterMarkers(attr, val) {
        let filtered = [];

        this.markers.forEach(marker => {
            if (marker && marker.options.hasOwnProperty(attr) && marker.options[attr] === val) {
                filtered.push(marker);
            }
        });

        return filtered;
    }

    rebuild(data) {
        this.map.remove();

        if ( data.markers && data.markers.length ) {
            this.data = data.markers;

            if ( data.center ) {
                this.center = data.center;
            } else {
                this.center = this.data[0].location;
            }
        }

        this.buildMap();
    }

}
