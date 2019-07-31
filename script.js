let currentSlide = 1;
let slideData;
let startYear, endYear;
let svg, g;
let graphWidth, graphHeight, canvasWidth, canvasHeight, margin;
const interval = (2015 - 1900 + 1) / 4;
const significantEvents = {
    "1918": {
        "title": "Spanish Flu (H1N1)",
        "description": "Most severe pandemic in recent history, caused by a virus of avian origin. 500 million people or one-third of the world’s population became infected with this virus. High mortality in healthy people was a unique feature of this pandemic.",
        "link": "https://www.cdc.gov/flu/pandemic-resources/1918-pandemic-h1n1.html"
    },
    "1940": {
        "title": "Medical developments in 1940s",
        "description": "First inactivated flu vaccine was developed and licensed for use in civilians. Mechanical ventilators were developed to support breathing in patients suffering from respiratory complications.",
        "link": "https://www.cdc.gov/flu/pandemic-resources/pandemic-timeline-1930-and-beyond.htm"
    },
    "1957": {
        "title": "Asian Flu (H2N2)",
        "description": "A new virus emerged in East Asia, triggering a pandemic. First reported in Singapore, then Hong Kong and in coastal cities in the United States.Estimated number of deaths was 1.1 million worldwide.",
        "link": "https://www.cdc.gov/flu/pandemic-resources/1957-1958-pandemic.html"
    },
    "1968": {
        "title": "Hong Kong Flu (H3N2)",
        "description": "A virus that combined parts of an avian influenza A virus and the 1957 H2N2 virus. Estimated number of deaths was 1 million worldwide, mostly affecting people 65 years and older. Continues to circulate worldwide as a seasonal influenza A virus.",
        "link": "https://www.cdc.gov/flu/pandemic-resources/1968-pandemic.html"
    },
    "1999": {
        "title": "Pandemic planning and drug development",
        "description": "WHO published a framework to enhance influenza surveillance, vaccine production and distribution, antiviral drugs, influenza research and emergency preparedness. The neuraminidase inhibitors oseltamivir (Tamiflu) and zanamivir (Relenza) were licensed to treat influenza infection.",
        "link": "https://www.cdc.gov/flu/pandemic-resources/pandemic-timeline-1930-and-beyond.htm"
    },
    "2002": {
        "title": "SARS outbreak",
        "description": "Severe acute respiratory syndrome (SARS) outbreak in southern China caused an eventual 8,098 cases, resulting in 774 deaths reported in 37 countries. Most SARS patients develop pneumonia.",
        "link": "https://www.cdc.gov/sars/about/fs-sars.html#outbreak"
    },
    "2009": {
        "title": "Swine Flu (H1N1)",
        "description": "A novel virus with an unidentified combination of genes from bird, swine and human flu viruses. Hence, seasonal flu vaccines offered little cross-protection against this virus. First found in the United States, it spread quickly across the world. Mainly affected children, and young and middle-aged adults.",
        "link": "https://www.cdc.gov/flu/pandemic-resources/1957-1958-pandemic.html"
    }
};

async function init() {
    const data = await d3.csv("https://xmd3project.github.io/NCHS_Age-adjusted_Death_Rates_for_Selected_Major_Causes_of_Death.csv");
    slideData = mapMortalityData(data);

    marginX = 280;
    marginY = 150;
    graphWidth = window.innerWidth - 2 * marginX;
    graphHeight = window.innerHeight - 2 * marginY;
    canvasWidth = window.innerWidth - marginX;
    canvasHeight = window.innerHeight - marginY;

    goTo(0);
};

function drawStaticElems() {
    // Plot labels
    g.append("text")
        .attr("class", "title")
        .attr("text-anchor", "middle")
        .attr("x", graphWidth / 2)
        .attr("y", -marginX / 4)
        .attr("dy", "+.75em")
        .text('Age-adjusted Death Rates for Influenza and Pneumonia');
    g.append("text")
        .attr("class", "axis-label")
        .attr("text-anchor", "end")
        .attr("x", graphWidth / 2)
        .attr("y", graphHeight + 40)
        .text('Year');
    g.append("text")
        .attr("class", "axis-label")
        .attr("text-anchor", "middle")
        .attr("x", -graphHeight / 2)
        .attr("y", -40)
        .attr("dy", "-.75em")
        .attr("transform", "rotate(-90)")
        .text('Age-adjusted Death Rate (Deaths per 100,000)');
}

