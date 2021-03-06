import * as ts from "typescript";
import {Expression} from "./../expression";
import {IterationStatement} from "./IterationStatement";

export const WhileStatementBase = IterationStatement;
export class WhileStatement extends WhileStatementBase<ts.WhileStatement> {
    /**
     * Gets this while statement's expression.
     */
    getExpression() {
        return this.getNodeFromCompilerNode<Expression>(this.compilerNode.expression);
    }
}
