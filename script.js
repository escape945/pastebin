'use strict';
(async () => {
  loadSubscribeList();
  if (localStorage['subscribe_storage_select-subscribe']) {
    document.querySelector('#app .subscribe-edit .select-subscribe').innerHTML = localStorage['subscribe_storage_select-subscribe'];
  }
  if (localStorage['subscribe_storage_verification-key']) {
    document.querySelector('#subscribe_storage_verification-key').value = localStorage['subscribe_storage_verification-key'];
  }
  document.querySelector('#app .refresh-page').addEventListener('click', evt => {
    location.reload();
  });
  document.querySelector('#app .subscribe-edit .select-subscribe').addEventListener('click', evt => {
    localStorage.removeItem('subscribe_storage_select-subscribe');
    document.querySelector('#app .subscribe-edit .select-subscribe').innerHTML = '';
    document.querySelector('#app .subscribe-edit .subscribe-name input').value = '';
    document.querySelector('#app .subscribe-edit .subscribe-url input').value = '';
    document.querySelector('#app .subscribe-edit .subscribe-text textarea').value = '';
  });
  document.querySelector('#app .subscribe-edit .edit-select-subscribe').addEventListener('click', evt => {
    swal('Name:', {
      content: 'input',
    }).then(value => {
      if (value) {
        localStorage['subscribe_storage_select-subscribe'] = value;
        document.querySelector('#app .subscribe-edit .select-subscribe').innerHTML = value;
        document.querySelector('#app .subscribe-edit .subscribe-name input').value = value;
        (() => {
          let url = new URL(location.href);
          url.pathname = url.pathname.replace(/index\.html/, '') + 'get.php/' + value;
          document.querySelector('#app .subscribe-edit .subscribe-url input').value = url.href;
        })();
        getSelectSubscribeContent();
      }
    });
  });
  document.querySelector('#app .subscribe-edit .subscribe-name input').addEventListener('click', evt => {
    evt.target.select();
    if (evt.target.value) navigator.clipboard.writeText(evt.target.value);
  });
  document.querySelector('#app .subscribe-edit .subscribe-url input').addEventListener('click', evt => {
    evt.target.select();
    if (evt.target.value) navigator.clipboard.writeText(evt.target.value);
  });
  document.querySelector('#app .subscribe-edit .confirm-area .delete').addEventListener('click', async evt => {
    let subscribe_name = localStorage['subscribe_storage_select-subscribe'];
    if (subscribe_name) {
      let willDelete = await swal({
        text: '确定要删除 ' + subscribe_name + ' 这个?',
        dangerMode: true,
        buttons: {
          cancel: '取消',
          confirm: '确定',
        },
      });
      console.log('willDelete ' + willDelete);
      if (willDelete) {
        fetch('api.php/delete/' + subscribe_name, {
          method: 'GET',
          headers: {
            'x-verify': localStorage['subscribe_storage_verification-key'],
          },
          cache: 'no-store',
        })
          .then(async res => {
            if (res.ok) return res.text();
            swal('删除失败', res.status + ' ' + res.statusText + '\n\n' + (await res.text()), 'error');
          })
          .then(res => {
            if (res == 'ok') {
              localStorage.removeItem('subscribe_storage_select-subscribe');
              document.querySelector('#app .subscribe-edit .select-subscribe').innerHTML = '';
              document.querySelector('#app .subscribe-edit .subscribe-name input').value = '';
              document.querySelector('#app .subscribe-edit .subscribe-url input').value = '';
              document.querySelector('#app .subscribe-edit .subscribe-text textarea').value = '';
              // location.reload();
              loadSubscribeList();
            }
          })
          .catch(err => {
            swal('删除失败', err, 'error');
          });
      }
    }
  });
  document.querySelector('#app .subscribe-edit .confirm-area .edit').addEventListener('click', async evt => {
    let subscribe_name = localStorage['subscribe_storage_select-subscribe'];
    if (subscribe_name) {
      fetch('api.php/edit/' + subscribe_name, {
        method: 'POST',
        headers: {
          'x-verify': localStorage['subscribe_storage_verification-key'],
        },
        cache: 'no-store',
        body: document.querySelector('#app .subscribe-edit .subscribe-text textarea').value,
      })
        .then(async res => {
          if (res.ok) return res.text();
          swal('修改失败', res.status + ' ' + res.statusText + '\n\n' + (await res.text()), 'error');
        })
        .then(res => {
          if (res == 'ok') {
            swal('修改成功', '', 'success');
            loadSubscribeList();
          }
        })
        .catch(err => {
          swal('修改失败', err, 'error');
        });
    }
  });
})();

