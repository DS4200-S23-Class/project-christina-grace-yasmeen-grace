// US MAP CODE


const FRAME_HEIGHT = 750;
const FRAME_WIDTH = "100%";
const MARGINS = {left: 40, right: 40, top: 40, bottom: 40};


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

// // dropdown title
// FRAME1.append('text')
//     .attr("x", 940)
//     .attr('y', 680)
//     .text("Select a food category");


// adds a slider to choose year
let slider = d3.sliderBottom()
    .tickFormat(function (d) {return d.toString().replace(/,/g, '')})
    .min('2019')
    .max('2022')
    .default(2019)
    .width(300)
    .ticks(4)
    .step(1)
    .on('onchange', (val) => {
        yr = val;
        updateYr(yr);
    });
FRAME1.append('g')
        .call(slider)
        .attr('id', 'yearSlider')
        .attr('transform', 'translate(140, 700)');
yr = 2019;   //d3.select("#yearSlider").value

// slider update map function
function updateYr(newYr) {
    FRAME1.select('#legendTicks').remove();
    buildMap(newYr, cat);
};

// slider title
FRAME1.append('text')
    .attr("x", 0)
    .attr('y', 703)
    .text("Drag to select year");

function buildMap(yr, cat) {
    myPromises = Promise.all(promises).then((mydata) => {

        const data = mydata[1];
        const json = mydata[0];
        const prices = [];

        for (var i = 0; i < data.length; i++) {
            if (data[i].Category == cat && data[i].Year == Number(yr)) {
                // Grab State Name and data value
                var dataState = data[i].State;
                var dataValue = Number(data[i].AverageUnitPrice);
                prices.push(dataValue);

                // printing data into console
                console.log(dataState, dataValue);

                // Find the corresponding state inside the GeoJSON
                for (var j = 0; j < json.features.length; j++) {
                    var jsonState = json.features[j].properties.name;
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
        console.log(prices)

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
            .attr('x', 850)
            .attr('y', 680)
            .attr("width", 500)
            .attr('height', 20)
            .attr("fill", "url(#linear-gradient)");

        // map title
        FRAME1.append('text')
            .attr("text-anchor", 'middle')
            .attr("x", "50%")
            .attr("y", 40)
            .attr("font-size", 30)
            .text("US FOOD PRICE MAP");

        // legend title
        FRAME1.append('text')
            .attr("x", 850)
            .attr('y', 670)
            .text("Average Unit Price");

        // legend ticks
        let xScale = d3.scaleLinear()
            .range([0, 500])
            .domain([min, max]);
        let xAxis = d3.axisBottom()
            .scale(xScale)
            .ticks(9, "$.2f");
        FRAME1.append('g')
            .call(xAxis)
            .attr('transform', 'translate(850, 700)')
            .attr('id', 'legendTicks');

        const projection = d3.geoAlbersUsa().scale(1300).translate([700, 345]);
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
            });
    })
};
// builds map
buildMap(yr, cat);

 
//
// //LINE CHARTS CODE
// //foodstamps
const VIS_HEIGHT = FRAME_HEIGHT - MARGINS.top - MARGINS.bottom;
const VIS_WIDTH = FRAME_WIDTH - MARGINS.left - MARGINS.right;
const stampData = "data/cleanstamps.csv";
// console.log(stampData);
// const timeConv = d3.timeParse("%d-%b-%Y");
var timeConv = d3.timeParse("%b-%d-%Y");


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


    for (i = 0; i < datapoints.length; i++)
    {
        Year.push(datapoints[i].Year);
        Dates.push(datapoints[i].Date);
        Persons.push(datapoints[i].Persons);
        State.push(datapoints[i].State);
    }
//
//     // console.log(Year, Persons, State, Dates);
//     // console.log(d3.max);
//
    const al_year = [];
    // const al_persons = [];

    for (i = 0; i < datapoints.length; i++)
    {
    if (Year[i] == 2020.0 && State[i] == 'Alabama') {
        al_year.push({Months: datapoints[i].Date,Persons: datapoints[i].Persons});
        // al_persons.push(datapoints[i].Persons);

    }};
//
//     console.log(al_year);
//
    // find the max X
    const MAX_X = d3.max(al_year, (d) => { return d.Months; });

    // find the max Y
    const MAX_Y = d3.max(al_year, (d) => { return parseInt(d.Persons); });

    console.log(MAX_X, MAX_Y);
``
    //domain and range
    const X_SCALE = d3.scaleTime()
                    .domain([0, (MAX_X + 1)])
                    .range([0, VIS_WIDTH]);
    const Y_SCALE = d3.scaleLinear()
                    .domain([(MAX_Y + 1) ,0])
                    .range([0, VIS_HEIGHT]);

    console.log(X_SCALE(al_year[0].Months))
    // // Add points to Frame
    FRAME2.append("g")
        .selectAll("datapoints")
        .data(al_year)
        .enter()
        .append("circle")
            .attr("cx", (d) => {return (X_SCALE(d.Months) + MARGINS.left);})
            .attr("cy", (d) => {return (Y_SCALE(d.Persons) + MARGINS.bottom);})
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
//
//     // svg.append("path")
//     //         .datum(data)
//     //         .attr("fill", "none")
//     //         .attr("stroke", "steelblue")
//     //         .attr("stroke-width", 1.5)
//     //         .attr("d", d3.line()
//     //             .x(function(d) { return x(d.Months) })
//     //             .y(function(d) { return y(d.Persons) })
//     //     );
//
    svg.append("g")
            .selectAll("datapoints")
            .data(al_year)
            .enter()
            .append("circle")
                .attr("cx", (d) => {return (X_SCALE(d.Months) + MARGINS.left);})
                .attr("cy", (d) => {return (Y_SCALE(d.Persons) + MARGINS.bottom);})
                .attr("r", 5)

//
//     // Add line to Frame
//      // svg.append("path")
//      //    .selectAll("datapoints")
//      //    .data(al_year)
//      //    .enter()
//      //    .attr("fill", "none")
//      //    .attr("stroke", "steelblue")
//      //    .attr("stroke-width", 1.5)
//      //    .attr("d", d3.svg.line())
//      //        .x(function(d) {return x(d.Months);})
//      //        .y(function(d) {return y(d.Persons);})
//
//
 });
