
import * as React from 'react';
import { expect } from 'chai';
import { mount } from 'enzyme';
import * as models from '../../../__fixtures__/models';
import { ModelManager } from 'rev-models';
import { ModelProvider } from '../../../provider/ModelProvider';
import { SearchView, ISearchViewContextProp } from '../../SearchView';
import { withSearchViewContext } from '../../withSearchViewContext';

interface ISpyComponentProps {
    prop1: string;
    prop2: string;
}

describe('withSearchViewContext()', () => {

    let modelManager: ModelManager;

    let receivedProps: ISpyComponentProps & ISearchViewContextProp;

    class SpyComponentC extends React.Component<ISpyComponentProps & ISearchViewContextProp> {
        constructor(props: any) {
            super(props);
            receivedProps = props;
        }
        render() {
            return <div>Spy Component</div>;
        }
    }

    const SpyComponent = withSearchViewContext(SpyComponentC);

    before(() => {
        receivedProps = null as any;
        modelManager = models.getModelManager();
        mount(
            <ModelProvider modelManager={modelManager}>
                <SearchView model="Post" onSearch={() => null}>
                    <SpyComponent prop1="prop1" prop2="prop2" />
                </SearchView>
            </ModelProvider>
        );
    });

    it('passes down searchViewContext from context', () => {
        expect(receivedProps.searchViewContext).not.to.be.undefined;
        expect(receivedProps.searchViewContext.modelMeta.name).to.equal('Post');
    });

    it('passes through other props', () => {
        expect(receivedProps.prop1).to.equal('prop1');
        expect(receivedProps.prop2).to.equal('prop2');
    });

});