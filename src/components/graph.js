import {useEffect, useRef} from 'react'; 
import * as d3 from 'd3';
import { getNodes } from '../utils/getNodes';
import { getLinks } from '../utils/getLinks';   
import {drag} from '../utils/drag';


export function Graph(props) {
        const { margin, svg_width, svg_height, data } = props;

        const nodes = getNodes({rawData: data});
        const links = getLinks({rawData: data});
    
        const width = svg_width - margin.left - margin.right;
        const height = svg_height - margin.top - margin.bottom;

        const lineWidth = d3.scaleLinear().range([2, 6]).domain([d3.min(links, d => d.value), d3.max(links, d => d.value)]);
        const radius = d3.scaleLinear().range([10, 50])
                .domain([d3.min(nodes, d => d.value), d3.max(nodes, d => d.value)]);
        const color = d3.scaleOrdinal().range(d3.schemeCategory10).domain(nodes.map( d => d.name));

        // Q1.4: Add a tooltip to each node
        useEffect(() => {
            d3.select("body").selectAll(".newTooltip").remove();
            const tooltip = d3.select("body")
                .append("div")
                .attr("class", "newTooltip")
                .style("position", "absolute")
                .style("pointer-events", "none")
                .style("background", "white")
                .style("border", "1px solid gray")
                .style("border-radius", "4px")
                .style("padding", "4px 8px")
                .style("font-size", "12px")
                .style("visibility", "hidden")
                .style("z-index", "10");
            return () => {
                    tooltip.remove();
                };
        }, []);

        const d3Selection = useRef();
        useEffect( ()=>{
            // Remove previous graph
            let g = d3.select(d3Selection.current);
            g.selectAll("*").remove();

            const simulation =  d3.forceSimulation(nodes)
                .force("link", d3.forceLink(links).id(d => d.name).distance(d => 20/d.value))
                .force("charge", d3.forceManyBody())
                .force("center", d3.forceCenter(width/2, height/2))
                .force("y", d3.forceY([height/2]).strength(0.02))
                .force("collide", d3.forceCollide().radius(d => radius(d.value)+20))
                .tick(3000);
            
            // let g = d3.select(d3Selection.current);
            const link = g.append("g")
                .attr("stroke", "#999")
                .attr("stroke-opacity", 0.6)
                .selectAll("line")
                .data(links)
                .join("line")
                .attr("stroke-width", d => lineWidth(d.value));

            const node = g.append("g")
                .attr("stroke", "#fff")
                .attr("stroke-width", 1.5)
                .selectAll("circle")
                .data(nodes)
                .enter();

            const point = node.append("circle")
                .attr("r", d => radius(d.value))
                .attr("fill", d => color(d.name))
                .call(drag(simulation))

            // Q1.4: Add mouse events to each node
            point.on("mouseover", function(event, d) {
                d3.select(".newTooltip")
                    .style("visibility", "visible")
                    .text(`${d.name}`);
            })
            .on("mousemove", function(event) {
                d3.select(".newTooltip")
                    .style("top", `${event.pageY}px`)
                    .style("left", `${event.pageX}px`);
            })
            .on("mouseout", function() {
                d3.select(".newTooltip")
                    .style("visibility", "hidden");
            });

            // Q1.3: Add a legend to the upper left corner of the view
            const legend = g.append("g")
                .attr("transform", "translate(40, 0)");

            const legendItem = legend.selectAll("g")
                .data(nodes)
                .join("g")
                .attr("transform", (d, i) => `translate(0, ${i * 20})`);

            legendItem.append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", 12)
                .attr("height", 12)
                .style("fill", d => color(d.name));

            legendItem.append("text")
                .attr("x", 18)
                .attr("y", 10)
                .style("font-size", "12px")
                .text(d => d.name);
            
            // Q1.3: Remove the names on nodes
            // const node_text = node.append('text')
            //     .style("fill", "black")
            //     .attr("stroke", "black")
            //     .text(d => d.name)

            simulation.on("tick", () => {
                link
                    .attr("x1", d => d.source.x)
                    .attr("y1", d => d.source.y)
                    .attr("x2", d => d.target.x)
                    .attr("y2", d => d.target.y);

                point
                    .attr("cx", d => d.x)
                    .attr("cy", d => d.y);
                
                // node_text
                //     .attr("x", d => d.x -radius(d.value)/4)
                //     .attr("y", d => d.y)
            });

        }, [width, height])


        return <svg 
            viewBox={`0 0 ${svg_width} ${svg_height}`}
            preserveAspectRatio="xMidYMid meet"
            style={{ width: "100%", height: "100%" }}
            > 
                <g ref={d3Selection} transform={`translate(${margin.left}, ${margin.top})`}>
                </g>
            </svg>
    };