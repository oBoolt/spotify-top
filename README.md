# spotify-top

spotify-top is a tool that creates a playlist and adds your most listened songs depending on the passed arguments

# Dependencies

- [Node JS](https://nodejs.org/en)
- [Spotify App](https://developer.spotify.com/dashboard/applications)

# Installation

first you will need to create a spotify app to get the client id and the secret, after that you have to configure a redirect uri, type `http://localhost:5000/redirect` in the `Redirects URIs` section and click the button `Add`

clone the repository then type the following commands

```
npm install
```

to install all the dependencies

```
npm run build
```

to build the project

before you run the tool you need to create a `.env` file in the root of the project and fill the data with your spotify app data, then you can proceed running the command

```
npm start <user_id> <playlist_id>
```

the first time you start the tool you will have to login with your spotify account (all the data will be stored in the `users.json` file), then run the same command again for the playlist update

# Usage

the basic way of using the tool is passing only the `user_id` and the `playlist_id`

```
npm start <user_id> <playlist_id>
```

you can also pass the `limit` and the `time_range`

```
npm start <user_id> <playlist_id> [limit] [time_range]
```

# Arguments

- `user_id`<sup><span style="color:#db4949;margin-left:5px">\*</span></sup>
  <br>It's the spotify user id that you want to get the top songs</br>
- `playlist_id`<sup><span style="color:#db4949;margin-left:5px">\*</span></sup>
  <br>It's the playlist that you want to add the songs</br>
- `limit`
  <br>It's a number between `1` and `50` that delimits the number of songs</br>
- `time_range`
  - `short_term`: gets the data from 1 month
  - `medium_term`: gets the data from 6 months
  - `long_term`: gets all the data available

# Example

```
npm start 128947nma 12vn1jib178 25 medium_term
```
