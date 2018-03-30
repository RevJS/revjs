
import * as React from 'react';
import { expect } from 'chai';
import { mount, ReactWrapper } from 'enzyme';

import { MUISearchView } from '../MUISearchView';
import { ISearchViewProps } from 'rev-ui/lib/views/SearchView';
import Grid from 'material-ui/Grid';

describe('MUISearchView', () => {

    let props: ISearchViewProps;
    let wrapper: ReactWrapper;

    function getComponentProps(): ISearchViewProps {
        return {
            model: 'Post',
            onSearch: () => null,
            style: {marginTop: 10}
        };
    }

    function MockComponent() {
        return <span>MOCK!</span>;
    }

    before(() => {
        props = getComponentProps();
        wrapper = mount(
            <MUISearchView {...props}>
                <MockComponent />
            </MUISearchView>
        );
    });

    it('renders a grid with properties as expected', () => {
        const grid = wrapper.find(Grid);
        expect(grid).to.have.length(1);
        expect(grid.prop('container')).to.be.true;
    });

    it('grid contains the wrapped component', () => {
        const grid = wrapper.find(Grid);
        expect(grid.find(MockComponent)).to.have.length(1);
    });

    it('style is applied to outer div', () => {
        const outerDiv = wrapper.find('div').at(0);
        expect(outerDiv.prop('style')).to.deep.equal({marginTop: 10});
    });

});