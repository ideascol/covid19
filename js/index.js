const initialize = async _ => {
    M.AutoInit();

    d3.select('#date').text(`${lastUpdate.toDateString()} ${lastUpdate.toLocaleTimeString()}`)

    let width = d3.select(`#${SVG}`).node().parentNode.getBoundingClientRect().width * 0.9
    let height = width

    await createMap(width, height)    
}

const createMap = async (width, height) => {
    let projection = d3.geoMercator()
        .scale(1600)
        .center([-74, 4.5])
        .translate([width / 2, height / 2])

    let path = d3.geoPath()
        .projection(projection)

    let svg = d3.select(`#${SVG}`)
        .attr('width', width)
        .attr('height', height)

    let mapLayer = svg.append('g')

    let mapData = await d3.json(colombiaGeoJson)
    let features = mapData.features

    mapLayer.selectAll('path')
        .data(features)
        .enter().append('path')
        .attr('d', path)
        .attr('vector-effect', 'non-scaling-stroke')
        .style('fill', 'white')
        .style('stroke', 'gray')

    // Fix/unfix map
    new Waypoint({
        element: document.getElementById('chart'),
        handler: direction => {
            if (direction === DOWN)
                d3.select('#chart').style('position', 'fixed').style('top', '10%')
            else if (direction === UP)
                d3.select('#chart').style('position', '').style('top', '')
        },
        offset: '10%'
    })

    // Add/remove dots
    new Waypoint({
        element: document.getElementById('text_1'),
        handler: direction => {
            if (direction === DOWN) 
                mapLayer.selectAll('circle')
                    .data(features)
                    .enter().append('circle')
                    .attr('class', 'text_1')
                    .attr('r', 5)
                    .attr('transform', d =>
                        'translate(' + path.centroid(d) + ')'
                    )
                    .style('fill', '#047ab3')
            else if (direction === UP)
                mapLayer.selectAll('.text_1')
                    .remove()
        },
        offset: '40%'
    })    
    
    // Add/remove color
    new Waypoint({
        element: document.getElementById('text_2'),
        handler: direction => {
            if (direction === DOWN) {
                mapLayer.selectAll('path')
                    .style('fill', d => palette[Math.round(Math.random()*19)])

                mapLayer.selectAll('.text_1')
                    .remove()
            }
            else if (direction === UP) {
                mapLayer.selectAll('path')
                    .style('fill', 'white')

                mapLayer.selectAll('circle')
                    .data(features)
                    .enter().append('circle')
                    .attr('class', 'text_1')
                    .attr('r', 5)
                    .attr('transform', d => `translate(${path.centroid(d)})`)
                    .style('fill', '#047ab3')
            }
        },
        offset: '40%'
    })    
}

initialize()