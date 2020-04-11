var vh = 0

function initialize() {
    M.AutoInit();

    d3.select('#date').text(`${lastUpdate.toDateString()} ${lastUpdate.toLocaleTimeString()}`)

    vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)

    let width = d3.select('#chapter_0').node().getBoundingClientRect().width
    let height = vh * 0.35 > width * 0.55 * 0.6 ? width * 0.55 * 0.6 : vh * 0.35

    createChart(width * 0.55, height)
    createSummaryChart(width * 0.65, vh * 0.4)
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
        .attr('x', x + 1)
        .attr('y', 20)
        .attr('width', width)
        .attr('height', height)
        .append('xhtml:p')
        .attr('class', '_blanks grey-text darken-1')
        .style('font-size', '10px')
        .html(['No hay', 'datos', 'de pruebas', 'procesadas', 'a la', 'fecha'].join(`</br>`))
}

const createChart = async (w, h) => {
    let margin = { top: 20, right: 5, bottom: 10, left: 50 }

    let width = w - margin.left - margin.right
    let height = h - margin.top - margin.bottom

    let svg = d3.select('#chartTestCol')
        .attr('width', w + margin.left + margin.right)
        .attr('height', h + margin.top + margin.bottom)
        .attr('transform',
            `translate(${margin.left}, ${margin.top})`)

    let data = await d3.csv('data/datos_nal.csv')
    data = await data.map(d => {
        d[COLS_NAL['date']] = new Date(d[COLS_NAL['date']])
        d[COLS_NAL['offTests']] = +d[COLS_NAL['offTests']]
        d[COLS_NAL['cases']] = +d[COLS_NAL['cases']]
        d[COLS_NAL['discarded']] = +d[COLS_NAL['discarded']]
        return d
    })
    data = data.sort((a, b) => new Date(a[COLS_NAL['date']]) - new Date(b[COLS_NAL['date']]))
    let lastDay = new Date(d3.max(await data.map(d => d[COLS_NAL['date']])).getTime())
    lastDay.setDate(lastDay.getDate() + 1)

    var x = d3.scaleTime().range([margin.left, width])
        .domain([firstDay, lastDay])

    let y = d3.scaleLinear()
        .range([height, margin.top])
        .domain([0, d3.max(await data.map(d => d[COLS_NAL['offTests']])) + 10])


    let xAxis = d3.axisBottom(x)
    let yAxis = d3.axisLeft(y)

    svg.append('text')
        .attr('id', 'chartTitle')
        .attr('x', 10)
        .attr('y', 15)
        .html(`<tspan style="fill: ${ORANGE}">Pruebas procesadas</tspan>`)

    svg.selectAll('rect')
        .data(data)
        .enter().append('rect')
        .attr('class', '_offTests')
        .attr('x', d => x(d[COLS_NAL['date']]))
        .attr('y', d => y(d[COLS_NAL['offTests']]))
        .attr('width', 5)
        .attr('height', d => height - y(d[COLS_NAL['offTests']]))
        .style('fill', ORANGE)
        .append('title')
        .html(d => `${d[COLS_NAL['date']].toLocaleDateString()}: ${d3.format(',d')(d[COLS_NAL['offTests']])} pruebas`)

    svg.append('g')
        .attr('transform', `translate(0,${h - margin.bottom - margin.top})`)
        .call(xAxis).selectAll('text')
        .style('text-anchor', 'end')
        .attr('transform', 'rotate(320)')

    svg.append('g')
        .attr('class', 'y-axis')
        .attr('transform', `translate(${margin.left},0)`)
        .call(yAxis)

    createEmpty(svg, x(data[31][COLS_NAL['date']]), x(lastDay) - x(data[31][COLS_NAL['date']]), height - margin.top)

    const reDimension = col => {
        svg.selectAll(`rect._${col}`)
            .transition().duration(1000)
            .attr('y', d => y(d[COLS_NAL[col]]))
            .attr('height', d => height - y(d[COLS_NAL[col]]))
    }

    const addCases = _ => {
        svg.selectAll('rect._cases')
            .data(data)
            .enter().append('rect')
            .attr('class', '_cases')
            .attr('x', d => x(d[COLS_NAL['date']]) + 5)
            .attr('y', height)
            .attr('width', 5)
            .attr('height', 0)
            .style('fill', palette[0])
            .append('title')
            .html(d => `${d[COLS_NAL['date']].toLocaleDateString()}: ${d3.format(',d')(d[COLS_NAL['cases']])} casos confirmados`)

        reDimension('cases')

        d3.select('#chartTitle')
            .html(`<tspan style="fill: ${ORANGE}">Pruebas procesadas</tspan> y <tspan style="fill: ${palette[0]}">casos confirmados</tspan>`)
    }

    const addDiscarded = async _ => {
        y.domain([0, d3.max(await data.map(d => d[COLS_NAL['cases']] + d[COLS_NAL['discarded']])) + 100])
        svg.select('.y-axis')
            .transition().duration(1000)
            .call(yAxis)

        reDimension('offTests')
        reDimension('cases')

        svg.selectAll('rect._discarded')
            .data(data)
            .enter().append('rect')
            .attr('class', '_discarded')
            .attr('x', d => x(d[COLS_NAL['date']]) + 5)
            .attr('y', d => y(d[COLS_NAL['cases']]))
            .attr('width', 5)
            .attr('height', 0)
            .style('fill', palette[1])
            .append('title')
            .html(d => `${d[COLS_NAL['date']].toLocaleDateString()}: ${d3.format(',d')(d[COLS_NAL['discarded']])} casos descartados`)

        svg.selectAll('rect._discarded')
            .transition()
            .duration(1000)
            .attr('y', d => y(d[COLS_NAL['cases']] + d[COLS_NAL['discarded']]))
            .attr('height', d => height - y(d[COLS_NAL['discarded']]))

        d3.select('#chartTitle')
            .html(`<tspan style="fill: ${ORANGE}">Pruebas procesadas</tspan>, <tspan style="fill: ${palette[0]}">casos confirmados</tspan> y <tspan style="fill: ${palette[1]}">casos descartados</tspan>`)
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
                createComparisonChart(w, h)
                addCases()
            }
            else if (direction === UP) {
                d3.select('#chartCompCases').html('')
                d3.selectAll('._cases').remove()
                d3.select('#chartTitle')
                    .html(`<tspan style="fill: ${ORANGE}">Pruebas procesadas</tspan>`)
            }
        },
        offset: '32%'
    })

    // Add/remove empty
    new Waypoint({
        element: document.getElementById('text_3'),
        handler: direction => {
            if (direction === DOWN) {
                d3.select('#chartCompCases').style('position', '').style('top', '')
            }
            else if (direction === UP) {
                d3.select('#chartCompCases').style('position', 'fixed').style('top', `${Math.round(h * 100 / vh) + 10}%`)
            }
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
                y.domain(d3.extent(data, d => d[COLS_NAL['offTests']]))
                svg.select('.y-axis')
                    .transition().duration(1000)
                    .call(yAxis)

                reDimension('offTests')
                reDimension('cases')

                svg.selectAll('p._blanks')
                    .style('visibility', 'inherit')

                svg.selectAll('._discarded').remove()

                d3.select('#chartTitle')
                    .html(`<tspan style="fill: ${ORANGE}">Pruebas procesadas</tspan> y <tspan style="fill: ${palette[0]}">casos confirmados</tspan>`)
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
        offset: `${Math.round(h * 100 / vh) + 5}%`
    })

}

