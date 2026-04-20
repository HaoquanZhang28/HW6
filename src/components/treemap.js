// import React from "react";
import React from "react";
import {getTree} from "../utils/getTree";
import { treemap, hierarchy, scaleOrdinal, schemeDark2, format } from "d3";

function TreeMapText ({ x, y, width, height, name, value, total, attr }) {
    const pctg = total ? ((value / total) * 100).toFixed(1) + "%" : "";

    return (
        <foreignObject x={x} y={y} width={width} height={height}>
            <div xmlns="http://www.w3.org/1999/xhtml" style={{ fontSize: "0.6em", padding: "2px", pointerEvents: "none", color: "white" }}>
                <div>{attr}:{name}</div>
                <div>Value: {pctg}</div>
            </div>
        </foreignObject>
    );
}

export function TreeMap(props) {
    const { margin, svg_width, svg_height, tree, selectedCell, setSelectedCell } = props;
    const innerWidth = svg_width - margin.left - margin.right;
    const innerHeight = svg_height - margin.top - margin.bottom;
    const treemapLayout = treemap()
            .size([innerWidth, innerHeight])
            .paddingInner(3)
            .paddingOuter(5)
            .round(true);
    const color = scaleOrdinal(schemeDark2);
    let root = null;
    if (tree) {
        const h = hierarchy(tree).sum(d => d.value || 0)
            .sort((a, b) => b.value - a.value);
        root = treemapLayout(h);
    }
    if (!root) {
        return <div>No data</div>;
    }
    const leaves = root.leaves();
    if (leaves.length === 0) {
        return <div>No data</div>;
    }
    const total = root.value;
    const topLevelGroups = root.children || [];
    return <svg 
                viewBox={`0 0 ${svg_width} ${svg_height}`} 
                preserveAspectRatio="xMidYMid meet" 
                style={{ width: "100%", height: "100%" }}>
                <g transform={`translate(${margin.left},${margin.top})`}>
                    {leaves.map((d, i) => {
                        const width = d.x1 - d.x0;
                        const height = d.y1 - d.y0;
                        const isSelected = selectedCell === d.data.name;

                        return (
                            <g key={i}>
                                <rect x={d.x0} y={d.y0} width={width} height={height} fill={color(d.data.name)} stroke="#fff" strokeWidth={isSelected ? 4 : 1.5} opacity={isSelected ? 1 : 0.9} style={{ cursor: "pointer", transition: "all 0.2s ease" }}
                                    onClick={() => setSelectedCell && setSelectedCell(d.data.name)}
                                    onMouseOver={(e) => {
                                        e.target.style.opacity = 1;
                                        e.target.style.strokeWidth = "4px";
                                        e.target.style.fill = "red";
                                        }}
                                    onMouseLeave={(e) => {
                                        e.target.style.opacity = isSelected ? 1 : 0.92;
                                        e.target.style.strokeWidth = isSelected ? "5px" : "2px";
                                        e.target.style.fill = color(d.data.name);
                                    }}
                                    />
                            <TreeMapText x={d.x0} y={d.y0} width={width} height={height} name={d.data.name} value={d.data.value} total={total} attr={d.data.attr} />
                            </g>
                        );
                    })}

                    {topLevelGroups.map((group, i) => {
                        if (!group.children || group.children.length === 0) return null;
                        const groupLeaves = group.leaves();
                        if (groupLeaves.length === 0) return null;
                        const minX = Math.min(...groupLeaves.map(d => d.x0));
                        const maxX = Math.max(...groupLeaves.map(d => d.x1));
                        const minY = Math.min(...groupLeaves.map(d => d.y0));
                        const maxY = Math.max(...groupLeaves.map(d => d.y1));
                        const centerX = (minX + maxX) / 2;
                        const centerY = (minY + maxY) / 2 + 25;
                        return (
                            <text key={`label-${i}`} x={centerX} y={centerY} textAnchor="middle" dominantBaseline="middle" opacity="0.3" fontWeight="bold" style={{ fontSize: "2.2em", fontWeight: "bold", fill: "#333", pointerEvents: "none" }}>
                                {group.data.attr}: {group.data.name}
                            </text>
                        );
                    })}
                </g>
            </svg>;
}

export default TreeMap;