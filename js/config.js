const testData = 'data/Casos-02-abr-2020.csv'
const colombiaGeoJson = 'data/colombia.json'
const lastUpdate = new Date(document.lastModified)
const firstDay = new Date(2020, 02, 06)
const ORANGE = '#ff9800'
const SVG = 'chart'
const DOWN = 'down'
const UP = 'up'
const COUNTRIES = [
    'Italia',
    'EE.UU',
    'Colombia',
    'Alemania',
    'Corea del Sur'
]

const POLITIKO_LABELS = [
    'pruebas procesadas',
    'casos confirmados',
    'muertes'
]

// Tests data columns
const INT_EXAMPLES = [
    'southkorea',
    'germany'
]

// National data columns
const COLS_NAL = {
    'date': 'Fecha',
    'offTests': 'Pruebas realizadas',
    'cases': 'Casos Confirmados Totales',
    'discarded': 'Casos Descartados Totales'
}

// International data columns
const COLS_INTNAL = {
    'day': 'Day (200 total cases)',
    'italy': 'Italy',
    'us': 'United States',
    'col': 'Colombia',
    'germany': 'Germany',
    'southkorea': 'South Korea',
}

// Tests data columns
const COLS_TESTS = {
    'day': 'Day(200 confirmed cases)',
    'italy': 'Italy',
    'us': 'United States',
    'col': 'Colombia',
    'germany': 'Germany',
    'southkorea': 'South Korea',
}

// Politiko data columns
const COLS_POLITIKO = {
    'day': 'Date',
    'tests': 'Total Tests',
    'cases': 'Total Confirmed Cases',
    'deaths': 'Total deaths'
}

const palette = [
    'rgb(80,198,229)',
    'rgb(53,108,164)',
    'rgb(156,181,50)',
    'rgb(16,50,124)',
    '#F8AF3C',
    'black',
    'rgb(211,28,35)',
    '#331E36',
    '#69B3A2',
    '#994636'
]
