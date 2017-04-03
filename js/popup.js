
document.addEventListener('DOMContentLoaded', function() {
  // console.log('popupjs ', blacklist);
  // load settings from background


  var pauseBtn = document.getElementById('pause');
  var blacklistBtn = document.getElementById('blacklist');
  
  pauseBtn.addEventListener('click', function() {
    pauseBtn.innerText = 'clicked';
  });
  blacklistBtn.addEventListener('click', function() {
    blacklistBtn.innerText = 'clicked';
  });

});