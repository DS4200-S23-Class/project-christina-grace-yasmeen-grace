// TAB CONTROLLING FUNCTION
function openTab(evt, tabName) {
  // Declare all variables
  let i, tabcontent, tablinks;

  // Get all elements with class="tabcontent" and hide them
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Get all elements with class="tablinks" and remove the class "active"
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";
}

// Setting motivation tab as default page
document.getElementById("defaultOpen").click();




// US MAP CODE
const MAP_FRAME_HEIGHT = 500;
const MAP_FRAME_WIDTH = 900;
const MAP_MARGINS = {left: 40, right: 40, top: 40, bottom: 40};
const MAP_VIS_HEIGHT = MAP_FRAME_HEIGHT - MAP_MARGINS.top - MAP_MARGINS.bottom
const MAP_VIS_WIDTH = MAP_FRAME_WIDTH - MAP_MARGINS.left - MAP_MARGINS.right

const FRAME1 = d3.select("#USMap")
                  .append("svg")
                    .attr("height", MAP_FRAME_HEIGHT)
                    .attr("width", MAP_FRAME_WIDTH)
                    .attr("class", "frame");

// frame for slider ticks
const FRAME0 = d3.select("#sliderDiv")
                  .append("svg")
                    .attr("height", 50)
                    .attr("width", 500)
                    .attr("class", "frame");

// years for each slider tick
FRAME0.append('text')
    .attr("text-anchor", 'start')
    .attr("x", 130)
    .attr('y', 15)
    .text("2019")
    .attr("font-size", 14);

FRAME0.append('text')
    .attr("text-anchor", 'start')
    .attr("x", 195)
    .attr('y', 15)
    .text("2020")
    .attr("font-size", 14);

FRAME0.append('text')
    .attr("text-anchor", 'start')
    .attr("x", 260)
    .attr('y', 15)
    .text("2021")
    .attr("font-size", 14);

FRAME0.append('text')
    .attr("text-anchor", 'start')
    .attr("x", 325)
    .attr('y', 15)
    .text("2022")
    .attr("font-size", 14);


// creating new map for data to be pushed into
let myMap = new Map();
const promises = [];

// pushing json and state data for the map into promises
promises.push(d3.json("https://gist.githubusercontent.com/Bradleykingz/3aa5206b6819a3c38b5d73cb814ed470/raw/a476b9098ba0244718b496697c5b350460d32f99/us-states.json"));
promises.push(d3.csv("data/averageprices.csv"), (d) => myMap.set(d.State, + d.AverageUnitPrice));

// dropdown food category selection
let allGroup = ['Dairy', 'Alcohol', 'Beverages', 'Commercially prepared items', 'Fats and oils', 'Fruits',
                'Grains', 'Meats, eggs, and nuts', 'Sugar and sweeteners', 'Vegetables']

// updating category based on dropdown selection
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
    cat = newCat;
    FRAME1.select('#legendTicks').remove();
    // removes line charts
    FRAME2.select('#pricexaxis').remove();
    FRAME2.select('#priceyaxis').remove();
    FRAME2.select('#priceline').remove();
    FRAME2.select('#pricetitle').remove();
    FRAME2.select('#pricexlabel').remove();
    FRAME2.select('#priceylabel').remove();
    FRAME3.select('#stampxaxis').remove();
    FRAME3.select('#stampyaxis').remove();
    FRAME3.select('#stampline').remove();
    FRAME3.select('#stamptitle').remove();
    FRAME3.select('#stampxlabel').remove();
    FRAME3.select('#stampylabel').remove();

    buildMap(yr, newCat);
}

// updating year based on slider selection
let slider = d3.select("#mySlider").on("change", function(d){
    yr = this.value;
    updateYr(yr);
  });


let yr = 2021;  

