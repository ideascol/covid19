const initialize = async _ => {
    console.log('initializing')
    let data = await d3.csv(testData)
    console.log(data)
}

initialize()