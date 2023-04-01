// US MAP CODE


const FRAME_HEIGHT = 375;
const FRAME_WIDTH = 750;
const MARGINS = {left: 40, right: 40, top: 40, bottom: 40};
const VIS_HEIGHT = FRAME_HEIGHT - MARGINS.top - MARGINS.bottom
const VIS_WIDTH = FRAME_WIDTH - MARGINS.left - MARGINS.right

const FRAME1 = d3.select("#USMap")
                  .append("svg")
                    .attr("height", FRAME_HEIGHT)
                    .attr("width", FRAME_WIDTH)
                    .attr("class", "frame");

let mapDairy = new Map();
const promises = [];

promises.push(d3.json("https://gist.githubusercontent.com/Bradleykingz/3aa5206b6819a3c38b5d73cb814ed470/raw/a476b9098ba0244718b496697c5b350460d32f99/us-states.json"));
promises.push(d3.csv("data/averageprices.csv"), (d) => mapDairy.set(d.State, + d.AverageUnitPrice));

// dropdown food category selection
let allGroup = ['Dairy', 'Alcohol', 'Beverages', 'Commercially prepared items', 'Fats and oils', 'Fruits',
                'Grains', 'Meats, eggs, and nuts', 'Sugar and sweeteners', 'Vegetables']
d3.select("#selectButton")
      .selectAll('myOptions')
        .data(allGroup)
      .enter()
        .append('option')
      .text((d) => {return d}) // text showed in the menu
      .attr("value", (d) => {return d}) // corresponding value returned by the button
d3.select("#selectButton").on("change", (val) => {
        cat = d3.select('#selectButton').property("value"); // gets selected value
        updateCat(cat);
    })
cat = 'Dairy'

// dropdown update map function
function updateCat(newCat) {
    FRAME1.select('#legendTicks').remove();
    buildMap(yr, newCat);
}


// adds a slider to choose year
let slider = d3.sliderBottom()
    .tickFormat(function (d) {return d.toString().replace(/,/g, '')})
    .min('2019')
    .max('2022')
    .default(2019)
    .width(VIS_WIDTH/4.5)
    .ticks(4)
    .step(1)
    .on('onchange', (val) => {
        yr = val;
        updateYr(yr);
    });
FRAME1.append('g')
        .call(slider)
        .attr('id', 'yearSlider')
        .attr('transform', 'translate(' + (MARGINS.left + 75) + "," + (VIS_HEIGHT + MARGINS.top) + ')');
yr = 2019;   //d3.select("#yearSlider").value

// slider update map function
function updateYr(newYr) {
    FRAME1.select('#legendTicks').remove();
    buildMap(newYr, cat);
};

// slider title
FRAME1.append('text')
    .attr("x", 0)
    .attr('y', VIS_HEIGHT + MARGINS.top + 3)
    .text("Drag to select year")
    .attr("font-size", 13);

// adds tooltip
const TOOLTIP = d3.select("#USMap")
                    .append("div")
                    .style("opacity", 0)
                    .attr("class", "tooltip");

// mouse move function
function updateTooltip(event, d) {
    TOOLTIP.style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 30) + "px");
    let p = d.properties.AverageUnitPrice
    if (p) {
        TOOLTIP.html("<b>" + d.properties.name + "</b><br/>Average Unit Price: $" + d3.format(".2f")(d.properties.AverageUnitPrice));
    } else {
        TOOLTIP.html("<b>" + d.properties.name + "</b><br/>Average Unit Price: no data");
    }
}

