# mu-player

![mu-player](https://raw.githubusercontent.com/mink0/mu-player/master/screenshot.png)

### Top Features

  - Play ANY music for FREE from [vk.com](http://vk.com/) and [soundcloud.com](http://soundcloud.com/) using [Music Player Daemon](http://www.musicpd.org/).
  - Explore new music with [last.fm](http://lastfm.com/) top tracks and similar artists search.
  - Smart searching: highest bitrates first.
  - Low system requirements: mu-player will pump smooth even on your grandpa's notebook.
  - Mu-player will save your laptop battery. CPU load of in-browser playback comparing to MPD is HUGE.
  - It works on both MAC OS and Linux.

#### Why use mu-player instead of Google Music (or any other music service)?
  - You will get any music for FREE.
  - Mu-player will always try to find music with highest bitrate quality.
  - Largest music databases in the Internet.

You could use mu-player standalone or with any other full-featured MPD clients. See http://mpd.wikia.com/wiki/Clients for some greatness. For Ubuntu and Linux Mint [mpDris2](https://github.com/eonpatapon/mpDris2) is recommended. It will add native popups, multimedia keys support and playback control in a system tray.

This player is powered by amazing [blessed](https://github.com/chjj/blessed) library and forked from tasty [badtaste](https://github.com/ewnd9/badtaste) player.

### Install
  * First install [MPD](http://www.musicpd.org/). I recommend to use versions `0.19` and higher for `addtagid` functionality. Follow the http://mpd.wikia.com/wiki/Install for the instructions.
  * Start MPD daemon if it is not started on system boot. You could test if it is running by typing `telnet localhost 6600`. You should see `OK MPD` response.
  * You need [nodejs](https://nodejs.org/) and [npm](https://www.npmjs.com/) to install mu-player.
  * Install mu-player:
    - MAC OS X: `npm -g install mu-player`.
    - Ubuntu (Debian) Linux: `sudo npm -g install mu-player`.
  * Now you could run `mu` and setup credentials for lastfm.com, soundcloud.com and vk.com. We have tons of free music there but you need to register accounts first.
  * Run `mu` again and enjoy the music.

Tested on OS X Yosemite, El Capitan; Ubuntu: 14.04, 15.10; Mint 17.x.

### Setup
  * Run `mu --setup` to edit your credentials.

### Config
  * Config file is located in `~/.murc`. You could tweak some parameters there.

### Log
  * Log is located in `/tmp/mu.log`.

### Help
  * Press `?` for in-app help.

### Alternatives
- https://github.com/ewnd9/badtaste
- https://www.npmjs.com/package/vknplayer
- https://www.npmjs.com/package/djesbe
