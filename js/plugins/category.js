
document.addEventListener('DOMContentLoaded', () => {
  const filterButtons = document.querySelectorAll(".mil-Kategori-list a[data-category]");
  filterButtons.forEach(button => {
    button.addEventListener('click', event => {
      event.preventDefault();
      const category = button.getAttribute('data-category');
      const items = document.querySelectorAll('.js-post');

      items.forEach(item =>{
    if(category === 'all' || item.getAttribute('data-category') === category){
    item.style.display = '';
  } else {
    item.style.display = 'none';
  }

})})});

});