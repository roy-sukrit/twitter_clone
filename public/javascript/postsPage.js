$(document).ready(() => {
    $.get("/api/posts/" + postId, results => {
        console.log("posts get modal",results);
        outputPostsWithReplies(results, $(".postsContainer"));
    })
})