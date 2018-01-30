
import { UI_COMPONENTS } from 'rev-ui/lib/config';
import { MUIListView } from './views/MUIListView';
import { MUIDetailView } from './views/MUIDetailView';
import { MUITextField } from './fields/MUITextField';
import { MUIActionButton } from './actions/MUIActionButton';

export function registerComponents() {

    UI_COMPONENTS.views.ListView = MUIListView;
    UI_COMPONENTS.views.DetailView = MUIDetailView;

    UI_COMPONENTS.actions.PostAction = MUIActionButton;
    UI_COMPONENTS.actions.SaveAction = MUIActionButton;

    UI_COMPONENTS.fields.DateField = MUITextField;
    UI_COMPONENTS.fields.TimeField = MUITextField;
    UI_COMPONENTS.fields.DateTimeField = MUITextField;
    UI_COMPONENTS.fields.IntegerField = MUITextField;
    UI_COMPONENTS.fields.NumberField = MUITextField;
    UI_COMPONENTS.fields.BooleanField = MUITextField;
    UI_COMPONENTS.fields.SelectField = MUITextField;
    UI_COMPONENTS.fields.EmailField = MUITextField;
    UI_COMPONENTS.fields.URLField = MUITextField;
    UI_COMPONENTS.fields.PasswordField = MUITextField;
    UI_COMPONENTS.fields.TextField = MUITextField;

}
