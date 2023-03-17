// US MAP CODE


const FRAME_HEIGHT = 900;
const FRAME_WIDTH = 1000; 
const MARGINS = {left: 40, right: 40, top: 40, bottom: 40};


const FRAME1 = d3.select("#USMap") 
                  .append("svg") 
                    .attr("height", FRAME_HEIGHT)   
                    .attr("width", FRAME_WIDTH)
                    .attr("class", "frame");

// for scaling data
const VIS_HEIGHT = FRAME_HEIGHT - MARGINS.top - MARGINS.bottom;
const VIS_WIDTH = FRAME_WIDTH - MARGINS.left - MARGINS.right;


// namemap = new Map(states.features.map(d => [d.properties.name, d.id]))

// function UsStateChoropleth(data, {
//   features = states,
//   borders = statemesh,
//   width = 975,
//   height = 610
// } = {}) {
//   return Choropleth(data, {features, borders, width, height});
// }

// chart = UsStateChoropleth(unemployment, {
//   id: d => namemap.get(d.name),
//   value: d => d.rate,
//   scale: d3.scaleQuantize,
//   domain: [1, 7],
//   range: d3.schemeBlues[6],
//   title: (f, d) => `${f.properties.name}\n${d?.rate}%`
// })


// var map = d3.choropleth()
//     .geofile('us-states.json')
//     .projection(d3.geoAlbersUsa)
//     .column('Average Unit Price')
//     .unitId('State')
//     .scale(1000)
//     .legend(true);

// d3.csv('/data/averageprices.csv').then(data => {
//     data.filter(function(d){ return  (d.Category == "Dairy" & d.Year == 2019) });
//     FRAME1.append("g") 
//     	.draw(d3.select('#map').datum(data));
// });


// var projection = d3.geoAlbersUsa()
// var path = d3.geoPath().projection(projection)

// var color = d3.scaleLinear()
//               .range(["rgb(213,222,217)","rgb(69,173,168)","rgb(84,36,55)","rgb(217,91,67)"]);


// d3.csv("data/averageprices.csv", function(data) {
// color.domain([0,20]);


// d3.json("us-states.json", function(json) {

// // Loop through each state data value in the .csv file
// for (var i = 0; i < data.length; i++) {
//     console.log("Hi")

//     if (data[i].Category == "Dairy" && data[i].Year == 2019) {
//         // Grab State Name
//         var dataState = data[i].State;

//         // Grab data value 
//         var dataValue = data[i].AverageUnitPrice;

//         // Find the corresponding state inside the GeoJSON
//         for (var j = 0; j < json.features.length; j++)  {
//             var jsonState = json.features[j].properties.name;

//             if (dataState == jsonState) {

//             // Copy the data value into the JSON
//             json.features[j].averageprices.AverageUnitPrice = dataValue; 

//             // Stop looking through the JSON
//             break;
//         }
//     }
//     }

// }

// FRAME1.append("g")
//     .selectAll("path")
//     .data(json.features)
//     .enter()
//     .append("path")
//     .attr("d", path)
//     .style("stroke", "#fff")
//     .style("stroke-width", "1")
//     .style("fill", function(d) {

//     // Get data value
//     var value = d.averageprices.AverageUnitPrice;

//     if (value) {
//     //If value exists…
//     return color(value);
//     } else {
//     //If value is undefined…
//     return "rgb(213,222,217)";
//     }
// });
    
// })
// })

 
const projection = d3.geoAlbersUsa().scale(1300).translate([487.5, 305])

const path = d3.geoPath().projection(projection);
console.log("hi1")

let mapDairy = new Map()


const promises = []

promises.push(d3.json("https://gist.githubusercontent.com/Bradleykingz/3aa5206b6819a3c38b5d73cb814ed470/raw/a476b9098ba0244718b496697c5b350460d32f99/us-states.json"))
promises.push(d3.csv("data/averageprices.csv"), (d) => mapDairy.set(d.State, + d.AverageUnitPrice))



myPromises = Promise.all(promises).then((mydata) => {

    const data = mydata[1]
    const json = mydata[0]

    for (var i = 0; i < data.length; i++) {
    
       // console.log(data[i])
    if (data[i].Category == "Dairy" && data[i].Year == 2019) {
        // Grab State Name
        var dataState = data[i].State;

        console.log(dataState)

        // Grab data value 
        var dataValue = data[i].AverageUnitPrice;
        console.log(dataValue)

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

    console.log(mydata[0].features)

    FRAME1.append("g")
        .selectAll('path')
        .data(mydata[0].features)
        .enter()
        .append('path')
        .attr('d', path)
        .attr("stroke", "black")
        .attr("stroke-width", "3px")
        .attr("fill", "white")

})

 
// d3.csv("data/averageprices.csv").then((data) => {

// d3.json("us-states.json").then((json) => {



//     for (var i = 0; i < data.length; i++) {
    

//     if (data[i].Category == "Dairy" && data[i].Year == 2019) {
//         // Grab State Name
//         var dataState = data[i].State;
//         console.log(dataState)

//         // Grab data value 
//         var dataValue = data[i].AverageUnitPrice;
//         console.log(dataValue)

//         // Find the corresponding state inside the GeoJSON
//         for (var j = 0; j < json.features.length; j++)  {
//             var jsonState = json.features[j].properties.name;

//             if (dataState == jsonState) {

//             // Copy the data value into the JSON
//             json.features[j].properties.AverageUnitPrice = dataValue;

//             // Stop looking through the JSON
//             break;
//         }
//     }
//     }

// }

//     let map = FRAME1.append("g")
//         .selectAll('path')
//         .data(json.features)
//         .enter()
//         .append('path')
//         .attr("d", path)
//         .attr('class', 'state')
// })
// });



       








// LINE CHARTS CODE

