var vh = 0
var windowWidth = 0
var dataInt = []
var dataCol = []
var dataMilestones = []

const createExplaination = i => explainations[i].title ? `<div class='left-align'><b class='orange-text darken-3'>${explainations[i].title}:</b></br>${explainations[i].text}</div>` : `<div class='left-align'>${explainations[i].text}</div>`

async function initialize() {
    $(document).ready(function () {
        $(this).scrollTop(0)
    })
    M.AutoInit()

    d3.select('#date').text(daysUp >= 1 ? `${daysUp} días ${hoursUp} horas ${minsUp} minutos` : hoursUp >= 1 ? `${hoursUp} horas ${minsUp} minutos` : minsUp > 5 ? `${minsUp} minutos` : 'Hace unos minutos')

    vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)

    windowWidth = d3.select('#chapter_0').node().getBoundingClientRect().width
    let height = windowWidth > 500 ? vh * 0.35 > windowWidth * 0.55 * 0.6 ? windowWidth * 0.55 * 0.6 : vh * 0.35 : windowWidth * 0.7

    dataInt = await loadDataInt()
    dataCol = await loadDataCol()
    dataMilestones = await loadDataMilestones()

    createChart(d3.select('#chartIntro').node().getBoundingClientRect().width * 0.85, height * 1.06)
    createNationalChart(d3.select('#chartIntro2').node().getBoundingClientRect().width * 0.85, height * 1.06)
    createIncreaseChart(d3.select('#chartIncrease').node().getBoundingClientRect().width * 0.85, height)
    createSummaryChart(d3.select('#summaryChart').node().getBoundingClientRect().width * 0.85, height * 1.06)
    createSummaryChart2(d3.select('#summaryChart').node().getBoundingClientRect().width * 0.85, height * 1.06)

    let width = d3.select('#chart_italy').node().getBoundingClientRect().width * 0.85
    createIntCharts(width, height, 'southkorea')
    createIntCharts(width, height, 'germany')
    createIntCharts(width, height, 'italy')
    createIntCharts(width, height, 'us')
    createIntCharts(width, height, 'col', [{ 'label': 'INS', 'source': 'https://www.ins.gov.co/Paginas/Inicio.aspx' }])

    createFINDChart(width, height)
    createMap(width, width)
    createPoliticoDptos(
        windowWidth > 500 ? width * 0.37 : width, 
        windowWidth > 500 ? width * 0.3 : width
    )
}

const loadDataInt = _ => {
    return new Promise(async resolve => {
        let data = await d3.csv('data/data_million_confirmed_cases_countries.csv')
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
        resolve(data)
    })
}

const loadDataCol = _ => {
    return new Promise(async resolve => {
        let data = await d3.csv('data/datos_nal.csv')
        data = await data.map(d => {
            d[COLS_NAL['date']] = new Date(d[COLS_NAL['date']])
            d[COLS_NAL['offTests']] = +d[COLS_NAL['offTests']]
            d[COLS_NAL['cases']] = +d[COLS_NAL['cases']]
            d[COLS_NAL['discarded']] = +d[COLS_NAL['discarded']]
            d[COLS_NAL['newTests']] = +d[COLS_NAL['newTests']]
            d[COLS_NAL['testsIncreasingRate']] = +d[COLS_NAL['testsIncreasingRate']]
            d[COLS_NAL['testsFIND']] = +d[COLS_NAL['testsFIND']]
            return d
        })
        data = data.sort((a, b) => new Date(a[COLS_NAL['date']]) - new Date(b[COLS_NAL['date']]))
        resolve(data)
    })
}

const loadDataMilestones = _ => {
    return new Promise(async resolve => {
        let data = await d3.csv('data/data_milestones.csv')
        data = await data.map(d => {
            d[COLS_MS['date']] = new Date(d[COLS_MS['date']])
            return d
        })
        data = data.sort((a, b) => new Date(a[COLS_NAL['date']]) - new Date(b[COLS_NAL['date']]))
        resolve(data)
    })
}

const createEmpty = (svg, x, y, width, height) => {
    svg.append('rect')
        .attr('class', '_blanks')
        .attr('x', x - 4)
        .attr('y', y)
        .attr('width', width + 12)
        .attr('height', height)
        .style('fill', '#fff3e0')
        .style('opacity', '0.6')
}

