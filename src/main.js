/* howler-player v1.0.0 | (c) 2019 Santiago Moreno */
import { Howl } from 'howler'
import axios from 'axios'
import jsonpAdapter from 'axios-jsonp';

class Player {
    constructor(opt = {}) {
        this.options = {
            el: opt.el || 'body',
            src: {
                name: opt.src.name || 'local',
                token: opt.src.token || null,
                id: opt.src.id,
                data: opt.src.data,
            },
            render: {
                ui: opt.render.ui,
                renderMethod: opt.render.renderMethod || 'default',
                showArtist: opt.render.showArtist || false,
            }
        }

        this.tracks = []
        this.info = {}
        this.index = 0
        this.url = null
        this.el = document.querySelector(this.options.el)
        this.playing = false
        this.data = null
        this.init()
    }

    init() {
        switch (this.options.src.name) {
            case 'spotify':
                this.runSpotify();
                break;
            case 'soundcloud': this.runSoundcloud(); break;
            case 'local': this.runLocal(); break;
            case 'deezer': this.runDeezer(); break;
            default: console.error('No valid source defined')
        }
    }

    runSpotify() {
        this.url = `https://api.spotify.com/v1/albums/${this.options.src.id}`
        const headers = { 'Authorization': 'Bearer ' + this.options.src.token }
        axios.get(this.url, {headers})
            .then(res=>{
                let data = res.data
                data.tracks.items.forEach((item, i)=>{
                    this.tracks[i] = {
                        name: item.name,
                        artist: [],
                        duration: 30, //item.duration_ms,
                        src: item.preview_url,
                        link: item.external_urls.spotify,
                        id: item.id,
                        uri: item.uri,
                    }
                    item.artists.forEach((artist) => {
                        this.tracks[i].artist.push(artist.name)
                    })
                })
                this.info = {
                    name: data.name,
                    cover: data.images[0].url,
                    label: data.label,
                    link: data.external_urls.spotify,
                    uri: data.uri,
                    id: data.id
                }
            })
            .then(()=>{
                this.data = { info: this.info, tracks: this.tracks }
                if (this.options.render.ui && this.options.render.renderMethod == 'default') this.render()
                else if (this.options.render.renderMethod != null && !this.options.render.ui) this.options.render.renderMethod(this.data)
            })
            .catch(error=>{
                console.error(error)
            })
    }

    runDeezer() {
        this.url = `https://api.deezer.com/album/${this.options.src.id}?output=jsonp`
        axios.get(this.url, {adapter: jsonpAdapter})
            .then(res => {
                let data = res.data
                data.tracks.data.forEach((item, i) => {
                    this.tracks[i] = {
                        name: item.title,
                        artist: [item.artist.name],
                        duration: 31, //item.duration_ms,
                        src: item.preview,
                        link: item.link,
                        id: item.id,
                    }
                })
                this.info = {
                    name: data.title,
                    cover: data.cover_big,
                    label: data.label,
                    link: data.link,
                    id: data.id
                }
            })
            .then(() => {
                this.data = {
                    info: this.info,
                    tracks: this.tracks
                }
                if (this.options.render.ui && this.options.render.renderMethod == 'default') this.render()
                else if (this.options.render.renderMethod != null && !this.options.render.ui) this.options.render.renderMethod(this.data)
            })
            .catch(error => {
                console.error(error)
            })
    }

    runSoundcloud() {
        this.url = `http://api.soundcloud.com/playlists/${this.options.src.id}?client_id=${this.options.src.token}`
        axios.get(this.url)
            .then(res=>{
                let data = res.data
                data.tracks.forEach((item, i) => {
                    this.tracks[i] = {
                        name: item.title,
                        artist: [item.user.username],
                        duration: item.duration / 1000,
                        src: item.stream_url + '?client_id=' + this.options.src.token,
                        link: item.permalink_url,
                        id: item.id,
                        uri: item.uri
                    }
                })
                this.info = {
                    name: data.title,
                    cover: data.artwork_url,
                    label: data.label_name,
                    link: data.permalink_url,
                    id: data.id
                }
            })
            .then(() => {
                this.data = {
                    info: this.info,
                    tracks: this.tracks
                }
                if (this.options.render.ui && this.options.render.renderMethod == 'default') this.render()
                else if (this.options.render.renderMethod != null && !this.options.render.ui) this.options.render.renderMethod(this.data)
            })
            .catch(error => {
                console.error(error)
            })
    }

    runLocal() {
        this.url = this.options.src.data
        let trackCount = 0
        axios.get(this.url)
            .then(res=>{
                let data = res.data
                data.tracks.forEach((item, i) => {
                    let audio = new Audio(item.src)
                    audio.addEventListener('loadedmetadata', () => {
                        this.tracks[i] = {
                            name: item.name,
                            artist: [item.artist],
                            duration: audio.duration,
                            src: item.src,
                        }
                        trackCount++
                        if (trackCount === data.tracks.length) {
                            this.data = {
                                info: this.info,
                                tracks: this.tracks
                            }

                            if (this.options.render.ui && this.options.render.renderMethod == 'default') this.render()
                            else if (this.options.render.renderMethod != null && !this.options.render.ui) this.options.render.renderMethod(this.data)
                        }
                    })
                    for(var k in data.info) this.info[k] = data.info[k]
                })
            })
            .catch(error => {
                console.error(error)
            })
            
    }

