
import * as React from 'react';
// import * as PropTypes from 'prop-types';
import * as sinon from 'sinon';
import * as models from '../../__fixtures__/models';
import { expect } from 'chai';
import * as rev from 'rev-models';
import { mount } from 'enzyme';
import { ModelProvider } from '../../provider/ModelProvider';
import { ViewManager } from '../ViewManager';

describe('ViewManager', () => {

    let modelManager: rev.ModelManager;
    // let receivedViewContext: IViewContext;

    before(() => {
        modelManager = new rev.ModelManager();
    });

    // class TestView extends React.Component {
    //     static contextTypes = {
    //         modelManager: PropTypes.object,
    //         viewContext: PropTypes.object
    //     };
    //     constructor(props: any, context: any) {
    //         super(props, context);
    //         receivedViewContext = this.context.viewContext;
    //     }
    //     render() {
    //         return <p>SpyComponent</p>;
    //     }
    // }

    describe('construction', () => {
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

    describe('initial viewContext', () => {

    });

});