const initialize = async _ => {
    console.log('initializing')

    d3.select('#date').text(`${lastUpdate.toDateString()} ${lastUpdate.toLocaleTimeString()}`)

    var width = 400,
        height = 500,
        centered;

    // Define color scale
    var color = d3.scaleLinear()
        .domain([1, 20])
        .clamp(true)
        .range(['#fff', '#409A99']);

    var projection = d3.geoEqualEarth()
        .scale(1500)
        // Center the Map in Colombia
        .center([-74, 4.5])
        .translate([width / 2, height / 2]);

    var path = d3.geoPath()
        .projection(projection);

    // Set svg width & height
    var svg = d3.select('#map')
        .attr('width', width)
        .attr('height', height);

    var mapLayer = svg.append('g');

    // Load map data
    let mapData = await d3.json(colombiaGeoJson)
    var features = mapData.features;
    console.log(features)

    // Update color scale domain based on data
    // color.domain([0, d3.max(features, 10)]);

    // Draw each province as a path
    mapLayer.selectAll('path')
        .data(features)
        .enter().append('path')
        .attr('d', path)
        .attr('vector-effect', 'non-scaling-stroke')
        .style('fill', 'red')

    let data = await d3.csv(testData)

    var waypoint = new Waypoint({
        element: document.getElementById('map'),
        handler: function (direction) {
            console.log('Scrolled to waypoint!')
        },
        offset: '40%'
    })
}

initialize()