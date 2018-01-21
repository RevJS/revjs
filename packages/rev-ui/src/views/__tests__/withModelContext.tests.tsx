
import * as React from 'react';
import { expect } from 'chai';
import { mount } from 'enzyme';
import * as models from '../../__fixtures__/models';
import { ModelManager } from 'rev-models';
import { ModelProvider } from '../../provider/ModelProvider';
import { DetailView, IModelContextProp } from '../DetailView';
import { withModelContext } from '../withModelContext';

interface ISpyComponentProps {
    prop1: string;
    prop2: string;
}

describe('withModelContext()', () => {

    let modelManager: ModelManager;

    let receivedProps: ISpyComponentProps & IModelContextProp;

    class SpyComponentC extends React.Component<ISpyComponentProps & IModelContextProp> {
        constructor(props: any) {
            super(props);
            receivedProps = props;
        }
        render() {
            return <div>Spy Component</div>;
        }
    }

    const SpyComponent = withModelContext(SpyComponentC);

    before(() => {
        receivedProps = null;
        modelManager = models.getModelManager();
        mount(
            <ModelProvider modelManager={modelManager}>
                <DetailView model="Post">
                    <SpyComponent prop1="prop1" prop2="prop2" />
                </DetailView>
            </ModelProvider>
        );
    });

    it('passes down modelContext from context', () => {
        expect(receivedProps.modelContext).not.to.be.undefined;
        expect(receivedProps.modelContext.modelMeta.name).to.equal('Post');
    });

    it('passes through other props', () => {
        expect(receivedProps.prop1).to.equal('prop1');
        expect(receivedProps.prop2).to.equal('prop2');
    });

});