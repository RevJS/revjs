
const PassthroughComponent: any = (props: any) => {
    return props.children;
};

export const UI_COMPONENTS = {
    views: {
        DetailView: PassthroughComponent,
        ListView: PassthroughComponent,
    },
    fields: {
        DateField: PassthroughComponent,
        TimeField: PassthroughComponent,
        DateTimeField: PassthroughComponent,
        IntegerField: PassthroughComponent,
        NumberField: PassthroughComponent,
        RelatedModelField: PassthroughComponent,
        RelatedModelListField: PassthroughComponent,
        BooleanField: PassthroughComponent,
        SelectField: PassthroughComponent,
        EmailField: PassthroughComponent,
        URLField: PassthroughComponent,
        PasswordField: PassthroughComponent,
        TextField: PassthroughComponent
    }
};
