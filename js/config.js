const testData = 'data/Casos-02-abr-2020.csv'
const colombiaGeoJson = 'data/colombia.json'
const lastUpdate = (new Date() - new Date(document.lastModified)) / (1000 * 60 * 60 * 24)
const daysUp = Math.round(lastUpdate)
const hoursUp = Math.round(lastUpdate * 24) % 24
const minsUp = Math.round(lastUpdate * 24 * 60) % 60
const firstDay = new Date(2020, 02, 06)
const ORANGE = '#c06b84'
const SVG = 'chart'
const DOWN = 'down'
const UP = 'up'
const COUNTRIES = [
    'Italia',
    'EE.UU',
    'Colombia',
    'Alemania',
    'Corea del Sur',
    'Suecia'
]

const VAR_LABELS = {
    'tests': 'Pruebas procesadas',
    'confirmed_cases': 'Casos confirmados',
    'deaths': 'Muertes',
}

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
    'newTests': 'Pruebas procesadas diarias',
    'testsIncreasingRate': 'Incremento en pruebas procesadas diarias',
    'testsFIND': 'Pruebas procesadas FIND'
}

// International data columns
const COLS_INTNAL = {
    'day': 'Day(200 confirmed cases)',
    'italy': 'Italy',
    'us': 'United States',
    'col': 'Colombia',
    'germany': 'Germany',
    'southkorea': 'South Korea',
    'sweden': 'Sweden',
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
    'sweden': 'Sweden',
}

// Politiko data columns
const COLS_POLITIKO = {
    'day': 'Date',
    'tests': 'Total Tests',
    'cases': 'Total Confirmed Cases',
    'deaths': 'Total deaths'
}

// National data columns
const COLS_DMNTOS = {
    'dpto': 'departamento',
    'code': 'codigo',
    'population': 'poblacion',
    'tests': 'pruebas_c',
    'cases': 'casos_confirmados_c',
    'deaths': 'casos_fallecido_c'
}

// National data columns
const COLS_DPTOS_TREND = {
    'date': 'fecha',
    'dpto': 'departamento',
    'code': 'codigo',
    'tests': 'pruebas',
    'cases': 'casos_confirmados',
    'deaths': 'casos_fallecido'
}

const palette = [
    '#f3a5a5',
    '#93abd7',
    '#66c2a5',
    '#3288bd',
    '#fee08b',
    '#828282',
    '#f46d43',
    'rgb(89, 53, 95)',
    'rgba(249, 208, 87, 0.7)',
    '#69B3A2',
    '#994636'
]

