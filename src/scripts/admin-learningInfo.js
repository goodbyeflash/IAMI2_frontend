import '../styles/reset.scss';
import '../styles/admin.scss';
import '../styles/layer.scss';
import * as XLSX from 'xlsx';
import api from './lib/api';

let pageCount = 1;
let lastPageNum = 0;
let type = 'all';
let data = {};
let learningInfoItems;
const loadingPopup = document.getElementsByClassName('loading-popup')[0];

window.onload = () => {
  api('get', 'teachers/check', undefined, (res) => {
    if (res) {
      if (res.msg && res.msg == 'ERROR') {
        location.href = 'admin.html';
        return;
      }

      document.getElementById('prev').onclick = () => {
        if (pageCount == 1) {
          return;
        } else {
          pageCount--;
          onloadLearningInfoTable();
        }
      };

      document.getElementById('next').onclick = () => {
        if (pageCount == lastPageNum) {
          return;
        } else {
          pageCount++;
          onloadLearningInfoTable();
        }
      };

      document.getElementById('findBtn').onclick = () => {
        data = {};
        data[document.getElementById('findSelect').value] =
          document.getElementById('findText').value;
        pageCount = 1;
        type = 'find';
        window.sessionStorage.setItem(
          'learningInfo_filter',
          JSON.stringify(data)
        );
        onloadLearningInfoTable();
      };

      onloadLearningInfoTable();

      document.getElementById('findClear').onclick = () => {
        window.sessionStorage.clear('learningInfo_filter');
        document.getElementById('findText').value = '';
        pageCount = 1;
        data = {};
        type == 'all';
        onloadLearningInfoTable();
      };

      document.getElementById('fileUpload').onchange = (e) => {
        readExcel(e);
      };

      document.getElementById('logout').onclick = () => {
        api('post', 'teachers/logout', {}, (res) => {
          if (res.msg && res.msg == 'OK') {
            alert('로그아웃 되었습니다.');
            location.href = 'admin.html';
          }
        });
      };

      document.getElementsByTagName('body')[0].style.display = 'block';
    }
  });
};

function onloadLearningInfoTable() {
  const table = document
    .getElementsByClassName('table')[0]
    .getElementsByTagName('tbody')[0];
  const filter = window.sessionStorage.getItem('learningInfo_filter');
  let method = type == 'find' || filter ? 'post' : 'get';
  let url = type == 'find' || filter ? 'learningInfo/find' : 'learningInfo';

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
        learningInfoItems = res.result.data;
        table.innerHTML = '';
        learningInfoItems.forEach((item, index) => {
          table.innerHTML += `<tr>
            <td>${item.learningDate}</td>
            <td>${item.learningTime}</td>
            <td>${item.userId}</td>
            <td> <a href=${item.teacherImgUrl} target='_blank'>${
              item.teacherImgUrl.length > 30
                ? item.teacherImgUrl.substring(0, 30) + '...'
                : item.teacherImgUrl
            }</a></td>
            <td>${item.learningText}</td>
            <td>${learningDataParsing(item.learningData)}</td>
            <td>${learningDataVideoCompleteParsing(item.learningData)}</td>
            <td>${new Date(item.publishedDate).YYYYMMDDHHMMSS()}</td>
            <td>
                <span href="admin-learningInfo-edit.html" id="update_${index}" data-val="${
            item._id
          }" class="btn btn-primary">수정</span><br />
                <span href="javascript: void(0);" id="delete_${index}" data-val="${
            item._id
          }" class="btn btn-cancel">삭제</span>
            </td>
            </tr>`;
        });

        for (let index = 0; index < learningInfoItems.length; index++) {
          document.getElementById(`update_${index}`).onclick = (e) => {
            location.href = `admin-learningInfo-edit.html?_id=${e.target.getAttribute(
              'data-val'
            )}`;
          };
        }

        for (let index = 0; index < learningInfoItems.length; index++) {
          document.getElementById(`delete_${index}`).onclick = (e) => {
            if (window.confirm('정말 삭제 하시겠습니까?')) {
              api(
                'delete',
                `learningInfo/${e.target.getAttribute('data-val')}`,
                undefined,
                () => {
                  if (res.msg && res.msg == 'ERROR') {
                    alert('오류가 발생하였습니다.');
                    return;
                  } else {
                    onloadLearningInfoTable();
                  }
                }
              );
            }
          };
        }

        document.getElementById(
          'pageNav'
        ).innerText = `${pageCount}/${lastPageNum}`;
      } else {
        console.log('[API] => 학습정보 전체 목록을 불러올 수 없습니다.');
      }
    }
  });
}

function learningDataParsing(data) {
  var retData = [];
  data.forEach((item) => {
    retData.push(item.learningNo);
  });
  return retData;
}

function learningDataVideoCompleteParsing(data) {
  var retData = [];
  data.forEach((item) => {
    retData.push(item.videoComplete ? item.videoComplete : 'N');
  });
  return retData;
}

function sendLearningDataParsing(data) {
  var retData = [];
  if (data.indexOf(',') > -1) {
    data.split(',').forEach((no) => {
      retData.push({ learningNo: no, complete: 'N', videoComplete: 'N' });
    });
  } else {
    retData.push({ learningNo: data, complete: 'N', videoComplete: 'N' });
  }
  return retData;
}

function readExcel(event) {
  let input = event.target;
  let reader = new FileReader();
  reader.onload = function () {
    let data = reader.result;
    let workBook = XLSX.read(data, { type: 'binary' });
    workBook.SheetNames.forEach(function (sheetName) {
      let rows = XLSX.utils.sheet_to_json(workBook.Sheets[sheetName]);
      if (rows) {
        try {
          loadingPopup.style.display = 'block';
          rows.forEach((row, index) => {
            api(
              'post',
              `learningInfo/register`,
              {
                learningDate: row.learningDate.toString(),
                learningTime: row.learningTime,
                userId: row.userId,
                teacherImgUrl: row.teacherImgUrl,
                learningText: row.learningText,
                learningData: sendLearningDataParsing(row.learningData),
                publishedDate: new Date(),
              },
              () => {
                if (index + 1 == rows.length) {
                  onloadLearningInfoTable();
                  loadingPopup.style.display = 'none';
                }
              }
            );
          });
        } catch (error) {
          alert('오류가 발생하였습니다.');
          loadingPopup.style.display = 'none';
        }
      }
    });
  };
  reader.readAsBinaryString(input.files[0]);
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

  return `${yyyy}-${MM}-${dd}<br/>${hh}:${mm}:${ss}`;
};
