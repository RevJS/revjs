
import * as React from 'react';
import { expect } from 'chai';
import { mount } from 'enzyme';
import * as models from '../../__fixtures__/models';
import { ModelManager } from 'rev-models';
import { ModelProvider, IModelManagerProp } from '../ModelProvider';
import { withModelManager } from '../withModelManager';

interface ISpyComponentProps {
    prop1: string;
    prop2: string;
}

describe('withModelManager()', () => {

    let modelManager: ModelManager;

    let receivedProps: ISpyComponentProps & IModelManagerProp;

    class SpyComponentC extends React.Component<ISpyComponentProps & IModelManagerProp> {
        constructor(props: any) {
            super(props);
            receivedProps = props;
        }
        render() {
            return <div>Spy Component</div>;
        }
    }

    const SpyComponent = withModelManager(SpyComponentC);

    before(() => {
        receivedProps = null;
        modelManager = models.getModelManager();
        mount(
            <ModelProvider modelManager={modelManager}>
                <SpyComponent prop1="prop1" prop2="prop2" />
            </ModelProvider>
        );
    });

    it('passes down modelManager from context', () => {
        expect(receivedProps.modelManager).not.to.be.undefined;
        expect(receivedProps.modelManager).to.equal(modelManager);
    });

    it('passes through other props', () => {
        expect(receivedProps.prop1).to.equal('prop1');
        expect(receivedProps.prop2).to.equal('prop2');
    });

});