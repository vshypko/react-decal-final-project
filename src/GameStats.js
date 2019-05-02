import React from "react";

class GameStats extends React.Component {

    render() {
        return (
            <div className="ui container game-stats">
                <p className="game-over-header">The game is over!</p>
                <p className="game-over-score">Your final score is: {this.props.score} out
                    of {this.props.songsPlayed}.</p>
            </div>
        );
    }
}

export default GameStats;
