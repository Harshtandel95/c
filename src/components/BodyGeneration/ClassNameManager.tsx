export class ClassNameManager {
    private classMap: Map<string, string> = new Map();
    getClassName(tagType: string): string {
      if (!this.classMap.has(tagType)) {
        const newClassName = `${tagType}-${this.classMap.size + 1}`;
        this.classMap.set(tagType, newClassName);
      }
      return this.classMap.get(tagType)!;
    }
    setClassName(tagType: string, className?: string): void {
      if (className) {
        this.classMap.set(tagType, className);
      } else {
        this.classMap.delete(tagType);
      }
    }
    replaceClassName(tagType: string, newClassName: string) {
      this.classMap.set(tagType, newClassName);
    }
  }

  
