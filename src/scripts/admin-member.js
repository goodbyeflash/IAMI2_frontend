import '../styles/reset.scss';
import '../styles/admin.scss';
import api from './lib/api';

let pageCount = 1;
let lastPageNum = 0;
let type = 'all';
let data = {};
let teacherItems;
let columns = [
  { header: '아이디', key: 'id', width: 25 },
  { header: '성명', key: 'name', width: 25 },
  { header: '휴대폰', key: 'hp', width: 25 },
  { header: '권한', key: 'type', width: 25 },
  { header: '가입일', key: 'publishedDate', width: 30 },
];

window.onload = () => {
  api('get', 'teachers/check', undefined, (res) => {
    console.log(res);
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
          onloadUserTable();
        }
      };

      document.getElementById('next').onclick = () => {
        if (pageCount == lastPageNum) {
          return;
        } else {
          pageCount++;
          onloadUserTable();
        }
      };

      document.getElementById('findBtn').onclick = () => {
        data = {};
        data[document.getElementById('findSelect').value] =
          document.getElementById('findText').value;
        pageCount = 1;
        type = 'find';
        window.sessionStorage.setItem('user_filter', JSON.stringify(data));
        onloadUserTable();
      };

      onloadUserTable();

      document.getElementById('findClear').onclick = () => {
        window.sessionStorage.clear('user_filter');
        document.getElementById('findText').value = '';
        pageCount = 1;
        data = {};
        type == 'all';
        onloadUserTable();
      };

      document.getElementsByTagName('body')[0].style.display = 'block';
    }
  });
};

function onloadUserTable() {
  const table = document
    .getElementsByClassName('table')[0]
    .getElementsByTagName('tbody')[0];
  const filter = window.sessionStorage.getItem('user_filter');
  let method = type == 'find' || filter ? 'post' : 'get';
  let url = type == 'find' || filter ? 'users/find' : 'users';

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
            <td>${item.id}</td>
            <td>${item.name}</td>
            <td>${new Date(item.publishedDate).YYYYMMDDHHMMSS()}</td>
            <td>
                <span href="admin-member-edit.html" id="update_${index}" data-val="${
            item._id
          }" class="btn btn-primary">수정</span>
                <span href="javascript: void(0);" class="btn btn-cancel">삭제</span>
            </td>
            </tr>`;
        });

        for (let index = 0; index < teacherItems.length; index++) {
          document.getElementById(`update_${index}`).onclick = (e) => {
            location.href = `admin-member-edit.html?_id=${e.target.getAttribute(
              'data-val'
            )}`;
          };
        }
        document.getElementById(
          'pageNav'
        ).innerText = `${pageCount}/${lastPageNum}`;
      } else {
        console.log(res);
        console.log('[API] => 사용자 전체 목록을 불러올 수 없습니다.');
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
