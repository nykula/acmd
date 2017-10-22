import { VNode } from "inferno";

export = h;

/**
 * Returns an Inferno VNode from a Hyperscript representation.
 */
declare function h(
    /**
     * Inferno component OR tag string with optional css class names and ids
     * in the format h1#some-id.foo.bar. If a tag string, the tag name is
     * parsed out, and the id and className propertires of the properties
     * argument will be modified.
     */
    componentOrTag: object | string,

    /**
     * An object containing the properties you'd like to set on the element.
     */
    properties?: object,

    /**
     * An array of h() children or strings, This will create childen or text nodes respectively.
     */
    children?: any[] | string,
): VNode;