import '../styles/reset.scss';
import '../styles/admin.scss';
import '../styles/layer.scss';
import api from './lib/api';
import datepicker from './lib/datepicker';

let pageCount = 1;
let lastPageNum = 0;
let type = 'all';
let data = {};
let learningResultItems;
const loadingPopup = document.getElementsByClassName('loading-popup')[0];

window.onload = () => {
  api('get', 'teachers/check', undefined, (res) => {
    if (res) {
      if (res.msg && res.msg == 'ERROR') {
        location.href = 'admin.html';
        return;
      }
      datepicker();

      document.getElementById('prev').onclick = () => {
        if (pageCount == 1) {
          return;
        } else {
          pageCount--;
          onloadLearningResultTable();
        }
      };

      document.getElementById('next').onclick = () => {
        if (pageCount == lastPageNum) {
          return;
        } else {
          pageCount++;
          onloadLearningResultTable();
        }
      };

      document.getElementById('findBtn').onclick = () => {
        data = {};
        data[document.getElementById('findSelect').value] =
          document.getElementById('findText').value;
        pageCount = 1;
        type = 'find';
        window.sessionStorage.setItem(
          'learningResult_filter',
          JSON.stringify(data)
        );
        onloadLearningResultTable();
      };

      onloadLearningResultTable();

      document.getElementById('findClear').onclick = () => {
        window.sessionStorage.clear('learningResult_filter');
        document.getElementById('findText').value = '';
        pageCount = 1;
        data = {};
        type == 'all';
        onloadLearningResultTable();
      };

      document.getElementsByClassName('btn btn-excel')[0].onclick = () => {
        loadingPopup.style.display = 'block';
        api(
          'post',
          'excel/download',
          {
            dateGte: document.getElementById('sdate').value,
            dateLt: document.getElementById('edate').value,
          },
          (res) => {
            if (res) {
              const blob = new Blob([res.result.data], {
                type: res.result.headers['content-type'],
              });
              var a = document.createElement('a');
              a.href = window.URL.createObjectURL(blob);
              a.download = `학습결과(${
                document.getElementById('sdate').value
              }~${document.getElementById('edate').value}).xlsx`;
              a.click();
            }
            loadingPopup.style.display = 'none';
          }
        );
      };

      document.getElementsByTagName('body')[0].style.display = 'block';
    }
  });
};

function onloadLearningResultTable() {
  const table = document
    .getElementsByClassName('table')[0]
    .getElementsByTagName('tbody')[0];
  const filter = window.sessionStorage.getItem('learningResult_filter');
  let method = type == 'find' || filter ? 'post' : 'get';
  let url = type == 'find' || filter ? 'learningResult/find' : 'learningResult';

  // 검색 된 필터 있을 경우
  if (filter) {
    data = JSON.parse(filter);
    const key = Object.keys(data)[0];
    const value = data[key];
    const selectOptions = [
      ...document.getElementById('findSelect').getElementsByTagName('option'),
    ];
    selectOptions.forEach((optionEl) => {
      if (optionEl.value == key) {
        optionEl.selected = true;
      }
    });
    document.getElementById('findText').value = value;
  }

  api(method, `${url}?page=${pageCount}`, data, (res) => {
    if (res) {
      if (res.msg && res.msg == 'OK') {
        lastPageNum = res.result.headers['last-page'];
        learningResultItems = res.result.data;
        table.innerHTML = '';
        learningResultItems.forEach((item, index) => {
          table.innerHTML += `<tr>
            <td>${item.userId}</td>
            <td>${item.learningNo}</td>
            <td>${padText(Math.round(item.learningTime.toFixed(1)))}</td>
            <td>${padText(Math.round(item.videoRunTime.toFixed(1)))}</td>
            <td>${Math.ceil(item.quizAvg)}점</td>
            <td>${item.quizAvgRunTime.toFixed(1)}초</td>
            <td>${item.quizIncorrectQuizNo}</td>
            <td>${item.quizTotalScore}</td>
            <td>${new Date(item.publishedDate).YYYYMMDDHHMMSS()}</td>
            <td>${
              item.replayAvg >= 0 ? `${Math.ceil(item.replayAvg)}점` : 'X'
            }</td>
            <td>${
              item.replayAvgRunTime >= 0
                ? `${item.replayAvgRunTime.toFixed(1)}초`
                : 'X'
            }</td>
            <td>${
              item.replayPublishedDate
                ? new Date(item.replayPublishedDate).YYYYMMDDHHMMSS()
                : 'X'
            }</td>
            </tr>`;
        });
        document.getElementById(
          'pageNav'
        ).innerText = `${pageCount}/${lastPageNum}`;
      } else {
        console.log('[API] => 학습결과 전체 목록을 불러올 수 없습니다.');
      }
    }
  });
}

function pad(number, length) {
  var str = '' + number;
  while (str.length < length) {
    str = '0' + str;
  }
  return str;
}

Date.prototype.YYYYMMDDHHMMSS = function () {
  var yyyy = this.getFullYear().toString();
  var MM = pad(this.getMonth() + 1, 2);
  var dd = pad(this.getDate(), 2);
  var hh = pad(this.getHours(), 2);
  var mm = pad(this.getMinutes(), 2);
  var ss = pad(this.getSeconds(), 2);

  return `${yyyy}-${MM}-${dd} ${hh}:${mm}:${ss}`;
};

function padText(seconds) {
  var pad = function (num) {
    var str = num < 10 ? '0' + num : num;

    return str;
  };

  var min = parseInt(seconds / 60);
  var sec = pad(parseInt(seconds % 60));

  return min + ':' + sec;
}
