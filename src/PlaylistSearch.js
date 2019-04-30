import React from "react";

class PlaylistSearch extends React.Component{

    render() {
        return (
            <div className="ui container search-form">
                <form className="ui form" onSubmit={(e) => this.props.submit(e)}>
                    <input
                        className="search-input"
                        type="text"
                        onChange={(e) => this.props.changeSearch(e)}
                    />
                    <input className="search-button" type="submit" value="Search Playlist"/>
                </form>
                <select
                    className="ui dropdown"
                    onChange={(e) => this.props.changeDevice(e)}
                >
                    {this.props.devices.map(device => (
                        <option key={device.id} value={device.id}>{device.name}</option>
                    ))}
                </select>
            </div>
        );
    }
}

export default PlaylistSearch;