var vh = 0

function initialize() {
    M.AutoInit();

    d3.select('#date').text(`${lastUpdate.toDateString()} ${lastUpdate.toLocaleTimeString()}`)
    
    vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)    

    let width = d3.select('#chapter_0').node().getBoundingClientRect().width
    let height = vh * 0.35 > 600 ? 600 : vh * 0.35

    createChart(width * 0.55, height)
    // createMap(width, height)    
}

const createEmpty = (svg, x, width, height) => {
    svg.append('rect')
        .attr('class', '_blanks')
        .attr('x', x)
        .attr('y', 20)
        .attr('width', width)
        .attr('height', height)
        .style('fill', '#fff3e0')
        .style('opacity', '0.6')
    svg.append('foreignObject')
        .attr('class', '_blanks')
        .attr('x', x + 20)
        .attr('y', 20)
        .attr('width', width)
        .attr('height', height)
        .append('xhtml:p')
        .attr('class', '_blanks grey-text darken-1')
        .html(['No hay', 'datos', 'de pruebas', 'a la', 'fecha'].join(`</br>`))
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

    let data = await d3.csv('data/datos_nal.csv')
    data = await data.map(d => {
        d[COLUMNS['date']] = new Date(d[COLUMNS['date']])
        d[COLUMNS['offTests']] = +d[COLUMNS['offTests']]
        d[COLUMNS['cases']] = +d[COLUMNS['cases']]
        d[COLUMNS['discarded']] = +d[COLUMNS['discarded']]
        return d
    })
    data = data.sort((a, b) => new Date(a[COLUMNS['date']]) - new Date(b[COLUMNS['date']]))
    console.log(data)
    let svg = d3.select('#chartTestCol')
    let lastDay = d3.max(await data.map(d => d[COLUMNS['date']]))
    lastDay.setDate(lastDay.getDate() + 3)

    var x = d3.scaleTime().range([margin.left, width])
        .domain([firstDay, lastDay])

    let y = d3.scaleLinear()
        .range([height, margin.top])
        .domain([0, d3.max(await data.map(d => d[COLUMNS['offTests']])) + 10])


    let xAxis = d3.axisBottom(x)
    let yAxis = d3.axisLeft(y)

    svg.append('text')
        .attr('id', 'chartTitle')
        .attr('x', 10)
        .attr('y', 15)
        .html(`Número de  <tspan style="fill: ${ORANGE}">pruebas hechas</tspan>`)

    svg.selectAll('rect')
        .data(data)
        .enter().append('rect')
        .attr('class', '_offTests')
        .attr('x', d => x(d[COLUMNS['date']]))
        .attr('y', d => y(d[COLUMNS['offTests']]))
        .attr('width', 7)
        .attr('height', d => height - y(d[COLUMNS['offTests']]))
        .style('fill', ORANGE)
        .append('title')
        .html(d => `${d[COLUMNS['date']].toLocaleDateString()}: ${d3.format(',d')(d[COLUMNS['offTests']])} pruebas`)

    svg.append('g')
        .attr('transform', `translate(0,${h - margin.bottom - margin.top})`)
        .call(xAxis).selectAll('text')
        .style('text-anchor', 'end')
        .attr('transform', 'rotate(320)')

    svg.append('g')
        .attr('class', 'y-axis')
        .attr('transform', `translate(${margin.left},0)`)
        .call(yAxis)

    createEmpty(svg, x(data[22][COLUMNS['date']]), x(data[data.length - 1][COLUMNS['date']]) - x(data[22][COLUMNS['date']]), height - margin.top)

    svg.selectAll('._blanks')
        .style('visibility', 'hidden')

    const reDimension = col => {
        svg.selectAll(`rect._${col}`)
            .transition().duration(1000)
            .attr('y', d => y(d[COLUMNS[col]]))
            .attr('height', d => height - y(d[COLUMNS[col]]))
    }

    const addCases = _ => {
        svg.selectAll('rect._cases')
            .data(data)
            .enter().append('rect')
            .attr('class', '_cases')
            .attr('x', d => x(d[COLUMNS['date']]) + 7)
            .attr('y', height)
            .attr('width', 7)
            .attr('height', 0)
            .style('fill', palette[0])
            .append('title')
            .html(d => `${d[COLUMNS['date']].toLocaleDateString()}: ${d3.format(',d')(d[COLUMNS['cases']])} casos confirmados`)

        reDimension('cases')

        d3.select('#chartTitle')
            .html(`Número de  <tspan style="fill: ${ORANGE}">pruebas hechas</tspan> y <tspan style="fill: ${palette[0]}">casos confirmados</tspan>`)
    }

    const addDiscarded = async _ => {
        y.domain([0, d3.max(await data.map(d => d[COLUMNS['cases']] + d[COLUMNS['discarded']])) + 100])
        svg.select('.y-axis')
            .transition().duration(1000)
            .call(yAxis)

        reDimension('offTests')
        reDimension('cases')

        svg.selectAll('rect._discarded')
            .data(data)
            .enter().append('rect')
            .attr('class', '_discarded')
            .attr('x', d => x(d[COLUMNS['date']]) + 7)
            .attr('y', d => y(d[COLUMNS['cases']]))
            .attr('width', 7)
            .attr('height', 0)
            .style('fill', palette[1])
            .append('title')
            .html(d => `${d[COLUMNS['date']].toLocaleDateString()}: ${d3.format(',d')(d[COLUMNS['discarded']])} casos descartados`)

        svg.selectAll('rect._discarded')
            .transition()
            .duration(1000)
            .attr('y', d => y(d[COLUMNS['cases']] + d[COLUMNS['discarded']]))
            .attr('height', d => height - y(d[COLUMNS['discarded']]))

        d3.select('#chartTitle')
            .html(`Número de  <tspan style="fill: ${ORANGE}">pruebas hechas</tspan>, <tspan style="fill: ${palette[0]}">casos confirmados</tspan> y <tspan style="fill: ${palette[1]}">casos descartados</tspan>`)
    }

    // Fix/unfix chart
    new Waypoint({
        element: document.getElementById('chartTestCol'),
        handler: direction => {
            if (direction === DOWN)
                svg.style('position', 'fixed').style('top', '5%')
            else if (direction === UP)
                svg.style('position', '').style('top', '')
        },
        offset: '10%'
    })

    // Add/remove cases
    new Waypoint({
        element: document.getElementById('text_2'),
        handler: direction => {
            if (direction === DOWN) {
                d3.selectAll('._blanks').style('visibility', 'hidden')
                addCases()
            }
            else if (direction === UP) {
                d3.selectAll('._cases').remove()
                d3.select('#chartTitle')
                    .html(`Número de <tspan style="fill: ${ORANGE}">pruebas hechas</tspan>`)
            }
        },
        offset: '40%'
    })

    // Add/remove empty
    new Waypoint({
        element: document.getElementById('text_3'),
        handler: direction => {
            if (direction === DOWN)
                svg.selectAll('._blanks')
                    .style('visibility', 'inherit')
            else if (direction === UP)
                svg.selectAll('._blanks')
                    .style('visibility', 'hidden')
        },
        offset: '40%'
    })

    // Add/remove discarded
    new Waypoint({
        element: document.getElementById('text_4'),
        handler: direction => {
            if (direction === DOWN) {
                svg.selectAll('p._blanks')
                    .style('visibility', 'hidden')
                addDiscarded()
            }
            else if (direction === UP) {
                y.domain(d3.extent(data, d => d[COLUMNS['offTests']]))
                svg.select('.y-axis')
                    .transition().duration(1000)
                    .call(yAxis)

                reDimension('offTests')
                reDimension('cases')

                svg.selectAll('p._blanks')
                    .style('visibility', 'inherit')

                svg.selectAll('._discarded').remove()

                d3.select('#chartTitle')
                    .html(`Número de  <tspan style="fill: ${ORANGE}">pruebas hechas</tspan> y <tspan style="fill: ${palette[0]}">casos confirmados</tspan>`)
            }
        },
        offset: '40%'
    })

    // Fix/unfix chart
    new Waypoint({
        element: document.getElementById('chapter_2'),
        handler: direction => {
            if (direction === DOWN)
                svg.style('position', '').style('top', '')
            else if (direction === UP)
                svg.style('position', 'fixed').style('top', '5%')
        },
        offset: `${Math.round(h*100/vh) + 5}%`
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
                d3.select('#chart').style('position', 'fixed').style('top', '5%')
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