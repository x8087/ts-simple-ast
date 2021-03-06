﻿import * as ts from "typescript";
import * as errors from "./../../errors";
import {Expression} from "./../expression";
import {Statement} from "./../statement";

export class ExportAssignment extends Statement<ts.ExportAssignment> {
    /**
     * Gets if this is an export equals assignemnt.
     *
     * If this is false, then it's `export default`.
     */
    isExportEquals() {
        return this.compilerNode.isExportEquals || false;
    }

    /**
     * Gets the export assignment expression.
     */
    getExpression(): Expression {
        return this.getNodeFromCompilerNode<Expression>(this.compilerNode.expression);
    }
}