const createComparisonChart = async (w, h) => {
    let margin = { top: 40, right: 5, bottom: 10, left: 50 }

    let width = w - margin.left - margin.right
    let height = h - margin.top - margin.bottom

    let svg = d3.select('#chartCompCases')
        .attr('width', w + margin.left + margin.right)
        .attr('height', h + margin.top + margin.bottom)
        .attr('transform',
            `translate(${margin.left}, ${margin.top})`)
        .style('position', 'fixed').style('top', `${Math.round(h * 100 / vh) + 10}%`)

    let data = await d3.csv('data/datos_intnal.csv')
    data = await data.map(d => {
        d[COLS_INTNAL['day']] = +d[COLS_INTNAL['day']]
        d[COLS_INTNAL['italy']] = +d[COLS_INTNAL['italy']]
        d[COLS_INTNAL['germany']] = +d[COLS_INTNAL['germany']]
        d[COLS_INTNAL['southkorea']] = +d[COLS_INTNAL['southkorea']]
        d[COLS_INTNAL['us']] = +d[COLS_INTNAL['us']]
        d[COLS_INTNAL['col']] = +d[COLS_INTNAL['col']]
        return d
    })
    data = data.sort((a, b) => a[COLS_INTNAL['day']] - b[COLS_INTNAL['day']])

    var x = d3.scaleLinear().range([margin.left, width])
        .domain([0, d3.max(await data.map(d => d[COLS_INTNAL['day']])) + 1])

    let y = d3.scaleLog()
        .range([height, margin.top])
        .domain([200, d3.max(data.map(d => Math.max(d[COLS_INTNAL['italy']], d[COLS_INTNAL['germany']], d[COLS_INTNAL['southkorea']], d[COLS_INTNAL['us']], d[COLS_INTNAL['col']]))) + 10])

    let xAxis = d3.axisBottom(x)
    let yAxis = d3.axisLeft(y).ticks(5).tickFormat(d => d3.format(',d')(d))

    svg.append('text')
        .attr('id', 'chart2Title_a')
        .attr('x', 10)
        .attr('y', 15)
        .html(`Casos confirmados a partir del día con 200 casos en`)

    svg.append('text')
        .attr('id', 'chart2Title_b')
        .attr('x', 10)
        .attr('y', 30)
        .html(`<tspan style="fill: ${palette[2]}">Italia</tspan>, <tspan style="fill: ${palette[3]}">EE.UU</tspan>, <tspan style="fill: ${palette[5]}">Alemania</tspan>, <tspan style="fill: ${palette[6]}">Corea del Sur</tspan> y <tspan style="fill: ${palette[4]}">Colombia</tspan>`)

    svg.append('text')
        .attr('id', 'chart2xAxis')
        .attr('x', margin.left + 10)
        .attr('y', h - 10)
        .style('font-size', 13)
        .style('color', 'grey')
        .html(`Días a partir del día con 200 casos acumulados confirmados`)

    let lineCols = Object.keys(COLS_INTNAL).filter(d => d !== 'day')
    for (let i = 0; i < lineCols.length; i++) {
        setTimeout(_ => {
            let col = lineCols[i]
            let line = d3.line()
                .x(d => x(d[COLS_INTNAL['day']]))
                .y(d => d[COLS_INTNAL[col]] === 0 ? 1 : y(d[COLS_INTNAL[col]]))

            svg.append('path')
                .data([data.filter(d => d[COLS_INTNAL[col]] && d[COLS_INTNAL[col]] > 0)])
                .attr('class', 'line')
                .style('stroke', palette[i + 2])
                .attr('d', line)

            svg.selectAll(`circle.cases.${col}`)
                .data(data.filter(d => d[COLS_INTNAL[col]] && d[COLS_INTNAL[col]] > 0))
                .enter().append('circle')
                .attr('class', `cases ${col}`)
                .attr('cx', d => x(d[COLS_INTNAL['day']]))
                .attr('cy', d => y(d[COLS_INTNAL[col]]))
                .attr('r', 2)
                .style('fill', palette[i + 2])
                .append('title')
                .html(d => `${COUNTRIES[i]}, día ${d[COLS_INTNAL['day']]}: ${d3.format(',d')(d[COLS_INTNAL[col]])} casos confirmados`)

        }, i * 500)
    }

    svg.append('g')
        .attr('transform', `translate(0,${h - margin.bottom - margin.top})`)
        .call(xAxis).selectAll('text')

    svg.append('g')
        .attr('class', 'y-axis')
        .attr('transform', `translate(${margin.left},0)`)
        .call(yAxis)
}

