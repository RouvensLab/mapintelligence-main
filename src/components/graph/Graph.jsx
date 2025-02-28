import React, { useEffect, useRef } from "react";
import { Transformer } from "markmap-lib";
import * as markmap from "markmap-view";

const { Markmap, loadCSS, loadJS } = markmap;
const transformer = new Transformer();

/**
 * Custom hook to render a Markmap visualization from Markdown content.
 *
 * @param {string} md - The Markdown content to be transformed into a Markmap.
 * @param {Object} options - Optional configuration for the Markmap.
 * @returns {JSX.Element} An SVG element containing the rendered Markmap.
 *
 * @example
 * const markdownContent = "# Title\n## Subtitle\n- Item 1\n- Item 2";
 * const options = { width: "800px", height: "600px" };
 * const markmapElement = useMarkmap(markdownContent, options);
 */
const useMarkmap = (md, options) => {
  const ref = useRef(null);

  /**
   * Function to update the Markmap visualization.
   *
   * @param {string} md - The Markdown content to be transformed into a Markmap.
   */
  const updateMarkmap = (md) => {
    if (!md) return;
    ref.current.innerHTML = "";
    const { root, features } = transformer.transform(md); // Transform the Markdown content
    const { styles, scripts } = transformer.getUsedAssets(features); // Get the required styles and scripts
    if (styles) loadCSS(styles);
    if (scripts) loadJS(scripts, { getMarkmap: () => markmap });
    Markmap.create(ref.current, options || { width: "100%", height: "100%" }, root);
  };

  // Effect hook to update the Markmap whenever the Markdown content or options change.
  useEffect(() => {
    updateMarkmap(md);
  }, [md, options]);

  // Return an SVG element to render the Markmap.
  return <svg ref={ref} style={{ width: "100%", height: "100%" }}></svg>;
};

/**
 * Graph component to render a Markmap from Markdown content.
 *
 * @param {Object} props - The component props.
 * @param {string} props.markdown - The Markdown content to be transformed into a Markmap.
 * @returns {JSX.Element} The rendered Markmap as an SVG element.
 */
const Graph = ({ markdown }) => {
  const markmapSvg = useMarkmap(markdown);
  return <>{markmapSvg}</>;
};

export default Graph;
