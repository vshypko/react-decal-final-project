import React from "react";

class PlaylistDisplay extends React.Component {

    render() {
        return (
            <div className="ui container selected-playlist">
                <p>Selected Playlist: {this.props.playlistName}</p>
                <img className="playlist-image" src={this.props.playlistImageLink} alt=""/>
                <div className="playlist-buttons">
                    <button className="reselect-playlist" onClick={() => this.props.reselect()}>Reselect Playlist</button>
                    {!this.props.isGameStarted && this.props.songsPlayed === 0 &&
                    <button className="start-game" onClick={() => this.props.nextSong()}>Start Game</button>
                    }
                    {this.props.isGameStarted &&
                    <p className="timer">Timer: {10 - this.props.roundTimer}</p>
                    }
                </div>
            </div>
        );
    }
}

export default PlaylistDisplay;