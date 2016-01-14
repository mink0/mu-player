# mu-player

![mu-player](https://raw.githubusercontent.com/mink0/mu-player/master/screenshot.png)

### Top Features

  - Play ANY music for free from [vk.com](http://vk.com/) and [soundcloud.com](http://soundcloud.com/) using [Music Player Daemon](http://www.musicpd.org/).
  - Explore new music by [last.fm](http://lastfm.com/) top tracks and similar artists search.
  - Low system requirements. It will pump smooth even on your grandpa's notebook.
  - Mu-player will definitely save your laptop battery. CPU load of in-browser playback comparing to MPD is HUGE.

You could use mu-player standalone or with any other full-featured MPD clients. See http://mpd.wikia.com/wiki/Clients for some greatness. For Ubuntu and Linux Mint [mpDris2](https://github.com/eonpatapon/mpDris2) is recommended. It will add native popups, multimedia keys support and playback control in a system tray.

This player is powered by amazing [blessed](https://github.com/chjj/blessed) lib and forked from tasty [badtaste](https://github.com/ewnd9/badtaste) player.

### Changelog
    - Total layout rewrite for proper support all terminals resolutions.
    - Support for changing MPD connection parameters from config file
    - Track metadata show
    - Progressive track seek
    - Fix long labels on track info
    - Fix no track progress on linux sometimes
    - Fix track-info playlist overlaping
  
  * v0.2.0
    - Better track seek
    - Log scrolling via keyboard/mouse
  
  * v0.1.3
    - Bug fix

  * v0.1.2
    - Add playlist counter
    - MPD connection error message

  * v0.1.1
    - Bug fixes

  * v0.1.0
    - Initial release

### Install
  * First install [MPD](http://www.musicpd.org/). I recommend to use versions `0.19` and higher for `addtagid` functionality. Follow the http://mpd.wikia.com/wiki/Install for the instructions.
  * Start MPD daemon if it is not started on system boot. You could test if it is running by typing `telnet localhost 6600`. You should see `OK MPD` response.
  * You need [nodejs](https://nodejs.org/) and [npm](https://www.npmjs.com/) to install mu-player.
  * Install mu-player:
    - MAC OS X: `npm -g install mu-player`.
    - Ubuntu (Debian) Linux: `sudo npm -g install mu-player`.
  * Now you could run `mu` and setup credentials for lastfm.com, soundcloud.com and vk.com. We have tons of free music there but you need to register accounts first.
  * Run `mu` again and enjoy the music.

Tested on OS X Yosemite and Ubuntu linux 14.04.

### Setup
  * Run `mu --setup` to edit your credentials.

### Config
  * Config file is located in `~/.murc`.

### Log
  * Log is located in `/tmp/mu.log`.

### Help
  * Press `?` for in-app help.

### Alternatives
- https://github.com/ewnd9/badtaste
- https://www.npmjs.com/package/vknplayer
- https://www.npmjs.com/package/djesbe