    render(){
        this.playlist = document.createElement('section')
        this.controls = document.createElement('div')

        let playlist = this.playlist
        let controls = this.controls

        controls.classList.add('player-controls')
        playlist.classList.add('playlist')
        playlist.innerHTML = `
            <header class="playlist-header">
                <h3 class="title">${this.info.name}<h3>
                <img class="cover-image" src=${this.info.cover}>
            </header>
			<ul>
			${this.tracks.map((item)=>
				`
				<li class="playlist-track" data-title="${item.name}" data-artist="${item.artist}" data-duration="${this.time(Math.round(item.duration))}">
                    <span>${item.name}</span>
					${this.options.render.showArtist ? `<span>${item.artist.join(', ')}</span>` : ''}
				</li>
				`
			).join('')}
			</ul>
    	`

        let track_items = playlist.querySelectorAll('.playlist-track')
        Array.prototype.forEach.call(track_items, (item, i) => {
            item.addEventListener('click', () => {
                if (!this.playing) {
                    this.skipTo(i)
                    this.play_btn.innerHTML = 'Pause'
                    this.playing = true
                } else {
                    this.skipTo(i)
                }
            })
        })

        controls.innerHTML = `
			<nav>
				<ul class="player-playback">
					<li><button class="player-prev-btn">Prev</button></li>
					<li><button class="player-play-btn">Play</button></li>
					<li><button class="player-next-btn">Next</button></li>
				</ul>
				<ul class="player-current">
					<li class="player-current-title"></li>
					<li class="player-current-progress">
						<span class="player-current-time">0:00</span>
						<span data-progress="0" class="player-progress-bar"></span>
						<span class="player-current-duration">0:00</span>
					</li>
				</ul>
			</nav>
    	`

        this.current_title = controls.querySelector('.player-current-title')
        this.current_duration = controls.querySelector('.player-current-duration')
        this.progress = controls.querySelector('.player-progress-bar')
        this.current_time = controls.querySelector('.player-current-time')

        if (this.options.render.ui) this.el.appendChild(controls)
        this.el.appendChild(playlist)

        this.update()
        this.addEvents(this.controls)
    }

    update() {
        let track = this.tracks[this.index]
        this.current_title.innerHTML = track.name
        this.current_duration.innerHTML = this.time(Math.round(track.duration))
    }

    addEvents(controls) {
        this.play_btn = controls.querySelector('.player-play-btn')
        this.prev_btn = controls.querySelector('.player-prev-btn')
        this.next_btn = controls.querySelector('.player-next-btn')

        this.play_btn.addEventListener('click', () => {
            if (!this.playing) {
                this.play()
                this.play_btn.innerHTML = 'Pause'
                this.playing = true
            } else {
                this.pause()
                this.play_btn.innerHTML = 'Play'
                this.playing = false
            }
        })

        this.prev_btn.addEventListener('click', () => {
            if (!this.playing) {
                this.skip('prev')
                this.play_btn.innerHTML = 'Pause'
                this.playing = true
            } else {
                this.skip('prev')
            }
        })

        this.next_btn.addEventListener('click', () => {
            if (!this.playing) {
                this.skip('next')
                this.play_btn.innerHTML = 'Pause'
                this.playing = true
            } else {
                this.skip('next')
            }
        })
    }

    time(secs) {
        var minutes = Math.floor(secs / 60) || 0;
        var seconds = (secs - minutes * 60) || 0;
        return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
    }

    play(index) {
        let sound
        index = typeof index === 'number' ? index : this.index;
        let data = this.tracks[index];

        if (data.howl) {
            sound = data.howl
        } else {
            sound = data.howl = new Howl({
                src: data.src,
                html5: true,
                onplay: () => {
                    requestAnimationFrame(this.step.bind(this))
                },
                onend: () => {
                    this.skip('next')
                }
            })
        }

        sound.play()
        this.index = index
    }

    pause() {
        // Get the Howl we want to manipulate.
        var sound = this.tracks[this.index].howl;
        // Puase the sound.
        sound.pause();
    }

    skip(direction) {
        // Get the next track based on the direction of the track.
        var index = 0;
        if (direction === 'prev') {
            index = this.index - 1;
            if (index < 0) {
                index = this.tracks.length - 1;
            }
        } else {
            index = this.index + 1;
            if (index >= this.tracks.length) {
                index = 0;
            }
        }

        this.skipTo(index);
    }

    skipTo(index) {
        // Stop the current track.
        if (this.tracks[this.index].howl) {
            this.tracks[this.index].howl.stop();
        }
        this.play(index);
        this.update()
    }

    step() {
        let sound = this.tracks[this.index].howl;
        // Determine our current seek position.
        let seek = sound.seek() || 0;
        this.current_time.innerHTML = this.time(Math.round(seek));
        this.progress.setAttribute('data-progress', (((seek / sound.duration()) * 100) || 0));
        // If the sound is still playing, continue stepping.
        if (sound.playing()) {
            requestAnimationFrame(this.step.bind(this));
        }
    }
}

export default Player