function drawDynamicElems(slideDataSingle) {

    d3.select("svg").remove();

    let minMortality = Math.min(...slideDataSingle.map(record => record.mortality));
    let maxMortality = Math.max(...slideDataSingle.map(record => record.mortality));

    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("display", "none");

    let xScale = d3.scaleLinear()
        .domain([startYear, endYear])
        .range([0, graphWidth]);

    let yScale = d3.scaleLinear()
        .domain([minMortality, maxMortality])
        .range([graphHeight, 0]);

    let line = d3.line()
        .x(d => xScale(d.year))
        .y(d => yScale(d.mortality));

    var xAxis = d3.axisBottom(xScale)
        .ticks(5)
        .tickFormat(d3.format("d"));

    var yAxis = d3.axisLeft(yScale)
        .ticks(4);

    svg = d3.select("body").append("svg")
        .attr("width", canvasWidth)
        .attr("height", canvasHeight)
        .attr("transform", `translate(${marginX / 2}, ${marginY / 2})`);

    g = svg.append("g")
        .attr("transform", `translate(${marginX / 2}, ${marginY / 2})`);

    // draw axes
    g.append("g")
        .attr("class", "y-axis")
        .call(yAxis);
    g.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${graphHeight})`)
        .call(xAxis);

    // draw line
    const path = g.append("path")
        .datum(slideDataSingle)
        .attr("class", "line hidden")
        .attr("d", line);
    const length = path.node().getTotalLength();
    path.attr("stroke-dasharray", `${length} ${length}`)
        .attr("stroke-dashoffset", length)
        .transition()
        .duration(5000)
        .attr("class", "line")
        .attr("stroke-dashoffset", 0);

    g.selectAll(".dot")
        .data(slideDataSingle)
        .enter().append("circle")
        .attr("class", d => significantEvents[d.year] ? 'dot detailed' : 'dot')
        .attr("cx", d => xScale(d.year))
        .attr("cy", d => yScale(d.mortality))
        .attr("r", 5)
        .on('mouseover', d => {
            tooltip.style("display", "block")
                .style("opacity", 1)
                .style("left", `${d3.event.pageX}px`)
                .style("top", `${d3.event.pageY}px`)
                .html(`
                    <div><b>Year</b>: ${d.year}<br></div>
                    <div><b>Death rate</b>: ${d.mortality}</div>
                `);
            const detail = significantEvents[d.year];
            if (detail) {
                tooltip.append('div')
                    .attr('class', 'detail')
                    .html(`
                    <b>${detail.title}</b>: ${detail.description}
                `);
                tooltip.append('img')
                    .attr('src', "./external-link.png")
                    .attr('class', 'link-out');
            }
        })
        .on('click', d => {
            const detail = significantEvents[d.year];
            if (detail) {
                window.open(significantEvents[d.year].link);
            }
        })
        .on('mouseout', () => {
            tooltip.style("opacity", 0)
            .style("display", "none");
        });
}

function mapMortalityData(data) {
    const slideData = [[]];
    let slideNum = 0;
    data
        .filter(d => d.Cause === 'Influenza and Pneumonia')
        .map(d => ({
            year: Number(d.Year),
            mortality: Number(d['Age Adjusted Death Rate'])
        }))
        .forEach(d => {
            if (Math.floor((d.year - 1900) / interval) > slideNum) {
                ++slideNum;
                slideData.push([]);
            }
            slideData[slideNum].push(d);
        });
    return slideData;
};

function goTo(slideNum) {
    currentSlide = slideNum;
    highlightSlide();
    const slideDataSingle = slideData[slideNum];
    startYear = slideDataSingle[0].year;
    endYear = slideDataSingle[slideDataSingle.length - 1].year;

    drawDynamicElems(slideDataSingle);
    drawStaticElems();
    const prev = document.getElementsByClassName('prev')[0];
    const next = document.getElementsByClassName('next')[0];
    if (startYear === 1900) {
        prev.classList.add('hidden');
        next.classList.remove('hidden');
    } else if (endYear === 2015) {
        prev.classList.remove('hidden');
        next.classList.add('hidden');
    } else {
        prev.classList.remove('hidden');
        next.classList.remove('hidden');
    }
}

function goNext() {
    if (endYear !== 2015) {
        currentSlide++;
        goTo(currentSlide);
    }
}

function goPrev() {
    if (startYear !== 1900) {
        currentSlide--;
        goTo(currentSlide);
    }
}

function highlightSlide() {
    const oldIndicator = document.getElementsByClassName('current');
    if (oldIndicator.length > 0) {
        oldIndicator[0].classList.remove('current');
    }
    document.getElementsByClassName(`slide-${currentSlide}`)[0].classList.add('current');
}