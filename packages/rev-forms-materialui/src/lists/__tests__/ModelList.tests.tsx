
import * as React from 'react';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { mount, ReactWrapper } from 'enzyme';
import { sleep } from '../../__test_utils__/utils';
import { ModelList } from '../ModelList';
import * as models from '../../__fixtures__/models';
import { ModelManager, IModelMeta } from 'rev-models';
import { ModelProvider } from '../../provider/ModelProvider';
import { LinearProgress } from 'material-ui/Progress';
import Table from 'material-ui/Table';
import { createData, IModelTestData } from '../../__fixtures__/modeldata';

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
            expect(wrapper.find(LinearProgress)).to.have.length(1);
        });

        it('does not render the table', () => {
            expect(wrapper.find(Table)).to.have.length(0);
        });

    });

    describe('when data has loaded', () => {
        const model = 'Post';
        const fields = ['id', 'title', 'published', 'post_date'];
        let wrapper: ReactWrapper;
        let meta: IModelMeta<models.Post>;
        let expectedData: IModelTestData;

        before(async () => {
            modelManager = models.getModelManager();
            meta = modelManager.getModelMeta(models.Post);
            expectedData = await createData(modelManager);

            wrapper = mount(
                <ModelProvider modelManager={modelManager}>
                    <ModelList model={model} fields={fields} />
                </ModelProvider>);
            await sleep(50);
            wrapper.update();
        });

        it('does not render a loading progress indicator', () => {
            expect(wrapper.find(LinearProgress)).to.have.length(0);
        });

        it('renders the table', () => {
            expect(wrapper.find(Table)).to.have.length(1);
        });

        it('renders all column headings', () => {
            expect(wrapper.find('th')).to.have.length(fields.length);
        });

        it('renders columns heading labels in correct order', () => {
            fields.forEach((fieldName, idx) => {
                const th = wrapper.find('th').at(idx);
                expect(th.text()).to.equal(
                    meta.fieldsByName[fieldName].options.label
                    || meta.fieldsByName[fieldName].name
                );
            });
        });

        it('renders table body', () => {
            expect(wrapper.find('tbody')).to.have.length(1);
        });

        it('renders all rows of data', () => {
            expect(
                wrapper.find('tbody')
                .at(0).find('tr')
            ).to.have.length(expectedData.posts.length);
        });

        it('renders the correct data in each cell', () => {
            expectedData.posts.forEach((post, postIdx) => {
                const row = wrapper.find('tbody')
                    .at(0).find('tr').at(postIdx);

                fields.forEach((fieldName, fieldIdx) => {
                    const td = row.find('td').at(fieldIdx);

                    expect(td.text()).to.equal(
                        post[fieldName].toString()
                    );
                });
            });
        });
    });

});