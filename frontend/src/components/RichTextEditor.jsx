import React, { useMemo, useRef, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '../styles/RichTextEditor.css';

const RichTextEditor = ({ value, onChange, placeholder = "Write your blog content here..." }) => {
  const quillRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkData, setLinkData] = useState({ url: '', text: '', range: null, hasSelection: false });

  // Custom toolbar configuration
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        // Text formatting
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'font': [] }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        
        // Alignment
        [{ 'align': [] }],
        
        // Lists
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        
        // Links and media
        ['link', 'image', 'video'],
        
        // Code and quotes
        ['blockquote', 'code-block'],
        
        // Utility
        ['clean']
      ],
      handlers: {
        'image': function() {
          const input = document.createElement('input');
          input.setAttribute('type', 'file');
          input.setAttribute('accept', 'image/*');
          input.click();
          input.onchange = () => {
            const file = input.files[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = () => {
                const quill = quillRef.current?.getEditor();
                const range = quill?.getSelection();
                quill?.insertEmbed(range?.index || 0, 'image', reader.result);
              };
              reader.readAsDataURL(file);
            }
          };
        },
        'link': function(value) {
          const quill = quillRef.current?.getEditor();
          if (!quill) return;
          
          const range = quill.getSelection();
          if (!range) return;
          
          if (value) {
            // Get selected text
            const selectedText = range.length > 0 ? quill.getText(range.index, range.length) : '';
            
            // Open modal
            setLinkData({
              url: '',
              text: selectedText || '',
              range: range,
              hasSelection: selectedText.trim() !== ''
            });
            setShowLinkModal(true);
          } else {
            // Remove link format
            quill.formatText(range.index, range.length, 'link', false);
          }
        }
      }
    },
    clipboard: {
      matchVisual: false,
    },
    history: {
      delay: 2000,
      maxStack: 500,
      userOnly: true
    },
    keyboard: {
      bindings: {
        tab: {
          key: 9,
          handler: function(range, context) {
            // Handle tab key for indentation
            return true;
          }
        },
        'ctrl+b': {
          key: 66,
          shortKey: true,
          handler: function(range, context) {
            const quill = quillRef.current?.getEditor();
            quill?.format('bold', true);
          }
        },
        'ctrl+i': {
          key: 73,
          shortKey: true,
          handler: function(range, context) {
            const quill = quillRef.current?.getEditor();
            quill?.format('italic', true);
          }
        },
        'ctrl+u': {
          key: 85,
          shortKey: true,
          handler: function(range, context) {
            const quill = quillRef.current?.getEditor();
            quill?.format('underline', true);
          }
        }
      }
    }
  }), []);

  // Custom formats for additional functionality
  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'script',
    'align',
    'list', 'bullet', 'indent',
    'link', 'image', 'video',
    'blockquote', 'code-block'
  ];

  const handleLinkInsert = () => {
    const quill = quillRef.current?.getEditor();
    if (!quill || !linkData.range) return;

    if (!linkData.url.trim()) {
      alert('Please enter a URL');
      return;
    }

    if (linkData.hasSelection) {
      // Format selected text as a link
      quill.formatText(linkData.range.index, linkData.range.length, 'link', linkData.url);
    } else {
      if (!linkData.text.trim()) {
        alert('Please enter link text');
        return;
      }
      // Insert text and format it as a link
      quill.insertText(linkData.range.index, linkData.text, 'link', linkData.url);
      quill.setSelection(linkData.range.index + linkData.text.length);
    }

    // Close modal and reset
    setShowLinkModal(false);
    setLinkData({ url: '', text: '', range: null, hasSelection: false });
  };

  const handleLinkCancel = () => {
    setShowLinkModal(false);
    setLinkData({ url: '', text: '', range: null, hasSelection: false });
  };

  return (
    <>
      <div className={`rich-text-editor ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
        {/* Quill Editor */}
        <div className="border-b border-gray-200 bg-gray-50">
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={value}
            onChange={onChange}
            modules={modules}
            formats={formats}
            placeholder={placeholder}
            style={{
              height: isFullscreen ? 'calc(100% - 60px)' : '350px',
              border: 'none'
            }}
          />
        </div>
        
        {/* Fullscreen Toggle */}
        <div className="flex justify-between items-center p-2 bg-gray-50 border-t border-gray-300 rounded-b-lg">
          <div className="text-xs text-gray-500">
            Word count: {value.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length}
          </div>
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </button>
        </div>
      </div>

      {/* Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]" onClick={handleLinkCancel}>
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Insert Link</h3>
            
            <div className="space-y-4">
              {/* URL Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL *
                </label>
                <input
                  type="url"
                  value={linkData.url}
                  onChange={(e) => setLinkData({ ...linkData, url: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleLinkInsert();
                    }
                  }}
                />
              </div>

              {/* Link Text Input - Only show if no text is selected */}
              {!linkData.hasSelection && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Link Text *
                  </label>
                  <input
                    type="text"
                    value={linkData.text}
                    onChange={(e) => setLinkData({ ...linkData, text: e.target.value })}
                    placeholder="Click here"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleLinkInsert();
                      }
                    }}
                  />
                </div>
              )}

              {/* Selected Text Display - Only show if text is selected */}
              {linkData.hasSelection && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selected Text
                  </label>
                  <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700">
                    {linkData.text}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={handleLinkCancel}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLinkInsert}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Insert Link
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RichTextEditor;