const createChart = async (w, h) => {
    let margin = { top: 40, right: 5, bottom: h * 0.06, left: 50 }

    let width = w
    let height = h - margin.top - margin.bottom

    let svg = d3.select('#chartIntro').select('svg')
        .attr('width', w + margin.left + margin.right)
        .attr('height', h + margin.top + margin.bottom)

    let x = d3.scaleLinear().range([margin.left, width])
        .domain([1, d3.max(await dataInt.map(d => d[COLS_INTNAL['day']])) + 1])

    let y = d3.scaleLog()
        .range([height, margin.top])
        .domain([0.71, d3.max(dataInt.map(d => Math.max(d[COLS_INTNAL['italy']], d[COLS_INTNAL['germany']], d[COLS_INTNAL['southkorea']], d[COLS_INTNAL['us']], d[COLS_INTNAL['col']])))])

    let xAxis = d3.axisBottom(x)
    let yAxis = d3.axisLeft(y).tickFormat(d => d3.format('2,d')(d))

    svg.append('text')
        .attr('x', 10)
        .attr('y', 12)
        .html(`Casos confirmados por millón de habitantes a partir del día con 200`)

    svg.append('text')
        .attr('x', 10)
        .attr('y', 32)
        .html(`casos confirmados en <tspan style="fill: ${palette[2]}">Italia</tspan>, <tspan style="fill: ${palette[3]}">EE.UU</tspan>, <tspan style="fill: ${palette[5]}">Alemania</tspan>, <tspan style="fill: ${palette[6]}">Corea del Sur</tspan> y <tspan style="fill: ${palette[4]}">Colombia</tspan>`)

    svg.append('text')
        .attr('x', 10)
        .attr('y', height + margin.top - 5)
        .style('font-size', 13)
        .style('color', 'grey')
        .html(`Días a partir del día con 200 casos acumulados confirmados`)

    d3.select('#explanation_chart1')
        .attr('data-tooltip', createExplaination('million_confirmed_cases_countries'))

    let lineCols = Object.keys(COLS_INTNAL).filter(d => d !== 'day')
    for (let i = 0; i < lineCols.length; i++) {
        setTimeout(_ => {
            let col = lineCols[i]
            let line = d3.line()
                .x(d => x(d[COLS_INTNAL['day']]))
                .y(d => d[COLS_INTNAL[col]] === 0 ? 1 : y(d[COLS_INTNAL[col]]))

            svg.append('path')
                .data([dataInt.filter(d => d[COLS_INTNAL[col]] && d[COLS_INTNAL[col]] > 0)])
                .attr('class', 'intcases line')
                .style('stroke', palette[i + 2])
                .attr('d', line)

            svg.selectAll(`circle.intcases.${col}`)
                .data(dataInt.filter(d => d[COLS_INTNAL[col]] && d[COLS_INTNAL[col]] > 0))
                .enter().append('circle')
                .attr('class', `intcases ${col}`)
                .attr('cx', d => x(d[COLS_INTNAL['day']]))
                .attr('cy', d => y(d[COLS_INTNAL[col]]))
                .attr('r', 2)
                .style('fill', palette[i + 2])
                .append('title')
                .html(d => `${COUNTRIES[i]}, día ${d[COLS_INTNAL['day']]}: ${d3.format(',d')(d[COLS_INTNAL[col]])} casos confirmados`)

        }, i * 500)
    }

    svg.append('text')
        .attr('x', 10)
        .attr('y', height + margin.top + 10)
        .attr('class', 'sources')
        .html(`Fuentes: <a href="https://ourworldindata.org/coronavirus" target="_blank">Our World in Data</a>, <a href="https://www.ins.gov.co/Paginas/Inicio.aspx" target="_blank">INS</a>`)

    svg.append('text')
        .attr('x', 10)
        .attr('y', height + margin.top + 30)
        .attr('class', 'sources')
        .html(`Nota: Esta gráfica se muestra en escala logarítmica.`)

    svg.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${h - margin.bottom - margin.top})`)
        .call(xAxis).selectAll('text')

    svg.append('g')
        .attr('class', 'y-axis')
        .attr('transform', `translate(${margin.left},0)`)
        .call(yAxis)

    svg.selectAll('.y-axis').selectAll('.tick').selectAll('text')
        .each(function () {
            let char = `${d3.select(this).html()}`.substring(0, 1)
            if (char !== '1' && char !== '5')
                d3.select(this).remove()
        })

}

const createNationalChart = async (w, h) => {
    let margin = { top: 40, right: 5, bottom: h * 0.06, left: 50 }

    let width = w
    let height = h - margin.top - margin.bottom

    let svg = d3.select('#chartIntro2').select('svg')
        .attr('width', w + margin.left + margin.right)
        .attr('height', h + margin.top + margin.bottom)

    let lastDay = new Date(d3.max(await dataCol.map(d => d[COLS_NAL['date']])).getTime())
    lastDay.setDate(lastDay.getDate() + 1)

    let x = d3.scaleTime().range([margin.left, width])
        .domain([firstDay, lastDay])

    let y = d3.scaleLinear()
        .range([height, margin.top])
        .domain([0, d3.max(await dataCol.map(d => d[COLS_NAL['offTests']])) + 10])

    let xAxis = d3.axisBottom(x).tickFormat(d => d3.timeFormat('%d %b')(d))
    let yAxis = d3.axisLeft(y)

    svg.append('text')
        .attr('id', 'chartIntroTitle_a')
        .attr('x', 10)
        .attr('y', 12)
        .html(`<tspan style="fill: ${ORANGE}">Pruebas procesadas</tspan>, <tspan style="fill: ${palette[0]}">casos confirmados</tspan>, <tspan style="fill: ${palette[1]}">casos descartados</tspan>`)

    svg.append('text')
        .attr('id', 'chartIntroTitle_b')
        .attr('x', 10)
        .attr('y', 32)
        .html(`<tspan style="fill: ${palette[7]}">pruebas procesadas reportadas por FIND</tspan> acumuladas`)

    svg.append('text')
        .attr('id', 'sources_1')
        .attr('x', 10)
        .attr('y', height + margin.top + 10)
        .attr('class', 'sources')
        .html(`Fuentes: <a href="https://www.ins.gov.co/Paginas/Inicio.aspx" target="_blank">INS</a>, <a href="https://ideascol.github.io/" target="_blank">Cálculos nuestros</a>, <a href="https://finddx.shinyapps.io/FIND_Cov_19_Tracker/" target="_blank">FIND</a>`)

    svg.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${h - margin.bottom - margin.top})`)
        .call(xAxis).selectAll('text')

    svg.append('g')
        .attr('class', 'y-axis')
        .attr('transform', `translate(${margin.left},0)`)
        .call(yAxis)

    svg.selectAll('.intcases').style('visibility', 'hidden')

    svg.select('.x-axis')
        .call(xAxis).selectAll('text')
        .style('text-anchor', 'end')
        .attr('transform', 'rotate(320)')

    svg.select('.y-axis')
        .call(yAxis)

    svg.selectAll('rect._offTests').remove()
    svg.selectAll('rect._offTests').data(dataCol)
        .enter().append('rect')
        .attr('class', '_offTests')
        .attr('x', d => x(d[COLS_NAL['date']]))
        .attr('y', height)
        .attr('width', windowWidth > 500 ? 5 : 2)
        .attr('height', 0)
        .style('fill', ORANGE)
        .append('title')
        .html(d => `${d[COLS_NAL['date']].toLocaleDateString()}: ${d3.format(',d')(d[COLS_NAL['offTests']])} pruebas`)

    svg.selectAll('rect._offTests')
        .attr('y', d => y(d[COLS_NAL['offTests']]))
        .attr('height', d => height - y(d[COLS_NAL['offTests']]))

    const createMilestones = _ => {
        for (let i = 0; i < dataMilestones.length; i++) {
            setTimeout(_ => {
                let news = dataMilestones[i]

                svg.append('line')
                    .attr('stroke', 'grey')
                    .attr('opacity', '0.4')
                    .attr('class', '_milestones')
                    .attr('stroke-width', 2)
                    .attr('x1', x(news[COLS_MS['date']]) + 4)
                    .attr('y1', height)
                    .attr('x2', x(news[COLS_MS['date']]) + 4)
                    .attr('y2', height)
                    .attr('y2', height + margin.top + 30 + 20 * i)

                svg.append('text')
                    .attr('class', 'sources _milestones')
                    .attr('x', x(news[COLS_MS['date']]))
                    .attr('y', height + margin.top + 30 + 20 * i)
                    .style('text-anchor', 'end')
                    .text(news[COLS_MS['name']])

                svg.append('circle')
                    .attr('class', '_milestones')
                    .attr('cx', x(news[COLS_MS['date']]) + 4)
                    .attr('cy', height)
                    .attr('r', 4)
                    .attr('fill', 'grey')
                    .append('title')
                    .html(news[COLS_MS['name']])

            }, i * 500)
        }
    }

    const createAllEmpties = _ => {
        svg.append('foreignObject')
            .attr('class', '_blanks')
            .attr('x', margin.left)
            .attr('y', height + 60)
            .attr('width', 125)
            .attr('height', 60)
            .style('background', 'rgba(255, 243, 224, 0.6)')
            .append('xhtml:p')
            .attr('class', '_blanks grey-text darken-1')
            .style('font-size', '10px')
            .html(['No hay datos', 'de pruebas procesadas', 'a la fecha'].join(`</br>`))

        createEmpty(svg, x(dataCol[22][COLS_NAL['date']]), margin.top, x(dataCol[22][COLS_NAL['date']]) - x(dataCol[22][COLS_NAL['date']]), height - margin.top)

        createEmpty(svg, x(dataCol[24][COLS_NAL['date']]), margin.top, x(dataCol[29][COLS_NAL['date']]) - x(dataCol[24][COLS_NAL['date']]), height - margin.top)

        createEmpty(svg, x(dataCol[31][COLS_NAL['date']]), margin.top, x(dataCol[36][COLS_NAL['date']]) - x(dataCol[31][COLS_NAL['date']]), height - margin.top)
    }

    const reDimension = col => {
        svg.selectAll(`rect._${col}`)
            .attr('y', d => y(d[COLS_NAL[col]]))
            .attr('height', d => height - y(d[COLS_NAL[col]]))
    }

    const addCases = _ => {
        svg.selectAll('rect._cases')
            .data(dataCol)
            .enter().append('rect')
            .attr('class', '_cases')
            .attr('x', d => x(d[COLS_NAL['date']]) + (windowWidth > 500 ? 6 : 2.5))
            .attr('y', height)
            .attr('width', windowWidth > 500 ? 5 : 2)
            .attr('height', 0)
            .style('fill', palette[0])
            .append('title')
            .html(d => `${d[COLS_NAL['date']].toLocaleDateString()}: ${d3.format(',d')(d[COLS_NAL['cases']])} casos confirmados`)

        reDimension('cases')
    }

    const addDiscarded = async _ => {
        y.domain([0, d3.max(await dataCol.map(d => d[COLS_NAL['cases']] + d[COLS_NAL['discarded']])) + 100])
        svg.select('.y-axis')
            .call(yAxis)

        reDimension('offTests')
        reDimension('cases')

        svg.selectAll('rect._discarded')
            .data(dataCol)
            .enter().append('rect')
            .attr('class', '_discarded')
            .attr('x', d => x(d[COLS_NAL['date']]) + (windowWidth > 500 ? 6 : 2.5))
            .attr('y', d => y(d[COLS_NAL['cases']]))
            .attr('width', windowWidth > 500 ? 5 : 2)
            .attr('height', 0)
            .style('fill', palette[1])
            .append('title')
            .html(d => `${d[COLS_NAL['date']].toLocaleDateString()}: ${d3.format(',d')(d[COLS_NAL['discarded']])} casos descartados`)

        svg.selectAll('rect._discarded')
            .attr('y', d => y(d[COLS_NAL['cases']] + d[COLS_NAL['discarded']]))
            .attr('height', d => height - y(d[COLS_NAL['discarded']]))

    }

    // createAllEmpties()

    d3.select('#explanation_chart1b')
        .attr('data-tooltip', createExplaination('testsNcasesNdiscardedNfindCol'))

    addCases()

    addDiscarded()

    createMilestones()

    setTimeout(_ =>
        svg.selectAll('.tests-find')
            .data(dataCol.filter(d => d[COLS_NAL['testsFIND']] > 0))
            .enter().append('rect')
            .attr('class', 'tests-find')
            .attr('x', d => x(d[COLS_NAL['date']]))
            .attr('y', d => y(d[COLS_NAL['testsFIND']]) - 1.5)
            .attr('width', windowWidth > 500 ? 12 : 6)
            .attr('height', 3)
            .attr('fill', palette[7])
            .attr('stroke', 'white')
            .append('title')
            .html(d => `${d[COLS_NAL['date']].toLocaleDateString()}: ${d3.format('0,d')(d[COLS_NAL['testsFIND']])} pruebas procesadas reportadas por FIND`),
        1000)

}

