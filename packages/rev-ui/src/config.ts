
const PassthroughComponent: any = (props: any) => {
    return props.children;
};

export const UI_COMPONENTS = {
    views: {
        DetailView: PassthroughComponent,
        ListView: PassthroughComponent,
        SearchView: PassthroughComponent
    },
    actions: {
        PostAction: PassthroughComponent,
        SaveAction: PassthroughComponent,
        RemoveAction: PassthroughComponent,
        SearchAction: PassthroughComponent
    },
    fields: {
        TextField: PassthroughComponent,
        EmailField: PassthroughComponent,
        URLField: PassthroughComponent,
        PasswordField: PassthroughComponent,
        NumberField: PassthroughComponent,
        IntegerField: PassthroughComponent,
        AutoNumberField: PassthroughComponent,
        BooleanField: PassthroughComponent,
        SelectField: PassthroughComponent,
        MultiSelectField: PassthroughComponent,
        DateField: PassthroughComponent,
        TimeField: PassthroughComponent,
        DateTimeField: PassthroughComponent,
        RelatedModelField: PassthroughComponent,
        RelatedModelListField: PassthroughComponent,
    },
    searchFields: {
        TextField: PassthroughComponent,
        EmailField: PassthroughComponent,
        URLField: PassthroughComponent,
        PasswordField: PassthroughComponent,
        NumberField: PassthroughComponent,
        IntegerField: PassthroughComponent,
        AutoNumberField: PassthroughComponent,
        BooleanField: PassthroughComponent,
        SelectField: PassthroughComponent,
        MultiSelectField: PassthroughComponent,
        DateField: PassthroughComponent,
        TimeField: PassthroughComponent,
        DateTimeField: PassthroughComponent,
        RelatedModelField: PassthroughComponent,
        RelatedModelListField: PassthroughComponent,
    }
};