function loadSubscribeList() {
  fetch('api.php/list/', {
    method: 'GET',
    headers: {
      'x-verify': localStorage['subscribe_storage_verification-key'],
    },
    cache: 'no-store',
  })
    .then(res => {
      if (res.ok) return res.text();
      document.querySelector('#app .subscribe-list ul').innerHTML = 'Unable to request subscribe list.';
    })
    .then(res => {
      let list = JSON.parse(res);
      // console.log(list);
      document.querySelector('#app .subscribe-list ul').innerHTML = '';
      for (let i in list) {
        document.querySelector('#app .subscribe-list ul').innerHTML += `<li class="mdui-list-item mdui-ripple">${list[i]}</li>`;
      }
      document.querySelectorAll('#app .subscribe-list ul li').forEach(element => {
        element.addEventListener('click', evt => {
          localStorage['subscribe_storage_select-subscribe'] = element.textContent;
          document.querySelector('#app .subscribe-edit .select-subscribe').innerHTML = element.textContent;
          document.querySelector('#app .subscribe-edit .subscribe-name input').value = element.textContent;
          (() => {
            let url = new URL(location.href);
            url.pathname = url.pathname.replace(/index\.html/, '') + 'get.php/' + element.textContent;
            document.querySelector('#app .subscribe-edit .subscribe-url input').value = url.href;
          })();
          getSelectSubscribeContent();
        });
      });
    })
    .catch(err => {
      document.querySelector('#app .subscribe-list ul').innerHTML = 'Unable to request subscribe list.';
    });
}

function getSelectSubscribeContent() {
  document.querySelector('#app .subscribe-edit .subscribe-text textarea').value = '';
  fetch('get.php/' + localStorage['subscribe_storage_select-subscribe'], {
    method: 'GET',
    headers: {},
    cache: 'no-store',
  })
    .then(async res => {
      if (res.ok) return res.text();
      swal('不能获取内容', res.status + ' ' + res.statusText + '\n\n' + (await res.text()), 'error');
    })
    .then(res => {
      if (res != undefined) document.querySelector('#app .subscribe-edit .subscribe-text textarea').value = res;
    })
    .catch(err => {
      swal('不能获取内容', err, 'error');
    });
}

(async () => {
  document.querySelector('#app .login').addEventListener('click', evt => {
    showAppLogin(true);
  });
  document.querySelectorAll('#app-login .close i.mdui-icon, #app-login ~ #app-login-overlay').forEach(element => {
    element.addEventListener('click', evt => {
      showAppLogin(false);
    });
  });
  document.querySelector('#app-login .confirm-area .login').addEventListener('click', evt => {
    localStorage['subscribe_storage_verification-key'] = document.querySelector('#subscribe_storage_verification-key').value;
    showAppLogin(false);
    setTimeout(() => {
      location.reload();
    }, 300);
  });
  document.querySelector('#app-login .confirm-area .logout').addEventListener('click', evt => {
    localStorage.removeItem('subscribe_storage_verification-key');
    showAppLogin(false);
    setTimeout(() => {
      location.reload();
    }, 300);
  });

  function showAppLogin(will_show) {
    if (will_show) {
      document.querySelector('#app-login').classList.add('show');
      setTimeout(() => {
        document.querySelector('#app-login').classList.add('ani');
      }, 10);
    } else {
      document.querySelector('#app-login').classList.remove('ani');
      setTimeout(() => {
        document.querySelector('#app-login').classList.remove('show');
      }, 200);
    }
  }
})();
