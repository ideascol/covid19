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
    'discarded': 'Casos Descartados Totales',
    'offNewTests': 'Nuevas pruebas realizadas',
    'calNewTests': 'Nuevas confirmados + descartados'
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

// Milestones data columns
const COLS_MS = {
    'date': 'Fecha',
    'offTests': 'Fuente',
    'href': 'Referencia',
    'name': 'Noticia'
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

const explainations = [
    {'title': 'Casos confirmados a partir del día con 200 casos confirmados en Italia, EE.UU, Alemania, Corea del Sur y Colombia', 'text': 'En esta gráfica encuentras el total de casos confirmados de cada país desde el día que cada país confirmó sus primeros 200 casos. Esto lo hacemos para poder hacer comparaciones, porque el virus no llegó a todos los países al mismo tiempo. Y tomamos como inicio 200 casos porque creemos que este es un momento en cual los gobiernos se toman en serio la gravedad del virus. Estas líneas siempre estarán en aumento (porque cada día hay nuevos casos).Lo que queremos es que estás líneas se aplanen eventualmente. Si estás en un computador, puedes acercar el cursor a los puntos sobre las líneas para observar el dato exacto de cada país.'},
    { 'title': 'Pruebas procesadas acumuladas', 'text': 'En esta gráfica encuentras las pruebas realizadas totales en barras de color naranja. Estas barras siempre serán más altas (porque cada día hay nuevas pruebas). Si estás en un computador, puedes acercar el cursor a las barras para observar el dato exacto de cada día.' },
    { 'title': 'Pruebas procesadas y casos confirmados acumulados', 'text': 'En esta gráfica encuentras las pruebas realizadas totales en barras de color naranja y los casos confirmados totales en barras de color azul. Estas barras siempre serán más altas (porque cada día hay nuevas pruebas y casos). Si estás en un computador, puedes acercar el cursor a las barras para observar el dato exacto de cada día.' },
    { 'title': 'Pruebas procesadas, casos confirmados y casos descartados acumulados', 'text': 'En esta gráfica ahora también encontrarás, encima de las barras de casos confirmados totales, los casos descartados totales en azul oscuro. Pusimos estas barras una sobre otra porque creemos que las barras completas son una buena aproximación del número total de pruebas procesadas.' },
    { 'title': 'Pruebas procesadas a partir del día con 200 casos confirmados en Italia, EE.UU, Alemania, Corea del Sur y Colombia', 'text': 'En esta gráfica encuentras el total de pruebas procesadas de cada país desde el día que cada país confirmó sus primeros 200 casos. Esto lo hacemos para poder hacer comparaciones, porque el virus no llegó a todos los países al mismo tiempo. Y tomamos como inicio 200 casos porque creemos que este es un momento en cual los gobiernos se toman en serio la gravedad del virus.  Estas líneas siempre estarán en aumento (porque cada día hay nuevas pruebas). Lo que queremos es que estás líneas suban más eventualmente. Si estás en un computador, puedes acercar el cursor a los puntos sobre las líneas para observar el dato exacto de cada país.' },
    { 'title': 'Pruebas procesadas por millón de habitantes a partir del día con 200 casos confirmados en Italia, EE.UU, Alemania, Corea del Sur y Colombia', 'text': 'En esta gráfica encuentras el total de pruebas procesadas de cada país por millón de habitantes desde el día que cada país confirmó sus primeros 200 casos. Esto lo hacemos para poder hacer comparaciones, porque no es lo mismo hacer mil pruebas en un país pequeño que en un país grande. Este es el mejor gráfico para compararnos en número de pruebas con respecto a los demás países.' },
    { 'title': '', 'text': 'En esta gráfica encuentras el total de pruebas procesadas en negro, el total de casos confirmados en verde y el total de muertes en rojo.' },
]