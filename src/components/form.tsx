import React, { FormEvent } from "react";

export interface ValidatorFormProps<T, E, F, K extends { isValid: boolean }> {
    validate: (contents: F) => K | Promise<K>;
    correct: (contents: F, result: K) => void;
    error: (contents: F, result: K) => void;
    submit: (contents: F) => Promise<T>; 
    success?: (response: T) => void;
    complete?: (contents: F) => void;
    apiError?: (error: E) => void;
    loadingComponent?: () => JSX.Element | null;
    correctComponent?: (contents: F, result: K) => JSX.Element | null;
    errorComponent?: (contents: F, result: K) => JSX.Element | null;
    apiErrorComponent?: (error: E) => JSX.Element | null;
    unfreeze?: boolean;
    formProps?: React.FormHTMLAttributes<HTMLFormElement>;
}

interface State<T, E, F, K extends { isValid: boolean }> {
    validation: K | null;
    submitting: boolean;
    result: T | null;
    values: F | null;
    apiError: E | null;
}

export class ValidatorForm<T, E, F, K extends { isValid: boolean }> extends React.Component<ValidatorFormProps<T, E, F, K>, State<T, E, F, K>> {
    formRef: HTMLFormElement | null = null;
    tagNames: string[] = ['input', 'select', 'textarea'];
    state: State<T, E, F, K> = {
        result: null,
        values: null,
        apiError: null,
        validation: null,
        submitting: false,
    }
    nodes: Array<HTMLElement> = [];
    submitButtons: Array<HTMLButtonElement> = [];
    public componentDidMount() {
        this.nodes = this.seekInDom();
        this.submitButtons = this.seekButtons();
    }
    public async componentDidUpdate() {
        const { props, state } = this;
        if (state.validation && state.validation.isValid && state.values && !state.submitting) {
            this.submitButtons.forEach(button => button.disabled = true);
            this.setState({ submitting: true });
            try {
                const result = await props.submit(state.values);
                if (props.success) {
                    props.success(result);
                    this.setState({ submitting: false, result, apiError: null });
                }
            } catch (e) {
                if (props.apiError) {
                    props.apiError(e);
                    this.setState({ submitting: false, result: null, apiError: e });
                }
            } finally {
                if (props.complete) {
                    props.complete(state.values);
                }
                this.setState({ validation: null });
                this.submitButtons.forEach(button => button.disabled = false);
            }
        }
        if (props.unfreeze) {
            this.nodes = this.seekInDom();
            this.submitButtons = this.seekButtons();    
        }
    }
    public componentWillUnmount() {
        this.nodes = [];
        this.submitButtons = [];
    }
    public render() {
        const { props, state } = this;
        return (
            <form {...props.formProps} ref={node => this.formRef = node} onSubmit={this.validation}>
                {state.validation
                    && !state.validation.isValid
                    && props.errorComponent
                    && props.errorComponent(state.values!, state.validation!)}
                {state.apiError && props.apiErrorComponent && props.apiErrorComponent(state.apiError)}
                {state.submitting && props.loadingComponent && props.loadingComponent()}
                {state.validation
                    && state.validation.isValid
                    && props.correctComponent
                    && props.correctComponent(state.values!, state.validation!)}
                {props.children}
            </form>
        )
    }

    private validation = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const { props, nodes } = this;
        const collect = nodes
            .reduce((p: F, node) => {
                if (node instanceof HTMLSelectElement
                    || node instanceof HTMLInputElement
                    || node instanceof HTMLTextAreaElement
                ) {
                    (p as any)[node.name] = node.value;
                    return p;
                }
                throw Error('Unknown element bound!');
            }, {} as F);
        const validation = await props.validate(collect);
        if (validation.isValid) {
            props.correct(collect, validation);
        } else {
            props.error(collect, validation);
        }
        this.setState({ validation, values: collect });
    }

    private seekButtons = (acc: Array<HTMLButtonElement> = [], node: HTMLElement | null = this.formRef): Array<HTMLButtonElement> => {
        if (!node) {
            return acc;
        }
        for (let i = 0; i < node.children.length; i++) {
            const child = node.children.item(i);
            if (child && child instanceof HTMLElement) {
                if (child instanceof HTMLButtonElement && child.type === 'submit') {
                    acc.push(child);
                } else {
                    this.seekInDom(acc, child);
                }
            }
        }
        return acc;
    };

    private seekInDom = (acc: Array<HTMLElement> = [], node: HTMLElement | null = this.formRef): Array<HTMLElement> => {
        if (!node) {
            return acc;
        }
        for (let i = 0; i < node.children.length; i++) {
            const child = node.children.item(i);
            if (child && child instanceof HTMLElement) {
                if (this.tagNames.includes(child.tagName)) {
                    acc.push(child);
                } else {
                    this.seekInDom(acc, child);
                }
            }
        }
        return acc;
    }
}