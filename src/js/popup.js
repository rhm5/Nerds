'use strict';

(function () {

  var popUp = document.querySelector('.popup'),
    btnOpen = document.querySelector('.btn--popup'),
    btnClose = document.querySelector('.btn--close'),
    form = popUp.querySelector('.popup__form'),
    username = popUp.querySelector('#name'),
    email = popUp.querySelector('#email'),
    message = popUp.querySelector('#message'),
    storageName = localStorage.getItem('username'),
    storageEmail = localStorage.getItem('email');


  btnOpen.addEventListener('click', function (event) {
    event.preventDefault();
    popUp.classList.add('popup--opened');
    if (storageName) {
      username.value = storageName;
      email.focus();
      if (storageEmail) {
        email.value = storageEmail;
        message.focus();
      }
    } else {
      username.focus();
    }
  });


  btnClose.addEventListener('mouseenter', function (event) {
    event.preventDefault();
    btnClose.style.transform = 'rotate(90deg)';
  });

  btnClose.addEventListener('mouseout', function (event) {
    event.preventDefault();
    btnClose.style.transform = 'rotate(-90deg)';
  });

  btnClose.addEventListener('click', function (event) {
    event.preventDefault();
    popUp.classList.remove('popup--opened');
  });


  form.addEventListener('submit', function () {
    if (!username.value || !email.value || !message.value) {
      event.preventDefault();
    } else {
      localStorage.setItem('username', username.value);
      localStorage.setItem('email', email.value);
    }
  });

  window.addEventListener('keydown', function (event) {
    if (event.keyCode == 27) {
      if (popUp.classList.contains('popup--opened')) {
        popUp.classList.remove('popup--opened');
      }
    }
  });
})();