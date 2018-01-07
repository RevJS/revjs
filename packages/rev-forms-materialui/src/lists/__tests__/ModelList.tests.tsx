
import * as React from 'react';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { mount, ReactWrapper } from 'enzyme';
import { ModelList } from '../ModelList';
import * as models from '../../__fixtures__/models';
import { ModelManager } from 'rev-models';
import { ModelProvider } from '../../provider/ModelProvider';
import { LinearProgress } from 'material-ui/Progress';

describe('ModelList', () => {

    let modelManager: ModelManager;

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
                mount(<ModelList model="Post" fields={['title']} />);
            }).to.throw('must be nested inside a ModelProvider');
        });

        it('throws error when specified model does not exist', () => {
            expect(() => {
                mount(<ModelProvider modelManager={modelManager}>
                        <ModelList model="NonExistey" fields={['name']} />
                    </ModelProvider>);
            }).to.throw(`Model 'NonExistey' is not registered`);
        });

        it('throws error when field name does not exist on model', () => {
            expect(() => {
                mount(<ModelProvider modelManager={modelManager}>
                        <ModelList model="Post" fields={['flannel']} />
                    </ModelProvider>);
            }).to.throw(`Model 'Post' does not have a field called 'flannel'`);
        });
    });

    describe('initial state - no data loaded', () => {
        const model = 'Post';
        const fields = ['id', 'title', 'published', 'post_date'];
        let wrapper: ReactWrapper;

        before(() => {
            modelManager = models.getModelManager();
            wrapper = mount(
                <ModelProvider modelManager={modelManager}>
                    <ModelList model={model} fields={fields} />
                </ModelProvider>);
        });

        it('renders a loading progress indicator', () => {
            expect(wrapper.contains(<LinearProgress />)).to.be.true;
        });

        it('does not render the table', () => {
            expect(wrapper.find('table')).to.have.length(0);
        });

    });

    describe('when data has loaded', () => {
        const model = 'Post';
        const fields = ['id', 'title', 'published', 'post_date'];
        let wrapper: ReactWrapper;

        before((done) => {
            modelManager = models.getModelManager();
            wrapper = mount(
                <ModelProvider modelManager={modelManager}>
                    <ModelList model={model} fields={fields} />
                </ModelProvider>);
            setTimeout(() => {
                wrapper.update();
                done();
            }, 50);
        });

        it('does not render a loading progress indicator', () => {
            expect(wrapper.contains(<LinearProgress />)).to.be.false;
        });

        it('does not render the table', () => {
            expect(wrapper.find('table')).to.have.length(1);
        });

    });

});