import _ from 'lodash';
import request from 'request';
import Promise from 'bluebird';
import storage from '../storage/storage';

export let getRemoteAudioSize = (url, cb) => {
  request.head({ url: url, timeout: storage.data.bitrateTimeout }, (err, res) => {
    if (err) return cb(err);

    if (res.statusCode !== 200)
      return cb(new Error('Wrong status code for ' + url));

    if (res.headers['content-type'] !== 'audio/mpeg')
      return cb(new Error('Unknown content-type for ' + url));

    let out = {};
    if (res.headers['x-amz-meta-bitrate'])
      out.bitrate = res.headers['x-amz-meta-bitrate'];

    if (res.headers['content-length'])
      out.size = parseInt(res.headers['content-length'], 10);

    if ((out.size == 0 || out.size == undefined) && !out.bitrate)
      return cb(new Error('Unknown content-length for ' + url));

    cb(null, out);
  });
};

export let getRemoteBitrate = (url, duration, cb) => {
  let si = 0.05;
  let std = [64, 128, 192, 224, 256, 320];
  let sv;
  var duration = parseInt(duration, 10);

  getRemoteAudioSize(url, function(err, data) {
    if (err) return cb(err);

    if (data.bitrate) return cb(null, parseInt(data.bitrate, 10));

    let bitrate = Math.round((data.size * 8 / 1000) / duration);

    if (bitrate > 320) bitrate = 320; // embeded cover

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
