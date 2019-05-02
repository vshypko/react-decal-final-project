import React from "react";
import ReactDOM from "react-dom";
import PlaylistDisplay from "./PlaylistDisplay.js"
import PlaylistSearch from "./PlaylistSearch.js"
import SongDisplay from "./SongDisplay.js"
import GameStats from "./GameStats.js"

import Spotify from "spotify-web-api-js";
import {ToastsContainer, ToastsStore, ToastsContainerPosition} from 'react-toasts';

import "./style.css";

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            authenticated: false,
            loggedIn: false,
            token: "",

            search: "",

            devices: [],
            currentDevice: "",

            playlist: null,
            playlists: [],
            playlistId: "",
            playlistName: "",
            playlistImageLink: "",
            allPlaylistSongs: [],
            selectedSongs: [],
            numRounds: 10, // number of rounds per game

            isGameStarted: false,
            songsPlayed: 0,
            score: 0,
            roundTimer: 10,
            currentAnswerOptions: []
        };

        this.onSubmit = this.onSubmit.bind(this);
        this.reselectPlaylist = this.reselectPlaylist.bind(this);
        this.checkAnswer = this.checkAnswer.bind(this);
        this.nextSong = this.nextSong.bind(this);
        this.generateAnswerOptions = this.generateAnswerOptions.bind(this);
        this.selectPlaylist = this.selectPlaylist.bind(this);
    }

    async componentDidMount() {
        if (window.location.hash) {
            const queryString = window.location.hash.substring(1);
            const accessToken = new URLSearchParams(queryString).get("access_token");
            this.spotifyClient = new Spotify();
            this.spotifyClient.setAccessToken(accessToken);

            // let user = await this.spotifyClient.getMe();
            const {devices} = await this.spotifyClient.getMyDevices();
            const playlists = await this.spotifyClient.getUserPlaylists();
            this.setState({
                authenticated: true,
                token: accessToken,
                loggedIn: true,
                devices: devices,
                playlists: playlists.items,
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

    //seeks to position in song
    async seek(position) {
        await this.spotifyClient.seek(position);
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

        let playlistResponse = await this.spotifyClient.getPlaylistTracks(this.state.playlistId, {
            market: "us"
        });

        if (playlistResponse.total < 30) {
            this.reselectPlaylist();
            alert("Not enough tracks to play (less than 30 songs). Please select other playlist.");
        }

        let songs = this.selectRandomSongs(playlistResponse.items, this.state.numRounds);

        this.setState({
            allPlaylistSongs: playlistResponse.items,
            selectedSongs: songs
        });
    }

    async selectPlaylist() {
        let id = document.getElementById('playlists').value;
        const playlist = await this.spotifyClient.getPlaylist(id);

        this.setState({
            playlist: playlist,
            playlistId: playlist.id,
            playlistName: playlist.name,
            playlistImageLink: playlist.images[0].url,
            playlistTracksLink: playlist.tracks.href
        });

        let playlistResponse = await this.spotifyClient.getPlaylistTracks(this.state.playlistId, {
            market: "us"
        });

        if (this.state.playlist.total < 30) {
            alert("Not enough tracks to play (less than 30 songs). Please select other playlist.");
        }

        let songs = this.selectRandomSongs(playlistResponse.items, this.state.numRounds);

        this.setState({
            allPlaylistSongs: playlistResponse.items,
            selectedSongs: songs
        });
    }

    reselectPlaylist() {
        if (this.state.songsPlayed < this.state.selectedSongs.length)
            this.pausePlayback(this.state.selectedSongs[this.state.songsPlayed].id); //added to stop song playing
        this.setState({
            playlist: null,
            playlistId: "",
            playlistName: "",
            playlistImageLink: "",
            playlistTracksLink: "",

            isGameStarted: false,
            songsPlayed: 0,
            score: 0,
            roundTimer: 10
        });
    }

    async nextSong() {
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

        let position = await this.selectRandomPosition(this.state.selectedSongs[this.state.songsPlayed].id);
        this.startPlayback(this.state.selectedSongs[this.state.songsPlayed].id);
        this.seek(position);

        this.interval = setInterval(() => {
            if (this.state.roundTimer <= 0) {
                this.setState({
                    roundTimer: 10
                });
                this.pausePlayback(this.state.selectedSongs[this.state.songsPlayed].id);
                clearInterval(this.interval);
            } else {
                this.setState({
                    roundTimer: this.state.roundTimer - 1
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

    //added so they can guess from 10 sec anywhere within the song
    async selectRandomPosition(songId) {
        let features = await this.spotifyClient.getAudioFeaturesForTrack(songId);
        let duration = features.duration_ms;

        return Math.floor(Math.random() * (duration - this.state.roundTimer * 100)); //finds random position in seconds to play 10 seconds;
    }

    checkAnswer(song) {
        let isCorrect = false;
        clearInterval(this.interval);
        if (song.id === this.state.selectedSongs[this.state.songsPlayed].id) {
            isCorrect = true;
        }
        if (isCorrect) {
            ToastsStore.success("Correct!");
            this.setState({
                    score: this.state.score + 1,
                    songsPlayed: this.state.songsPlayed + 1,
                    roundTimer: 10
                },
                () => {
                    this.nextSong();
                });
        } else {
            ToastsStore.error("Incorrect!");
            this.setState({
                    songsPlayed: this.state.songsPlayed + 1,
                    roundTimer: 10
                },
                () => {
                    this.nextSong();
                });
        }
    }

    logout() {
        const queryString = window.location.hash.substring(1);
        var del = new URLSearchParams(queryString).set("access_token", "");
        this.setState({
            authenticated: false,
            loggedIn: false,
            token: "",
            devices: [],
            currentDevice: ""
        });
        const url = 'https://accounts.spotify.com/en/logout/';
        const spotifyLogoutWindow = window.open(url, 'Spotify Logout', 'width=700,height=500,top=40,left=40');
        setTimeout(() => spotifyLogoutWindow.close(), 2000);
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
                           .location.origin + window.location.pathname}&scope=streaming user-read-playback-state user-modify-playback-state user-top-read
               playlist-read-private playlist-read-collaborative user-read-private`}>
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

                <div className="logout-wrapper">
                    {this.state.authenticated === true &&
                    <button className="logout" onClick={() => this.logout()}>Logout</button>
                    }
                </div>

                {this.state.playlistName === "" &&
                <PlaylistSearch submit={(e) => this.onSubmit(e)}
                                changeSearch={(e) => this.setState({search: e.target.value})}
                                changeDevice={(e) => this.setState({currentDevice: e.target.value})}
                                changePlaylist={(e) => this.setState({playlist: e.target.value})}
                                selectPlaylist={this.selectPlaylist}
                                devices={this.state.devices}
                                playlists={this.state.playlists}/>
                }

                {this.state.playlistName !== "" &&
                <PlaylistDisplay playlistName={this.state.playlistName}
                                 playlistImageLink={this.state.playlistImageLink}
                                 reselect={() => this.reselectPlaylist()}
                                 isGameStarted={this.state.isGameStarted}
                                 songsPlayed={this.state.songsPlayed}
                                 nextSong={() => this.nextSong()}
                                 roundTimer={this.state.roundTimer}/>
                }

                {this.state.playlistName !== "" && this.state.isGameStarted &&
                <div className="ui container answer-options">
                    <p className="guess-header">Guess the song! We'll play you 10 seconds of audio indicated by the
                        timer.</p>

                    <ToastsContainer store={ToastsStore} position={ToastsContainerPosition.BOTTOM_CENTER}/>

                    {this.state.currentAnswerOptions.map(song => (
                        <SongDisplay song={song} checkAnswer={(song) => this.checkAnswer(song)}/>))}

                    <p className="round-score">Round: {this.state.songsPlayed + 1} | Score: {this.state.score}</p>
                </div>
                }

                {!this.state.isGameStarted && this.state.songsPlayed > 0 &&
                <GameStats score={this.state.score} songsPlayed={this.state.songsPlayed}/>
                }

            </div>
        );
    }
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App/>, rootElement);

export default App;
