import '../styles/reset.scss';
import '../styles/admin.scss';
import api from './lib/api';

window.onload = () => {
  api('get', 'teachers/check', undefined, (res) => {
    if (res) {
      if (res.msg && res.msg == 'ERROR') {
        location.href = 'admin.html';
        return;
      }
      const params = new URLSearchParams(window.location.search);
      const _id = params.get('_id');
      if (_id) {
        api('get', `users/${_id}`, undefined, (res) => {
          if (res.msg == 'OK') {
            const data = res.result.data;

            const idEl = document.getElementById('id');
            const nameEl = document.getElementById('name');
            const passwordEl = document.getElementById('password');

            idEl.innerText = data.id;
            nameEl.value = data.name;

            if (nameEl.value == '') {
              alert('성명을 입력해주세요.');
              return;
            }

            passwordEl.onkeydown = (e) => {
              if (e.code == 'Space') {
                e.preventDefault();
                return;
              }
            };

            document.getElementById('updateBtn').onclick = () => {
              const patchData = {
                name: nameEl.value,
              };

              if (passwordEl.value.length > 0) {
                patchData['password'] = passwordEl.value;
              }
              api('patch', `users/${_id}`, patchData, (res) => {
                if (res.msg == 'OK') {
                  history.back();
                } else {
                  alert('오류가 발생하였습니다.');
                }
              });
            };
          }
          document.getElementsByTagName('body')[0].style.display = 'block';
        });
      }
    }
  });
};
