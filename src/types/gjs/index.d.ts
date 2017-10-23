declare const ARGV: string[];

declare namespace imports {
    const console: {
        interact(): void
    };

    const gi: any;

    const searchPath: string[];

    const src: any;
}

declare function print(message: string): void;