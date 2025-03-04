import { create } from 'zustand';
interface TagClass {
  tag: string;
  class: string;
}
interface Generator {
  BodyGenerator: TagClass[];
  TOCgenerator: TagClass[];
  UIComponents: TagClass[];
  FAQgenerator: TagClass[];
}
interface Company {
  name: string;
  generators: Generator;
}
interface ClassNameState {
  companies: Company[];
  currentCompany: string | null;
  addCompany: (name: string) => void;
  setCurrentCompany: (name: string) => void;
  updateTagClass: (
    companyName: string,
    generatorType: keyof Generator,
    tag: string,
    className: string
  ) => void;
  getTagClass: (
    companyName: string,
    generatorType: keyof Generator,
    tag: string
  ) => string;
  initializeGenerator: (
    companyName: string,
    generatorType: keyof Generator,
    tags: TagClass[]
  ) => void;
}
const createEmptyGenerator = (): Generator => ({
  BodyGenerator: [],
  TOCgenerator: [],
  UIComponents: [],
  FAQgenerator: [],
});
export const useClassNameStore = create<ClassNameState>((set, get) => ({
  companies: [],
  currentCompany: null,
  addCompany: (name: string) => {
    set((state) => ({
      companies: [
        ...state.companies,
        {
          name,
          generators: createEmptyGenerator(),
        },
      ],
    }));
  },
  setCurrentCompany: (name: string) => {
    set({ currentCompany: name });
  },
  updateTagClass: (
    companyName: string,
    generatorType: keyof Generator,
    tag: string,
    className: string
  ) => {
    set((state) => ({
      companies: state.companies.map((company) => {
        if (company.name !== companyName) return company;

        const existingTags = company.generators[generatorType];
        const tagIndex = existingTags.findIndex((t) => t.tag === tag);

        const updatedTags =
          tagIndex >= 0
            ? existingTags.map((t, i) =>
                i === tagIndex ? { ...t, class: className } : t
              )
            : [...existingTags, { tag, class: className }];

        return {
          ...company,
          generators: {
            ...company.generators,
            [generatorType]: updatedTags,
          },
        };
      }),
    }));
  },
  getTagClass: (companyName: string, generatorType: keyof Generator, tag: string) => {
    const company = get().companies.find((c) => c.name === companyName);
    if (!company) return `${tag}-default`;

    const tagClass = company.generators[generatorType].find((t) => t.tag === tag);
    return tagClass?.class ?? `${tag}-default`;
  },
  initializeGenerator: (
    companyName: string,
    generatorType: keyof Generator,
    tags: TagClass[]
  ) => {
    set((state) => ({
      companies: state.companies.map((company) => {
        if (company.name !== companyName) return company;

        return {
          ...company,
          generators: {
            ...company.generators,
            [generatorType]: tags,
          },
        };
      }),
    }));
  },
}));