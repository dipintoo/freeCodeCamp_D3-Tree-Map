(async () => {
  try {
    const dataset = await d3.json(
      "https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/movie-data.json"
    );

    const width = 1000;
    const height = 600;

    const padding = {
      top: 160,
      right: 0,
      left: 0,
      bottom: 0
    };

    const labelPadding = 5;

    const toolTipSpacingY = -30;
    const toolTipSpacingX = 20;

    const legendSpacing = 5;
    const legendRectW =
      (width -
        padding.left -
        padding.right -
        450 -
        (dataset.children.length - 1) * legendSpacing) /
      dataset.children.length;
    const legendRectH = 20;

    const tileStroke = "white";
    const colors = {};

    // Color-generator function
    const colorBuilder = () => {
      const numberOfColors = dataset.children.length;
      const hueStep = 2000 / numberOfColors;

      dataset.children.forEach((d, i) => {
        colors[d.name] = `hsl(${Math.round(i * hueStep + hueStep / 2)}, 75%, 80%)`;
      });
    };

    colorBuilder();

    // The treemap

    const svg = d3
      .select("#container")
      .append("svg")
      .attr("id", "chart")
      .attr("width", width)
      .attr("height", height);
    svg
      .append("text")
      .attr("id", "title")
      .text("Movie Sales")
      .attr("x", width / 2)
      .attr("y", (2 / 5) * padding.top)
      .attr("text-anchor", "middle");

    svg
      .append("text")
      .attr("id", "description")
      .text("Top 100 highest grossing movies by genre")
      .attr("x", width / 2)
      .attr("y", (2 / 5) * padding.top + 14)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "hanging");

    const legend = svg
      .append("g")
      .attr("id", "legend")
      .attr("transform", "translate(450,120)")
      .selectAll("g")
      .data(dataset.children)
      .enter()
      .append("g");

    legend
      .append("rect")
      .attr("class", "legend-item")
      .attr("width", legendRectW)
      .attr("height", legendRectH)
      .attr("x", (d, i) => i * (legendRectW + legendSpacing))
      .attr("fill", (d) => colors[d.name]);

    legend
      .append("text")
      .attr("class", "legend-label")
      .attr("x", (d, i) => legendRectW / 2 + i * (legendRectW + legendSpacing))
      .attr("y", legendRectH / 2)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .text((d) => d.name);

    const toolTipBox = d3
      .select("#container")
      .append("div")
      .attr("id", "tooltip");
    const toolTipContent = (d) => {
      const tempValue = parseInt(d.data.value);
      const localeValue = tempValue.toLocaleString(undefined, {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0
      });

      return `<span id='tooltip-name'>${d.data.name}</span><br/><span id='tooltip-category'>(${d.data.category})</span><br/><span id='tooltip-value'>${localeValue}</span>`;
    };

    const root = d3.hierarchy(dataset);

    const treemapLayout = d3
      .treemap()
      .size([
        width - padding.left - padding.right,
        height - padding.top - padding.bottom
      ])
      .paddingInner(0);
    root.sum((d) => d.value);

    treemapLayout(root);

    const tiles = svg
      .append("g")
      .attr("id", "treemap")
      .attr("transform", `translate(${padding.left}, ${padding.top})`)
      .selectAll("g")
      .data(root.leaves())
      .enter()
      .append("g")
      .attr("transform", (d) => `translate(${d.x0}, ${d.y0})`);

    tiles
      .append("rect")
      .attr("class", "tile")
      .attr("data-name", (d) => d.data.name)
      .attr("data-category", (d) => d.data.category)
      .attr("data-value", (d) => d.data.value)
      .attr("width", (d) => d.x1 - d.x0)
      .attr("height", (d) => d.y1 - d.y0)
      .attr("stroke", tileStroke)
      .attr("fill", (d) => colors[d.data.category])
      .on("mousemove", (d, i) => {
        toolTipBox
          .html(toolTipContent(d))
          .attr("data-value", d.data.value)
          .style("top", `${d3.event.pageY + toolTipSpacingY}px`)
          .style("left", `${d3.event.pageX + toolTipSpacingX}px`)
          .style("opacity", 0.9)
          .style("display", "block"); // show tooltip
      })
      .on("mouseout", (d, i) => {
        toolTipBox.style("opacity", 0).style("display", "none");
      });

    tiles
      .append("foreignObject")
      .attr("width", (d) => d.x1 - d.x0) // same width as its tile group
      .attr("height", 0.01)
      .attr("class", "tile-label")
      .html((d) => d.data.name);
  } catch (error) {
    console.error("An error occurred:", error);
  }
})();
