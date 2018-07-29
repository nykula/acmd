import { VNode } from "inferno";

type Component<T> = (new (props: T) => { render(): VNode }) | ((props: T) => VNode);

type Widget<T> = new (...args: any[]) => ({ parent_instance: any } & T);

export function h<T>(
  component: Component<T> | Widget<T>,
  children?: Array<VNode|null>
): VNode;

export function h<T>(
  component: Component<T> | Widget<T>,
  props: Partial<T & {
    key: number | string,
    orientation: number, // FIXME: Box recognized as Component, not Widget?
    ref: any
  }>,
  children?: VNode|Array<VNode|null>
): VNode;

// FIXME: Delete.
export function h(
  tag: "icon-view",
  props: any,
  children: VNode
): VNode;

export function h(
  tag: "list-store",
  props: any,
  children: any
): VNode;

export function h(
  tag: "stub-box",
  children: Array<VNode|null>
): VNode;

export function h(
  tag: "stub",
  props: any,
  children?: Array<VNode|null>,
): VNode;

// FIXME: Delete.
export function h(
  tag: "menu-item-with-submenu",
  props: any,
  children: Array<VNode|null>
): VNode;

// FIXME: Delete.
export function h(
  tag: "tree-view",
  props: any,
  children: VNode
): VNode;