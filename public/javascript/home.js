$(document).ready(() => {
    $.get("/api/posts", { followingOnly: true }, results => {
        outputPost(results, $(".postsContainer"));
    })
})

function outputPost(results,container) {
    container.html("");

    results.forEach(element => {
        const html = createPostHtml(element)
        container.append(html)
    });

    if(results.length == 0){
        container.append("<span class='noResults'>No Tweets yet :( </span>")
    }
}