import React, { useState, useRef, useEffect } from 'react';
import { Markmap, loadCSS, loadJS } from 'markmap-view';
import { Transformer } from 'markmap-lib';
import { Toolbar } from 'markmap-toolbar';
import 'markmap-toolbar/dist/style.css';

// Create a new instance of the transformer
const transformer = new Transformer();


const Graph = ({ markdown, setMarkdown, editorSplitterPosition, handleEditorSplitterMouseDown }) => {
  const [editorContent, setEditorContent] = useState('');
  const refSvg = useRef(null);
  const refMm = useRef(null);
  const refToolbar = useRef(null);


  // Create the markmap when the component mounts
  useEffect(() => {
    if (refMm.current) return;
    const mm = Markmap.create(refSvg.current);
    refMm.current = mm;
    renderToolbar(refMm.current, refToolbar.current);
  }, [refSvg.current]);

  // Update the markmap when the markdown changes
  useEffect(() => {
    // update markmap
    if (!markdown) return;
    setEditorContent(removeElements(markdown));
  }, [markdown]);

  // Update the markmap when the editor content changes
  useEffect(() => {
    const mm = refMm.current;
    if (!mm) return;
    const { root, features } = transformer.transform(editorContent);
    const { styles, scripts } = transformer.getUsedAssets(features);
    if (styles) loadCSS(styles);
    if (scripts) loadJS(scripts, { getMarkmap: () => markmap });
    const updateData = mm.setData(root);
    if (updateData && typeof updateData.then === 'function') {
      updateData.then(() => {
        mm.fit();
      });
    } else {
      mm.fit();
    }
  }, [editorContent]);

  //function that removes unnecessary elements from the markmap
  function removeElements(markmapMD) {
    //removes ``` from the markmap
    markmapMD = markmapMD.replace(/```/g, "");
    //removes the first line from the markmap
    markmapMD = markmapMD.replace(/.*\n/, "");
    return markmapMD;
  }

  //function that handles the editor change
  const handleEditorChange = (e) => {
    setEditorContent(e.target.value);
  };
//function that handles the update click
  const handleUpdateClick = () => {
    setMarkdown(editorContent);
  };
//function that renders the toolbar
  function renderToolbar(mm, wrapper) {
    while (wrapper?.firstChild) wrapper.firstChild.remove();
    if (mm && wrapper) {
      const toolbar = new Toolbar();
      toolbar.attach(mm);
      toolbar.setItems([...Toolbar.defaultItems]);
      wrapper.append(toolbar.render());
    }
  }

  return (
    <div className="graph-container" style={{ gridTemplateRows: `${editorSplitterPosition}% 5px ${100 - editorSplitterPosition}%`}}>
      <textarea
        value={editorContent}
        onChange={handleEditorChange}
        style={{ width: "100%", height: "100%", padding: "10px", boxSizing: "border-box" }}
      />
      <div className="splitter" onMouseDown={handleEditorSplitterMouseDown} />
      <svg ref={refSvg} style={{ width: "100%", height: "100%" }}></svg>
      <div className="toolbar" ref={refToolbar}></div>
    </div>
  );
};

export default Graph;
