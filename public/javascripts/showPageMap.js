//Then following the map div up top we put this script down here
//Even though mapToken isn't declared here it gets the information since
//the variable was computed at top of show.ejs file 
//show.ejs spits out the token using ejs syntax up at the top of show file
mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v11', // style URL
    center: campground.geometry.coordinates, // starting position [lng, lat]
    zoom: 9 // starting zoom
});

//adding controls to the map
map.addControl(new mapboxgl.NavigationControl());


new mapboxgl.Marker()
    .setLngLat(campground.geometry.coordinates)
    .setPopup(
        // Popup instructions is found in Mapbox docs
        new mapboxgl.Popup({ offset: 25 })
        .setHTML(
            `<h3>${campground.title}</h3><p>${campground.location}</p>`
        )
    )
    .addTo(map)