// slider update map function
function updateYr(newYr) {
    yr = newYr
    FRAME1.select('#legendTicks').remove();
    buildMap(newYr, cat);
    // removes line charts
    FRAME2.select('#pricexaxis').remove();
    FRAME2.select('#priceyaxis').remove();
    FRAME2.select('#priceline').remove();
    FRAME2.select('#pricetitle').remove();
    FRAME2.select('#pricexlabel').remove();
    FRAME2.select('#priceylabel').remove();
    FRAME3.select('#stampxaxis').remove();
    FRAME3.select('#stampyaxis').remove();
    FRAME3.select('#stampline').remove();
    FRAME3.select('#stamptitle').remove();
    FRAME3.select('#stampxlabel').remove();
    FRAME3.select('#stampylabel').remove();
};


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

// event handler for click
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

// create map function
function buildMap(yr, cat) {
    myPromises = Promise.all(promises).then((mydata) => {
        
        const data = mydata[1];
        const json = mydata[0];
        const prices = [];
        
        // iterating through promises to find data specific for given category and year
        for (let i = 0; i < data.length; i++) {
            if (data[i].Category == cat && data[i].Year == Number(yr)) {
                // Grab State Name and data value
                let dataState = data[i].State;
                let dataValue = Number(data[i].AverageUnitPrice);
                prices.push(dataValue);

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
            .text("*states colored white have no data and there is missing food stamp data for KS, NE, IA, MS")
            .attr("font-size", 11);

        // click state to show info text
        FRAME1.append('text')
            .attr("text-anchor", 'start')
            .attr("x", 0)
            .attr('y', MAP_MARGINS.top + MAP_VIS_HEIGHT)
            .text("Click each state to see the corresponding food stamp")
            .attr("font-size", 16)
            .attr("font-weight", "bold");
        FRAME1.append('text')
            .attr("text-anchor", 'middle')
            .attr("x", MAP_MARGINS.left + 0.16 * MAP_VIS_WIDTH)
            .attr('y', MAP_MARGINS.top + MAP_VIS_HEIGHT + 18)
            .text("and unit price data over the year!")
            .attr("font-size", 16)
            .attr("font-weight", "bold");

        // creating map itself with colors based on state value
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



// line chart charts
const FRAME_HEIGHT = 400;
const FRAME_WIDTH = 550;
const MARGINS = {left: 50, right: 50, top: 40, bottom: 40};
const VIS_HEIGHT = FRAME_HEIGHT - MARGINS.top - MARGINS.bottom
const VIS_WIDTH = FRAME_WIDTH - MARGINS.left - MARGINS.right

// setting frame for line charts
const FRAME2 = d3.select("#priceLineChart")
                  .append("svg")
                    .attr("height", FRAME_HEIGHT)
                    .attr("width", FRAME_WIDTH)
                    .attr("class", "frame");
//Unit Price
const promises2 = [];

// pushing prices data into promises 
promises2.push(d3.csv("data/cleanprices.csv"));

// function to create line chart for prices 
function buildPriceLine(cat, yr, state){
    myPromises = Promise.all(promises2).then((mydata) => {

        const data = mydata[0];
        let prices = [];

        // iterate through promises to get specific data for given category, year, and state
        for (let i = 0; i < data.length; i++) {
            if (data[i].Category == cat && data[i].Year == Number(yr) && data[i].State == state) {
                // Grab State Name and data value
                let dataDate = d3.timeParse("%m/%d/%Y")(data[i].Date)
                let dataValue = Number(data[i].UnitPrice);
                prices.push({dataDate, dataValue});
            }
        };
    
        // plot line chart for prices of corresponding selected state 
        function plotPriceLine() {      
            let x = d3.scaleTime()
                    .domain(d3.extent(prices, function(d) { return d.dataDate; }))
                    .range([0, VIS_WIDTH]);

            // adding x axis 
            FRAME2.append("g")
                    .attr('id', 'pricexaxis')
                    .attr('transform', "translate(" + MARGINS.left + "," + (VIS_HEIGHT + MARGINS.top) + ')')
                    .call(d3.axisBottom(x))
                    .selectAll("text") 
                        .style("text-anchor", "end")
                        .attr("transform", "rotate(-20)");

            let y = d3.scaleLinear()
                          .domain(d3.extent(prices, function(d) { return d.dataValue; }))
                          .range([VIS_HEIGHT, 0]);

            // adding y axis 
            FRAME2.append("g")
                    .attr('id', 'priceyaxis')
                    .attr("class", "axis")
                    .call(d3.axisLeft(y).ticks(10, "$.2f"))
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
        
            // x label
            FRAME2.append("text")
                .attr("text-anchor", "end")
                .attr('id', 'pricexlabel')
                .attr("x", VIS_WIDTH + MARGINS.left)
                .attr("y", FRAME_HEIGHT)
                .text("Months")
                .attr("font-size", 12);
        
            // y label
            FRAME2.append("text")
                .attr("text-anchor", "end")
                .attr('id', 'priceylabel')
                .attr("transform", "rotate(-90)")
                .attr("y", MARGINS.top/5)
                .attr("x", -MARGINS.left)
                .text("Unit Price")
                .attr("font-size", 12);
        }
        // call function
        plotPriceLine();




    })
};


//Food Stamps
const FRAME3 = d3.select("#stampLineChart")
                  .append("svg")
                    .attr("height", FRAME_HEIGHT)
                    .attr("width", FRAME_WIDTH)
                    .attr("class", "frame");
const promises3 = [];


// pushing stamp data into promises 
promises3.push(d3.csv("data/cleanstamps.csv"));

// function to create line chart for food stamp usage 
function buildStampLine(yr, state){
    myPromises = Promise.all(promises3).then((mydata) => {

        const data = mydata[0];
        let stamps = [];

        // iterating through promises to get data given year and state 
        for (let i = 0; i < data.length; i++) {
            if (data[i].Year == Number(yr) && data[i].State == state) {
                // Grab State Name and data value
                let dataDate = d3.timeParse("%m/%d/%Y")(data[i].Date)
                let dataValue = Number(data[i].Percentage);
                stamps.push({dataDate, dataValue});
            }
        };
    
        // plot line chart for stamp usage of corresponding selected state 
        function plotStampLine() {      
            let x = d3.scaleTime()
                    .domain(d3.extent(stamps, function(d) { return d.dataDate; }))
                    .range([0, VIS_WIDTH]);

            // setting x axis
            FRAME3.append("g")
                    .attr('id', 'stampxaxis')
                    .attr('transform', "translate(" + MARGINS.left + "," + (VIS_HEIGHT + MARGINS.top) + ')')
                    .call(d3.axisBottom(x))
                    .selectAll("text") 
                        .style("text-anchor", "end")
                        .attr("transform", "rotate(-20)");

            let y = d3.scaleLinear()
                          .domain(d3.extent(stamps, function(d) { return d.dataValue; }))
                          .range([VIS_HEIGHT, 0]);

            // setting y axis
            FRAME3.append("g")
                    .attr('id', 'stampyaxis')
                    .call(d3.axisLeft(y).ticks(10, ".2%"))
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
        
            // x label
            FRAME3.append("text")
                .attr("text-anchor", "end")
                .attr('id', 'stampxlabel')
                .attr("x", VIS_WIDTH + MARGINS.left)
                .attr("y", FRAME_HEIGHT)
                .text("Months")
                .attr("font-size", 12);
        
            // y label
            FRAME3.append("text")
                .attr("text-anchor", "end")
                .attr('id', 'stampylabel')
                .attr("transform", "rotate(-90)")
                .attr("y", MARGINS.top/5)
                .attr("x", -MARGINS.left)
                .text("Population Percentage")
                .attr("font-size", 12);
        }
        // call function
        plotStampLine();




    })
};