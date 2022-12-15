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
        api('get', `learningInfo/${_id}`, undefined, (res) => {
          if (res.msg == 'OK') {
            const data = res.result.data;

            const learningDateEl = document.getElementById('learningDate');
            const learningTimeEl = document.getElementById('learningTime');
            const userIdEl = document.getElementById('userId');
            const teacherImgUrlEl = document.getElementById('teacherImgUrl');
            const learningTextEl = document.getElementById('learningText');
            const learningDataEl = document.getElementById('learningData');

            learningDateEl.value = data.learningDate;
            learningTimeEl.value = data.learningTime;
            userIdEl.value = data.userId;
            teacherImgUrlEl.value = data.teacherImgUrl;
            learningTextEl.value = data.learningText;
            learningDataEl.value = learningDataParsing(data.learningData);

            if (learningDateEl.value == '') {
              alert('학습날짜를 입력해주세요.');
              return;
            }

            if (learningTimeEl.value == '') {
              alert('학습시간을 입력해주세요.');
              return;
            }

            if (userIdEl.value == '') {
              alert('회원아이디를 입력해주세요.');
              return;
            }

            if (teacherImgUrlEl.value == '') {
              alert('선생님 이미지 링크를 입력해주세요.');
              return;
            }

            if (learningTextEl.value == '') {
              alert('학습문구를 입력해주세요.');
              return;
            }

            if (learningDataEl.value == '') {
              alert('학습데이터를 입력해주세요.');
              return;
            }

            learningDateEl.onkeydown = (e) => {
              if (e.code == 'Space') {
                e.preventDefault();
                return;
              }
            };

            learningTimeEl.onkeydown = (e) => {
              if (e.code == 'Space') {
                e.preventDefault();
                return;
              }
            };

            userIdEl.onkeydown = (e) => {
              if (e.code == 'Space') {
                e.preventDefault();
                return;
              }
            };

            learningDataEl.onkeydown = (e) => {
              if (e.code == 'Space') {
                e.preventDefault();
                return;
              }
            };

            document.getElementById('updateBtn').onclick = () => {
              api(
                'patch',
                `learningInfo/${_id}`,
                {
                  learningDate: learningDateEl.value,
                  learningTime: learningTimeEl.value,
                  userId: userIdEl.value,
                  teacherImgUrl: teacherImgUrlEl.value,
                  learningText: learningTextEl.value,
                  learningData: sendLearningDataParsing(learningDataEl.value),
                },
                (res) => {
                  if (res.msg == 'OK') {
                    history.back();
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

function learningDataParsing(data) {
  var retData = [];
  data.forEach((item) => {
    retData.push(item.learningNo);
  });
  return retData;
}

function sendLearningDataParsing(data) {
  var retData = [];
  data.split(',').forEach((no) => {
    retData.push({ learningNo: no, complete: 'N' });
  });
  return retData;
}
