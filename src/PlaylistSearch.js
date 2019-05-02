import React from "react";

class PlaylistSearch extends React.Component {

    render() {
        return (
            <div className="ui container search-form">
                <p className="select-header">Type in the name of a playlist or select from your own to begin playing!
                    The playlist must have at least 30 songs.</p>
                <form className="ui form" onSubmit={(e) => this.props.submit(e)}>
                    <input
                        className="search-input"
                        type="text"
                        onChange={(e) => this.props.changeSearch(e)}
                    />
                    <input className="search-button" type="submit" value="Search for Playlist"/>
                </form>
                <div className="ui container search-form">
                    <select
                        className="ui dropdown select-playlist"
                        onChange={(e) => this.props.changePlaylist(e)}
                        id="playlists"
                    >
                        {this.props.playlists.map(playlist => (
                            <option key={playlist.id} value={playlist.id}>
                                {playlist.name}
                            </option>
                        ))}
                    </select>
                    <button className="user-playlist" onClick={() => this.props.selectPlaylist()}>Select Playlist
                    </button>
                </div>
                <select
                    className="ui dropdown devices"
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
