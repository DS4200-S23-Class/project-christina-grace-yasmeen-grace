// US MAP CODE
const MAP_FRAME_HEIGHT = 750;
const MAP_FRAME_WIDTH = 1500;
const MAP_MARGINS = {left: 40, right: 40, top: 40, bottom: 40};
const MAP_VIS_HEIGHT = MAP_FRAME_HEIGHT - MAP_MARGINS.top - MAP_MARGINS.bottom
const MAP_VIS_WIDTH = MAP_FRAME_WIDTH - MAP_MARGINS.left - MAP_MARGINS.right

const FRAME1 = d3.select("#USMap")
                  .append("svg")
                    .attr("height", MAP_FRAME_HEIGHT)
                    .attr("width", MAP_FRAME_WIDTH)
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
let cat = 'Dairy'

// dropdown update map function
function updateCat(newCat) {
    cat = newCat
    FRAME1.select('#legendTicks').remove();
    buildMap(yr, newCat);
}


// adds a slider to choose year
let slider = d3.sliderBottom()
    .tickFormat(function (d) {return d.toString().replace(/,/g, '')})
    .min('2019')
    .max('2022')
    .default(2019)
    .width(MAP_VIS_WIDTH/4.5)
    .ticks(4)
    .step(1)
    .on('onchange', (val) => {
        yr = val;
        updateYr(yr);
    });
FRAME1.append('g')
        .call(slider)
        .attr('id', 'yearSlider')
        .attr('transform', 'translate(' + (MAP_MARGINS.left + 75) + "," + (MAP_VIS_HEIGHT + MAP_MARGINS.top) + ')');
let yr = 2019;   //d3.select("#yearSlider").value

// slider update map function
function updateYr(newYr) {
    yr = newYr
    FRAME1.select('#legendTicks').remove();
    buildMap(newYr, cat);
};

// slider title
FRAME1.append('text')
    .attr("x", 0)
    .attr('y', MAP_VIS_HEIGHT + MAP_MARGINS.top + 3)
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

function mouseClickEvent(event, d) {
    state = d.properties.name
    
    FRAME2.select('#pricexaxis').remove()
    FRAME2.select('#priceyaxis').remove()
    FRAME2.select('#priceline').remove()
    FRAME2.select('#pricetitle').remove()
    buildPriceLine(cat, yr, state)

    FRAME3.select('#stampxaxis').remove()
    FRAME3.select('#stampyaxis').remove()
    FRAME3.select('#stampline').remove()
    FRAME3.select('#stamptitle').remove()
    buildStampLine(yr, state)
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
            .attr('x', MAP_FRAME_WIDTH/2)
            .attr('y', 0.8 * MAP_MARGINS.top + MAP_VIS_HEIGHT)
            .attr("width", MAP_VIS_WIDTH/2.5)
            .attr('height', 0.03 * MAP_VIS_HEIGHT)
            .attr("fill", "url(#linear-gradient)");

        // map title
        FRAME1.append('text')
            .attr("text-anchor", 'middle')
            .attr("x", "50%")
            .attr("y", MAP_MARGINS.top/2)
            .attr("font-size", 25)
            .text("US FOOD PRICE MAP");

        // legend title
        FRAME1.append('text')
            .attr("x", MAP_FRAME_WIDTH/2)
            .attr('y', 0.7 * MAP_MARGINS.top + MAP_VIS_HEIGHT)
            .text("Average Unit Price")
            .attr("font-size", 13);

        // legend ticks
        let xScale = d3.scaleLinear()
            .range([0, MAP_VIS_WIDTH/2.5])
            .domain([min, max]);
        let xAxis = d3.axisBottom()
            .scale(xScale)
            .ticks(7, "$.2f");
        FRAME1.append('g')
            .call(xAxis)
            .attr('transform', 'translate(' + (MAP_FRAME_WIDTH/2) + ', ' + ( 1.03 * MAP_VIS_HEIGHT + 0.8 * MAP_MARGINS.top) + ')')
            .attr('id', 'legendTicks');

        // no data disclaimer
        FRAME1.append('text')
            .attr("text-anchor", 'end')
            .attr("x", MAP_FRAME_WIDTH/2 + MAP_VIS_WIDTH/2.5)
            .attr('y', MAP_MARGINS.top + MAP_VIS_HEIGHT + MAP_MARGINS.bottom)
            .text("*states colored white have no data")
            .attr("font-size", 11);

        const projection = d3.geoAlbersUsa().scale(MAP_VIS_WIDTH).translate([MAP_VIS_WIDTH/2, MAP_VIS_WIDTH/4]);
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
            .on("mouseleave", (d) => {TOOLTIP.style("opacity", 0);})
            .on("click", mouseClickEvent);
    })
    ;
};

// builds map
buildMap(yr, cat);



const FRAME_HEIGHT = 375;
const FRAME_WIDTH = 750;
const MARGINS = {left: 50, right: 50, top: 40, bottom: 40};
const VIS_HEIGHT = FRAME_HEIGHT - MARGINS.top - MARGINS.bottom
const VIS_WIDTH = FRAME_WIDTH - MARGINS.left - MARGINS.right
// Line Charts code:
const FRAME2 = d3.select("#priceLineChart")
                  .append("svg")
                    .attr("height", FRAME_HEIGHT)
                    .attr("width", FRAME_WIDTH)
                    .attr("class", "frame");
//Unit Price
const promises2 = [];

