import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { MindmapNode } from '../types';

interface MindmapProps {
  data: MindmapNode;
}

export const Mindmap: React.FC<MindmapProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 800;
    const height = 600;
    const margin = { top: 40, right: 160, bottom: 40, left: 160 };

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height]);

    svg.selectAll("*").remove();

    const g = svg.append("g");

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    const tree = d3.tree<MindmapNode>().size([height - margin.top - margin.bottom, width - margin.left - margin.right]);

    const root = d3.hierarchy(data);
    tree(root);

    // Center the tree initially
    const initialTransform = d3.zoomIdentity.translate(margin.left, margin.top);
    svg.call(zoom.transform, initialTransform);

    // Links with curved paths
    g.selectAll(".link")
      .data(root.links())
      .enter().append("path")
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke", "currentColor")
      .attr("stroke-opacity", 0.3)
      .attr("stroke-width", 2)
      .attr("d", d3.linkHorizontal()
        .x(d => (d as any).y)
        .y(d => (d as any).x) as any);

    // Nodes
    const node = g.selectAll(".node")
      .data(root.descendants())
      .enter().append("g")
      .attr("class", d => "node" + (d.children ? " node--internal" : " node--leaf"))
      .attr("transform", d => `translate(${(d as any).y},${(d as any).x})`);

    // Node shapes (Rectangles for better text fit)
    node.append("rect")
      .attr("rx", 6)
      .attr("ry", 6)
      .attr("y", -15)
      .attr("x", d => d.children ? -10 - (d.data.name.length * 8) : 0)
      .attr("width", d => d.data.name.length * 8 + 10)
      .attr("height", 30)
      .attr("fill", d => d.depth === 0 ? "var(--primary)" : "var(--card)")
      .attr("stroke", "currentColor")
      .attr("stroke-width", 2);

    node.append("text")
      .attr("dy", "0.35em")
      .attr("x", d => d.children ? -5 : 5)
      .attr("text-anchor", d => d.children ? "end" : "start")
      .attr("font-weight", d => d.depth === 0 ? "bold" : "normal")
      .attr("font-family", "var(--font-display)")
      .attr("font-size", d => d.depth === 0 ? "14px" : "12px")
      .attr("fill", d => d.depth === 0 ? "var(--primary-foreground)" : "currentColor")
      .text(d => d.data.name);

  }, [data]);

  return (
    <div ref={containerRef} className="w-full h-[600px] brutalist-border bg-card relative overflow-hidden">
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <div className="px-2 py-1 bg-muted text-[10px] font-bold uppercase brutalist-border">
          Scroll to Zoom • Drag to Pan
        </div>
      </div>
      <svg ref={svgRef} className="w-full h-full text-foreground cursor-move" />
    </div>
  );
};