const createIncreaseChart = async (w, h) => {
    let margin = { top: 30, right: 5, bottom: 9, left: 60 }

    let width = w
    let height = h - margin.top - margin.bottom

    let svg = d3.select(`#newTests`)
        .attr('width', w + margin.left + margin.right)
        .attr('height', h + margin.top + margin.bottom)


    let lastDay = new Date(d3.max(await dataCol.map(d => d[COLS_NAL['date']])).getTime())
    lastDay.setDate(lastDay.getDate() + 1)

    var x = d3.scaleTime().range([margin.left, width])
        .domain([firstDay, lastDay])

    var y = d3.scaleLinear().range([height, margin.top])
        .domain([0, d3.max(dataCol.map(d => d[COLS_NAL['newTests']])) + 100])

    let xAxis = d3.axisBottom(x).tickFormat(d => d3.timeFormat('%d %b')(d))
    let yAxis = d3.axisLeft(y).ticks(5)

    let rects = svg.selectAll(`.increase.newTests`)
        .data(dataCol)

    rects
        .enter().append('rect')
        .attr('class', 'increase newTests')
        .merge(rects)
        .attr('x', d => x(d[COLS_NAL['date']]))
        .attr('y', d => y(d[COLS_NAL['newTests']]))
        .attr('width', windowWidth > 500 ? 8 : 4)
        .attr('height', d => height - y(d[COLS_NAL['newTests']]))
        .attr('fill', palette[7])
        .append('title')
        .html(d => `${d[COLS_NAL['date']].toLocaleDateString()}: ${d3.format('0,d')(d[COLS_NAL['newTests']])} nuevas pruebas procesadas, ${d[COLS_NAL['testsIncreasingRate']] > 0 ? `${d[COLS_NAL['testsIncreasingRate']]} más que el día anterior` : `${Math.abs(d[COLS_NAL['testsIncreasingRate']])} menos que el día anterior`}`)

    svg.selectAll('.increase.increaseTests')
        .data(dataCol)
        .enter().append('rect')
        .attr('class', 'increase increaseTests')
        .attr('x', d => x(d[COLS_NAL['date']]))
        .attr('y', d => d[COLS_NAL['testsIncreasingRate']] < 0 ? y(d[COLS_NAL['newTests']] + Math.abs(d[COLS_NAL['testsIncreasingRate']])) : height)
        .attr('width', windowWidth > 500 ? 8 : 4)
        .attr('height', d => d[COLS_NAL['testsIncreasingRate']] < 0 ? height - y(Math.abs(d[COLS_NAL['testsIncreasingRate']])) : 0)
        .attr('fill', 'red')
        .style('opacity', '0.3')
        .append('title')
        .html(d => `${d[COLS_NAL['date']].toLocaleDateString()}: ${d3.format('0,d')(d[COLS_NAL['newTests']])} nuevas pruebas procesadas, ${d[COLS_NAL['testsIncreasingRate']] > 0 ? `${d[COLS_NAL['testsIncreasingRate']]} más que el día anterior` : `${Math.abs(d[COLS_NAL['testsIncreasingRate']])} menos que el día anterior`}`)

    svg.selectAll('.increase.daysNegative')
        .data(dataCol)
        .enter().append('circle')
        .attr('class', 'increase daysNegative')
        .attr('cx', d => x(d[COLS_NAL['date']]) + (windowWidth > 500 ? 4 : 2))
        .attr('cy', height)
        .attr('r', d => d[COLS_NAL['testsIncreasingRate']] < 0 ? windowWidth > 500 ? 4 : 2 : 0)
        .attr('fill', 'red')
        .append('title')
        .html(d => `${d[COLS_NAL['date']].toLocaleDateString()}: ${d3.format('0,d')(d[COLS_NAL['newTests']])} nuevas pruebas procesadas, ${d[COLS_NAL['testsIncreasingRate']] > 0 ? `${d[COLS_NAL['testsIncreasingRate']]} más que el día anterior` : `${Math.abs(d[COLS_NAL['testsIncreasingRate']])} menos que el día anterior`}`)

    svg.append('circle')
        .attr('cx', 16)
        .attr('cy', 22)
        .attr('r', 4)
        .attr('fill', 'red')

    svg.append('text')
        .attr('x', 10)
        .attr('y', 12)
        .attr('r', 4)
        .html(`</tspan><tspan style="fill:${palette[7]}">Pruebas procesadas diarias</tspan>, <tspan style="fill:rgba(256,0,0,0.6)">diferencia con respecto al día anterior`)

    svg.append('text')
        .attr('x', 25)
        .attr('y', 27)
        .attr('r', 4)
        .html(`<tspan style="fill:red">días con diferencia negativa</tspan>`)

    svg.append('text')
        .attr('id', 'sources_2')
        .attr('x', 10)
        .attr('y', h + margin.bottom)
        .attr('class', 'sources')
        .html(`Fuentes: <a href="https://www.ins.gov.co/Paginas/Inicio.aspx" target="_blank">INS</a>, <a href="https://ideascol.github.io/" target="_blank">Cálculos nuestros</a>`)

    svg.append('g')
        .attr('transform', `translate(0,${h - margin.bottom - margin.top})`)
        .call(xAxis).selectAll('text')
        .style('text-anchor', 'end')
        .attr('transform', 'rotate(320)')

    svg.append('g')
        .attr('class', 'y-axis')
        .attr('transform', `translate(${margin.left},0)`)
        .call(yAxis)

    d3.select('#explanation_chart2')
        .attr('data-tooltip', createExplaination('testsIncrease'))
}

