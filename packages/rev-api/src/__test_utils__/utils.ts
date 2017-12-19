
import { expect } from 'chai';

export function expectToHaveProperties(testee: any, properties: any) {
    for (let field of Object.keys(properties)) {
        expect(testee).to.have.property(field, properties[field]);
    }
}
