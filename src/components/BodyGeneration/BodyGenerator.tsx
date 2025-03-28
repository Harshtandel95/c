import { useEffect, useState, useRef } from "react";
import { Editor } from "primereact/editor";
import { Toast } from "primereact/toast";
import { HTMLPreview } from "./HTMLPreview";

const BodyGenerator = () => {
  const [text, setText] = useState<string>("");
  const [processedText, setProcessedText] = useState<string>("");
  const [showCopiedAlert, setShowCopiedAlert] = useState(false);
  const [tagClassMap, setTagClassMap] = useState<Record<string, string>>({});
  const [tagInput, setTagInput] = useState<string>(""); // Input for tag name
  const [classInput, setClassInput] = useState<string>(""); // Input for class name

  const toast = useRef<Toast>(null);

  // Function to generate a heading ID
  const generateHeadingId = (text: string): string => {
    return text
      .trim()
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove non-alphanumeric characters except hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-'); // Remove consecutive hyphens
  };

  // Function to process the HTML content, add spaces around href, and remove style attributes
  const processHTML = (text: string) => {
    // Create a temporary DOM element to parse the HTML
    const temp = document.createElement("div");
    temp.innerHTML = text;

    // Remove style attributes from all elements
    const elementsWithStyle = temp.querySelectorAll("[style]");
    elementsWithStyle.forEach(element => {
      element.removeAttribute("style");
    });

    // Add spaces around href values in anchor tags
    const anchorTags = temp.querySelectorAll("a");
    anchorTags.forEach(anchor => {
      const parent = anchor.parentNode;
      if (parent) {
        parent.insertBefore(document.createTextNode(" "), anchor);
        parent.insertBefore(anchor, anchor.nextSibling);
        parent.insertBefore(document.createTextNode(" "), anchor.nextSibling);
      }
    });

    // Remove underline tags around links
    const underlineTags = temp.querySelectorAll("u");
    underlineTags.forEach(u => {
      if (u.querySelector("a")) {
        const parent = u.parentNode;
        if (parent) {
          while (u.firstChild) {
            parent.insertBefore(u.firstChild, u);
          }
          parent.removeChild(u);
        }
      }
    });

    // Generate and assign IDs to headings
    const headings = temp.querySelectorAll("h1, h2, h3, h4, h5, h6");
    headings.forEach(heading => {
      const originalHeadingText = heading.textContent || "";
      const headingTextForId = originalHeadingText
        .replace(/\(h[1-6]\)/gi, '') // Remove (h1), (h2), etc.
        .replace(/^\d+\.\s*/, '') // Remove indexing like 1., 2., etc. for IDs only
        .trim();
      const headingId = generateHeadingId(headingTextForId);
      heading.setAttribute("id", headingId);

      // Keep the original heading text (including indexing) for display
      heading.textContent = originalHeadingText.replace(/\(h[1-6]\)/gi, '').trim();
    });

    // Apply custom classes to tags
    Object.entries(tagClassMap).forEach(([tag, className]) => {
      const elements = temp.querySelectorAll(tag);
      elements.forEach(element => {
        element.className = className; // Assign the custom class
      });
    });

    return { html: temp.innerHTML };
  };

  useEffect(() => {
    const { html } = processHTML(text);
    setProcessedText(html);
  }, [text, tagClassMap]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(processedText);
      setShowCopiedAlert(true);
      setTimeout(() => setShowCopiedAlert(false), 2000);
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: `${err}`,
        life: 3000,
      });
    }
  };

  const handleAddTagClass = () => {
    if (tagInput.trim() && classInput.trim()) {
      setTagClassMap((prev) => ({ ...prev, [tagInput.trim()]: classInput.trim() }));
      setTagInput(""); // Clear the tag input
      setClassInput(""); // Clear the class input
    }
  };

  const handleRemoveTagClass = (tag: string) => {
    setTagClassMap((prev) => {
      const updatedMap = { ...prev };
      delete updatedMap[tag];
      return updatedMap;
    });
  };

  return (
    <div className="space-y-4">
      <Editor
        value={text}
        onTextChange={(e) => setText(e.htmlValue || "")}
        style={{ height: "320px" }}
        placeholder="Enter headings in format: 'Heading Text (H1)' or 'Heading Text (h2)'"
      />

      {/* Tag Classes Section */}
      <div className="tag-class-manager p-4 border rounded bg-gray-50">
        <h3 className="text-lg font-semibold mb-4">Tag Classes</h3>
        <div className="flex items-center space-x-2 mb-4">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            className="flex-1 p-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            placeholder="Enter tag (e.g., div, h1)"
          />
          <input
            type="text"
            value={classInput}
            onChange={(e) => setClassInput(e.target.value)}
            className="flex-1 p-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            placeholder="Enter class name"
          />
          <button
            onClick={handleAddTagClass}
            className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add
          </button>
        </div>
        <ul className="space-y-1">
          {Object.entries(tagClassMap).map(([tag, className]) => (
            <li
              key={tag}
              className="flex justify-between items-center p-1 border rounded bg-gray-50"
            >
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-700">{`<${tag}>`}</span>
                <span className="text-sm text-gray-500">{className}</span>
              </div>
              <button
                onClick={() => handleRemoveTagClass(tag)}
                className="p-1 text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>

      <HTMLPreview 
        processedText={processedText}
        onCopy={handleCopy}
        showCopiedAlert={showCopiedAlert}
      />
      
      <Toast ref={toast} />
    </div>
  );
};

export default BodyGenerator;
