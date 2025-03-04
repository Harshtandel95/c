// types.ts
import React from "react";
import { faqDefaultStyles } from "./faqDefaultStyles";
import { templateDefaultStyles } from "./templateDefaultStyles";
import { tocDefaultStyles } from "./tocDefaultStyles";
import { bodyDefaultStyles } from "./BodyDefaultStyles";
import { FileText, List, Layout, HelpCircle } from "lucide-react";
export interface StyleProperties {
  fontSize?: string;
  color?: string;
  marginBottom?: string;
  marginLeft?: string;
  textDecoration?: string;
}
export interface TagStyles {
  [key: string]: StyleProperties;
}
export interface GeneratorSchema {
  _id?: string;
  tags: string;
  class: string;
  id: string;
  title?: string;
  description?: string;
  content?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
export interface Generator {
  BodyGenerator: GeneratorSchema[];
  TOCgenerator: GeneratorSchema[];
  UIcomponents: GeneratorSchema[];
  FAQgenerator: GeneratorSchema[];
}
export interface Company {
  _id: string;
  company: string;
  Generator: Generator|never;
  active?: boolean;
  generatorType?: 'body' | 'toc' | 'ui' | 'faq';
  styles?: TagStyles;
  createdAt?: Date;
  updatedAt?: Date;
  shopify_id?:string ;
  shopify_url?:string;
  __v?: number;
}
export interface GeneratorType {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  defaultStyles: () => TagStyles;
}
export const GENERATOR_TYPES: GeneratorType[] = [
  {
    id: "body",
    name: "Body Generator",
    description: "Generate structured content bodies with customizable styling",
    icon: <FileText className="h-5 w-5" />,
    defaultStyles: bodyDefaultStyles,
  },
  {
    id: "toc",
    name: "Table of Contents Generator",
    description: "Create dynamic, styled table of contents",
    icon: <List className="h-5 w-5" />,
    defaultStyles: tocDefaultStyles,
  },
  {
    id: "template",
    name: "UI Template Generator",
    description: "Generate complete UI templates with consistent styling",
    icon: <Layout className="h-5 w-5" />,
    defaultStyles: templateDefaultStyles,
  },
  {
    id: "faq",
    name: "FAQ Generator",
    description: "Create styled FAQ sections with customizable formats",
    icon: <HelpCircle className="h-5 w-5" />,
    defaultStyles: faqDefaultStyles,
  },
];