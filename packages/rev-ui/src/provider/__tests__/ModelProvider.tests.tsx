
import * as React from 'react';
import * as PropTypes from 'prop-types';
import { expect } from 'chai';
import { ModelManager } from 'rev-models';
import { mount, ReactWrapper } from 'enzyme';
import { ModelProvider } from '../ModelProvider';

describe('ModelProvider', () => {

    let modelManager: ModelManager;
    let passedModelManager: ModelManager;
    let wrapper: ReactWrapper;

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

    before(() => {
        modelManager = new ModelManager();
        wrapper = mount(
            <ModelProvider modelManager={modelManager}>
                <SpyComponent />
            </ModelProvider>
        );
    });

    it('passes down the specified ModelManager via React Context', () => {
        expect(passedModelManager).to.equal(modelManager);
    });

    it('renders children directly', () => {
        expect(wrapper.at(0).text()).to.equal('SpyComponent');
    });

});