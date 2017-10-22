declare const ARGV: string[];

declare namespace imports {
    const console: {
        interact(): void
    };

    const gi: any;

    const lang: {
        bind: typeof Function.prototype.bind;

        Class: {
            new <T extends Class>(prototype: T): {
                new(...args: any[]): T
            }
        },
    };

    const searchPath: string[];

    const src: any;

    interface Class {
        Name: string;

        Extends?: any;

        _init: Function;
    }
}

declare function print(message: string): void;