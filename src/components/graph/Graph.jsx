import React, { useEffect, useRef } from "react";
import { Transformer } from "markmap-lib";
import * as markmap from "markmap-view";

const { Markmap, loadCSS, loadJS } = markmap;
const transformer = new Transformer();

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
