
export interface IActionComponentProps {
    label: string;
    disabled: boolean;
    doAction(): Promise<void>;

    children?: React.ReactNode;
}
