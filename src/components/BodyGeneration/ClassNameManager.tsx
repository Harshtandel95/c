export class ClassNameManager {
    private classMap: Map<string, string> = new Map();
    getClassName(tagType: string): string {
      if (!this.classMap.has(tagType)) {
        const newClassName = `${tagType}-${this.classMap.size + 1}`;
        this.classMap.set(tagType, newClassName);
      }
      return this.classMap.get(tagType)!;
    }
    replaceClassName(tagType: string, newClassName: string) {
      this.classMap.set(tagType, newClassName);
    }
  }