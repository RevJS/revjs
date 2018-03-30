
import { UI_COMPONENTS } from 'rev-ui/lib/config';
import { MUIListView } from './views/MUIListView';
import { MUIDetailView } from './views/MUIDetailView';
import { MUITextField } from './fields/MUITextField';
import { MUIDateField } from './fields/MUIDateField';
import { MUISelectField } from './fields/MUISelectField';
import { MUIActionButton } from './actions/MUIActionButton';
import { MUIRelatedModelField } from './fields/MUIRelatedModelField';

export function registerComponents() {

    UI_COMPONENTS.views.ListView = MUIListView;
    UI_COMPONENTS.views.DetailView = MUIDetailView;

    UI_COMPONENTS.actions.PostAction = MUIActionButton;
    UI_COMPONENTS.actions.SaveAction = MUIActionButton;
    UI_COMPONENTS.actions.RemoveAction = MUIActionButton;

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

}