function buildMap(yr, cat) {
    myPromises = Promise.all(promises).then((mydata) => {

        const data = mydata[1];
        const json = mydata[0];
        const prices = [];

        for (let i = 0; i < data.length; i++) {
            if (data[i].Category == cat && data[i].Year == Number(yr)) {
                // Grab State Name and data value
                let dataState = data[i].State;
                let dataValue = Number(data[i].AverageUnitPrice);
                prices.push(dataValue);

                // printing data into console
                console.log(dataState, dataValue);

                // Find the corresponding state inside the GeoJSON
                for (let j = 0; j < json.features.length; j++) {
                    let jsonState = json.features[j].properties.name;
                    if (dataState == jsonState) {
                        // Copy the data value into the JSON
                        json.features[j].properties.AverageUnitPrice = dataValue;

                        // Stop looking through the JSON
                        break;
                    }
                }
            }
        }


        // used to make legend and create color scale
        let min = Math.floor(Number(d3.min(prices)) * 10) / 10;
        let max = Math.ceil(Number(d3.max(prices)) * 10) / 10;
        let med = (max + min) / 2;

        // used to color states
        const colorScale = d3.scaleLinear()
            .domain([min, med, max])
            .range(["#0DCF00", "#FFFF4A", "#FF1818"]);


        // legend gradient
        let defs = FRAME1.append("defs");
        let gradient = defs.append("linearGradient")
            .attr('id', 'linear-gradient')
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "100%")
            .attr("y2", "0%");

        gradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', "#0DCF00");
        gradient.append('stop')
            .attr('offset', '50%')
            .attr('stop-color', "#FFFF4A");
        gradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', "#FF1818");

        FRAME1.append("rect")
            .attr('x', FRAME_WIDTH/2)
            .attr('y', 0.8 * MARGINS.top + VIS_HEIGHT)
            .attr("width", VIS_WIDTH/2.5)
            .attr('height', 0.03 * VIS_HEIGHT)
            .attr("fill", "url(#linear-gradient)");

        // map title
        FRAME1.append('text')
            .attr("text-anchor", 'middle')
            .attr("x", "50%")
            .attr("y", MARGINS.top/2)
            .attr("font-size", 25)
            .text("US FOOD PRICE MAP");

        // legend title
        FRAME1.append('text')
            .attr("x", FRAME_WIDTH/2)
            .attr('y', 0.7 * MARGINS.top + VIS_HEIGHT)
            .text("Average Unit Price")
            .attr("font-size", 13);

        // legend ticks
        let xScale = d3.scaleLinear()
            .range([0, VIS_WIDTH/2.5])
            .domain([min, max]);
        let xAxis = d3.axisBottom()
            .scale(xScale)
            .ticks(7, "$.2f");
        FRAME1.append('g')
            .call(xAxis)
            .attr('transform', 'translate(' + (FRAME_WIDTH/2) + ', ' + ( 0.03 * VIS_HEIGHT + VIS_HEIGHT + 0.8 * MARGINS.top) + ')')
            .attr('id', 'legendTicks');

        // no data disclaimer
        FRAME1.append('text')
            .attr("text-anchor", 'end')
            .attr("x", FRAME_WIDTH/2 + VIS_WIDTH/2.5)
            .attr('y', MARGINS.top + VIS_HEIGHT + 0.8 * MARGINS.bottom)
            .text("*states colored white have no data")
            .attr("font-size", 10);

        const projection = d3.geoAlbersUsa().scale(VIS_WIDTH).translate([VIS_WIDTH/2, VIS_WIDTH/4]);
        const path = d3.geoPath().projection(projection);
        FRAME1.append("g")
            .selectAll('path')
            .data(json.features)
            .enter()
            .append('path')
            .attr('d', path)
            .attr("stroke", "black")
            .attr("stroke-width", "1.8px")
            .attr("fill", function(d) {
                let value = d.properties.AverageUnitPrice;

                if (value) {
                return colorScale(value);
                } else {
                return "white";
                }
            })
            .on("mouseover", (d) => {TOOLTIP.style("opacity", 1);}) // adds tooltip events
            .on("mousemove", updateTooltip)
            .on("mouseleave", (d) => {TOOLTIP.style("opacity", 0);});
    })
    ;
};

// builds map
buildMap(yr, cat);



// Line Charts code:

//food stamp

// set the dimensions and margins of the first graph
const margin = {top: 10, right: 30, bottom: 30, left: 60},
    width = 1000 - margin.left - margin.right,
    height = 450 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select("#stampline")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);


// const VIS_HEIGHT = FRAME_HEIGHT - MARGINS.top - MARGINS.bottom;
// const VIS_WIDTH = FRAME_WIDTH - MARGINS.left - MARGINS.right;

// const svg = d3.select("#stampline")
//         .append("svg")
//         .attr("height", FRAME_HEIGHT)
//         .attr("width", FRAME_WIDTH)
//         .attr("class", "svg");

//Read the data
d3.csv("data/alabama2020stamps.csv",

  // When reading the csv, I must format variables:
  function(d){
    return { date : d3.timeParse("%Y-%m-%d")(d.date), persons : d.persons }
  }).then(

  function(data) {

    // X axis -> date format
    const x = d3.scaleTime()
      .domain(d3.extent(data, function(d) { return d.date; }))
      .range([ 0, FRAME_WIDTH ]);
    svg.append("g")
      .attr("transform", `translate(0, ${FRAME_HEIGHT})`)
      .call(d3.axisBottom(x));

    // Y axis
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, function(d) { return +d.persons; })])
      .range([ FRAME_HEIGHT, 0 ]);
    svg.append("g")
      .call(d3.axisLeft(y));

    // Add the line
    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "blue")
      .attr("stroke-width", 2)
      .attr("d", d3.line()
        .x(function(d) { return x(d.date) })
        .y(function(d) { return y(d.persons) })
    )


    // map title
    svg.append('text')
        .attr("text-anchor", 'end')
        .attr("x", "50%")
        .attr("y", MARGINS.top+20)
        .attr("font-size", 25)
        .text("FOOD STAMPS in ALABAMA");

    // x and y labels
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", width-150)
        .attr("y", height + margin.top)
        .text("Months");

    svg.append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left+12)
        .attr("x", -margin.top-20)
        .text("Number of Food Stamps");
});


