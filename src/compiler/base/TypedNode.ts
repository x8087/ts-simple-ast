﻿import * as ts from "typescript";
import {Constructor} from "./../../Constructor";
import {TypedNodeStructure} from "./../../structures";
import {callBaseFill} from "./../callBaseFill";
import * as errors from "./../../errors";
import {insertIntoParent, removeChildren} from "./../../manipulation";
import {StringUtils} from "./../../utils";
import {Node} from "./../common";
import {Type} from "./../type/Type";
import {TypeNode} from "./../type/TypeNode";

export type TypedNodeExtensionType = Node<ts.Node & { type?: ts.TypeNode; }>;

export interface TypedNode {
    /**
     * Gets the type node or undefined if none exists.
     */
    getTypeNode(): TypeNode | undefined;
    /**
     * Gets the type node or throws if none exists.
     */
    getTypeNodeOrThrow(): TypeNode;
    /**
     * Sets the type.
     * @param text - Text to set the type to.
     */
    setType(text: string): this;
    /**
     * Removes the type.
     */
    removeType(): this;
}

export function TypedNode<T extends Constructor<TypedNodeExtensionType>>(Base: T): Constructor<TypedNode> & T {
    return class extends Base implements TypedNode {
        getTypeNode() {
            return this.getNodeFromCompilerNodeIfExists<TypeNode>(this.compilerNode.type);
        }

        getTypeNodeOrThrow() {
            return errors.throwIfNullOrUndefined(this.getTypeNode(), "Expected to find a type node.");
        }

        setType(text: string) {
            if (StringUtils.isNullOrWhitespace(text))
                return this.removeType();

            const typeNode = this.getTypeNode();
            if (typeNode != null && typeNode.getText() === text)
                return this;

            // remove previous type
            const separatorSyntaxKind = getSeparatorSyntaxKindForNode(this);
            const separatorNode = this.getFirstChildByKind(separatorSyntaxKind);

            let insertPos: number;
            let childIndex: number;
            let insertItemsCount: number;
            let newText: string;

            if (separatorNode == null) {
                const identifier = this.getFirstChildByKindOrThrow(ts.SyntaxKind.Identifier);
                childIndex = identifier.getChildIndex() + 1;
                insertPos = identifier.getEnd();
                insertItemsCount = 2;
                newText = (separatorSyntaxKind === ts.SyntaxKind.EqualsToken ? " = " : ": ") + text;
            }
            else {
                childIndex = separatorNode.getChildIndex() + 1;
                insertPos = typeNode!.getStart();
                insertItemsCount = 1;
                newText = text;
            }

            // insert new type
            insertIntoParent({
                parent: this,
                childIndex,
                insertItemsCount,
                insertPos,
                newText,
                replacing: {
                    textLength: typeNode == null ? 0 : typeNode.getWidth(),
                    nodes: typeNode == null ? [] : [typeNode]
                }
            });

            return this;
        }

        fill(structure: Partial<TypedNodeStructure>) {
            callBaseFill(Base.prototype, this, structure);

            if (structure.type != null)
                this.setType(structure.type);

            return this;
        }

        removeType() {
            if (this.getKind() === ts.SyntaxKind.TypeAliasDeclaration)
                throw new errors.NotSupportedError(`Cannot remove the type of a type alias. Use ${nameof<TypedNode>(t => t.setType)} instead.`);

            const typeNode = this.getTypeNode();
            if (typeNode == null)
                return this;

            const separatorToken = typeNode.getPreviousSiblingIfKindOrThrow(getSeparatorSyntaxKindForNode(this));
            removeChildren({ children: [separatorToken, typeNode], removePrecedingSpaces: true });
            return this;
        }
    };
}

function getSeparatorSyntaxKindForNode(node: Node) {
    switch (node.getKind()) {
        case ts.SyntaxKind.TypeAliasDeclaration:
            return ts.SyntaxKind.EqualsToken;
        default:
            return ts.SyntaxKind.ColonToken;
    }
}
