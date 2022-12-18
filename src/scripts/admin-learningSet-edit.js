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
        api('get', `learningSet/${_id}`, undefined, (res) => {
          if (res.msg == 'OK') {
            const data = res.result.data;

            const learningNoEl = document.getElementById('learningNo');
            const videoNameEl = document.getElementById('videoName');
            const videoUrlEl = document.getElementById('videoUrl');
            const quizNoEl = document.getElementById('quizNo');

            learningNoEl.innerText = data.learningNo;
            videoNameEl.value = data.videoName;
            videoUrlEl.value = data.videoUrl;
            quizNoEl.value = data.quizNo;

            if (videoNameEl.value == '') {
              alert('비디오 이름을 입력해주세요.');
              return;
            }

            if (videoUrlEl.value == '') {
              alert('비디오 링크를 입력해주세요.');
              return;
            }

            if (quizNoEl.value == '') {
              alert('퀴즈 넘버를 입력해주세요.');
              return;
            }

            quizNoEl.onkeydown = (e) => {
              if (e.code == 'Space') {
                e.preventDefault();
                return;
              }
            };

            document.getElementById('updateBtn').onclick = () => {
              api(
                'patch',
                `learningSet/${_id}`,
                {
                  learningNo: learningNoEl.innerText,
                  videoName: videoNameEl.value,
                  videoUrl: videoUrlEl.value,
                  quizNo: quizNoEl.value.split(','),
                },
                (res) => {
                  if (res.msg == 'OK') {
                    location.href = 'admin-learningSet.html';
                  } else {
                    alert('오류가 발생하였습니다.');
                  }
                }
              );
            };
          }
          document.getElementById('logout').onclick = () => {
            api('post', 'teachers/logout', {}, (res) => {
              if (res.msg && res.msg == 'OK') {
                alert('로그아웃 되었습니다.');
                location.href = 'admin.html';
              }
            });
          };
          document.getElementsByTagName('body')[0].style.display = 'block';
        });
      }
    }
  });
};
