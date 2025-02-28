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
 *
 * @remarks
 * This hook uses the `transformer` and `markmap` libraries to convert Markdown
 * content into a visual mind map. It dynamically loads necessary CSS and JS
 * assets based on the features used in the Markdown content.
 *
 * @note
 * Ensure that the `transformer` and `markmap` libraries ar properly imported
 * and available in your project.
 */
const useMarkmap = (md, options) => {
  const ref = useRef(null);

  const updateMarkmap = (md) => {
    if (!md) return;
    ref.current.innerHTML = "";
    const { root, features } = transformer.transform(md);
    const { styles, scripts } = transformer.getUsedAssets(features);
    if (styles) loadCSS(styles);
    if (scripts) loadJS(scripts, { getMarkmap: () => markmap });
    Markmap.create(ref.current, options || { width: "100%", height: "100%" }, root);
  };

  useEffect(() => {
    updateMarkmap(md);
  }, [md, options]);

  return <svg ref={ref} style={{ width: "100%", height: "100%" }}></svg>;
};

const Graph = ({ markdown }) => {
  const markmapSvg = useMarkmap(markdown);
  return <>{markmapSvg}</>;
};

export default Graph;