const createSummaryChart = async (w, h) => {
    let margin = { top: 40, right: 5, bottom: 10, left: 80 }

    let width = w
    let height = h - margin.top - margin.bottom

    let svg = d3.select('#summaryChart').select('svg')
        .attr('width', w + margin.left + margin.right)
        .attr('height', h + margin.top + margin.bottom)

    let data = await d3.csv('data/data_200day_tests_countries.csv')
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
        .attr('x', 10)
        .attr('y', 15)
        .html(`Pruebas procesadas a partir del día con 200 casos confirmados en `)

    svg.append('text')
        .attr('x', 10)
        .attr('y', 30)
        .html(`<tspan style="fill: ${palette[2]}">Italia</tspan>, <tspan style="fill: ${palette[3]}">EE.UU</tspan>, <tspan style="fill: ${palette[5]}">Alemania</tspan>, <tspan style="fill: ${palette[6]}">Corea del Sur</tspan> y <tspan style="fill: ${palette[4]}">Colombia</tspan>`)

    svg.append('text')
        .attr('x', 10)
        .attr('y', h - 10)
        .style('font-size', 13)
        .style('color', 'grey')
        .html(`Días a partir del día con 200 casos acumulados confirmados`)

    updateLines(data)

    svg.append('text')
        .attr('x', 10)
        .attr('y', h + margin.bottom)
        .attr('class', 'sources')
        .html(`Fuentes: <a href="https://ourworldindata.org/coronavirus" target="_blank">Our World in Data</a>, <a href="https://www.ins.gov.co/Paginas/Inicio.aspx" target="_blank">INS</a>`)

    svg.append('g')
        .attr('transform', `translate(0,${h - margin.bottom - margin.top})`)
        .call(xAxis).selectAll('text')

    svg.append('g')
        .attr('class', 'y-axis')
        .attr('transform', `translate(${margin.left},0)`)
        .call(yAxis)

    d3.select('#explanation_chart3')
        .attr('data-tooltip', createExplaination('200day_tests_countries'))
}

