import { VNode } from "inferno";

type Component<T> = (new (props: T) => any) | ((props: T) => any);

type Widget<T> = new (...args: any[]) => T;

export function h<T>(
  component: Widget<T> | Component<T>,
  children?: Array<VNode|null>
): VNode;

export function h<T>(
  component: Widget<T> | Component<T>,
  props: Partial<T & { key: number | string, ref: any }>,
  children?: Array<VNode|null>
): VNode;

export function h(
  tag: "stub-box",
  children: Array<VNode|null>
);