const explainations = {
    'million_confirmed_cases_countries': { 'title': 'Casos confirmados por millón de habitantes a partir del día con 200 casos confirmados en Italia, EE.UU, Alemania, Corea del Sur y Colombia', 'text': 'En esta gráfica encuentras el total de casos confirmados por millón de habitantes desde el día que cada país confirmó sus primeros 200 casos. Esto lo hacemos para poder hacer comparaciones, porque el virus no llegó a todos los países al mismo tiempo y no es lo mismo tener mil casos confirmados en un país pequeño que en un país grande. Tomamos como inicio 200 casos porque hemos visto que es un estándar utilizado mundialmente y que este es un momento en cual los gobiernos se toman en serio la gravedad del virus. Las líneas siempre estarán en aumento (porque cada día hay nuevos casos) y lo que queremos es que se aplanen eventualmente. Si estás en un computador, puedes acercar el cursor a los puntos sobre las líneas para observar el dato exacto de cada país. Esta gráfica está en términos logarítmicos.' },
    'testsCol': { 'title': 'Pruebas procesadas acumuladas', 'text': 'En esta gráfica encuentras las pruebas realizadas totales en barras de color fucsia. Estas barras siempre estarán creciendo (porque cada día hay nuevas pruebas). Las zonas de color naranja pastel indican que en esas fechas no hay datos oficiales reportados. Si estás en un computador, puedes acercar el cursor a las barras para observar el dato exacto de cada día.' },
    'testsNcasesCol': { 'title': 'Pruebas procesadas y casos confirmados acumulados', 'text': 'En esta gráfica encuentras las pruebas realizadas totales en barras de color fucsia y los casos confirmados totales en barras de color rosado. Estas barras siempre estarán creciendo (porque cada día hay nuevas pruebas y casos). Si estás en un computador, puedes acercar el cursor a las barras para observar el dato exacto de cada día.' },
    'testsNcasesNdiscardedCol': { 'title': 'Pruebas procesadas, casos confirmados y casos descartados acumulados', 'text': 'En esta gráfica ahora también encontrarás, encima de las barras de casos confirmados totales, los casos descartados totales en azul. Pusimos estas barras una sobre otra porque creemos que las barras completas son una buena aproximación del número total de pruebas procesadas.' },
    '200day_tests_countries': { 'title': 'Pruebas procesadas a partir del día con 200 casos confirmados en Italia, EE.UU, Alemania, Corea del Sur, Suecia y Colombia', 'text': 'En esta gráfica encuentras el total de pruebas procesadas desde el día que cada país confirmó sus primeros 200 casos. Esto lo hacemos para poder hacer comparaciones, porque el virus no llegó a todos los países al mismo tiempo. Y tomamos como inicio 200 casos porque es un estándar utilizado mundialmente y porque creemos que este es un momento en cual los gobiernos se toman en serio la gravedad del virus.  Estas líneas siempre estarán creciendo (porque cada día hay nuevas pruebas). Lo que queremos es que estás líneas crezcan y se vuelvan cada vez más empinadas. Si estás en un computador, puedes acercar el cursor a los puntos sobre las líneas para observar el dato exacto de cada país.' },
    'million_tests_countries': { 'title': 'Pruebas procesadas por millón de habitantes a partir del día con 200 casos confirmados en Italia, EE.UU, Alemania, Corea del Sur, Suecia y Colombia', 'text': 'En esta gráfica encuentras el total de pruebas procesadas por millón de habitantes desde el día que cada país confirmó sus primeros 200 casos. Esto lo hacemos para poder hacer comparaciones, porque no es lo mismo hacer mil pruebas en un país pequeño que en un país grande. Este es el mejor gráfico para compararnos en número de pruebas con respecto a los demás países.' },
    'intExamples': { 'title': 'Pruebas procesadas, casos confirmados y muertes', 'text': 'En esta gráfica encuentras el total de pruebas procesadas en amarillo, el total de casos confirmados en verde y el total de muertes en rojo.' },
    'testsNcasesNdiscardedNfindCol': { 'title': 'Pruebas procesadas, casos confirmados, casos descartados y pruebas procesadas reportadas por FIND acumuladas', 'text': 'En esta gráfica ahora también encontrarás, encima de las barras, unos cuadros morados con la información de pruebas totales reportada por FIND (hasta el 19 de Abril fecha en que dejaron de publicar el total de pruebas procesadas). Pusimos este dato para contrastar los datos de cada una de las fuentes. También puedes ver unas fechas relevantes en la evolución de la administración de las pruebas en la parte inferior derecha.' },
    'testsIncrease': { 'title': 'Pruebas procesadas diarias, diferencia con respecto al día anterior, días con diferencia negativa', 'text': 'En esta gráfica encontrarás las pruebas que se procesan cada día en morado. Los días que tienen un punto rojo en la base son días en los que hubo menos pruebas realizadas que el día anterior. En esos días también puedes ver una barra rosada sobre la morada que indica la diferencia (negativa) entre las pruebas de ese día y las del día anterior. Lo que queremos es que no haya puntos rojos ni barras rosadas, es decir, que cada día haya más pruebas que el día anterior.' },
    'map': { 'title': 'Pruebas procesadas, casos confirmados y muertes por cada cien mil habitantes', 'text': 'En esta gráfica, el tamaño de las burbujas representa las pruebas procesadas, los casos confirmados y las muertes por cada cien mil habitantes para cada departamento. La información reportada es la más actualizada. Si estás viendo la página desde un computador, si pones el cursor sobre las burbujas que están sobre cada departamento, podrás observar el dato real.' }
}