# howlplayer #

A howler-based wrapper and functional album/playlist player for Spotify or Deezer albums, SoundCloud playlists or your local sounds.

## Usage ##
`npm i sntiagomoreno/howlplayer` or `yarn add sntiagomoreno/howlplayer`

### Deezer (Recommended) ###
**Note**: If you're trying to get preview sounds Deezer is a better option than Spotify as you will not need an access token.

```
import Player from 'howlplayer'

let player = new Player({
            src: {
                name: 'deezer',
                id: '86241112' // album ID
            },
            render: {
                ui: true // append UI to DOM
            }
        })
```

### Spotify ###
**Note**: Spotify's API doesn't offer a no-expiry access token. You will have to refresh it on your end.

```
import Player from 'howlplayer'

let player = new Player({
            src: {
                name: 'spotify',
                id: '0DRUOQBsax8QLUVctbEIAT', // album ID
                token: 'YOUR_ACCESS_TOKEN' // required for Spotify
            },
            render: {
                ui: false // set to false if you want a custom function to render your data
                renderMethod: myFunction
            }
        })
```

### SoundCloud ###
**Note**: In order to access SoundCloud's API you will need an access token. Sadly, they've stopped letting users create new applications so there's no way to get a new API key. This is only useful if you've previously been granted one.

```
import Player from 'howlplayer'

let player = new Player({
            src: {
                name: 'soundcloud',
                id: '405726', // album ID
                token: 'YOUR_ACCESS_TOKEN' // required for SoundCloud
            },
            render: {
                ui: true
            }
        })
```

### Local ###
**Note**: Please check the repo source code to see how your json file should be structured. You can add as many properties you want within `tracks` and `info` properties.

```
import Player from 'howlplayer'

let player = new Player({
            src: {
                name: 'local',
                data: 'tracks.json'
            },
            render: {
                ui: true
            }
        })
```

### Custom renderer ###
You can use your own method to render the data received.
```
import Player from 'howlplayer'

let player = new Player({
            src: {
                name: 'deezer',
                id: '86241112'
            },
            render: {
                ui: false,
                renderMethod: myFunction
            }
        })

// Your function must have one parameter to which the data gets passed

function myFunction(arg){
    var data = arg
    console.log(data)
}
```

## Options ##

| option              | description | default   |
|---------------------|-------------|-----------|
| `el`                  | Selector to append the player            | `body`      |
| `src.name `           | Source name `local` `deezer` `spotify` or `soundcloud`           | `local`     |
| `src.token `          | Access token or API key (required for Spotify and SoundCloud)            | `null`      |
| `src.id `             | ID of the album to get           |           |
| `src.data `           | JSON File for loading local sounds (required when `src.name` is `local`)            |           |
| `render.ui `          | Render basic player UI elements            | `false`     |
| `render.renderMethod` | Function name to render content. `render.ui` must be `false`            | `'default'` |
| `showArtist`          | Show artist/author name next to the song's name            | `false`     |

## Dependencies ##
* Howler
* Axios

### TODO ###
- Options for album, track or playlist in Spotify and Deezer.
- Improve code structure.
- Use fetch over axios.
- Add demo.
- Add development to docs.
