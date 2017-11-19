declare const ARGV: string[];

declare namespace imports {
  const console: {
    interact(): void
  };

  const gi: {
    [moduleName: string]: any,

    Gdk: {
      [key: string]: any,

      DragAction: {
        COPY: 2,
        MOVE: 4
      },

      ModifierType: {
        BUTTON1_MASK: 256
      }
    },

    Gio: {
      [key: string]: any,

      FileType: {
        REGULAR: 1,
        DIRECTORY: 2
      }
    }
  };

  const searchPath: string[];

  const src: any;
}

declare function print(message: string): void;