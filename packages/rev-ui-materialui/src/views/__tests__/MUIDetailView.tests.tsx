
import * as React from 'react';
import { expect } from 'chai';
import { mount, ReactWrapper } from 'enzyme';

import { MUIDetailView } from '../MUIDetailView';
import { IDetailViewProps } from 'rev-ui/lib/views/DetailView';
import Grid from 'material-ui/Grid';

describe('MUIDetailView', () => {

    let props: IDetailViewProps;
    let wrapper: ReactWrapper;

    function getComponentProps(): IDetailViewProps {
        return {
            model: 'Post'
        };
    }

    function MockComponent() {
        return <span>MOCK!</span>;
    }

    before(() => {
        props = getComponentProps();
        wrapper = mount(
            <MUIDetailView {...props}>
                <MockComponent />
            </MUIDetailView>
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

});