const createSummaryChart2 = async (w, h) => {
    let margin = { top: 40, right: 5, bottom: 10, left: 80 }

    let width = w
    let height = h - margin.top - margin.bottom

    let svg = d3.select('#summaryChartb').select('svg')
        .attr('width', w + margin.left + margin.right)
        .attr('height', h + margin.top + margin.bottom)

    let dataRate = await d3.csv('data/data_million_tests_countries.csv')
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
        .domain([0, d3.max(await dataRate.map(d => d[COLS_TESTS['day']])) + 1])

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
        .html(`Pruebas procesadas a partir del día con 200 casos confirmados en `)

    svg.append('text')
        .attr('id', 'chart3Title_b')
        .attr('x', 10)
        .attr('y', 30)
        .html(`<tspan style="fill: ${palette[2]}">Italia</tspan>, <tspan style="fill: ${palette[3]}">EE.UU</tspan>, <tspan style="fill: ${palette[5]}">Alemania</tspan>, <tspan style="fill: ${palette[6]}">Corea del Sur</tspan> y <tspan style="fill: ${palette[4]}">Colombia</tspan>`)

    svg.append('text')
        .attr('id', 'chart3xAxis')
        .attr('x', 10)
        .attr('y', h - 10)
        .style('font-size', 13)
        .style('color', 'grey')
        .html(`Días a partir del día con 200 casos acumulados confirmados`)

    svg.append('text')
        .attr('id', 'sources_3')
        .attr('x', 10)
        .attr('y', h + margin.bottom)
        .attr('class', 'sources')
        .html(`Fuentes: <a href="https://ourworldindata.org/coronavirus" target="_blank">Our World in Data</a>, <a href="https://www.ins.gov.co/Paginas/Inicio.aspx" target="_blank">INS</a>`)

    svg.append('g')
        .attr('transform', `translate(0,${h - margin.bottom - margin.top})`)
        .call(xAxis).selectAll('text')

    svg.append('g')
        .attr('class', 'y-axis')
        .attr('transform', `translate(${margin.left},0)`)
        .call(yAxis)

    d3.select('#explanation_chart3')
        .attr('data-tooltip', createExplaination('200day_tests_countries'))

    updateLines(dataRate)

    d3.select('#sources_3')
        .html(`Fuentes: <a href="https://ourworldindata.org/coronavirus" target="_blank">Our World in Data</a>, <a href="https://www.ins.gov.co/Paginas/Inicio.aspx" target="_blank">INS</a>, <a href="https://www.bancomundial.org/" target="_blank">Banco Mundial</a>, <a href="https://www.dane.gov.co/index.php/en/" target="_blank">Dane</a>`)

    d3.select('#chart3Title_a')
        .html(`Pruebas procesadas <tspan font-weight="bold">por millón de habitantes</tspan> a partir del día con 200`)

    d3.select('#chart3Title_b')
        .html(`casos confirmados en <tspan style="fill: ${palette[2]}">Italia</tspan>, <tspan style="fill: ${palette[3]}">EE.UU</tspan>, <tspan style="fill: ${palette[5]}">Alemania</tspan>, <tspan style="fill: ${palette[6]}">Corea del Sur</tspan> y <tspan style="fill: ${palette[4]}">Colombia</tspan>`)

    d3.select('#explanation_chart3b')
        .attr('data-tooltip', createExplaination('million_tests_countries'))

}

const createIntCharts = async (w, h, dataset, sources) => {
    let margin = { top: 20, right: 5, bottom: 15, left: 35 }

    let width = w
    let height = h - margin.top - margin.bottom
    let data = []
    if (dataset.data)
        data = [...dataset.data]
    else {
        data = await d3.csv(`data/data_${dataset}.csv`)
        data = await data.map(d => {
            d[COLS_POLITIKO['day']] = new Date(d[COLS_POLITIKO['day']])
            d[COLS_POLITIKO['cases']] = +d[COLS_POLITIKO['cases']]
            d[COLS_POLITIKO['tests']] = +d[COLS_POLITIKO['tests']]
            d[COLS_POLITIKO['deaths']] = +d[COLS_POLITIKO['deaths']]
            return d
        })
    }

    dataset = dataset.chart ? dataset.chart : dataset

    let svg = d3.select(`#chart_${dataset}`).select('svg')
        .attr('width', w + margin.left + margin.right)
        .attr('height', h + margin.top + margin.bottom)

    data = data.sort((a, b) => a[COLS_POLITIKO['day']] - b[COLS_POLITIKO['day']])
    var x = d3.scaleTime().range([margin.left, width])
        .domain(d3.extent(data, d => d[COLS_POLITIKO['day']]))
    var y = d3.scaleLog().range([height, margin.top])
        .domain([1, d3.max(data.map(d => d[COLS_POLITIKO['tests']])) + 10])

    let xAxis = d3.axisBottom(x).tickFormat(d => d3.timeFormat('%d %b')(d))
    let yAxis = d3.axisLeft(y).tickFormat(d => d3.format(',d')(d))

    Object.keys(COLS_POLITIKO).filter(d => d !== 'day').map((col, i) => {
        let area = d3.area()
            .x(d => x(d[COLS_POLITIKO['day']]))
            .y0(y(1))
            .y1(d => d[COLS_POLITIKO[col]] === 0 ? 1 : y(d[COLS_POLITIKO[col]]))

        let paths = svg.selectAll(`.area.politiko.${col}`)
            .data([data.filter(d => d[COLS_POLITIKO[col]] && d[COLS_POLITIKO[col]] > 0)])

        paths
            .enter().append('path')
            .attr('class', `politiko ${col} area`)
            .attr('d', area)
            .attr('fill', d3.color(palette[i + 8]))
            .attr('fill-opacity', 0.3)
            .attr('stroke', 'none')

        let circles = svg.selectAll(`circle.politiko.${col}`)
            .data(data.filter(d => d[COLS_POLITIKO[col]] && d[COLS_POLITIKO[col]] > 0))

        circles.enter().append('circle')
            .attr('class', `politiko ${col}`)
            .attr('cx', d => x(d[COLS_POLITIKO['day']]))
            .attr('cy', d => y(d[COLS_POLITIKO[col]]))
            .attr('r', 3)
            .style('fill', d3.color(palette[i + 8]))
            .append('title')
            .attr('class', `politiko title ${col}`)
            .html(d => `${d[COLS_POLITIKO['day']].toLocaleDateString()}: ${d3.format(',d')(d[COLS_POLITIKO[col]])} ${POLITIKO_LABELS[i]}`)
    })

    d3.select(`#explanation_chart_${dataset}`)
        .attr('data-tooltip', createExplaination('intExamples'))

    svg.append('text')
        .attr('x', 5)
        .attr('y', 10)
        .html(`<tspan fill="${palette[8]}">Pruebas procesadas</tspan>, <tspan fill="${palette[9]}">casos confirmados</tspan> y <tspan fill="${palette[10]}">muertes</tspan>`)

    svg.append('text')
        .attr('x', 5)
        .attr('y', h + margin.bottom - 2)
        .attr('class', 'sources')
        .html(`Fuentes: ${sources ? sources.map(d => `<a href="${d.source}" target="_blank">${d.label}</a>`).join(', ') : '<a href="https://ourworldindata.org/coronavirus" target="_blank">Our World in Data</a>'}`)

    svg.append('text')
        .attr('x', 5)
        .attr('y', h + margin.bottom + 10)
        .attr('class', 'sources')
        .html(`Nota: Esta gráfica se muestra en escala logarítmica.`)

    svg.append('g')
        .attr('transform', `translate(0,${h - margin.bottom - margin.top})`)
        .call(xAxis).selectAll('text')
        .style('text-anchor', 'end')
        .attr('transform', 'rotate(320)')

    svg.append('g')
        .attr('class', 'y-axis')
        .attr('transform', `translate(${margin.left},0)`)
        .call(yAxis)

    svg.selectAll('.y-axis').selectAll('.tick').selectAll('text')
        .each(function () {
            let char = `${d3.select(this).html()}`.substring(0, 1)
            if (char !== '1' && char !== '5')
                d3.select(this).remove()
        })

}

