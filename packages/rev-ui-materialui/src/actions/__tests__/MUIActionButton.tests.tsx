
import * as React from 'react';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { mount, ReactWrapper } from 'enzyme';

import { MUIActionButton } from '../MUIActionButton';
import { IActionComponentProps } from 'rev-ui/lib/actions/types';
import Button from 'material-ui/Button';

describe('MUIActionButton', () => {

    let props: IActionComponentProps;
    let wrapper: ReactWrapper;
    let button: ReactWrapper;

    function getComponentProps(): IActionComponentProps {
        return {
            label: 'Button Label',
            doAction: sinon.stub(),
            disabled: false
        };
    }

    function render() {
        wrapper = mount(
            <MUIActionButton {...props} />
        );
        button = wrapper.find(Button);
    }

    beforeEach(() => {
        props = getComponentProps();
        render();
    });

    it('renders a button', () => {
        expect(button).to.have.length(1);
    });

    it('button can be not disabled', () => {
        expect(button.prop('disabled')).to.equal(false);
    });

    it('button can be disabled', () => {
        props.disabled = true;
        render();
        expect(button.prop('disabled')).to.equal(true);
    });

    it('renders passed in label prop', () => {
        expect(button.text()).to.equal('Button Label');
    });

    it('alternatively, renders passed in child component', () => {
        props.children = <span>Sweet Other Content</span>;
        render();
        expect(button.text()).to.equal('Sweet Other Content');
    });

    it('calls doAction() when clicked', () => {
        button.simulate('click');
        expect((props.doAction as any).callCount).to.equal(1);
    });

});