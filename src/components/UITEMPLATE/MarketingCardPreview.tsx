import { Fields } from "./types";
interface MarketingCardPreviewProps {
    fields: Fields;
  }
  export const MarketingCardPreview = ({ fields }: MarketingCardPreviewProps) => (
    <div className="bg-blue-50 p-6 rounded-lg">
      {fields.heading.enabled && fields.heading.value && (
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{fields.heading.value}</h1>
      )}
      {fields.description.enabled && fields.description.value && (
        <p className="text-gray-600 mb-4">{fields.description.value}</p>
      )}
      {fields.button.enabled && fields.button.value && (
        <button className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors">
          {fields.button.value}
        </button>
      )}
    </div>
);