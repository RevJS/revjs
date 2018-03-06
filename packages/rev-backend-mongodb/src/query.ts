import { IModel, ModelManager } from 'rev-models';
import { ConjunctionNode, FieldNode, ValueOperator, ValueListOperator } from 'rev-models/lib/queries/nodes';
import { getLikeOperatorRegExp } from 'rev-models/lib/queries/utils';
import { IQueryNode } from 'rev-models/lib/queries/types';
import { QueryParser } from 'rev-models/lib/queries/queryparser';

const FIELD_OPERATOR_MAPPING = {
    eq: '$eq',
    ne: '$ne',
    gt: '$gt',
    gte: '$gte',
    lt: '$lt',
    lte: '$lte',
    like: '__like',
    in: '$in',
    nin: '$nin'
};

function _convertConjunctionNode(srcNode: ConjunctionNode<any>, destNode: object) {
    if (srcNode.children.length == 0) {
        return;
    }
    const mongoOperator = (srcNode.operator == 'and' && '$and') || (srcNode.operator == 'or' && '$or');
    if (!mongoOperator) {
        throw new Error(`Conjunction Operator '${srcNode.operator}' not recognised.`);
    }
    destNode[mongoOperator] = srcNode.children.map((child) => {
        const childDestNode = {};
        _convertQueryNode(child, childDestNode);
        return childDestNode;
    });
}

function _convertFieldNode(srcNode: FieldNode<any>, destNode: object) {
    destNode[srcNode.fieldName] = {};
    for (let valueNode of srcNode.children) {
        let mongoOperator = FIELD_OPERATOR_MAPPING[valueNode.operator];
        if (!mongoOperator) {
            throw new Error(`Field Value Operator '${valueNode.operator}' not recognised.`);
        }
        if (valueNode instanceof ValueOperator) {
            let value = valueNode.value;
            if (mongoOperator == '__like') {
                mongoOperator = '$regex';
                value = getLikeOperatorRegExp(value);
            }
            destNode[srcNode.fieldName][mongoOperator] = value;
        }
        else if (valueNode instanceof ValueListOperator) {
            destNode[srcNode.fieldName][mongoOperator] = valueNode.values;
        }
        else {
            throw new Error(`Field Value Operator '${valueNode.operator}' not supported.`);
        }
    }
}

function _convertQueryNode(srcNode: IQueryNode<any>, destNode: object) {
    if (srcNode instanceof ConjunctionNode) {
        _convertConjunctionNode(srcNode, destNode);
    }
    else if (srcNode instanceof FieldNode) {
        return _convertFieldNode(srcNode, destNode);
    }
    else {
        throw new Error(`Unrecognised Query Node: ${srcNode.constructor.name}`);
    }

}

export function convertQuery<T extends IModel>(manager: ModelManager, model: new() => T, where: object): any {
    const parser = new QueryParser(manager);
    const queryNode = parser.getQueryNodeForQuery(model, where);
    const mongoQuery = {};
    _convertQueryNode(queryNode, mongoQuery);
    return mongoQuery;
}
