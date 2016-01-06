# mu-player

![alt tag](https://github.com/mink0/mu-player/blob/master/screenshot.png)
### Features

  Play ANY music ABSOLUTELY FREE(c) from vk.com and soundcloud.com using [Music Player Daemon](http://www.musicpd.org/).
  
  Top tracks search and similar artists search is made by Last.fm service.
  
  This player is powered by [blessed](https://github.com/chjj/blessed) and forked from [badtaste](https://github.com/ewnd9/badtaste) (go and see some cool stuff from ewnd9). 
  
  You could use any other MPD client with mu-player or use mu-player as standalone. For example you could use web interface or MPD Sound Menu for Ubuntu, or use `mpc` for playback fast control from console. See http://mpd.wikia.com/wiki/Clients for some greatness.

### Install
  * First, install [MPD](http://www.musicpd.org/). I recommend to use version higher than `0.18.7` for `add tags` functionality. Follow the http://mpd.wikia.com/wiki/Install for the instructions.
  * Start MPD daemon. Test if it is running by typing `telnet localhost 6600`. You should see `OK MPD` response.
  * You need [nodejs](https://nodejs.org/) and [npm](https://www.npmjs.com/) to install mu-player. Tested on nodejs versions 0.12 and 4.2.
  * Install mu-player:
  
Run `npm -g install git+https://github.com/mink0/mu-player.git` on MAC.

Or `sudo npm -g install git+https://github.com/mink0/mu-player.git` on Linux.
  
  * Now you could run `mu` and setup credentials for lastfm.com, soundcloud.com and vk.com. You need to register accounts first.
  * Run `mu` again and enjoy the free goodies.
  * Run `mu --setup` for editing your credentials.
  * Press `?` for in-app help.

Tested on OS X Yosemite and Ubuntu linux 14.04.

### Alternatives
- https://github.com/ewnd9/badtaste
- https://www.npmjs.com/package/vknplayer
- https://www.npmjs.com/package/djesbe
