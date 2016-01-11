import _ from 'lodash';

export let formatTrack = (track) => {
  if (track.label) {
		return `{light-red-fg}${track.label}{/light-red-fg}`;
	}

  let result = `{bold}${track.artist}{/bold}`;

  if (track.source) {
    result = `[${track.source}] ` + result;
  }

	if (track.title) {
		result += ` - ${track.title}`;
	}

  if (track.duration) {
    let duration = _.padLeft(track.duration / 60 | 0, 2, '0') + ':' + _.padLeft(track.duration % 60, 2, '0');
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