promises2.push(d3.csv("data/cleanprices.csv"));
function buildPriceLine(cat, yr, state){
    myPromises = Promise.all(promises2).then((mydata) => {

        const data = mydata[0];
        let prices = [];

        for (let i = 0; i < data.length; i++) {
            if (data[i].Category == cat && data[i].Year == Number(yr) && data[i].State == state) {
                // Grab State Name and data value
                let dataDate = d3.timeParse("%m/%d/%Y")(data[i].Date)
                let dataValue = Number(data[i].UnitPrice);
                prices.push({dataDate, dataValue});
            }
        };
    
        function plotPriceLine() {      
            let x = d3.scaleTime()
                    .domain(d3.extent(prices, function(d) { return d.dataDate; }))
                    .range([0, VIS_WIDTH]);
            FRAME2.append("g")
                    .attr('id', 'pricexaxis')
                    .call(d3.axisBottom(x))
                    .attr('transform', "translate(" + MARGINS.left + "," + (VIS_HEIGHT + MARGINS.top) + ')');

            let y = d3.scaleLinear()
                          .domain(d3.extent(prices, function(d) { return d.dataValue; }))
                          .range([VIS_HEIGHT, 0]);
            FRAME2.append("g")
                    .attr('id', 'priceyaxis')
                    .call(d3.axisLeft(y))
                    .attr('transform', "translate(" + MARGINS.left + "," + MARGINS.top + ')');
        
            // Add the line
            FRAME2.append("path")
              .datum(prices)
              .attr("fill", "none")
              .attr("stroke", "green")
              .attr("stroke-width", 2)
              .attr('id', 'priceline')
              .attr("d", d3.line()
                .x(function(a) { return x(a.dataDate) })
                .y(function(a) { return y(a.dataValue) })
                )
                .attr('transform', "translate(" + MARGINS.left + "," + MARGINS.top + ')')
        
        
            // map title
            FRAME2.append('text')
                .attr('id', 'pricetitle')
                .attr("text-anchor", 'middle')
                .attr("x", "50%")
                .attr("y", MARGINS.top)
                .attr("font-size", 16)
                .text(function(d) { return "UNIT PRICE OF " + cat.toUpperCase() + " IN " + state.toUpperCase()});
        
            // x and y labels
            FRAME2.append("text")
                .attr("text-anchor", "end")
                .attr("x", VIS_WIDTH + MARGINS.left)
                .attr("y", FRAME_HEIGHT)
                .text("Months")
                .attr("font-size", 13);
        
            FRAME2.append("text")
                .attr("text-anchor", "end")
                .attr("transform", "rotate(-90)")
                .attr("y", MARGINS.top/3)
                .attr("x", -MARGINS.left)
                .text("Unit Price ($)")
                .attr("font-size", 13);
        }
        plotPriceLine();




    })
}


//Food Stamps
const FRAME3 = d3.select("#stampLineChart")
                  .append("svg")
                    .attr("height", FRAME_HEIGHT)
                    .attr("width", FRAME_WIDTH)
                    .attr("class", "frame");
const promises3 = [];

promises3.push(d3.csv("data/cleanstamps.csv"));
function buildStampLine(yr, state){
    myPromises = Promise.all(promises3).then((mydata) => {

        const data = mydata[0];
        let stamps = [];
        console.log(data)

        for (let i = 0; i < data.length; i++) {
            if (data[i].Year == Number(yr) && data[i].State == state) {
                // Grab State Name and data value
                let dataDate = d3.timeParse("%m/%d/%Y")(data[i].Date)
                let dataValue = Number(data[i].Percentage);
                stamps.push({dataDate, dataValue});
            }
        };
    
        function plotStampLine() {      
           console.log(stamps)
            let x = d3.scaleTime()
                    .domain(d3.extent(stamps, function(d) { return d.dataDate; }))
                    .range([0, VIS_WIDTH]);
            FRAME3.append("g")
                    .attr('id', 'stampxaxis')
                    .call(d3.axisBottom(x))
                    .attr('transform', "translate(" + MARGINS.left + "," + (VIS_HEIGHT + MARGINS.top) + ')');

            let y = d3.scaleLinear()
                          .domain(d3.extent(stamps, function(d) { return d.dataValue; }))
                          .range([VIS_HEIGHT, 0]);
            FRAME3.append("g")
                    .attr('id', 'stampyaxis')
                    .call(d3.axisLeft(y))
                    .attr('transform', "translate(" + MARGINS.left + "," + MARGINS.top + ')');
        
            // Add the line
            FRAME3.append("path")
              .datum(stamps)
              .attr("fill", "none")
              .attr("stroke", "green")
              .attr("stroke-width", 2)
              .attr('id', 'stampline')
              .attr("d", d3.line()
                .x(function(a) { return x(a.dataDate) })
                .y(function(a) { return y(a.dataValue) })
                )
                .attr('transform', "translate(" + MARGINS.left + "," + MARGINS.top + ')')
        
        
            // map title
            FRAME3.append('text')
                .attr('id', 'stamptitle')
                .attr("text-anchor", 'middle')
                .attr("x", "50%")
                .attr("y", MARGINS.top)
                .attr("font-size", 16)
                .text(function(d) { return "FOOD STAMP USAGE IN " + state.toUpperCase(); });
        
            // x and y labels
            FRAME3.append("text")
                .attr("text-anchor", "end")
                .attr("x", VIS_WIDTH + MARGINS.left)
                .attr("y", FRAME_HEIGHT)
                .text("Months")
                .attr("font-size", 13);
        
            FRAME3.append("text")
                .attr("text-anchor", "end")
                .attr("transform", "rotate(-90)")
                .attr("y", MARGINS.top/3)
                .attr("x", -MARGINS.left)
                .text("Population Percentage")
                .attr("font-size", 13);
        }
        plotStampLine();




    })
}