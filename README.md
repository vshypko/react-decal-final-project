# React Decal Project

**Team Members:** Vasudev Venkatesh, Marielle Isla, Vitali Shypko

**Demo Link (optional)**: [guess-the-song](https://guess-the-song.netlify.com) 

**Prompt:** Spotify Client

## Abstract

We created a game where a user attempts to guess a song that is currently playing. For that, we authorize and login user.
Once he/she is logged in, they search for a playlist or pick one of their playlists. Once the user clicks “Start Game”,
we play a random song from the playlist for 10 seconds (10 is a parameter that can be changed). Once 10 seconds pass,
we display 4 song names to the user (1 of them is the song that was just playing and the other 3 are randomly selected
from the same playlist). If the user selects the correct option, they earned 1 point. The game continues for 10 number
of songs (this parameter can also be changed).

We use `spotify-web-api-js` to login users and get their playlists, `react-toasts` to give user feedback regarding their
selected answer option, `shuffle-array` to shuffle songs in a playlist and generate random answer options for each round.
We also use `yarn` since deploying to Netlify did not work with plain npm (because of a fsevents).

## Components:

What purpose does each of the components in your app serve?
Playlist Search - searches for a playlist to select songs from
Playlist Display - displays the current playlist being used for the game, allows for reselection of playlist
Song Display - displays song options to guess the currently playing song
Game Stats - displays the current round and score
Toast Container - displays visual feed back for incorrect/correct guesses

## Features:

What features does your app accomplish?

## Division of Labor:

- Vasudev Venkatesh — 
- Marielle Isla — logout functionality, toasts for visual feedback, selecting user playlists, playing random 10 seconds of the song
- Vitali Shypko — main logic of the app and styling.
