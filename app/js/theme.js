const theme = document.getElementById('theme');
const themeIcon = document.getElementById('themeIcon');

let isDark = false;

theme.addEventListener('click', () => {
	if (!isDark) {
		themeIcon.classList.remove('fa-moon');
		themeIcon.classList.add('fa-sun');

		theme.classList.remove('left');
		theme.classList.add('right');
	} else {
		themeIcon.classList.remove('fa-sun');
		themeIcon.classList.add('fa-moon');

		theme.classList.add('left');
		theme.classList.remove('right');
	}
	isDark = !isDark;
});
