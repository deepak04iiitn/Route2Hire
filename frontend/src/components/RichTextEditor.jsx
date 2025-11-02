import React, { useMemo, useRef, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "../styles/RichTextEditor.css";

const RichTextEditor = ({ value, onChange, placeholder = "Write your blog content here..." }) => {
  const quillRef = useRef(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkData, setLinkData] = useState({ url: "", text: "", range: null, hasSelection: false });

  // Custom toolbar configuration
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }, { font: [] }],
        [{ size: ["small", false, "large", "huge"] }],
        ["bold", "italic", "underline", "strike"],
        [{ color: [] }, { background: [] }],
        [{ script: "sub" }, { script: "super" }],
        [{ align: [] }],
        [{ list: "ordered"}, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
        ["link", "image", "video"],
        ["blockquote", "code-block"],
        ["clean"]
      ],
      handlers: {
        image: function () {
          const input = document.createElement("input");
          input.setAttribute("type", "file");
          input.setAttribute("accept", "image/*");
          input.click();
          input.onchange = () => {
            const file = input.files[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = () => {
                const quill = quillRef.current?.getEditor();
                const range = quill?.getSelection();
                quill?.insertEmbed(range?.index || 0, "image", reader.result);
              };
              reader.readAsDataURL(file);
            }
          };
        },
        link: function(value) {
          const quill = quillRef.current?.getEditor();
          if (!quill) return;
          const range = quill.getSelection();
          if (!range) return;
          const selectedText = range.length > 0 ? quill.getText(range.index, range.length) : "";
          setLinkData({
            url: "",
            text: selectedText,
            range,
            hasSelection: selectedText.trim() !== ""
          });
          setShowLinkModal(true);
        }
      }
    },
    clipboard: { matchVisual: false },
    history: { delay: 2000, maxStack: 500, userOnly: true },
    keyboard: {
      bindings: {
        tab: {
          key: 9,
          handler: function(range, context) {
            const quill = quillRef.current?.getEditor();
            if (context.format.list) {
              quill.format("indent", "+1");
              return false;
            }
            return true;
          }
        },
        shifttab: {
          key: 9,
          shiftKey: true,
          handler: function(range, context) {
            const quill = quillRef.current?.getEditor();
            if (context.format.list) {
              quill.format("indent", "-1");
              return false;
            }
            return true;
          }
        },
        'ctrl+b': {
          key: 66,
          shortKey: true,
          handler: function() {
            const quill = quillRef.current?.getEditor();
            quill?.format("bold", true);
            return false;
          }
        },
        'ctrl+i': {
          key: 73,
          shortKey: true,
          handler: function() {
            const quill = quillRef.current?.getEditor();
            quill?.format("italic", true);
            return false;
          }
        },
        'ctrl+u': {
          key: 85,
          shortKey: true,
          handler: function() {
            const quill = quillRef.current?.getEditor();
            quill?.format("underline", true);
            return false;
          }
        }
      }
    }
  }), []);

  const formats = [
    "header", "font", "size",
    "bold", "italic", "underline", "strike",
    "color", "background",
    "script", "align",
    "list", "bullet", "indent",
    "link", "image", "video",
    "blockquote", "code-block"
  ];

  // Link modal logic
  const handleLinkInsert = () => {
    const quill = quillRef.current?.getEditor();
    if (!quill || !linkData.range) return;
    if (!linkData.url.trim()) return alert("Please enter a URL");
    if (linkData.hasSelection) {
      quill.formatText(linkData.range.index, linkData.range.length, "link", linkData.url);
    } else {
      if (!linkData.text.trim()) return alert("Please enter link text");
      quill.insertText(linkData.range.index, linkData.text, "link", linkData.url);
      quill.setSelection(linkData.range.index + linkData.text.length);
    }
    setShowLinkModal(false);
    setLinkData({ url: "", text: "", range: null, hasSelection: false });
  };

  const handleLinkCancel = () => {
    setShowLinkModal(false);
    setLinkData({ url: "", text: "", range: null, hasSelection: false });
  };

  return (
    <div className="relative rounded-md border bg-white dark:bg-gray-900 shadow-lg transition-all duration-300">
      <ReactQuill
        ref={quillRef}
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        theme="snow"
      />
      {showLinkModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-2xl w-[350px]">
            <div className="mb-3">
              <input
                type="text"
                placeholder="Paste or type the URL here"
                value={linkData.url}
                onChange={(e) => setLinkData({ ...linkData, url: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg mb-2 transition"
              />
              {!linkData.hasSelection && (
                <input
                  type="text"
                  placeholder="Link text"
                  value={linkData.text}
                  onChange={(e) => setLinkData({ ...linkData, text: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg transition"
                />
              )}
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={handleLinkInsert} className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-all">Insert Link</button>
              <button onClick={handleLinkCancel} className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400 transition-all">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default RichTextEditor;
