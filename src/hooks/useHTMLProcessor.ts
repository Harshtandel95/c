import { useCallback } from 'react';
import { ClassNameManager } from '../components/BodyGeneration/ClassNameManager';

const generateHeadingId = (text: string): string => {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')  
    .replace(/\s+/g, '-')      
    .replace(/-+/g, '-');   
};

const isEmptyElement = (node: Node): boolean => {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent?.trim() === '';
  }
  if (node instanceof HTMLElement) {
    if (node.tagName.toLowerCase() === 'br') return true;
    if (node.tagName.toLowerCase() === 'p' && !node.textContent?.trim()) return true;
    if (node.tagName.toLowerCase() === 'p' && 
        Array.from(node.childNodes).every(child => 
          child.nodeType === Node.TEXT_NODE 
            ? !child.textContent?.trim() 
            : child.nodeName.toLowerCase() === 'br'
        )) {
      return true;
    }
  }
  return false;
};

const isEmptyTableCell = (cell: HTMLElement): boolean => {
  return !cell.textContent?.trim() && !cell.querySelector('img');
};
const shouldRemoveUnderline = (node: HTMLElement): boolean => {
  if (node.tagName.toLowerCase() === 'u' && node.querySelector('a')) {
    return true;
  }
  if (node.tagName.toLowerCase() === 'a') {
    const underlineTags = node.querySelectorAll('u');
    if (underlineTags.length > 0) {
      underlineTags.forEach(u => {
        const parent = u.parentNode;
        if (parent) {
          while (u.firstChild) {
            parent.insertBefore(u.firstChild, u);
          }
          parent.removeChild(u);
        }
      });
    }
  }
  return false;
};
export const useHTMLProcessor = (classNameManager: ClassNameManager) => {
  return useCallback((html: string) => {
    if (!html) return { html: "", classNames: [] };
    const temp = document.createElement("div");
    temp.innerHTML = html;
    const classNames: string[] = [];
    const anchorTags = temp.querySelectorAll('a');
    anchorTags.forEach(anchor => {
      const underlineTags = anchor.querySelectorAll('u');
      underlineTags.forEach(u => {
        const parent = u.parentNode;
        if (parent) {
          while (u.firstChild) {
            parent.insertBefore(u.firstChild, u);
          }
          parent.removeChild(u);
        }
      });
    });
    const underlineTags = temp.querySelectorAll('u');
    underlineTags.forEach(u => {
      if (u.querySelector('a')) {
        const parent = u.parentNode;
        if (parent) {
          while (u.firstChild) {
            parent.insertBefore(u.firstChild, u);
          }
          parent.removeChild(u);
        }
      }
    });
    const processNode = (node: Node): Node | string => {
      if (isEmptyElement(node)) {
        return "";
      }
      if (node.nodeType === 3) { 
        const textContent = node.textContent || "";
        return textContent.replace(/\s*\((H[1-6])\)\s*/gi, "").trim();
      }
      if (node.nodeType === 8) return ""; 
      if (node.nodeType === 1 && node instanceof HTMLElement) {
        let tagName = node.tagName.toLowerCase();
        if (shouldRemoveUnderline(node)) {
          return "";
        }
        if (tagName === "ol") {
          const hasBullet = Array.from(node.children).some(
            (child) => 
              child.tagName.toLowerCase() === "li" && 
              child.getAttribute("data-list") === "bullet"
          );
          if (hasBullet) tagName = "ul";
        }
        if ((tagName === "td" || tagName === "th") && isEmptyTableCell(node)) {
          return "";
        }
        const newElement = document.createElement(tagName);
        Array.from(node.attributes).forEach(attr => {
          if (attr.name !== 'class' && attr.name !== 'style') {
            newElement.setAttribute(attr.name, attr.value);
          }
        });
        const className = classNameManager.getClassName(tagName);
        newElement.classList.add(className);
        classNames.push(className);
        const processedChildren = Array.from(node.childNodes)
          .map(child => processNode(child))
          .filter(result => result !== "");
        processedChildren.forEach(child => {
          if (typeof child === "string") {
            newElement.appendChild(document.createTextNode(child));
          } else if (child instanceof Node) {
            newElement.appendChild(child);
          }
        });
        if (/^h[1-6]$/.test(tagName)) {
          const headingText = newElement.textContent || "";
          const headingId = generateHeadingId(headingText);
          if (headingId) {
            newElement.setAttribute('id', headingId);
          }
        }
        if (processedChildren.length === 0 && !['br', 'hr', 'img'].includes(tagName)) {
          return "";
        }
        return newElement;
      }
      return "";
    };
    const processedNodes = Array.from(temp.childNodes)
      .map(node => processNode(node))
      .filter(result => result !== "");
      
    const output = document.createElement("div");
    processedNodes.forEach(node => {
      if (typeof node === "string") {
        output.appendChild(document.createTextNode(node));
      } else if (node instanceof Node) {
        output.appendChild(node);
      }
    });
    return { html: output.innerHTML, classNames };
  }, [classNameManager]);
};