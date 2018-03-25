
import * as React from 'react';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { mount, ReactWrapper } from 'enzyme';

import { MUITextField } from '../MUITextField';
import Grid from 'material-ui/Grid';
import { IFieldComponentProps } from 'rev-ui/lib/fields/Field';
import { fields } from 'rev-models';
import InputLabel from 'material-ui/Input/InputLabel';
import Input from 'material-ui/Input';
import { FormHelperText } from 'material-ui/Form';

describe('MUITextField', () => {

    let props: IFieldComponentProps;
    let wrapper: ReactWrapper;

    function getComponentProps(): IFieldComponentProps {
        return {
            field: new fields.TextField('text_field'),
            label: 'Text Field',
            colspanNarrow: 12,
            colspan: 6,
            colspanWide: 4,
            value: 'some value',
            errors: [],
            disabled: false,
            style: {marginTop: 10},
            onChange: sinon.stub()
        };
    }

    function render() {
        wrapper = mount(
            <MUITextField {...props} />
        );
    }

    describe('basic rendering', () => {

        before(() => {
            props = getComponentProps();
            render();
        });

        it('renders a Grid component with "item" property set', () => {
            const grid = wrapper.find(Grid);
            expect(grid).to.have.length(1);
            expect(grid.prop('item')).to.be.true;
        });

        it('Grid component has column widths set correctly', () => {
            const grid = wrapper.find(Grid);
            expect(grid).to.have.length(1);
            expect(grid.prop('xs')).to.equal(props.colspanNarrow);
            expect(grid.prop('md')).to.equal(props.colspan);
            expect(grid.prop('lg')).to.equal(props.colspanWide);
        });

        it('renders an InputLabel component containing props.label and no error', () => {
            const label = wrapper.find(InputLabel);
            expect(label).to.have.length(1);
            expect(label.text()).to.equal('Text Field');
            expect(label.prop('error')).to.be.false;
        });

        it('renders an Input component', () => {
            const input = wrapper.find(Input);
            expect(input).to.have.length(1);
        });

        it('Input component has expected props', () => {
            const input = wrapper.find(Input);
            expect(input).to.have.length(1);
            expect(input.prop('id')).to.equal(props.field.name);
            expect(input.prop('type')).to.equal('text');
            expect(input.prop('value')).to.equal(props.value);
            expect(input.prop('disabled')).to.equal(props.disabled);
            expect(input.prop('error')).to.be.false;
        });

        it('does not render form helper text when there are no errors', () => {
            const helpText = wrapper.find(FormHelperText);
            expect(helpText).to.have.length(0);
        });

        it('applies passed-in style', () => {
            const outerDiv = wrapper.find('div').at(0);
            expect(outerDiv.prop('style')).to.deep.equal({marginTop: 10});
        });

    });

    describe('field type', () => {

        before(() => {
            props = getComponentProps();
            props.field = new fields.PasswordField('password_field');
            render();
        });

        it('renders a password field when required', () => {
            const input = wrapper.find(Input);
            expect(input).to.have.length(1);
            expect(input.prop('type')).to.equal('password');
        });

    });

    describe('multiline text entry', () => {

        beforeEach(() => {
            props = getComponentProps();
        });

        it('not multi-line by default', () => {
            props.field = new fields.TextField('normal_field');
            render();

            const input = wrapper.find(Input);
            expect(input).to.have.length(1);
            expect(input.prop('multiline')).to.be.undefined;
            expect(input.prop('rowsMax')).to.be.undefined;
        });

        it('when options.multiline = true, input is multi-line', () => {
            props.field = new fields.TextField('multiline_field', { multiLine: true });
            render();

            const input = wrapper.find(Input);
            expect(input).to.have.length(1);
            expect(input.prop('multiline')).to.equal(true);
            expect(input.prop('rowsMax')).to.equal(4);
        });

    });

    describe('when the errors property contains items', () => {

        before(() => {
            props = getComponentProps();
            props.errors = [
                { message: 'Error 1' },
                { message: 'Error 2' }
            ];
            render();
        });

        it('InputLabel component has the error property set', () => {
            const label = wrapper.find(InputLabel);
            expect(label).to.have.length(1);
            expect(label.prop('error')).to.be.true;
        });

        it('Input component has the error property set', () => {
            const input = wrapper.find(Input);
            expect(input).to.have.length(1);
            expect(input.prop('error')).to.be.true;
        });

        it('renders form helper text with error property set', () => {
            const helpText = wrapper.find(FormHelperText);
            expect(helpText).to.have.length(1);
            expect(helpText.prop('error')).to.be.true;
        });

        it('error messages are concetenated', () => {
            const helpText = wrapper.find(FormHelperText);
            expect(helpText.text()).to.equal('Error 1. Error 2. ');
        });

    });

});