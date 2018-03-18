/**
 * The props passed to ActionComponents, when they are set up via e.g.
 * `<SaveAction component={MyCustomComponent} />`, or via the
 * [[UI_COMPONENTS]] configuration.
 */
export interface IActionComponentProps {

    /** The label to be displayed */
    label: string;

    /** Whether the component should be disabled */
    disabled: boolean;

    /** The method to call to trigger the action */
    doAction(): Promise<void>;

    /** Any children passed to the parent ActionComponent */
    children?: React.ReactNode;
}
