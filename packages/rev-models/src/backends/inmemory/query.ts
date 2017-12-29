
import { IQueryNode } from '../../queries/types';
import { IModel } from '../../models/types';
import { ConjunctionNode } from '../../queries/nodes/conjunction';
import { FieldNode } from '../../queries/nodes/field';
import { ValueOperator } from '../../queries/nodes/value';
import { ValueListOperator } from '../../queries/nodes/valuelist';
import { getLikeOperatorRegExp } from '../../queries/utils';

export class InMemoryQuery<T extends IModel> {

    constructor(private query: IQueryNode<T>) {}

    testRecord(record: object): boolean {
        return this.testRecordAgainstNode(record, this.query);
    }

    testRecordAgainstNode(record: object, node: IQueryNode<T>): boolean {
        if (node instanceof ConjunctionNode) {
            return this.testRecordAgainstConjunction(record, node);
        }
        else if (node instanceof FieldNode) {
            return this.testRecordAgainstFieldNode(record, node);
        }
        else {
            throw new Error('Unrecognised Query Node: ' + node.constructor.name);
        }
    }

    testRecordAgainstConjunction(record: object, conjunction: ConjunctionNode<T>): boolean {
        if (conjunction.operator == '_and') {
            for (let childNode of conjunction.children) {
                if (!this.testRecordAgainstNode(record, childNode)) {
                    return false;
                }
            }
            return true;
        }
        else if (conjunction.operator == '_or') {
            for (let childNode of conjunction.children) {
                if (this.testRecordAgainstNode(record, childNode)) {
                    return true;
                }
            }
            return false;
        }
        else {
            throw new Error('Unknown Conjunction Operator: ' + conjunction.operator);
        }
    }

    testRecordAgainstFieldNode(record: object, fieldNode: FieldNode<T>): boolean {
        for (let valueNode of fieldNode.children) {
            if (!this.testRecordFieldValue(record, fieldNode.fieldName, valueNode)) {
                return false;
            }
        }
        return true;
    }

    testRecordFieldValue(record: object, fieldName: string, valueNode: IQueryNode<T>): boolean {
        if (valueNode instanceof ValueOperator) {
            if (valueNode.operator == '_eq' && record[fieldName] == valueNode.value) {
                return true;
            }
            if (valueNode.operator == '_ne' && record[fieldName] != valueNode.value) {
                return true;
            }
            if (valueNode.operator == '_gt' && record[fieldName] > valueNode.value) {
                return true;
            }
            if (valueNode.operator == '_gte' && record[fieldName] >= valueNode.value) {
                return true;
            }
            if (valueNode.operator == '_lt' && record[fieldName] < valueNode.value) {
                return true;
            }
            if (valueNode.operator == '_lte' && record[fieldName] <= valueNode.value) {
                return true;
            }
            if (valueNode.operator == '_like' && getLikeOperatorRegExp(valueNode.value).test(record[fieldName])) {
                return true;
            }
            return false;
        }
        else if (valueNode instanceof ValueListOperator) {
            if (valueNode.operator == '_in') {
                return (valueNode.values.indexOf(record[fieldName]) > -1);
            }
            if (valueNode.operator == '_nin') {
                return (valueNode.values.indexOf(record[fieldName]) == -1);
            }
        }
        else {
            throw new Error('Unknown Field Value Operator: ' + valueNode.operator);
        }
    }
}