//
// // function(data) {
//
//
// //    // Add X axis --> it is a date format
// //     var x = d3.scaleTime()
// //             .domain(d3.extent(data, function(d) { return d.Months; }))
// //             .range([ 0, FRAME_WIDTH]);
// //         svg.append("g")
// //             .attr("transform", "translate(0," + FRAME_HEIGHT + ")")
// //             .call(d3.axisBottom(x));
//
// //     // Add Y axis
// //         var y = d3.scaleLinear()
// //             .domain([0, d3.max(data, function(d){ return + d.Persons; })])
// //             .range([ FRAME_HEIGHT, 0 ]);
// //         svg.append("g")
// //             .call(d3.axisLeft(y));
//
// //     // Add the line
// //         svg.append("path")
// //             .datum(data)
// //             .attr("fill", "none")
// //             .attr("stroke", "steelblue")
// //             .attr("stroke-width", 1.5)
// //             .attr("d", d3.line()
// //                 .x(function(d) { return x(d.Months) })
// //                 .y(function(d) { return y(d.Persons) })
// //         );
//
// // };
//
//
//     // console.log(Dates.getFullYear(), Persons,":", State);
//
//     // const data = {
//     //     labels: ['Jan', 'Feb', 'Mar', 'Apr','May', 'Jun','Jul', 'Aug','Sept','Oct','Nov','Dec'],
//     //     datasets: [{
//     //         label: 'Food Stamps',
//     //         data:Persons
//     //     }]
//     // }
//
// //     /////////test code
// //     var domain = d3.extent(dates);
//
// //     var xScale = d3.scaleTime()
// //         .domain(domain)
// //         .range([25, 555]);
//
// //     var xAxis = d3.axisBottom(xScale);
//
// //     var svg = d3.select("#stampline");
//
// //     svg.append("g")
// //         .attr("transform", "translate(0,60)")
// //         .call(xAxis);
//
// //     svg.append("g")
// //         .attr("transform", "translate(0,60)")
// //         .call(xAxis.ticks(d3.timeYear));
//
// //     domain = [d3.timeYear.floor(domain[0]), d3.timeYear.ceil(domain[1])];
//
// //     svg.append("g")
// //     .attr("transform", "translate(0,60)")
// //     .call(xAxis.ticks(d3.Months));
//
// //     svg.selectAll(".tick text").remove();
//
// //     svg.append("text")
// //        .attr("transform", "translate(300,95)")
// //        .style("text-anchor", "middle")
// //        .attr("fill", "black")
// //        .text("Dates");
//
// //     svg.selectAll("circle")
// //         .data(al_year)
// //         .enter()
// //         .append("circle")
// //         .attr("r", 5)
// //         .attr("fill", "black")
// //         .attr("cx", (d) => xScale(timeConv(d.Months)))
// //         .attr("cy", 50);
//
//     /////////