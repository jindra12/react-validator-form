import React from "react";
import ReactDOM from "react-dom";
import { WeatherGlobal, WeatherList, WeatherGraph, WeatherConditions } from 'react-weather-forecast';
import ExtendedTemperatureInfo from "./ExtendedTemperatureInfo";
import ExtendedWeatherInfo from "./ExtendedWeatherInfo";

interface MainComponentState {
    apiKey: string;
    setApiKey: string;
}

class MainComponent extends React.Component<{}, MainComponentState> {
    state: MainComponentState = {
        apiKey: '',
        setApiKey: '',
    }

    public render() {
        const { state } = this;
        const threeDaysLater = new Date();
        threeDaysLater.setDate(threeDaysLater.getDate() + 3);
        return (
            <div>
                <input type="text" onChange={e => this.setState({ apiKey: e.target.value })} value={state.apiKey} />
                <button className="button" onClick={() => this.setState(prevState => ({ setApiKey: prevState.apiKey }))}>Show Prague Weather</button>
                {state.setApiKey && (
                    // Set up global configuration for weather components
                    <WeatherGlobal
                        apiKey={state.setApiKey}
                        by="day"
                        from={new Date()}
                        to={threeDaysLater}
                        loadingHandler={() => <div>Loading...</div>}
                        errorHandler={() => <div>Error!</div>}
                        storage={localStorage}
                        dateHandler={date => <span>{date.toLocaleDateString() + " " + date.toLocaleTimeString()}</span>}
                        units="metric"
                        lang="cz"
                    >
                        {/* List how much it rains in Prague */}
                        {<WeatherList kind="names" names={["Prague"]} type="rain" />}
                        {/* List what kind of weather is in Prague */}
                        {<WeatherConditions kind="geo" lat={50.073658} lon={14.418540} list />}
                        {/* List only cloudy types of weather */}
                        {<WeatherConditions kind="geo" lat={50.073658} lon={14.418540} type="Clouds" />}
                        {/* List temperature in Prague */}
                        {<WeatherGraph kind="ids" ids={[3067696]} type="clouds" label="Temperature" />}
                        {/* List temperature with custom extended component */}
                        {<ExtendedTemperatureInfo label="Temp" />}
                        {/* List weather phenomena with custom extended component */}
                        {<ExtendedWeatherInfo label="Weather list" />}
                    </WeatherGlobal>
                )}
            </div>
        );
    }
}

ReactDOM.render(
    <div>
        <MainComponent />
    </div>,
    document.getElementById('root'),
)