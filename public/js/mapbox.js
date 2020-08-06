
export const displayMap = (locations) => {
    mapboxgl.accessToken = 'pk.eyJ1Ijoic3ZpazcyNCIsImEiOiJja2Q4OWlicHYyajJ3MnFxdnhjdXZwcnk3In0.UsDNGEoMeHaI4GNOSTktiA';

    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/svik724/ckd89n4nc0iib1iplmpzydwkl',
        scrollZoom: false
    });
    
    const bounds = new mapboxgl.LngLatBounds(); 
    
    locations.forEach(loc => {
        // Create marker
        const el = document.createElement('div');
        el.className = 'marker';
    
        // Add marker
        new mapboxgl.Marker({
            element: el,
            anchor: 'bottom'
        }).setLngLat(loc.coordinates).addTo(map); 
    
        // Add popup
        new mapboxgl.Popup({
            offset: 30
        }).setLngLat(loc.coordinates).setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`).addTo(map);
    
        // Extends the map bounds to include the current location
        bounds.extend(loc.coordinates)
    }); 
    
    map.fitBounds(bounds, {
        padding: {
            top: 200,
            bottom: 150,
            left: 100,
            right: 100
        }
    }); 
}

