import '../styles/reset.scss';
import '../styles/admin.scss';
import '../styles/layer.scss';
import * as XLSX from 'xlsx';
import api from './lib/api';

let pageCount = 1;
let lastPageNum = 0;
let type = 'all';
let data = {};
let teacherItems;
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
          onloadLearningSetTable();
        }
      };

      document.getElementById('next').onclick = () => {
        if (pageCount == lastPageNum) {
          return;
        } else {
          pageCount++;
          onloadLearningSetTable();
        }
      };

      document.getElementById('findBtn').onclick = () => {
        data = {};
        data[document.getElementById('findSelect').value] =
          document.getElementById('findText').value;
        pageCount = 1;
        type = 'find';
        window.sessionStorage.setItem(
          'learningSet_filter',
          JSON.stringify(data)
        );
        onloadLearningSetTable();
      };

      onloadLearningSetTable();

      document.getElementById('findClear').onclick = () => {
        window.sessionStorage.clear('learningSet_filter');
        document.getElementById('findText').value = '';
        pageCount = 1;
        data = {};
        type == 'all';
        onloadLearningSetTable();
      };

      document.getElementById('fileUpload').onchange = (e) => {
        readExcel(e);
      };

      document.getElementsByTagName('body')[0].style.display = 'block';
    }
  });
};

function onloadLearningSetTable() {
  const table = document
    .getElementsByClassName('table')[0]
    .getElementsByTagName('tbody')[0];
  const filter = window.sessionStorage.getItem('learningSet_filter');
  let method = type == 'find' || filter ? 'post' : 'get';
  let url = type == 'find' || filter ? 'learningSet/find' : 'learningSet';

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
        teacherItems = res.result.data;
        table.innerHTML = '';
        teacherItems.forEach((item, index) => {
          table.innerHTML += `<tr>
            <td>${item.learningNo}</td>
            <td>${item.videoName}</td>
            <td>${item.videoUrl}</td>
            <td>${item.quizNo}</td>
            <td>${new Date(item.publishedDate).YYYYMMDDHHMMSS()}</td>
            <td>
                <span href="admin-learningSet-edit.html" id="update_${index}" data-val="${
            item._id
          }" class="btn btn-primary">수정</span>
                <span href="javascript: void(0);" id="delete_${index}" data-val="${
            item._id
          }" class="btn btn-cancel">삭제</span>
            </td>
            </tr>`;
        });

        for (let index = 0; index < teacherItems.length; index++) {
          document.getElementById(`update_${index}`).onclick = (e) => {
            location.href = `admin-learningSet-edit.html?_id=${e.target.getAttribute(
              'data-val'
            )}`;
          };
        }

        for (let index = 0; index < teacherItems.length; index++) {
          document.getElementById(`delete_${index}`).onclick = (e) => {
            if (window.confirm('정말 삭제 하시겠습니까?')) {
              api(
                'delete',
                `users/${e.target.getAttribute('data-val')}`,
                undefined,
                (res) => {
                  if (res.msg && res.msg == 'ERROR') {
                    alert('오류가 발생하였습니다.');
                    return;
                  } else {
                    onloadLearningSetTable();
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
        console.log('[API] => 학습세트 전체 목록을 불러올 수 없습니다.');
      }
    }
  });
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
              `learningSet/register`,
              {
                learningNo: row.learningNo.toString(),
                videoName: row.videoName,
                videoUrl: row.videoUrl,
                quizNo: row.quizNo.split(','),
                publishedDate: new Date(),
              },
              (res) => {
                if (index + 1 == rows.length) {
                  onloadLearningSetTable();
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

  return `${yyyy}-${MM}-${dd} ${hh}:${mm}:${ss}`;
};
