import '../styles/reset.scss';
import '../styles/admin.scss';
import '../styles/login.scss';
import api from './lib/api';

window.onload = () => {
  api('get', 'teachers/check', undefined, (res) => {
    if (res) {
      if (res.result.data && res.result.data.id) {
        location.href = 'admin-member.html';
      } else {
        document.getElementsByTagName('body')[0].style.display = 'block';
        document.getElementsByClassName('btn btn-primary')[0].onclick = () => {
          api(
            'post',
            'teachers/login',
            {
              id: document.getElementById('userId').value,
              password: document.getElementById('userPw').value,
            },
            (res) => {
              if (res) {
                if (res.msg == 'ERROR') {
                  document.getElementById('message').innerText =
                    '아이디와 비밀번호를 확인해주세요.';
                } else {
                  location.href = 'admin-member.html';
                }
              }
            }
          );
        };
      }
    }
  });
};
