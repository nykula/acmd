declare const ARGV: string[];

declare namespace imports {
  const console: {
    interact(): void
  };

  const gi: {
    [moduleName: string]: any,

    Gio: {
      [key: string]: any,

      FileType: {
        REGULAR: 1,
        DIRECTORY: 3
      }
    }
  };

  const searchPath: string[];

  const src: any;
}

declare function print(message: string): void;