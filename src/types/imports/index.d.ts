declare namespace imports {
    const gi: any;

    const lang: {
        bind: typeof Function.prototype.bind;

        Class: {
            new <T extends Class>(prototype: T): {
                new(...args: any[]): T
            }
        },
    };

    interface Class {
        Name: string;

        Extends?: any;

        _init: Function;
    }
}