import axios from 'axios';

type UserInfo = {
	userId: string;
	token: string;
};

const emailInput: HTMLInputElement = document.querySelector('#email');
const phoneInput: HTMLInputElement = document.querySelector('#phone');
const passwordInput: HTMLInputElement = document.querySelector('#password');

let debounce = false;

let loginEventHandler = async (event: Event) => {
	event.preventDefault();
	if (debounce) return;
	let email = emailInput.value;
	let phone = phoneInput.value;
	let password = passwordInput.value;
	try {
		setTimeout(() => (debounce = !debounce));
		setTimeout(() => (debounce = !debounce), 2000);
		let response = await axios.post('/api/v1/auth/login', {
			email,
			phone,
			password,
		});
		let { token }: UserInfo = response.data;
		sessionStorage.setItem('token', token);
		location.replace('/user-account');
	} catch (error) {
		console.error(error);
	}
};

export { loginEventHandler };