const margin2 = {top: 10, right: 30, bottom: 30, left: 60},
    width2 = 1000 - margin2.left - margin2.right,
    height2 = 450 - margin2.top - margin2.bottom;

// category 
const svg2 = d3.select("#priceline")
  .append("svg")
    .attr("width", width2 + margin2.left + margin2.right)
    .attr("height", height2 + margin2.top + margin2.bottom)
  .append("g")
    .attr("transform", `translate(${margin2.left},${margin2.top})`);


// const VIS_HEIGHT = FRAME_HEIGHT - MARGINS.top - MARGINS.bottom;
// const VIS_WIDTH = FRAME_WIDTH - MARGINS.left - MARGINS.right;

// const svg = d3.select("#stampline")
//         .append("svg")
//         .attr("height", FRAME_HEIGHT)
//         .attr("width", FRAME_WIDTH)
//         .attr("class", "svg");

//Read the data
d3.csv("data/alabama2020pricealc.csv",

  function(a){
    return { date2 : d3.timeParse("%Y-%d-%m")(a.date2), unit_price : a.unit_price }
  }).then(

  function(data2) {

    // X axis -> date format
    const x = d3.scaleTime()
      .domain(d3.extent(data2, function(a) { return a.date2; }))
      .range([ 0, FRAME_WIDTH ]);
    svg2.append("g")
      .attr("transform", `translate(0, ${FRAME_HEIGHT})`)
      .call(d3.axisBottom(x));

    // Y axis
    const y = d3.scaleLinear()
      .domain([0, d3.max(data2, function(a) { return +a.unit_price; })])
      .range([ FRAME_HEIGHT, 0 ]);
    svg2.append("g")
      .call(d3.axisLeft(y));

    // Add the line
    svg2.append("path")
      .datum(data2)
      .attr("fill", "none")
      .attr("stroke", "green")
      .attr("stroke-width", 2)
      .attr("d", d3.line()
        .x(function(a) { return x(a.date2) })
        .y(function(a) { return y(a.unit_price) })
    )


    // map title
    svg2.append('text')
        .attr("text-anchor", 'end')
        .attr("x", "50%")
        .attr("y", MARGINS.top+20)
        .attr("font-size", 25)
        .text("UNIT PRICE in ALABAMA");

    // x and y labels
    svg2.append("text")
        .attr("text-anchor", "end")
        .attr("x", width2-150)
        .attr("y", height2 + margin2.top)
        .text("Months");

    svg2.append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin2.left+15)
        .attr("x", -margin2.top-20)
        .text("Unit Price for Alcohol");
});


// // //LINE CHARTS CODE
// //foodstamps
// const VIS_HEIGHT = FRAME_HEIGHT - MARGINS.top - MARGINS.bottom;
// const VIS_WIDTH = FRAME_WIDTH - MARGINS.left - MARGINS.right;
const stampData = "data/cleanstamps.csv";
// console.log(stampData);
// const timeConv = d3.timeParse("%d-%b-%Y");

//
const FRAME2 = d3.select("#stampline")
        .append("svg")
        .attr("height", FRAME_HEIGHT)
        .attr("width", FRAME_WIDTH)
        .attr("class", "frame2");

var svg = d3.select("#stampline")
.append("svg")
    .attr("width", FRAME_WIDTH + MARGINS.left + MARGINS.right)
    .attr("height", FRAME_HEIGHT + MARGINS.top + MARGINS.bottom)
  .append("g")
    .attr("transform",
          "translate(" + MARGINS.left + "," + MARGINS.top + ")");

