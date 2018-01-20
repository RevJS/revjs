
const PassthroughComponent: any = (props: any) => {
    return props.children;
};

export const UI_COMPONENTS = {
    views: {
        DetailView: PassthroughComponent,
        ListView: PassthroughComponent,
    },
    fields: {

    }
};
