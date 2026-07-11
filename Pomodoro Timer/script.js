'use strict';

const el = {
  workTab: document.getElementById('work-button'),
  studyTab: document.getElementById('study-button'),
  personalTab: document.getElementById('personal-button'),
  timeInput: document.getElementById('custom-time'),
  timerDisplay: document.getElementById('timer-display'),
  startBtn: document.getElementById('start-btn'),
  pauseBtn: document.getElementById('pause-btn'),
  resetBtn: document.getElementById('reset-btn'),
  clearBtn: document.getElementById('clear-btn'),
  stopAlarmBtn: document.getElementById('stop-alarm-btn'),
  workBlock: document.getElementById('summary-work'),
  studyBlock: document.getElementById('summary-study'),
  personalBlock: document.getElementById('summary-personal'),
  alarmSound: document.getElementById('alarm-sound'),
  tabGroup: document.getElementById('mode-tabs'),
  allActivity: document.getElementById('activity-log'),
};

let timeRemaining, timeInterval;
let totalSessionTime = 0;
let currentMode = 'work';
let totalWorkSeconds = +localStorage.getItem('savedWork') || 0;
let totalStudySeconds = +localStorage.getItem('savedStudy') || 0;
let totalPersonalSeconds = +localStorage.getItem('savedPersonal') || 0;

const workLog = JSON.parse(localStorage.getItem('savedLog')) || [];

const logUIUpdate = function (logs) {
  if (logs.length > 0) {
    document.querySelector('.empty-log-msg').remove();

    logs.forEach(log => {
      const logHTML = `
    <li class="log-item">
      <strong>${log.mode}</strong>: ${log.duration}m completed at ${log.time}
    </li>
  `;
      el.allActivity.insertAdjacentHTML('afterbegin', logHTML);
    });
  }
};
logUIUpdate(workLog);

const activeTimer = function () {
  el.startBtn.textContent = 'Start';
  if (timeInterval) {
    clearInterval(timeInterval);
  }
  el.startBtn.disabled = true;
  el.pauseBtn.disabled = false;
  el.workTab.disabled = true;
  el.studyTab.disabled = true;
  el.personalTab.disabled = true;

  if (!timeRemaining) {
    setDefaultModeTime();
    if (!timeRemaining) {
      if (currentMode === 'study') {
        timeRemaining = 45 * 60;
        totalSessionTime = timeRemaining;
      } else if (currentMode === 'personal') {
        timeRemaining = 10 * 60;
        totalSessionTime = timeRemaining;
      } else if (currentMode === 'work') {
        timeRemaining = 25 * 60;
        totalSessionTime = timeRemaining;
      }
    }
  }

  const activeClock = function () {
    const min = String(Math.trunc(timeRemaining / 60)).padStart(2, 0);
    const sec = String(timeRemaining % 60).padStart(2, 0);

    el.timerDisplay.textContent = `${min}:${sec}`;

    if (timeRemaining === 0) {
      clearInterval(timeInterval);
      el.startBtn.disabled = false;
      el.pauseBtn.disabled = true;
      timeTracker();
      el.alarmSound.play();
      resetTimer();
      return;
    } else timeRemaining--;
  };

  activeClock();

  timeInterval = setInterval(activeClock, 1000);
  el.timeInput.value = '';
};

const performanceUI = function () {
  const minS = String(Math.trunc(totalStudySeconds / 60)).padStart(2, 0);
  const secS = String(totalStudySeconds % 60).padStart(2, 0);
  el.studyBlock.textContent = `${minS}:${secS}m`;

  const minP = String(Math.trunc(totalPersonalSeconds / 60)).padStart(2, 0);
  const secP = String(totalPersonalSeconds % 60).padStart(2, 0);
  el.personalBlock.textContent = `${minP}:${secP}m`;

  const minW = String(Math.trunc(totalWorkSeconds / 60)).padStart(2, 0);
  const secw = String(totalWorkSeconds % 60).padStart(2, 0);
  el.workBlock.textContent = `${minW}:${secw}m`;
};
performanceUI();

