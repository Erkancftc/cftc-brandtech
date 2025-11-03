/**/

document.getElementById('loadMore').addEventListener('click', function() {
    const hiddenPosts = document.querySelectorAll('.js-post.hidden');
    for (let i = 0; i < 4 && i < hiddenPosts.length; i++) {
        hiddenPosts[i].classList.remove('hidden');
    }});
   