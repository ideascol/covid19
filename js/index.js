const initialize = async _ => {
    M.AutoInit();

    d3.select('#date').text(`${lastUpdate.toDateString()} ${lastUpdate.toLocaleTimeString()}`)

    let width = d3.select('#intro').node().getBoundingClientRect().width

    await createChart(width * 0.55, 200)
    // await createMap(width, height)    
}

const createChart = async (w, h) => {
    let margin = { top: 20, right: 5, bottom: 10, left: 50 }

    let width = w - margin.left - margin.right
    let height = h - margin.top - margin.bottom

    d3.select('#chartTestCol')
        .attr('width', w + margin.left + margin.right)
        .attr('height', h + margin.top + margin.bottom)
        .attr('transform',
            `translate(${margin.left}, ${margin.top})`)

    let data = await d3.csv('../data/Datos a nivel nacional.xlsx - Pruebas Nacional.csv')
    data = await data.map(d => {
        d['Fecha'] = new Date(d['Fecha'])
        d['Pruebas realizadas'] = +d['Pruebas realizadas']
        return d
    })
    data = data.sort((a, b) => new Date(a['Fecha']) - new Date(b['Fecha']))
    console.log(data)
    let svg = d3.select('#chartTestCol')

    var x = d3.scaleTime().range([margin.left, width])
        .domain(d3.extent(data, d => d['Fecha']))

    let y = d3.scaleLinear()
        .range([height, margin.top])
        .domain(d3.extent(data, d => d['Pruebas realizadas']))

    let xAxis = d3.axisBottom(x)
    let yAxis = d3.axisLeft(y)

    svg.selectAll('rect')
        .data(data)
        .enter().append('rect')
        .attr('x', d => x(d['Fecha']))
        .attr('y', d => y(d['Pruebas realizadas']))
        .attr('width', 10)
        .attr('height', d => height - y(d['Pruebas realizadas']))
        .style('fill', '#ff9800')
        .append('title')
        .html(d => `${d['Fecha'].toLocaleDateString()}: ${d3.format(',d')(d['Pruebas realizadas'])} pruebas`)

    svg.append('g')
        .attr('transform', `translate(0,${h - margin.bottom - margin.top})`)
        .call(xAxis).selectAll('text')
        .style('text-anchor', 'end')
        .attr('transform', 'rotate(320)')

    svg.append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(yAxis)

    // Fix/unfix chart
    new Waypoint({
        element: document.getElementById('chartTestCol'),
        handler: direction => {
            if (direction === DOWN)
                svg.style('position', 'fixed').style('top', '10%')
            else if (direction === UP)
                svg.style('position', '').style('top', '')
        },
        offset: '10%'
    })

    // Add/remove empty
    new Waypoint({
        element: document.getElementById('text_1'),
        handler: direction => {
            if (direction === DOWN) {
                svg.append('rect')
                    .attr('class', '_blanks')
                    .attr('x', x(data[22]['Fecha']))
                    .attr('y', 5)
                    .attr('width', x(data[data.length - 1]['Fecha']) - x(data[22]['Fecha']))
                    .attr('height', height * 0.95)
                    .style('fill', '#fff3e0')
                    .style('opacity', '0.6')
                svg.append('foreignObject')
                    .attr('class', '_blanks')
                    .attr('x', x(data[22]['Fecha']) + 20)
                    .attr('y', 10)
                    .attr('width', x(data[data.length - 1]['Fecha']) - x(data[22]['Fecha']))
                    .attr('height', height * 0.95)
                    .append('xhtml:p')
                    .attr('class', '_blanks grey-text darken-1')
                    .html(['No hay', 'datos', 'a la', 'fecha'].join(`</br>`))
            }
            else if (direction === UP)
                svg.selectAll('._blanks')
                    .remove()
        },
        offset: '40%'
    })
}

const createMap = async (width, height) => {
    let projection = d3.geoMercator()
        .scale(1600)
        .center([-74, 4.5])
        .translate([width / 2, height / 2])

    let path = d3.geoPath()
        .projection(projection)

    let svg = d3.select('#map')
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
                    .style('fill', d => palette[Math.round(Math.random() * 19)])

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