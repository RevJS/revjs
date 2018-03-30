
import { UI_COMPONENTS } from 'rev-ui/lib/config';

import { MUIListView } from './views/MUIListView';
import { MUIDetailView } from './views/MUIDetailView';
import { MUISearchView } from './views/MUISearchView';

import { MUIActionButton } from './actions/MUIActionButton';

import { MUITextField } from './fields/MUITextField';
import { MUIDateField } from './fields/MUIDateField';
import { MUISelectField } from './fields/MUISelectField';
import { MUIRelatedModelField } from './fields/MUIRelatedModelField';

import { MUITextSearchField } from './searchFields/MUITextSearchField';
import { MUISelectSearchField } from './searchFields/MUISelectSearchField';

export function registerComponents() {

    UI_COMPONENTS.views.ListView = MUIListView;
    UI_COMPONENTS.views.DetailView = MUIDetailView;
    UI_COMPONENTS.views.SearchView = MUISearchView;

    UI_COMPONENTS.actions.PostAction = MUIActionButton;
    UI_COMPONENTS.actions.SaveAction = MUIActionButton;
    UI_COMPONENTS.actions.RemoveAction = MUIActionButton;
    UI_COMPONENTS.actions.SearchAction = MUIActionButton;

    UI_COMPONENTS.fields.TextField = MUITextField;
    UI_COMPONENTS.fields.EmailField = MUITextField;
    UI_COMPONENTS.fields.URLField = MUITextField;
    UI_COMPONENTS.fields.PasswordField = MUITextField;
    UI_COMPONENTS.fields.NumberField = MUITextField;
    UI_COMPONENTS.fields.IntegerField = MUITextField;
    UI_COMPONENTS.fields.AutoNumberField = MUITextField;
    UI_COMPONENTS.fields.BooleanField = MUITextField;
    UI_COMPONENTS.fields.SelectField = MUISelectField;
    UI_COMPONENTS.fields.MultiSelectField = MUITextField;
    UI_COMPONENTS.fields.DateField = MUIDateField;
    UI_COMPONENTS.fields.TimeField = MUITextField;
    UI_COMPONENTS.fields.DateTimeField = MUITextField;
    UI_COMPONENTS.fields.RelatedModelField = MUIRelatedModelField;
    UI_COMPONENTS.fields.RelatedModelListField = MUITextField;

    UI_COMPONENTS.searchFields.TextField = MUITextSearchField;
    UI_COMPONENTS.searchFields.EmailField = MUITextSearchField;
    UI_COMPONENTS.searchFields.URLField = MUITextSearchField;
    UI_COMPONENTS.searchFields.PasswordField = MUITextSearchField;
    UI_COMPONENTS.searchFields.NumberField = MUITextSearchField;
    UI_COMPONENTS.searchFields.IntegerField = MUITextSearchField;
    UI_COMPONENTS.searchFields.AutoNumberField = MUITextSearchField;
    UI_COMPONENTS.searchFields.BooleanField = MUITextSearchField;
    UI_COMPONENTS.searchFields.SelectField = MUISelectSearchField;
    UI_COMPONENTS.searchFields.MultiSelectField = MUITextSearchField;
    UI_COMPONENTS.searchFields.DateField = MUITextSearchField;
    UI_COMPONENTS.searchFields.TimeField = MUITextSearchField;
    UI_COMPONENTS.searchFields.DateTimeField = MUITextSearchField;
    UI_COMPONENTS.searchFields.RelatedModelField = MUITextSearchField;
    UI_COMPONENTS.searchFields.RelatedModelListField = MUITextSearchField;

}
