import _ from 'lodash';
import request from 'request';

export let getRemoteAudioSize = (url, cb) => {
  request.head(url, (err, res) =>{
    if (err) return cb(err);

    if (res.statusCode == 200) {
      if (res.headers['content-type'] !== 'audio/mpeg') 
        return cb(new Error('Unknown content-type for ' + url));

      cb(null, parseInt(res.headers['content-length'], 10));
    } 

    // Logger.screen.log(res.headers);
  });

    // obj.url = function() {
    //   return  req.getAsync({ url: obj.stream_url + '?client_id=' + storage.data.scClientId,
    //     json: true,
    //     followRedirect: false
    //   }).then((res) => res[1].location.replace(/^https:\/\//i, 'http://'));
    // };

};

export let getRemoteBitrate = (url, _duration, cb) => {
  let si = 0.05;
  let std = [64, 128, 192, 224, 256, 320];
  let sv;
  let duration = parseInt(_duration, 10);
  getRemoteAudioSize(url, function(err, size) {
    if (err) return cb(err);

    let bitrate = Math.round((size * 8 / 1000) / duration);
    for (var i = 0; i < std.length; i++) {
      sv = bitrate * si;
      if (bitrate - sv <= std[i] && bitrate + sv >= std[i]) {
        bitrate = std[i];
        break;
      }
    }

    return cb(null, bitrate);
  });
};

export let formatTrack = (track) => {
  if (track.label) {
		return `{light-red-fg}${track.label}{/light-red-fg}`;
	}

  let result = `{bold}${track.artist}{/bold}`;

  if (track.source) {
    result = `[${track.source}] ` + result;
  }

	if (track.title) {
		result += ` - ${  track.title}`;
	}

  if (track.duration) {
    let duration = _.padLeft(track.duration / 60 | 0, 2, '0') + ':' + _.padLeft(track.duration % 60, 2, '0');
    
    if (track.bitrate) result += ` [${track.bitrate}kbps]`;

    result += ` {|}${duration}`;
  }

  if (!track.url) {
    result = `Not Found: ${result}`;
  }

  return result;
};

export let format = (items) => {
	return items.map(obj => {
		obj.trackTitle = formatTrack(obj);
		obj.trackTitleFull = obj.trackTitle;

		return obj;
	});
};

export let timeConvert = (_seconds) => {
  let bzero = 1;
  var sec_num = parseInt(_seconds, 10); // don't forget the second param
  
  if (sec_num < 0) bzero = -1;
  sec_num = sec_num * bzero;

  var hours = Math.floor(sec_num / 3600);
  var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
  var seconds = sec_num - (hours * 3600) - (minutes * 60);

  if (hours < 10) hours = '0' + hours;
  if (minutes < 10) minutes = '0' + minutes;
  if (seconds < 10) seconds = '0' + seconds;

  var time = hours === '00' ? minutes + ':' + seconds : hours + ':' + minutes + ':' + seconds;
  
  if (bzero === -1) time = '-' + time;
  
  return time;
};
