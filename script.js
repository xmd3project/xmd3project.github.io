let currentSlide = 0;
let slideData, mortalityData;
let startYear, endYear;
let svg, g;
let graphWidth, graphHeight, canvasWidth, canvasHeight, margin;
const interval = (2015 - 1900 + 1) / 4;
let initialLoad = true;
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
    mortalityData = getMortalityData(data);
    slideData = getSlideData(mortalityData);

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
    if (initialLoad || currentSlide !== 0) {
        path.attr("stroke-dasharray", `${length} ${length}`)
            .attr("stroke-dashoffset", length)
            .transition()
            .duration(5000)
            .attr("class", "line")
            .attr("stroke-dashoffset", 0);
    } else {
        path.attr("class", "line");
    }
    g.selectAll(".dot")
        .data(slideDataSingle)
        .enter().append("circle")
        .style('display', () => slideDataSingle.length === 2015 - 1900 + 1 ? 'none' : 'normal')
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

    if (slideDataSingle.length === 2015 - 1900 + 1) {
        const slices = [1900, 1929, 1958, 1987];
        let xRectScale = d3.scaleBand()
            .domain(slices)
            .range([0, graphWidth])
        g.selectAll("rect")
            .data(slices)
            .enter()
            .append("rect")
            .style('opacity', 0)
            .attr("x", d => xRectScale(d))
            .attr("y", yScale(maxMortality))
            .attr("width", graphWidth / 4)
            .attr("height", yScale(minMortality))
            .on('click', (d, i) => goTo(i + 1));
        for (let i = 0; i < 4; i++) {
            g.append("text")
                .attr("class", "subtitle")
                .attr("text-anchor", "middle")
                .attr("x", graphWidth / 2)
                .attr("y", -marginX / 6)
                .attr("dy", "+.75em")
                .style("opacity", 0);
        }
        if (initialLoad) {
            animateSlidePreview(g);
            animateYearRangeSubtitle(g);
        } else if (currentSlide === 0) {
            g.selectAll(".subtitle")
                .text((d, i) => `${1900 + i * 29} - ${1900 + (i + 1) * 29 - 1}`)
            addYearRangeSubtitleHover(g);
        }

    } else {
        g.append("text")
            .attr("class", "subtitle")
            .attr("text-anchor", "middle")
            .attr("x", graphWidth / 2)
            .attr("y", -marginX / 6)
            .attr("dy", "+.75em")
            .text(`${1900 + (currentSlide - 1) * 29} - ${1900 + currentSlide * 29 - 1}`)
    }
}

function animateSlidePreview(g) {
    setTimeout(() => {
        g.selectAll("rect")
            .attr('class', 'rect')
            .transition()
            .delay((d, i) => 700 * i)
            .duration(600)
            .style('opacity', 0.2)
            .transition()
            .style('opacity', 0);

        g.selectAll(".subtitle")
            .text((d, i) => `${1900 + i * 29} - ${1900 + (i + 1) * 29 - 1}`)
            .transition()
            .delay((d, i) => 700 * i)
            .duration(600)
            .style('opacity', 1)
            .transition()
            .style('opacity', 0);
    }, 4500);
}
function animateYearRangeSubtitle(g) {
    setTimeout(() => {
        addYearRangeSubtitleHover(g);
    }, 7000);
}
function addYearRangeSubtitleHover(g) {
    g.selectAll("rect")
        .attr('class', 'rect done')
        .on('mouseover', (d, i) => {
            g.selectAll(".subtitle")
                .transition()
                .style('opacity', (d2, i2) => i2 === i ? 1 : 0);
        })
        .on('mouseout', () => {
            g.selectAll(".subtitle")
                .transition()
                .style('opacity', 0);
        });
}

function getSlideData(fullData) {
    const slideData = [[]];
    let slideNum = 0;
    fullData.forEach(d => {
        if (Math.floor((d.year - 1900) / interval) > slideNum) {
            ++slideNum;
            slideData.push([]);
        }
        slideData[slideNum].push(d);
    });
    return slideData;
};

function getMortalityData(data) {
    return data
        .filter(d => d.Cause === 'Influenza and Pneumonia')
        .map(d => ({
            year: Number(d.Year),
            mortality: Number(d['Age Adjusted Death Rate'])
        }));
}

function goTo(slideNum) {

    currentSlide = slideNum;
    let graphData;
    const prev = document.getElementsByClassName('prev')[0];
    const next = document.getElementsByClassName('next')[0];

    if (slideNum !== 0) {
        initialLoad = false;
        document.getElementsByClassName('slide-nav')[0].classList.remove('hidden');
        document.getElementsByClassName('slide-0')[0].classList.remove('hidden');
        graphData = slideData[slideNum - 1];
        startYear = graphData[0].year;
        endYear = graphData[graphData.length - 1].year;

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
    } else {
        graphData = mortalityData;
        startYear = 1900;
        endYear = 2015;
        prev.classList.add('hidden');
    }

    highlightSlide();
    drawDynamicElems(graphData);
    drawStaticElems();

}

function goNext() {
    if (startYear !== 1987) {
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