const createFINDChart = async (w, h) => {
    let margin = { top: 20, right: 0, bottom: 20, left: 50 }

    let width = w
    let height = h - margin.top - margin.bottom

    let svg = d3.select('#findDataChart')
        .attr('width', w + margin.left + margin.right)
        .attr('height', (h + margin.top + margin.bottom) * 0.85)

    let lastDay = new Date(d3.max(await dataCol.map(d => d[COLS_NAL['date']])).getTime())
    lastDay.setDate(lastDay.getDate() + 1)

    let x = d3.scaleTime().range([margin.left, width])
        .domain([firstDay, lastDay])

    let y = d3.scaleLinear()
        .range([height, margin.top])
        .domain([0, d3.max(dataCol.map(d => Math.max(d[COLS_NAL['offTests']], d[COLS_NAL['cases']] + d[COLS_NAL['discarded']], d[COLS_NAL['testsFIND']]) + 100))])

    let xAxis = d3.axisBottom(x)
    let yAxis = d3.axisLeft(y)

    svg.selectAll('rect._offTests')
        .data(dataCol)
        .enter().append('rect')
        .attr('class', '_offTests')
        .attr('x', d => x(d[COLS_NAL['date']]))
        .attr('y', d => y(d[COLS_NAL['offTests']]))
        .attr('width', windowWidth > 500 ? 5 : 2)
        .attr('height', d => height - y(d[COLS_NAL['offTests']]))
        .style('fill', ORANGE)
        .append('title')
        .html(d => `${d[COLS_NAL['date']].toLocaleDateString()}: ${d3.format(',d')(d[COLS_NAL['offTests']])} pruebas procesadas`)

    svg.selectAll('rect._find')
        .data(dataCol)
        .enter().append('rect')
        .attr('class', '_find')
        .attr('x', d => x(d[COLS_NAL['date']]) + (windowWidth > 500 ? 6 : 2.5))
        .attr('y', d => y(d[COLS_NAL['testsFIND']]))
        .attr('width', windowWidth > 500 ? 5 : 2)
        .attr('height', d => height - y(d[COLS_NAL['testsFIND']]))
        .style('fill', palette[7])
        .append('title')
        .html(d => `${d[COLS_NAL['date']].toLocaleDateString()}: ${d3.format(',d')(d[COLS_NAL['testsFIND']])} pruebas reportadas por FIND`)

    svg.append('text')
        .attr('x', 10)
        .attr('y', h - margin.bottom * 0.5)
        .attr('class', 'sources')
        .html(`Fuentes: <a href="https://www.ins.gov.co/Paginas/Inicio.aspx" target="_blank">INS</a>, <a href="https://finddx.shinyapps.io/FIND_Cov_19_Tracker/" target="_blank">FIND</a>`)

    svg.append('text')
        .attr('x', 10)
        .attr('y', margin.top * .8)
        .html(`<tspan style="fill: ${ORANGE}">Pruebas procesadas</tspan> y <tspan style="fill: ${palette[7]}">pruebas procesadas reportadas por FIND</tspan> acumuladas`)

    svg.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${h - margin.bottom - margin.top})`)
        .call(xAxis).selectAll('text')

    svg.append('g')
        .attr('class', 'y-axis')
        .attr('transform', `translate(${margin.left},0)`)
        .call(yAxis)

    let svg1 = d3.select('#findMarch22')
        .attr('width', w)
        .attr('height', 100)

    let y1 = d3.scaleLinear()
        .range([margin.left, width])
        .domain([0, dataCol[16][COLS_NAL['offTests']] + 1000])

    let yAxis1 = d3.axisBottom(y1)

    svg1.append('circle')
        .attr('cx', y1(dataCol[16][COLS_NAL['offTests']]))
        .attr('cy', 50)
        .attr('r', 5)
        .style('fill', ORANGE)
        .append('title')
        .html(`${d3.format('0,d')(dataCol[16][COLS_NAL['offTests']])} pruebas procesadas el 22 de marzo`)

    svg1.append('circle')
        .attr('cx', y1(dataCol[16][COLS_NAL['cases']] + dataCol[16][COLS_NAL['discarded']]))
        .attr('cy', 50)
        .attr('r', 5)
        .style('fill', palette[1])
        .append('title')
        .html(`${d3.format('0,d')(dataCol[16][COLS_NAL['cases']] + dataCol[16][COLS_NAL['discarded']])} casos confirmados mas descartados el 22 de marzo`)

    svg1.append('circle')
        .attr('cx', y1(dataCol[16][COLS_NAL['testsFIND']]))
        .attr('cy', 50)
        .attr('r', 5)
        .style('fill', palette[7])
        .append('title')
        .html(`${d3.format('0,d')(dataCol[16][COLS_NAL['testsFIND']])} pruebas reportadas por FIND el 22 de marzo`)

    svg1.append('text')
        .attr('x', 10)
        .attr('y', 100)
        .attr('class', 'sources')
        .html(`Fuentes: <a href="https://www.ins.gov.co/Paginas/Inicio.aspx" target="_blank">INS</a>, <a href="https://ideascol.github.io/" target="_blank">Cálculos nuestros</a>, <a href="https://finddx.shinyapps.io/FIND_Cov_19_Tracker/" target="_blank">FIND</a>`)

    svg1.append('text')
        .attr('x', 10)
        .attr('y', 11)
        .html(`<tspan style="fill: ${ORANGE}">Pruebas procesadas</tspan>, <tspan style="fill: ${palette[7]}">pruebas procesadas reportadas por FIND</tspan> y`)

    svg1.append('text')
        .attr('x', 10)
        .attr('y', 26)
        .html(`<tspan style="fill: ${palette[1]}">suma de casos confirmados mas descartados</tspan> acumulados al 22 de marzo`)

    svg1.append('g')
        .attr('class', 'y-axis')
        .attr('transform', `translate(0,70)`)
        .call(yAxis1)

    let svg2 = d3.select('#findMarch29')
        .attr('width', w + margin.left + margin.right)
        .attr('height', (h + margin.top + margin.bottom) * 0.85)

    let tmpData = [...dataCol].splice(22, 5)

    let x2 = d3.scaleTime().range([margin.left, width])
        .domain(d3.extent(tmpData, d => d[COLS_NAL['date']]))

    let y2 = d3.scaleLinear()
        .range([height, margin.top])
        .domain([0, d3.max(tmpData, d => d[COLS_NAL['cases']] + d[COLS_NAL['discarded']]) + 100])

    let xAxis2 = d3.axisBottom(x2).ticks(4).tickFormat(d => d3.timeFormat('%d %b')(d))
    let yAxis2 = d3.axisLeft(y2)

    svg2.selectAll('rect._find')
        .data(tmpData)
        .enter().append('rect')
        .attr('class', '_find')
        .attr('x', d => x2(d[COLS_NAL['date']]))
        .attr('y', d => y2(d[COLS_NAL['testsFIND']]))
        .attr('width', windowWidth > 500 ? 30 : 15)
        .attr('height', d => height - y2(d[COLS_NAL['testsFIND']]))
        .style('fill', palette[7])
        .append('title')
        .html(d => `${d[COLS_NAL['date']].toLocaleDateString()}: ${d3.format(',d')(d[COLS_NAL['testsFIND']])} pruebas reportadas por FIND`)

    svg2.selectAll('rect._ideascol')
        .data(tmpData)
        .enter().append('rect')
        .attr('class', '_ideascol')
        .attr('x', d => x2(d[COLS_NAL['date']]) + (windowWidth > 500 ? 34 : 16))
        .attr('y', d => y2(d[COLS_NAL['cases']] + d[COLS_NAL['discarded']]))
        .attr('width', windowWidth > 500 ? 30 : 15)
        .attr('height', d => height - y2(d[COLS_NAL['cases']] + d[COLS_NAL['discarded']]))
        .style('fill', palette[1])
        .append('title')
        .html(d => `${d[COLS_NAL['date']].toLocaleDateString()}: ${d3.format(',d')(d[COLS_NAL['cases']] + d[COLS_NAL['discarded']])} pruebas reportadas por FIND`)

    svg2.append('line')
        .attr('x1', x2(tmpData[1][COLS_NAL['date']]) + (windowWidth > 500 ? 16 : 7))
        .attr('y1', y2(tmpData[1][COLS_NAL['testsFIND']]))
        .attr('x2', x2(tmpData[2][COLS_NAL['date']]) + (windowWidth > 500 ? 44 : 22))
        .attr('y2', y2(tmpData[1][COLS_NAL['testsFIND']]))
        .style('stroke-width', 5)
        .style('stroke', palette[0])

    svg2.append('line')
        .attr('x1', x2(tmpData[2][COLS_NAL['date']]) + (windowWidth > 500 ? 20 : 10))
        .attr('y1', y2(tmpData[3][COLS_NAL['testsFIND']]))
        .attr('x2', x2(tmpData[3][COLS_NAL['date']]) + (windowWidth > 500 ? 44 : 22))
        .attr('y2', y2(tmpData[3][COLS_NAL['testsFIND']]))
        .style('stroke-width', 5)
        .style('stroke', palette[0])

    svg2.append('text')
        .attr('x', 10)
        .attr('y', margin.top * .8)
        .html(`<tspan style="fill: ${palette[7]}">Pruebas reportadas por FIND</tspan> y <tspan style="fill: ${palette[1]}">casos confirmados mas descartados </tspan> acumulados`)

    svg2.append('text')
        .attr('x', 10)
        .attr('y', h - margin.bottom * 0.5)
        .attr('class', 'sources')
        .html(`Fuentes: <a href="https://ideascol.github.io/" target="_blank">Cálculos nuestros</a>, <a href="https://finddx.shinyapps.io/FIND_Cov_19_Tracker/" target="_blank">FIND</a>`)

    svg2.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${h - margin.bottom - margin.top})`)
        .call(xAxis2).selectAll('text')

    svg2.append('g')
        .attr('class', 'y-axis')
        .attr('transform', `translate(${margin.left},0)`)
        .call(yAxis2)
}

