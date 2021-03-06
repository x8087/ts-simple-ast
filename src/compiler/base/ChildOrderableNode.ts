﻿import * as ts from "typescript";
import * as errors from "./../../errors";
import {changeChildOrder, getGeneralFormatting} from "./../../manipulation";
import {Constructor} from "./../../Constructor";
import {Node} from "./../common";

export interface ChildOrderableNode {
    /**
     * Sets the child order of the node within the parent.
     */
    setOrder(order: number): this;
}

export function ChildOrderableNode<T extends Constructor<Node>>(Base: T): Constructor<ChildOrderableNode> & T {
    return class extends Base implements ChildOrderableNode {
        setOrder(order: number) {
            const childIndex = this.getChildIndex();
            errors.throwIfOutOfRange(order, [0, this.getChildCount() - 1], nameof(order));

            if (childIndex === order)
                return this;

            changeChildOrder({
                parent: this.getParentSyntaxList() || this.getParentOrThrow(),
                getSiblingFormatting: getGeneralFormatting,
                oldIndex: childIndex,
                newIndex: order
            });
            return this;
        }
    };
}
