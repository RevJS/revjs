
import * as React from 'react';
import { expect } from 'chai';
import { mount } from 'enzyme';
import * as models from '../../../__fixtures__/models';
import { ModelManager } from 'rev-models';
import { ModelProvider } from '../../../provider/ModelProvider';
import { DetailView, IDetailViewContextProp } from '../../DetailView';
import { withDetailViewContext } from '../../withDetailViewContext';

interface ISpyComponentProps {
    prop1: string;
    prop2: string;
}

describe('withDetailViewContext()', () => {

    let modelManager: ModelManager;

    let receivedProps: ISpyComponentProps & IDetailViewContextProp;

    class SpyComponentC extends React.Component<ISpyComponentProps & IDetailViewContextProp> {
        constructor(props: any) {
            super(props);
            receivedProps = props;
        }
        render() {
            return <div>Spy Component</div>;
        }
    }

    const SpyComponent = withDetailViewContext(SpyComponentC);

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

    it('passes down detailViewContext from context', () => {
        expect(receivedProps.detailViewContext).not.to.be.undefined;
        expect(receivedProps.detailViewContext.modelMeta.name).to.equal('Post');
    });

    it('passes through other props', () => {
        expect(receivedProps.prop1).to.equal('prop1');
        expect(receivedProps.prop2).to.equal('prop2');
    });

});