const timeTracker = function () {
  const now = new Date();
  const timestamp = now.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
  const durationMins = (totalSessionTime / 60).toFixed(2);

  workLog.push({
    mode: currentMode,
    duration: durationMins,
    time: timestamp,
  });
  localStorage.setItem('savedLog', JSON.stringify(workLog));

  const emptyLog = document.querySelector('.empty-log-msg');
  if (emptyLog) {
    emptyLog.remove();
  }
  if (currentMode === 'study') {
    totalStudySeconds += totalSessionTime;
    const min = String(Math.trunc(totalStudySeconds / 60)).padStart(2, 0);
    const sec = String(totalStudySeconds % 60).padStart(2, 0);
    el.studyBlock.textContent = `${min}:${sec}m`;
    localStorage.setItem('savedStudy', totalStudySeconds);
  } else if (currentMode === 'personal') {
    totalPersonalSeconds += totalSessionTime;
    const min = String(Math.trunc(totalPersonalSeconds / 60)).padStart(2, 0);
    const sec = String(totalPersonalSeconds % 60).padStart(2, 0);
    el.personalBlock.textContent = `${min}:${sec}m`;
    localStorage.setItem('savedPersonal', totalPersonalSeconds);
  } else if (currentMode === 'work') {
    totalWorkSeconds += totalSessionTime;
    const min = String(Math.trunc(totalWorkSeconds / 60)).padStart(2, 0);
    const sec = String(totalWorkSeconds % 60).padStart(2, 0);
    el.workBlock.textContent = `${min}:${sec}m`;
    localStorage.setItem('savedWork', totalWorkSeconds);
  }
  const logHTML = `
    <li class="log-item">
      <strong>${currentMode.toUpperCase()}</strong>: ${durationMins}m completed at ${timestamp}
    </li>
  `;
  el.allActivity.insertAdjacentHTML('afterbegin', logHTML);
};

const pauseTimer = function () {
  clearInterval(timeInterval);
  el.startBtn.textContent = 'Continue';
  el.startBtn.disabled = false;
  el.pauseBtn.disabled = true;
  el.workTab.disabled = false;
  el.studyTab.disabled = false;
  el.personalTab.disabled = false;
};

const resetTimer = function () {
  clearInterval(timeInterval);
  el.startBtn.textContent = 'Start';
  timeRemaining = 0;
  el.startBtn.disabled = false;
  el.pauseBtn.disabled = true;
  el.workTab.disabled = false;
  el.studyTab.disabled = false;
  el.personalTab.disabled = false;
  setDefaultModeTime();
};

const setDefaultModeTime = function () {
  const customTime = Math.round(Number(el.timeInput.value) * 60);
  const min = String(Math.trunc(customTime / 60)).padStart(2, 0);
  const sec = String(customTime % 60).padStart(2, 0);

  if (currentMode === 'study') {
    el.timerDisplay.textContent = `45:00`;
    timeRemaining = customTime;
  } else if (currentMode === 'personal') {
    el.timerDisplay.textContent = `10:00`;
    timeRemaining = customTime;
  } else if (currentMode === 'work') {
    el.timerDisplay.textContent = `25:00`;
    timeRemaining = customTime;
  }
  totalSessionTime = timeRemaining;
};

const clearMemory = function () {
  localStorage.clear();
  totalWorkSeconds = 0;
  totalStudySeconds = 0;
  totalPersonalSeconds = 0;
  //restore the li element
  el.allActivity.innerHTML = '';
  const html = `<li class="empty-log-msg">
              No completed blocks tracked in this workspace. Start the clock to
              begin.
            </li>`;
  el.allActivity.insertAdjacentHTML('afterbegin', html);
  el.studyBlock.textContent = `00:00m`;
  el.personalBlock.textContent = `00:00m`;
  el.workBlock.textContent = `00:00m`;
  //call reset timer
  resetTimer();
};

const stopAlarm = function () {
  el.alarmSound.pause();
  el.alarmSound.currentTime = 0;
};

el.tabGroup.addEventListener('sl-tab-show', function (e) {
  currentMode = e.detail.name;
  resetTimer();
});

el.startBtn.addEventListener('click', activeTimer);
el.pauseBtn.addEventListener('click', pauseTimer);
el.resetBtn.addEventListener('click', resetTimer);
el.clearBtn.addEventListener('click', clearMemory);
el.stopAlarmBtn.addEventListener('click', stopAlarm);
