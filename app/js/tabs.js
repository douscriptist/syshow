const contents = document.querySelectorAll('.content');
const listItems = document.querySelectorAll('nav ul li');
const eyeIcon = document.getElementById('eyeIcon');
const ip = document.getElementById('ip');

let isShown = false;

// Showin ip adress
eyeIcon.addEventListener('click', () => {
	ip.classList.toggle('blur');
	if (!isShown) {
		eyeIcon.classList.remove('fa-eye');
		eyeIcon.classList.add('fa-eye-slash');
	} else {
		eyeIcon.classList.add('fa-eye');
		eyeIcon.classList.remove('fa-eye-slash');
	}
	isShown = !isShown;
});

listItems.forEach((item, index) => {
	item.addEventListener('click', () => {
		hideAllContents();
		hideAllItems();

		// activate list item
		item.classList.add('active');

		// display content
		contents[index].classList.add('show');
	});
});

function hideAllContents() {
	contents.forEach((content) => {
		content.classList.remove('show');
	});
}

function hideAllItems() {
	listItems.forEach((item) => {
		item.classList.remove('active');
	});
}
