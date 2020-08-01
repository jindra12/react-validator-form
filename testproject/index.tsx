import ReactDOM from 'react-dom';
import React, { FunctionComponent } from 'react';
import ValidatorForm from 'react-validator-form';

interface FormContents {
    name: string;
    surname: string;
    age: string;
}

interface ApiResult extends FormContents {
    id: number;
}

const TestComponent: FunctionComponent = () => (
    <div>
        <ValidatorForm
            validate={(contents: FormContents) => {
                if (!contents.name) {
                    return {
                        isValid: false,
                        reason: "No name",
                    };
                }
                if (!contents.surname) {
                    return {
                        isValid: false,
                        reason: "No surname",
                    };
                }
                if (!isNaN(parseInt(contents.age))) {
                    return {
                        isValid: false,
                        reason: "Age is not a number",
                    };
                }
                return {
                    isValid: true,
                    reason: "Valid form!",
                };
            }}
            correct={contents => alert(`${contents.name} is being worked on!`)}
            error={(_, result) => alert(`Validation failed because: ${result.reason}`)}
            submit={async contents => {
                await new Promise(resolve => setTimeout(resolve, 2000));
                alert('Form submitted!');
                if (contents.name === 'bad') {
                    throw Error('No bad names! :)');
                }
                return {
                    id: 502,
                    ...contents
                };
            }}
            apiError={e => alert(e)}
            complete={contents => alert(`Validation for ${contents.name} completed!`)}
            correctComponent={() => <div>Validated correctly!</div>}
            apiErrorComponent={() => <div>Bad name received!</div>}
            errorComponent={() => <div>Validation form failed!</div>}
            loadingComponent={() => <div>Loading...</div>}
            success={(contents: ApiResult) => alert(`Api call for ${contents.name}`)}
            formProps={{
                name: 'TestForm'
            }}
        >
            <input name="name" /><br />
            <textarea cols={20} rows={10} name="surname" /><br />
            <select name="age">
                <option value="18">18</option>
                <option value="18">19</option>
                <option value="18">20</option>
            </select><br />
            <button type="submit">
                Send!
            </button>
        </ValidatorForm>
    </div>
)

ReactDOM.render(
    <TestComponent />,
    document.getElementById('root'),
);