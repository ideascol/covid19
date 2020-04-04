const initialize = async _ => {
    console.log('initializing')

    d3.select('#date').text(`${lastUpdate.toDateString()} ${lastUpdate.toLocaleTimeString()}`)

    var width = 600,
        height = 600,
        centered;

    // Define color scale
    var color = d3.scaleLinear()
        .domain([1, 20])
        .clamp(true)
        .range(['#fff', '#409A99']);

    var projection = d3.geoMercator()
        .scale(1600)
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
    let paths = mapLayer.selectAll('path')
        .data(features)
        .enter().append('path')
        .attr('d', path)
        .attr('vector-effect', 'non-scaling-stroke')
        .style('fill', 'white')
        .style('stroke', 'gray')

    let data = await d3.csv(testData)

    var waypointMap = new Waypoint({
        element: document.getElementById('map'),
        handler: function (direction) {
            if (direction === DOWN)
                d3.select('#map').style('position', 'fixed').style('top', '10%')
            else if (direction === UP)
                d3.select('#map').style('position', '').style('top', '')
        },
        offset: '10%'
    })

    var waypointText1 = new Waypoint({
        element: document.getElementById('text_1'),
        handler: function (direction) {
            if (direction === DOWN) {
                mapLayer.selectAll('circle')
                    .data(features)
                    .enter().append('circle')
                    .attr('class', 'text_1')
                    .attr('r', 5)
                    .attr("transform", d =>
                        "translate(" + path.centroid(d) + ")"
                    )
                    .style('fill', '#047ab3')
            }
            else if (direction === UP) 
                mapLayer.selectAll('.text_1')
                    .remove()
        },
        offset: '10%'
    })
}

initialize()