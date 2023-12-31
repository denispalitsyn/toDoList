import { register } from '../api/user';
import { errorHandler } from '../utils/errorHandler';

async function onSubmit(event) {
  event.preventDefault();

  const elements = event.target.elements;

  const email = elements.email;
  const emailValue = email.value;

  const password = elements.password;
  const passwordValue = password.value;

  const confirmPassword = elements.confirmPassword;
  const confirmPasswordValue = confirmPassword.value;

  const registerButton = elements.registerButton;

  try {
    const checkAndRemoveError = () => {
      if (confirmPassword.classList.contains('error')) {
        confirmPassword.classList.remove('error');
      }
    };

    confirmPassword.removeEventListener('input', checkAndRemoveError);

    if (passwordValue !== confirmPasswordValue) {
      confirmPassword.addEventListener('input', checkAndRemoveError);

      confirmPassword.classList.add('error');
      throw Error('Пароли не совпадают');
    }

    email.setAttribute('disabled', 'true');
    password.setAttribute('disabled', 'true');
    confirmPassword.setAttribute('disabled', 'true');
    registerButton.setAttribute('disabled', 'true');

    await register(emailValue, passwordValue);

    const registrationContentContainer = document.querySelector(
      '#registrationContentContainer'
    );

    registrationContentContainer.innerHTML = `
      <div class="text-center font-semibold">
        Письмо с подтверждением отправлено на почту
      </div>`;
  } catch (error) {
    email.removeAttribute('disabled');
    password.removeAttribute('disabled');
    confirmPassword.removeAttribute('disabled');
    registerButton.removeAttribute('disabled');

    errorHandler(error);
  }
}

async function start() {
  try {
    const registrationForm = document.querySelector('#registrationForm');

    registrationForm.addEventListener('submit', onSubmit);
  } catch (error) {
    errorHandler(error);
  }
}

start();