const createSummaryChart = async (w, h) => {
    let margin = { top: 40, right: 5, bottom: 10, left: 80 }

    let width = w - margin.left - margin.right
    let height = h - margin.top - margin.bottom

    let svg = d3.select('#summaryChart')
        .attr('width', w + margin.left + margin.right)
        .attr('height', h + margin.top + margin.bottom)
        .attr('transform',
            `translate(${margin.left}, ${margin.top})`)

    let data = await d3.csv('data/datos_tests.csv')
    data = await data.map(d => {
        d[COLS_TESTS['day']] = +d[COLS_TESTS['day']]
        d[COLS_TESTS['italy']] = +d[COLS_TESTS['italy']]
        d[COLS_TESTS['germany']] = +d[COLS_TESTS['germany']]
        d[COLS_TESTS['southkorea']] = +d[COLS_TESTS['southkorea']]
        d[COLS_TESTS['us']] = +d[COLS_TESTS['us']]
        d[COLS_TESTS['col']] = +d[COLS_TESTS['col']]
        return d
    })
    data = data.sort((a, b) => a[COLS_TESTS['day']] - b[COLS_TESTS['day']])
    
    let dataRate = await d3.csv('data/datos_tests_rate.csv')
    dataRate = await dataRate.map(d => {
        d[COLS_TESTS['day']] = +d[COLS_TESTS['day']]
        d[COLS_TESTS['italy']] = +d[COLS_TESTS['italy']]
        d[COLS_TESTS['germany']] = +d[COLS_TESTS['germany']]
        d[COLS_TESTS['southkorea']] = +d[COLS_TESTS['southkorea']]
        d[COLS_TESTS['us']] = +d[COLS_TESTS['us']]
        d[COLS_TESTS['col']] = +d[COLS_TESTS['col']]
        return d
    })
    dataRate = dataRate.sort((a, b) => a[COLS_TESTS['day']] - b[COLS_TESTS['day']])

    var x = d3.scaleLinear().range([margin.left, width])
        .domain([0, d3.max(await data.map(d => d[COLS_TESTS['day']])) + 1])

    var y = d3.scaleLinear().range([height, margin.top])

    let xAxis = d3.axisBottom(x)
    let yAxis = d3.axisLeft(y).tickFormat(d => d3.format(',d')(d))

    const updateLines = dataset => {
        y.domain([200, d3.max(dataset.map(d => Math.max(d[COLS_TESTS['italy']], d[COLS_TESTS['germany']], d[COLS_TESTS['southkorea']], d[COLS_TESTS['us']], d[COLS_TESTS['col']]))) + 10])
        
        svg.select('.y-axis')
            .transition().duration(1000)
            .call(yAxis)

        Object.keys(COLS_TESTS).filter(d => d !== 'day').map((col, i) => {
            let line = d3.line()
                .x(d => x(d[COLS_TESTS['day']]))
                .y(d => d[COLS_TESTS[col]] === 0 ? 1 : y(d[COLS_TESTS[col]]))

            let paths = svg.selectAll(`.tests.${col}.line`)
                .data([dataset.filter(d => d[COLS_TESTS[col]] && d[COLS_TESTS[col]] > 0)])

            paths
                .enter().append('path')
                .attr('class', `tests ${col} line`)
                .merge(paths)
                .transition().duration(1000)
                .attr('d', line)
                .style('stroke', palette[i + 2])

            let circles = svg.selectAll(`circle.tests.${col}`)
                .data(dataset.filter(d => d[COLS_TESTS[col]] && d[COLS_TESTS[col]] > 0))

            circles.enter().append('circle')
                .attr('class', `tests ${col}`)
                .merge(circles)
                .transition().duration(1000)
                .attr('cx', d => x(d[COLS_TESTS['day']]))
                .attr('cy', d => y(d[COLS_TESTS[col]]))
                .attr('r', 3)
                .style('fill', palette[i + 2])

            circles.append('title')
                .attr('class', `tests title ${col}`)
                .html(d => `${COUNTRIES[i]}, día ${d[COLS_TESTS['day']]}: ${d3.format(',d')(d[COLS_TESTS[col]])} pruebas procesadas`)
        })
    }

    svg.append('text')
        .attr('id', 'chart3Title_a')
        .attr('x', 10)
        .attr('y', 15)
        .html(`Pruebas procesadas a partir del día con 200 casos en `)

    svg.append('text')
        .attr('id', 'chart3Title_b')
        .attr('x', 10)
        .attr('y', 30)
        .html(`<tspan style="fill: ${palette[2]}">Italia</tspan>, <tspan style="fill: ${palette[3]}">EE.UU</tspan>, <tspan style="fill: ${palette[5]}">Alemania</tspan>, <tspan style="fill: ${palette[6]}">Corea del Sur</tspan> y <tspan style="fill: ${palette[4]}">Colombia</tspan>`)

    svg.append('text')
        .attr('id', 'chart3xAxis')
        .attr('x', margin.left + 10)
        .attr('y', h - 10)
        .style('font-size', 13)
        .style('color', 'grey')
        .html(`Días a partir del día con 200 casos acumulados confirmados`)

    updateLines(data)

    svg.append('g')
        .attr('transform', `translate(0,${h - margin.bottom - margin.top})`)
        .call(xAxis).selectAll('text')

    svg.append('g')
        .attr('class', 'y-axis')
        .attr('transform', `translate(${margin.left},0)`)
        .call(yAxis)

    // Fix/unfix chart
    new Waypoint({
        element: document.getElementById('summaryChart'),
        handler: direction => {
            if (direction === DOWN) {
                d3.select('#summaryChart').style('position', 'fixed').style('top', '5%')
                d3.select('#chart3Title_a')
                .html(`Pruebas procesadas por millón de habitantes a partir del día con 200 casos en `)
            }
            else if (direction === UP) {
                d3.select('#summaryChart').style('position', '').style('top', '')
                d3.select('#chart3Title_a')
                    .html(`Pruebas procesadas a partir del día con 200 casos en `)
            }
        },
        offset: `10%`
    })

    // Fix/unfix chart
    new Waypoint({
        element: document.getElementById('text_5'),
        handler: async direction => {
            if (direction === DOWN)           
                updateLines(dataRate)
            else if (direction === UP)
                updateLines(data)
        },
        offset: `40%`
    })

    // Remove/add chart
    new Waypoint({
        element: document.getElementById('chapter_3'),
        handler: direction => {
            if (direction === DOWN)
                svg.style('position', '').style('top', '')
            else if (direction === UP)
                svg.style('position', 'fixed').style('top', '5%')
        },
        offset: `${Math.round(h * 100 / vh) + 5}%`
    })
}