const createMap = async (width, height) => {
    let projection = d3.geoMercator()
        .scale(windowWidth > 500 ? 1600 : 1000)
        .center([-74, 4.5])
        .translate([width / 2, height / 1.9])

    let path = d3.geoPath()
        .projection(projection)

    let mapData = await d3.json(colombiaGeoJson)
    let features = []
    let data = await d3.csv('data/data_dptos_cienmil.csv')
    await data.map(async row => {
        let feature = mapData.features.find(e => +e.properties.DPTO === +row[COLS_DMNTOS['code']])
        if (feature && feature.properties)
            features.push({ ...feature, properties: { values: row, ...feature.properties } })
    })

    let y = d3.scaleLog()
        .range([0, 10])
        .domain([1, d3.max(data, d => d[COLS_DMNTOS['tests']])])

    let svg = d3.select('#map').select('svg')
        .attr('width', width)
        .attr('height', height)

    let mapLayer = svg.append('g')

    console.log(mapData.features)

    mapLayer.append('path')
        .data(mapData.features)
        // .attr('d', path)
        // // .attr('vector-effect', 'non-scaling-stroke')
        // .style('fill', 'white')
        // .style('stroke', 'gray')

    // // mapLayer.selectAll('circle.tests')
    // //     .data(features)
    // //     .enter().append('circle')
    // //     .attr('class', 'tests')
    // //     .attr('r', d => y(d.properties.values[COLS_DMNTOS['tests']]))
    // //     .attr('transform', d =>
    // //         'translate(' + path.centroid(d) + ')'
    // //     )
    // //     .style('fill', d3.color(palette[8]))
    // //     .append('title')
    // //     .html(d => `${d.properties.values[COLS_DMNTOS['dpto']]} ${d3.format('0,d')(d.properties.values[COLS_DMNTOS['tests']] * d.properties.values[COLS_DMNTOS['population']] / 100000)} pruebas procesadas ${d3.format('0,d')(d.properties.values[COLS_DMNTOS['cases']] * d.properties.values[COLS_DMNTOS['population']] / 100000)} casos confirmados ${d3.format('0,d')(d.properties.values[COLS_DMNTOS['deaths']] * d.properties.values[COLS_DMNTOS['population']] / 100000)} muertes`)

    // // mapLayer.selectAll('circle.cases')
    // //     .data(features)
    // //     .enter().append('circle')
    // //     .attr('class', 'cases')
    // //     .attr('r', d => y(d.properties.values[COLS_DMNTOS['cases']]))
    // //     .attr('transform', d =>
    // //         'translate(' + path.centroid(d) + ')'
    // //     )
    // //     .style('fill', d3.color(palette[9]))
    // //     .append('title')
    // //     .html(d => `${d.properties.values[COLS_DMNTOS['dpto']]} ${d3.format('0,d')(d.properties.values[COLS_DMNTOS['tests']] * d.properties.values[COLS_DMNTOS['population']] / 100000)} pruebas procesadas ${d3.format('0,d')(d.properties.values[COLS_DMNTOS['cases']] * d.properties.values[COLS_DMNTOS['population']] / 100000)} casos confirmados ${d3.format('0,d')(d.properties.values[COLS_DMNTOS['deaths']] * d.properties.values[COLS_DMNTOS['population']] / 100000)} muertes`)

    // // mapLayer.selectAll('circle.deaths')
    // //     .data(features)
    // //     .enter().append('circle')
    // //     .attr('class', 'deaths')
    // //     .attr('r', d => y(d.properties.values[COLS_DMNTOS['deaths']]))
    // //     .attr('transform', d =>
    // //         'translate(' + path.centroid(d) + ')'
    // //     )
    // //     .style('fill', d3.color(palette[10]))
    // //     .append('title')
    // //     .html(d => `${d.properties.values[COLS_DMNTOS['dpto']]} ${d3.format('0,d')(d.properties.values[COLS_DMNTOS['tests']] * d.properties.values[COLS_DMNTOS['population']] / 100000)} pruebas procesadas ${d3.format('0,d')(d.properties.values[COLS_DMNTOS['cases']] * d.properties.values[COLS_DMNTOS['population']] / 100000)} casos confirmados ${d3.format('0,d')(d.properties.values[COLS_DMNTOS['deaths']] * d.properties.values[COLS_DMNTOS['population']] / 100000)} muertes`)

    // // d3.select('#explanation_chart_map')
    // //     .attr('data-tooltip', createExplaination('map'))

}

