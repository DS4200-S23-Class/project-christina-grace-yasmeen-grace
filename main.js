// US MAP CODE


const FRAME_HEIGHT = 900;
const FRAME_WIDTH = "100%"; 
const MARGINS = {left: 40, right: 40, top: 40, bottom: 40};


const FRAME1 = d3.select("#USMap") 
                  .append("svg") 
                    .attr("height", FRAME_HEIGHT)   
                    .attr("width", FRAME_WIDTH)
                    .attr("class", "frame");



 
const projection = d3.geoAlbersUsa().scale(1300).translate([700, 345])

const path = d3.geoPath().projection(projection);


let mapDairy = new Map()


const promises = []

promises.push(d3.json("https://gist.githubusercontent.com/Bradleykingz/3aa5206b6819a3c38b5d73cb814ed470/raw/a476b9098ba0244718b496697c5b350460d32f99/us-states.json"))
promises.push(d3.csv("data/averageprices.csv"), (d) => mapDairy.set(d.State, + d.AverageUnitPrice))


var allGroup = []
d3.csv("data/averageprices.csv" , (d) => {allGroup.push(d.Category)})

var dropdown = d3.select("#selectButton")
        .property('value', 'hi')


console.log(allGroup)

var options = dropdown.selectAll('option')
        .data(allGroup)
        .enter()
        .append('option')
options.text(function (d) { return d; }) // text showed in the menu
        .attr("value", function (d) { return d; }) // corresponding value returned by the button
        





myPromises = Promise.all(promises).then((mydata) => {

    const data = mydata[1]
    const json = mydata[0]
    const prices = []

    for (var i = 0; i < data.length; i++) {
    
        if (data[i].Category == "Dairy" && data[i].Year == 2019) {
            // Grab State Name
            var dataState = data[i].State;


            // Grab data value 
            var dataValue = data[i].AverageUnitPrice;
            prices.push(dataValue)

            // printing data into console
            console.log(dataState, dataValue)


            // Find the corresponding state inside the GeoJSON
            for (var j = 0; j < json.features.length; j++)  {
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

    

    let max = Number(d3.max(prices));

    let min = Number(d3.min(prices));
 

    const colorScale = d3.scaleLinear()
        .domain([min, max])
        .range(["#739BEC", "#FF6B6B"]);


    const xScale = d3.scaleLinear()
        .range([0, 500])
        .domain([Math.round(min*10)/10, Math.round(max*10)/10])


    var xAxis = d3.axisBottom()
        .scale(xScale)
        .ticks(9, "$.2f");


    FRAME1.append("g")
        .selectAll('path')
        .data(json.features)
        .enter()
        .append('path')
        .attr('d', path)
        .attr("stroke", "black")
        .attr("stroke-width", "1.8px")
        //.attr("fill", "white")
        .attr("fill", function(d) {
            // Get data value
            var value = d.properties.AverageUnitPrice;

            if (value) {
            //If value exists…
            return colorScale(value);
            } else {
            //If value is undefined…
            return "white";
            }
        })
    
    var defs = FRAME1.append("defs");

    var gradient = defs.append("linearGradient")
        .attr('id', 'linear-gradient')
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "0%");

    gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', "#739BEC");

    gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', "#FF6B6B");


    // legend gradient
    FRAME1.append("rect")
        .attr('x', 50)
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
        .text("US ______ Map");

    // legend title
    FRAME1.append('text')
        .attr("x", 50)
        .attr('y', 670)
        .text("Average Unit Price");

    // legend ticks
    FRAME1.append('g')
        .call(xAxis)
        .attr('transform', 'translate(50, 700)');





})

 
       








//LINE CHARTS CODE
//foodstamps
const stampData = "data/cleanstamps.csv"; 

d3.csv(stampData).then(function(datapoints){
    console.log(datapoints);
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

    // console.log(Year, Persons, State, Dates);



    var svg = d3.select("#stampline")
  .append("svg")
    .attr("width", FRAME_WIDTH + MARGINS.left + MARGINS.right)
    .attr("height", FRAME_HEIGHT + MARGINS.top + MARGINS.bottom)
  .append("g")
    .attr("transform",
          "translate(" + MARGINS.left + "," + MARGINS.top + ")");



    const al_year = [];
    // const al_persons = [];

    for (i = 0; i < datapoints.length; i++)
    {
    if (Year[i] == 2020.0 && State[i] == 'Alabama') {
        al_year.push({Months: datapoints[i].Date, Perons: datapoints[i].Persons}); 
        // al_persons.push(datapoints[i].Persons);
        
    }

    

    }

    console.log(al_year);


function(data) {


   // Add X axis --> it is a date format
    var x = d3.scaleTime()
            .domain(d3.extent(data, function(d) { return d.Months; }))
            .range([ 0, FRAME_WIDTH]);
        svg.append("g")
            .attr("transform", "translate(0," + FRAME_HEIGHT + ")")
            .call(d3.axisBottom(x));

    // Add Y axis
        var y = d3.scaleLinear()
            .domain([0, d3.max(data, function(d){ return + d.Persons; })])
            .range([ FRAME_HEIGHT, 0 ]);
        svg.append("g")
            .call(d3.axisLeft(y));

    // Add the line
        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                .x(function(d) { return x(d.Months) })
                .y(function(d) { return y(d.Persons) })
        );

};
});

    // console.log(Dates.getFullYear(), Persons,":", State);

    // const data = {
    //     labels: ['Jan', 'Feb', 'Mar', 'Apr','May', 'Jun','Jul', 'Aug','Sept','Oct','Nov','Dec'],
    //     datasets: [{
    //         label: 'Food Stamps',
    //         data:Persons
    //     }]
    // }




  