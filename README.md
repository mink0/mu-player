# mu-player

![mu-player](https://raw.githubusercontent.com/mink0/mu-player/master/screenshot.png)

### Top Features

  - Play ANY music from [vk.com](http://vk.com/) and [soundcloud.com](http://soundcloud.com/) using [Music Player Daemon](http://www.musicpd.org/).
  - Top tracks search and similar artists search is made by [last.fm](http://lastfm.com/) service.
  - Low system requirements. It will pump smooth even on your grandpa notebook.
  - CPU consumption of in-browser playback comparing with MPD is HUGE. It will definitely save your laptop battery.

You could use mu-player standalone or with any other full-featured MPD clients. See http://mpd.wikia.com/wiki/Clients for some greatness. For Ubuntu and Linux Mint [mpDris2](https://github.com/eonpatapon/mpDris2) is recommended. It will add native popups, multimedia keys support and playback control in a system tray.

This player is powered by amazing [blessed](https://github.com/chjj/blessed) lib and forked from tasty [badtaste](https://github.com/ewnd9/badtaste) player.

### Changelog

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
  * First install [MPD](http://www.musicpd.org/). I recommend to use versions `0.18.9` and higher for `addtagid` functionality. Follow the http://mpd.wikia.com/wiki/Install for the instructions.
  * Start MPD daemon. Test if it is running by typing `telnet localhost 6600`. You should see `OK MPD` response.
  * You need [nodejs](https://nodejs.org/) and [npm](https://www.npmjs.com/) to install mu-player. Tested on nodejs versions 0.12 and 4.2.
  * Install mu-player:

Run `npm -g install mu-player` on MAC.

Or `sudo npm -g install mu-player` on Ubuntu Linux.

  * Now you could run `mu` and setup credentials for lastfm.com, soundcloud.com and vk.com. We have tons of free music there but you need to register accounts there first.
  * Run `mu` again and enjoy the free music.

Tested on OS X Yosemite and Ubuntu linux 14.04.

### Setup
  * Run `mu --setup` for editing your credentials.

### Help
  * Press `?` for in-app help.

### Alternatives
- https://github.com/ewnd9/badtaste
- https://www.npmjs.com/package/vknplayer
- https://www.npmjs.com/package/djesbe
