
import { UI_COMPONENTS } from 'rev-ui/lib/config';
import { MUIListView } from './views/MUIListView';
import { MUIDetailView } from './views/MUIDetailView';

export function registerComponents() {

    UI_COMPONENTS.views.ListView = MUIListView;
    UI_COMPONENTS.views.DetailView = MUIDetailView;

}
