import { useEffect, useState, useRef } from "react";
import { Editor } from "primereact/editor";
import { Toast } from "primereact/toast";
import { HTMLPreview } from "./HTMLPreview";

const BodyGenerator = () => {
  const [text, setText] = useState<string>("");
  const [processedText, setProcessedText] = useState<string>("");
  const [showCopiedAlert, setShowCopiedAlert] = useState(false);
 
  const toast = useRef<Toast>(null);

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

    return { html: temp.innerHTML };
  };

  useEffect(() => {
    const { html } = processHTML(text);
    setProcessedText(html);
  }, [text]);

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

  return (
    <div className="space-y-4">
      <Editor
        value={text}
        onTextChange={(e) => setText(e.htmlValue || "")}
        style={{ height: "320px" }}
        placeholder="Enter headings in format: 'Heading Text (H1)' or 'Heading Text (h2)'"
      />
      
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
