import React from "react";

class SongDisplay extends React.Component {
    render() {
        return (
            <div className="ui answer-item" key={this.props.song.id} onClick={() => this.checkAnswer(this.props.song)}>
                <div className="ui container">
                    {
                        this.props.song.album.images[0] !== undefined &&
                        <img className="song-image" src={this.props.song.album.images[0].url} alt=""/>
                    }
                </div>
                <div className="content song-info">
                    <p className="song-artists">
                        {this.props.song.artists.map(artist => artist.name).join(", ")}
                    </p>
                    <p className="song-name">
                        {this.props.song.name}
                    </p>
                </div>
            </div>
        );
    }
}

export default SongDisplay;