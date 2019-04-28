import React from "react";
import ReactDOM from "react-dom";

import Spotify from "spotify-web-api-js";

import "./style.css";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      authenticated: false,
      devices: [],
      playLists: [],
      allPlaylistSongs: [],
      selectedSongs: [],
      search: "",
      currentDevice: "",
      totalNumTracks: 0,
      link: ""
    };
    this.onSubmit = this.onSubmit.bind(this);
  }

  async componentDidMount() {
    if (window.location.hash) {
      // Remove the "#"
      const queryString = window.location.hash.substring(1);
      // Parse the access_token out
      const accessToken = new URLSearchParams(queryString).get("access_token");
      this.spotifyClient = new Spotify();
      this.spotifyClient.setAccessToken(accessToken);

      const {devices} = await this.spotifyClient.getMyDevices();
      // const devices = Object.keys(devicesResp).map(key => devicesResp[key]);
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

  async onSubmit(ev) {
    ev.preventDefault();
    const {
      tracks: {items: songs}
    } = await this.spotifyClient.searchTracks(this.state.search, {
      market: "us"
    });
    this.setState({songs});
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
            <strong>Login to Spotify</strong>
          </a>
        </div>
      );
    }
    return (
      <div className="ui container">
        <div className="ui container search-form">
          <div className="logo-wrapper">
            <img className="spotify-logo" src={spotify_logo} alt=""/>
          </div>
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
              <option value={device.id}>{device.name}</option>
            ))}
          </select>
        </div>
        <div className="ui container six column grid">
          {this.state.allPlaylistSongs.map(song => (
            <div
              className="ui one column card"
              key={song.id}
              onClick={e => this.startPlayback(song.id)}
            >
              <div className="image">
                <img src={song.album.images[0].url} alt=""/>
              </div>
              <div className="content">
                <p className="header">{song.name}</p>
                <div className="meta">
                  <span className="date">
                    {song.artists.map(artist => artist.name).join(", ")}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App/>, rootElement);

export default App;