d3.csv(stampData).then(function(datapoints){
    const Year = [];
    const Dates = [];
    const Persons = [];
    const State = [];
    const Months = []; 

    for (i = 0; i < datapoints.length; i++)
    {
        Year.push(datapoints[i].Year);
        Dates.push(datapoints[i].Date);
        Persons.push(datapoints[i].Persons);
        State.push(datapoints[i].State);
    }
    // console.log(Months); 

    let formatTime = d3.timeFormat("%B");
    let todayString = formatTime(new Date(2019, 0, 1)); // "January 15, 2020"
    //console.log(todayString)

    let dateparser = function(l)
    {
        for(i = 0; i < l.length-1; i++)
        {
            let d = l[i]; 
            // date array
            let dateArr = d.split("/");
            const month = parseInt(dateArr[0]); 
            const day = parseInt(dateArr[1]);
            const year = parseInt("20" + dateArr[2]); 
            //console.log(year); 
            const ret = formatTime(new Date(year, month-1, day));
            //console.log(typeof ret); 
            Months.push(ret); 
        }
        
    }
    dateparser(Dates); 


    // create dictionary
    const masterDict = {};
    const yearDict = {}; 
    const monthDict = {}; 


    for(i = 0; i < Months.length; i++)
    {
        monthDict[Months[i]] = ""; 
    } 
    // console.log(monthDict); 

    for(i = 0; i < Year.length; i++)
    {
        yearDict[Year[i]] = monthDict; 
    } 
    // console.log(yearDict); 

    for(i = 0; i < State.length; i++)
    {
        masterDict[State[i]] = yearDict; 
    } 
     console.log(masterDict); 
     let randomvar = 200; 
     


    // function that parses individual date into month
    // retruns month
    function tparse(t){
        let dateArr = t.split("/");
        const month = parseInt(dateArr[0]); 
        const day = parseInt(dateArr[1]);
        const year = parseInt("20" + dateArr[2]); 
        //console.log(year); 
        const ret = formatTime(new Date(year, month-1, day));
        //console.log(ret); 
        return ret; 
    }


    // looping through each row in csv to populate dictionaries of dictionaries
    for (i = 0; i < datapoints.length; i++)
    {
        let state = datapoints[i].State;  
       
        let year = datapoints[i].Year;
        
        let month = tparse(datapoints[i].Date);
       
        let pval  = datapoints[i].Persons; 
        let stateVar = masterDict[state];
        let yearVar = stateVar[year];
        let monthVar = yearVar[month]; 
        monthVar = pval;

        console.log(state);
        console.log(typeof state);
        console.log(year); 
        console.log(typeof year);
        console.log(month);
        console.log(typeof month);
        console.log(pval);
        console.log(typeof pval);
        console.log(masterDict);
        console.log(); 
    }
    //console.log(masterDict); 
    //console.log(masterDict);
    // console.log(masterDict[state = 'Massachusetts'][year = '2020.0'][month = 'January']); 


    const al_year = [];
    // const al_persons = [];

    for (i = 0; i < datapoints.length; i++)
    {
    if (Year[i] == 2020.0 && State[i] == 'Alabama') {
        al_year.push({Months: datapoints[i].Date,Persons: datapoints[i].Persons});
        // al_persons.push(datapoints[i].Persons);

    }};

    // find the max X
    const MAX_X = d3.max(al_year, (d) => { return d.month; });

    // find the max Y
    const MAX_Y = d3.max(al_year, (d) => { return parseInt(d.pval); });

    //console.log(MAX_X, MAX_Y);


    //domain and range

    const X_SCALE = d3.scaleLinear()
                    .domain([0, MAX_X])
                    .range([0, VIS_WIDTH]);
    const Y_SCALE = d3.scaleLinear()
                    .domain([(MAX_Y + 1) ,0])
                    .range([0, VIS_HEIGHT]);

    //console.log(X_SCALE(al_year[0].Months))
    // // Add points to Frame
    FRAME2.append("g")
        .selectAll("datapoints")
        .data(al_year)
        .enter()
        .append("circle")
            .attr("cx", (d) => {return (X_SCALE(d.month) + MARGINS.left);})
            .attr("cy", (d) => {return (Y_SCALE(d.pval) + MARGINS.bottom);})
            .attr("r", 5)


    // Add x-axis to vis1
    svg.append("g")
        .attr("transform", "translate(" + MARGINS.left + ","
            + (VIS_HEIGHT + MARGINS.top) + ")")
        .call(d3.axisBottom(X_SCALE).ticks(10))
            .attr("font-size", '20px');

    svg.append("g")
      .attr("transform", "translate(0," + VIS_HEIGHT + ")")
      .call(d3.axisBottom(X_SCALE));

    // Add y-axis to vis1
    svg.append("g")
        .attr("transform", "translate(" + MARGINS.left + ","
            + (MARGINS.bottom) + ")")
        .call(d3.axisLeft(Y_SCALE).ticks(15))
            .attr("font-size", '20px');

    svg.append("g")
            .selectAll("datapoints")
            // .data(al_year)
            .enter()
            .append("circle")
                .attr("cx", (d) => {return (X_SCALE(d.month) + MARGINS.left);})
                .attr("cy", (d) => {return (Y_SCALE(d.pval) + MARGINS.bottom);})
                .attr("r", 5)

 });