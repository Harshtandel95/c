import React, { useState, useEffect } from "react";
import { ClipboardDocumentIcon } from "@heroicons/react/24/outline";

const ReferenceGenerator = () => {
  const [inputText, setInputText] = useState("");
  const [generatedHTML, setGeneratedHTML] = useState("");

  // Load persisted HTML from localStorage on component mount
  useEffect(() => {
    const savedHTML = localStorage.getItem("generatedHTML");
    if (savedHTML) {
      setGeneratedHTML(savedHTML);
    }
  }, []);

  const handleGenerate = () => {
    const references = inputText
      .split("\n")
      .filter((line) => line.trim() !== "") // Remove empty lines
      .filter((line, index) => !(index === 0 && line.trim().toLowerCase() === "references:")) // Exclude "References:" if it's the first line
      .map((line) =>
        line.replace(/^\d+[\.\)]\s*|^[-*]\s*/, "").trim() // Remove numbering or bullets
      );

    const htmlOutput = `
<div class="article-faq-wrapper">
  <div id="inner-accordion_block" class="inner-accordion">
    <div class="inner-accordion-item" itemscope="" itemprop="mainEntity" itemtype="https://schema.org/Question">
      <div class="inner-accordion-title" itemprop="name"><h2 id="faqs">References</h2></div>
      <div class="inner-accordion-content" itemscope="" itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
        ${references
          .map((ref) => `<p itemprop="text">${ref}</p>`)
          .join("\n        ")}
      </div>
    </div>
  </div>
</div>
    `.trim();

    setGeneratedHTML(htmlOutput);
    localStorage.setItem("generatedHTML", htmlOutput); // Persist the generated HTML
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedHTML);
  };

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 via-blue-100 to-indigo-200 rounded-3xl shadow-2xl max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">
          Reference Generator
        </h1>
        <p className="text-gray-600 mt-2 text-lg">
          Paste your references below.
          
        </p>
      </div>

      {/* Main Content Section */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Input Section */}
        <div className="flex-1 bg-white p-6 rounded-xl shadow-lg flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-800">Input</h3>
            <button
              onClick={handleGenerate}
              className="px-4 py-2 bg-indigo-500 text-white text-sm font-medium rounded-lg shadow hover:bg-indigo-600 transition-all duration-300"
            >
              Generate HTML
            </button>
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste your references here..."
            className="flex-1 p-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all duration-300"
          ></textarea>
        </div>

        {/* Generated HTML Section */}
        <div className="flex-1 bg-white p-6 rounded-xl shadow-lg flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-800">
              Generated HTML
            </h3>
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-lg shadow hover:bg-green-600 transition-all duration-300 flex items-center gap-2"
            >
              <ClipboardDocumentIcon className="h-5 w-5" />
              Copy
            </button>
          </div>
          <pre className="flex-1 p-4 bg-gray-100 rounded-lg overflow-auto text-sm whitespace-pre-wrap border border-gray-200">
            {generatedHTML}
          </pre>
        </div>
      </div>

      {/* Footer */}
      
    </div>
  );
};

export default ReferenceGenerator;
