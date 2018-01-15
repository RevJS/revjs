
import * as React from 'react';
import * as PropTypes from 'prop-types';
import { expect } from 'chai';
import { ModelManager } from 'rev-models';
import { mount } from 'enzyme';
import { ModelProvider } from '../ModelProvider';

describe('ModelProvider', () => {

    let modelManager: ModelManager;
    let passedModelManager: ModelManager;

    before(() => {
        modelManager = new ModelManager();
    });

    class SpyComponent extends React.Component {
        static contextTypes = {
            modelManager: PropTypes.object
        };
        constructor(props: any, context: any) {
            super(props, context);
            passedModelManager = this.context.modelManager;
        }
        render() {
            return <p>SpyComponent</p>;
        }
    }

    it('passes down the specified ModelManager via React Context', () => {
        mount(
            <ModelProvider modelManager={modelManager}>
                <SpyComponent />
            </ModelProvider>
        );
        expect(passedModelManager).to.equal(modelManager);
    });

});