const createMap = async (width, height) => {
    // let projection = d3.geoMercator()
    //     .scale(1600)
    //     .center([-74, 4.5])
    //     .translate([width / 2, height / 2])

    // let path = d3.geoPath()
    //     .projection(projection)

    // let svg = d3.select('#map')
    //     .attr('width', width)
    //     .attr('height', height)

    // let mapLayer = svg.append('g')

    // let mapData = await d3.json(colombiaGeoJson)
    // let features = mapData.features

    // mapLayer.selectAll('path')
    //     .data(features)
    //     .enter().append('path')
    //     .attr('d', path)
    //     .attr('vector-effect', 'non-scaling-stroke')
    //     .style('fill', 'white')
    //     .style('stroke', 'gray')

    // // Fix/unfix map
    // new Waypoint({
    //     element: document.getElementById('chart'),
    //     handler: direction => {
    //         if (direction === DOWN)
    //             d3.select('#chart').style('position', 'fixed').style('top', '5%')
    //         else if (direction === UP)
    //             d3.select('#chart').style('position', '').style('top', '')
    //     },
    //     offset: '10%'
    // })

    // // Add/remove dots
    // new Waypoint({
    //     element: document.getElementById('text_2'),
    //     handler: direction => {
    //         if (direction === DOWN)
    //             mapLayer.selectAll('circle')
    //                 .data(features)
    //                 .enter().append('circle')
    //                 .attr('class', 'text_1')
    //                 .attr('r', 5)
    //                 .attr('transform', d =>
    //                     'translate(' + path.centroid(d) + ')'
    //                 )
    //                 .style('fill', '#047ab3')
    //         else if (direction === UP)
    //             mapLayer.selectAll('.text_1')
    //                 .remove()
    //     },
    //     offset: '40%'
    // })

    // // Add/remove color
    // new Waypoint({
    //     element: document.getElementById('text_2'),
    //     handler: direction => {
    //         if (direction === DOWN) {
    //             mapLayer.selectAll('path')
    //                 .style('fill', d => palette[Math.round(Math.random() * 19)])

    //             mapLayer.selectAll('.text_1')
    //                 .remove()
    //         }
    //         else if (direction === UP) {
    //             mapLayer.selectAll('path')
    //                 .style('fill', 'white')

    //             mapLayer.selectAll('circle')
    //                 .data(features)
    //                 .enter().append('circle')
    //                 .attr('class', 'text_1')
    //                 .attr('r', 5)
    //                 .attr('transform', d => `translate(${path.centroid(d)})`)
    //                 .style('fill', '#047ab3')
    //         }
    //     },
    //     offset: '40%'
    // })
}

initialize()