const createPoliticoDptos = async (w, h) => {
    let data = await d3.csv('data/data_dptos_trend.csv')

    let dptos = [...new Set(await data.map(d => `${d[COLS_DPTOS_TREND['code']]}###${d[COLS_DPTOS_TREND['dpto']]}`))]

    let divAll = d3.select('#dptos-politico')

    d3.select('#explanation_chart_dptos')
        .attr('data-tooltip', createExplaination('intExamples'))

    await dptos.map(async d => {

        let dpto = d.split('###')[0]

        let div = divAll.append('div')
            .attr('id', `chart_politico_${dpto}`)
            .attr('class', 'col m4 s12')

        div.append('div')
            .attr('class', 'row no-margin left-align')
            .append('span')
            .text(d.split('###')[1].length > 38 ? `${d.split('###')[1].slice(0, 38)} (...)` : d.split('###')[1])

        div.append('svg')

        let dataDpto = []
        await (data.filter(d => d[COLS_DPTOS_TREND['code']] === dpto)).map(d => {
            d[COLS_POLITIKO['day']] = new Date(d[COLS_DPTOS_TREND['date']])
            d[COLS_POLITIKO['tests']] = +d[COLS_DPTOS_TREND['tests']]
            d[COLS_POLITIKO['cases']] = +d[COLS_DPTOS_TREND['cases']]
            d[COLS_POLITIKO['deaths']] = +d[COLS_DPTOS_TREND['deaths']]
            dataDpto.push(d)
        })

        createIntCharts(w, h, { data: dataDpto, chart: `politico_${dpto}` }, [{ 'label': 'INS', 'source': 'https://www.ins.gov.co/Paginas/Inicio.aspx' }])
    })
}

initialize()