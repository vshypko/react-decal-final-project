import React from "react";
import ReactDOM from "react-dom";

import Spotify from "spotify-web-api-js";

import "./style.css";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      authenticated: false,

      search: "",

      devices: [],
      currentDevice: "",

      playlist: null,
      playlistId: "",
      playlistName: "",
      playlistImageLink: "",
      allPlaylistSongs: [],
      selectedSongs: [],
      numRounds: 10, // number of rounds per game

      isGameStarted: false,
      songsPlayed: 0,
      score: 0,
      roundTimer: 0,
      currentAnswerOptions: []
    };

    this.onSubmit = this.onSubmit.bind(this);
    this.reselectPlaylist = this.reselectPlaylist.bind(this);
    this.checkAnswer = this.checkAnswer.bind(this);
    this.nextSong = this.nextSong.bind(this);
    this.generateAnswerOptions = this.generateAnswerOptions.bind(this);
  }

  async componentDidMount() {
    if (window.location.hash) {
      const queryString = window.location.hash.substring(1);
      const accessToken = new URLSearchParams(queryString).get("access_token");
      this.spotifyClient = new Spotify();
      this.spotifyClient.setAccessToken(accessToken);

      const {devices} = await this.spotifyClient.getMyDevices();
      this.setState({
        authenticated: true,
        devices,
        currentDevice: devices[0].id
      });
    }
  }

  async startPlayback(songId) {
    await this.spotifyClient.play({
      device_id: this.state.currentDevice,
      uris: [`spotify:track:${songId}`]
    });
  }

  async pausePlayback(songId) {
    await this.spotifyClient.pause({
      device_id: this.state.currentDevice,
      uris: [`spotify:track:${songId}`]
    });
  }

  async onSubmit(ev) {
    ev.preventDefault();
    const searchResponse = await this.spotifyClient.searchPlaylists(this.state.search, {
      market: "us"
    });

    this.setState({
      playlist: searchResponse.playlists.items[0],
      playlistId: searchResponse.playlists.items[0].id,
      playlistName: searchResponse.playlists.items[0].name,
      playlistImageLink: searchResponse.playlists.items[0].images[0].url,
      playlistTracksLink: searchResponse.playlists.items[0].tracks.href
    });

    const playlistResponse = await this.spotifyClient.getPlaylistTracks(this.state.playlistId, {
      market: "us"
    });

    if (playlistResponse.total < 30) {
      this.reselectPlaylist();
      alert("Not enough tracks to play (<30). Please select other playlist.");
    }

    let songs = this.selectRandomSongs(playlistResponse.items, this.state.numRounds);

    this.setState({
      allPlaylistSongs: playlistResponse.items,
      selectedSongs: songs
    });
  }

  reselectPlaylist() {
    this.setState({
      playlist: null,
      playlistId: "",
      playlistName: "",
      playlistImageLink: "",
      playlistTracksLink: "",

      isGameStarted: false,
      songsPlayed: 0,
      score: 0,
      roundTimer: 0
    });
  }

  nextSong() {
    if (this.state.songsPlayed >= this.state.numRounds) {
      this.endGame();
      return;
    }
    this.setState({
      isGameStarted: true,
    });

    this.setState({isGameStarted: true}, () => {
      this.generateAnswerOptions();
    });

    this.startPlayback(this.state.selectedSongs[this.state.songsPlayed].id);

    this.interval = setInterval(() => {
      if (this.state.roundTimer > 9) {
        this.setState({
          roundTimer: 0
        });
        this.pausePlayback(this.state.selectedSongs[this.state.songsPlayed].id);
        clearInterval(this.interval);
      } else {
        this.setState({
          roundTimer: this.state.roundTimer + 1
        });
      }
    }, 1000);
  }

  generateAnswerOptions() {
    let shuffle = require('shuffle-array');

    let correctAnswer = this.state.selectedSongs[this.state.songsPlayed];
    let shuffledArray = this.selectRandomSongs(this.state.allPlaylistSongs, 3);

    while (shuffledArray.includes(correctAnswer)) {
      shuffledArray = this.selectRandomSongs(this.state.allPlaylistSongs, 3);
    }

    shuffledArray.push(correctAnswer);
    shuffle(shuffledArray);

    this.setState({
      currentAnswerOptions: shuffledArray
    });
  }

  endGame() {
    this.pausePlayback();
    this.setState({
      isGameStarted: false
    });
  }

  selectRandomSongs(array, num) {
    let songs = [];
    for (let i = 0; i < num; i++) {
      let item = array[Math.floor(Math.random() * array.length)].track;
      if (!songs.includes(item) && item.is_playable) {
        songs.push(item);
      } else {
        i--;
      }
    }

    return songs;
  }

  checkAnswer(song) {
    let isCorrect = false;
    clearInterval(this.interval);
    if (song.id === this.state.selectedSongs[this.state.songsPlayed].id) {
      isCorrect = true;
    }
    if (isCorrect) {
      this.setState({
          score: this.state.score + 1,
          songsPlayed: this.state.songsPlayed + 1,
          roundTimer: 0
        },
        () => {
          this.nextSong();
        });
    } else {
      this.setState({
          songsPlayed: this.state.songsPlayed + 1,
          roundTimer: 0
        },
        () => {
          this.nextSong();
        });
    }
  }

  render() {
    const spotify_logo = require('./img/Spotify_Logo_RGB_Green.png')

    if (!this.state.authenticated) {
      return (
        <div className="ui container centered login-page">
          <div className="logo-wrapper">
            <img className="spotify-logo" src={spotify_logo} alt=""/>
          </div>
          <a className="login-link"
             href={`https://accounts.spotify.com/authorize/?client_id=ac9ec319b658424d8aa1e41317e7c70f&response_type=token&redirect_uri=${window
               .location.origin + window.location.pathname}&scope=streaming user-read-playback-state user-modify-playback-state user-top-read user-read-private`}>
            Login to Spotify
          </a>
        </div>
      );
    }
    return (
      <div className="ui container">

        <div className="logo-wrapper">
          <img className="spotify-logo" src={spotify_logo} alt=""/>
        </div>

        {this.state.playlistName === "" &&
        <div className="ui container search-form">
          <form className="ui form" onSubmit={this.onSubmit}>
            <input
              className="search-input"
              type="text"
              onChange={e => this.setState({search: e.target.value})}
            />
            <input className="search-button" type="submit" value="Search Playlist"/>
          </form>
          <select
            className="ui dropdown"
            onChange={e => this.setState({currentDevice: e.target.value})}
          >
            {this.state.devices.map(device => (
              <option key={device.id} value={device.id}>{device.name}</option>
            ))}
          </select>
        </div>
        }

        {/*Separate component for playlist display with props (image link and name)?*/}
        {this.state.playlistName !== "" &&
        <div className="ui container selected-playlist">
          <p>Selected Playlist: {this.state.playlistName}</p>
          <img className="playlist-image" src={this.state.playlistImageLink} alt=""/>
          <div className="playlist-buttons">
            <button className="reselect-playlist" onClick={this.reselectPlaylist}>Reselect Playlist</button>
            {!this.state.isGameStarted && this.state.songsPlayed === 0 &&
            <button className="start-game" onClick={this.nextSong}>Start Game</button>
            }
            {this.state.isGameStarted &&
            <p className="timer">Timer: {10 - this.state.roundTimer}</p>
            }
          </div>
        </div>
        }

        {this.state.playlistName !== "" && this.state.isGameStarted &&
        <div className="ui container answer-options">
          <p className="guess-header">Guess the song!</p>

          {this.state.currentAnswerOptions.map(song => (
            <div className="ui answer-item" key={song.id} onClick={() => this.checkAnswer(song)}>
              <div className="ui container">
                {
                  song.album.images[0] !== undefined &&
                  <img className="song-image" src={song.album.images[0].url} alt=""/>
                }
              </div>
              <div className="content song-info">
                <p className="song-artists">
                  {song.artists.map(artist => artist.name).join(", ")}
                </p>
                <p className="song-name">
                  {song.name}
                </p>
              </div>
            </div>
          ))}

          <p className="round-score">Round: {this.state.songsPlayed + 1} | Score: {this.state.score}</p>
        </div>
        }

        {!this.state.isGameStarted && this.state.songsPlayed > 0 &&
        <div className="ui container game-stats">
          <p className="game-over-header">The game is over!</p>
          <p className="game-over-score">Your final score is: {this.state.score} out of {this.state.songsPlayed}.</p>
        </div>
        }

      </div>
    );
  }
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App/>, rootElement);

export default App;
