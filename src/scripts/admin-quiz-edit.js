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
        api('get', `quizData/${_id}`, undefined, (res) => {
          if (res.msg == 'OK') {
            const data = res.result.data;

            const quizNoEl = document.getElementById('quizNo');
            const textEl = document.getElementById('text');
            const questionEl = document.getElementById('question');
            const answerEl = document.getElementById('answer');
            const timeEl = document.getElementById('time');

            quizNoEl.innerText = data.quizNo;
            textEl.value = data.text;
            questionEl.value = data.question;
            answerEl.value = data.answer;
            timeEl.value = data.time;

            if (textEl.value == '') {
              alert('퀴즈 문구를 입력해주세요.');
              return;
            }

            if (questionEl.value == '') {
              alert('퀴즈 문제를 입력해주세요.');
              return;
            }

            if (answerEl.value == '') {
              alert('퀴즈 정답을 입력해주세요.');
              return;
            }

            if (timeEl.value == '') {
              alert('제한 시간을 입력해주세요.');
              return;
            }

            textEl.onkeydown = (e) => {
              if (e.code == 'Space') {
                e.preventDefault();
                return;
              }
            };

            questionEl.onkeydown = (e) => {
              if (e.code == 'Space') {
                e.preventDefault();
                return;
              }
            };

            answerEl.onkeydown = (e) => {
              if (e.code == 'Space') {
                e.preventDefault();
                return;
              }
            };

            timeEl.onkeydown = (e) => {
              if (e.code == 'Space') {
                e.preventDefault();
                return;
              }
            };

            document.getElementById('updateBtn').onclick = () => {
              api(
                'patch',
                `quizData/${_id}`,
                {
                  quizNo: quizNoEl.innerText,
                  text: textEl.value,
                  question: questionEl.value,
                  answer: answerEl.value,
                  time: timeEl.value,
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
          document.getElementsByTagName('body')[0].style.display = 'block';
        });
      }
    }
  });
};
