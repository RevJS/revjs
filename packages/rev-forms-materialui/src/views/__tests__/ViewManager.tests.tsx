
import * as React from 'react';
import * as PropTypes from 'prop-types';
import * as sinon from 'sinon';
import * as models from '../../__fixtures__/models';
import { expect } from 'chai';
import * as rev from 'rev-models';
import { mount, ReactWrapper } from 'enzyme';
import { ModelProvider } from '../../provider/ModelProvider';
import { ViewManager, IViewContext } from '../ViewManager';

describe('ViewManager', () => {

    describe('construction', () => {
        let modelManager: rev.ModelManager;
        let errorStub: sinon.SinonStub;

        beforeEach(() => {
            modelManager = models.getModelManager();
            errorStub = sinon.stub(console, 'error');
        });

        afterEach(() => {
            errorStub.restore();
        });

        it('throws error when not nested inside a ModelProvider', () => {
            expect(() => {
                mount(<ViewManager model="Post" />);
            }).to.throw('must be nested inside a ModelProvider');
        });

        it('throws error when specified model does not exist', () => {
            expect(() => {
                mount(<ModelProvider modelManager={modelManager}>
                    <ViewManager model="NonExistey" />
                </ModelProvider>);
            }).to.throw(`Model 'NonExistey' is not registered`);
        });

        it('throws error when specified model does not define a primaryKey', () => {
            class ModelNoPK {
                @rev.TextField()
                    name: string;
            }
            modelManager.register(ModelNoPK);
            expect(() => {
                mount(<ModelProvider modelManager={modelManager}>
                    <ViewManager model="ModelNoPK" />
                </ModelProvider>);
            }).to.throw(`can only be used with models that have a primaryKey`);
        });

    });

    let receivedViewContext: IViewContext;

    class TestView extends React.Component {
        static contextTypes = {
            modelManager: PropTypes.object,
            viewContext: PropTypes.object
        };
        constructor(props: any, context: any) {
            super(props, context);
            receivedViewContext = this.context.viewContext;
        }
        render() {
            return <p>SpyComponent</p>;
        }
    }

    describe('initial viewContext - when no primaryKeyValue is specified', () => {
        let modelManager: rev.ModelManager;
        let wrapper: ReactWrapper;

        before(() => {
            receivedViewContext = null;
            modelManager = models.getModelManager();
            wrapper = mount(
                <ModelProvider modelManager={modelManager}>
                    <ViewManager model="Post">
                        <TestView />
                    </ViewManager>
                </ModelProvider>
            );
        });

        it('passes viewContext to contained Views', () => {
            expect(receivedViewContext).not.to.be.null;
        });

        it('does not trigger a data load', () => {
            expect(receivedViewContext.loadState).to.equal('NONE');
        });

        it('model data is null', () => {
            expect(receivedViewContext.model).to.be.null;
        });

        it('modelMeta is set', () => {
            expect(receivedViewContext.modelMeta).to.deep.equal(modelManager.getModelMeta('Post'));
        });

        it('validation information is null', () => {
            expect(receivedViewContext.validation).to.be.null;
        });

        it('dirty is false', () => {
            expect(receivedViewContext.dirty).to.be.false;
        });

    });

});