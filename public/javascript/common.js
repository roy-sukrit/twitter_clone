
//For Submit Button Post
$('#postTextArea,#replyTextArea').keyup(event => {

    const textBox = $(event.target);
    console.log("textBox", textBox);

    const value = textBox.val().trim();
    console.log("value", value);

    const isModal = textBox.parents(".modal").length == 1;

    const submitButton = isModal ? $("#submitReplyButton") : $("#submitPostButton");
    console.log("submitButton", submitButton);
    if (submitButton.length == 0) {
        return alert("No Submit button found")
    }

    if (value == "") {
        submitButton.prop("disabled", true);
        return;
    }

    if (value !== "") {
        submitButton.prop("disabled", false);
        return;
    }

})




//FIred from event related targer


$("#replyModal").on("show.bs.modal", (e) => {
    console.log("Modal opened");
    const button = $(e.relatedTarget);
    console.log("button", button);
    const postId = getPostIdFromElement(button);
    console.log("postId Modal", postId);

    //Setting id to grab postID
    $('#submitReplyButton').data("id", postId);

    $.get("/api/posts/" + postId, (postData) => {
        console.log("postData modal", postData.output);
        outputPosts(postData.output, $("#originalPostContainer"))
    })

})


//Delete Button
$("#deletePostModal").on("show.bs.modal", (e) => {
    console.log("Modal opened");
    const button = $(e.relatedTarget);
    console.log("button", button);
    const postId = getPostIdFromElement(button);
    console.log("postId Modal delete", postId);

    //Setting id to grab postID
    $('#deletePostButton').data("id", postId);

  
})


$("#deletePostButton").click(function (e) { 
    const id = $(e.target).data("id");

    
    $.ajax({
        url: `/api/posts/${id}`,
        type: "DELETE",
        success: (postData) => {
            console.log(
                "response PUT Req", postData
            );

            location.reload();
            // button.find("span").text(postData.likes.length || "");
            // if (postData.likes.includes(userLoggedIn._id)) {
            //     button.addClass("active");
            // }
            // else {
            //     button.removeClass("active");

            // }

        }
    });

    
});

$("#replyModal").on("hidden.bs.modal", (e) => {
    $("#originalPostContainer").html("")

})


$('#submitPostButton,#submitReplyButton').click(e => {

    const button = $(e.target);


    // const isModal = textBox.parents(".modal").length == 1;

    // let textBox = isModal ? $('#replyTextarea') : $("#postTextArea");


    const isModal = button.parents(".modal").length == 1;
    const textBox = isModal ? $("#replyTextArea") : $("#postTextarea");
    let data = {
        content: textBox.val()
    }

    if (isModal) {

        const id = button.data().id;
        if (id == null) {
            alert("Id is null")
        }

        data.replyTo = id;
    }

    console.log("modal post data", data);
    //Ajax Request Callback Func called after request post
    $.post("/api/posts", data, (postData) => {
        if (postData.replyTo) {
            location.reload();
        }
        else {
            console.log("postData", postData);

            const html = createPostHtml(postData);
            $('.postsContainer').prepend(html)
            textBox.val("");
            button.prop("disabled", true)
        }
    })
})

function createPostHtml(postData, largefont = false) {

    console.log("postData createPostHtml", postData);
    if (postData == null) {
        return alert("Post object is null")
    }

    const isRetweet = postData.retweetData !== undefined;
    console.log("isRetweet", isRetweet);

    const retweetedBy = isRetweet ? postData.postedBy.userName : null;
    console.log("retweetedBy", retweetedBy);
    postData = isRetweet ? postData.retweetData : postData;




    console.log("postData HTML", postData);
    const postedBy = postData.postedBy;
    if (postedBy._id === undefined) {
        return console.log("User Object Not populated");
    }

    const displayName = postedBy.firstName + " " + postedBy.lastName;
    const timestamp = timeDifference(new Date(), new Date(postData.createdAt));

    const likesButtonActiveClass = postData.likes.includes(userLoggedIn._id) ? "active" : ""
    const retweetButtonActiveClass = postData.retweetUsers.includes(userLoggedIn._id) ? "active" : ""
    const largeFontClass = largefont ? "largeFont" : ""
    let retweetText = ''
    if (isRetweet) {
        retweetText = `<span><i class="fas fa-retweet"></i>
        Retweeted By <a href ='/profile/${retweetedBy}'>@${retweetedBy}</a>
        </span>`
    }

    let replyFlag = '';

    //Reply
    if (postData.replyTo && postData.replyTo._id) {

        if (!postData.replyTo._id) {
            return alert("Reply to not populated")
        }
        else if (!postData.replyTo.postedBy._id) {
            return alert("Posted By not populated")

        }

        var replyToUsername = postData.replyTo.postedBy.userName;
        replyFlag = `<div class='replyFlag '>
                       Replying to <a href=/profile/${replyToUsername}'>@${replyToUsername}</a>
                     </div>`



    }


    //Delete Button Logic
    let button = "";
    if (postData.postedBy._id == userLoggedIn._id) {
        button = `<button data-id="${postData._id}" data-toggle="modal" data-target="#deletePostModal"><i class='fas fa-times'></i> </button>`
    }

    return `
    <div class="post ${largeFontClass}" data-id=${postData._id}>
     <div class ='postActionContainer'>${retweetText}</div>
    <div class="mainContentContainer">
        <div class="userImageContainer">
            <img src= ${postedBy.profilePic}>   
        </div>    
        <div class="postContentContainer">
            <div class="header">
            <a href='/profile/${postedBy.userName}' class="displayName">${displayName}</a>
            <span class="username">@${postedBy.userName}</span>
            <span class="date">${timestamp}</span>
            ${button}
            </div>
            ${replyFlag}
            <div class="postBody">
            <span>${postData.content}</span>
            </div>
            <div class="postFooter">
            <div class='postButtonContainer'>
                <button data-toggle='modal' data-target='#replyModal'>
                      <i class='far fa-comment'></i>
                </button>
            </div>
            <div class="postButtonContainer green">
                <button class='retweetButton ${retweetButtonActiveClass}'>
                <i class="fas fa-retweet">
                </i>
                <span>${postData.retweetUsers.length || ""}</span>

                </button>
            </div>
            <div class="postButtonContainer red">
                <button class="likeButton ${likesButtonActiveClass}">
                <i class="far fa-heart">
                </i>
                <span>${postData.likes.length || ""}</span>
                </button>
            </div>
            
            </div>
         </div>
    </div>
</div>`;

}


function timeDifference(current, previous) {

    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;
    var msPerYear = msPerDay * 365;

    var elapsed = current - previous;

    if (elapsed < msPerMinute) {
        if (elapsed / 1000 < 30) return "Just now";

        return Math.round(elapsed / 1000) + ' seconds ago';
    }

    else if (elapsed < msPerHour) {
        return Math.round(elapsed / msPerMinute) + ' minutes ago';
    }

    else if (elapsed < msPerDay) {
        return Math.round(elapsed / msPerHour) + ' hours ago';
    }

    else if (elapsed < msPerMonth) {
        return Math.round(elapsed / msPerDay) + ' days ago';
    }

    else if (elapsed < msPerYear) {
        return Math.round(elapsed / msPerMonth) + ' months ago';
    }

    else {
        return Math.round(elapsed / msPerYear) + ' years ago';
    }
}


//Like Button Event Handler

$(document).on("click", ".likeButton", (e) => {
    console.log("click");
    const button = $(e.target);
    console.log("button", button);
    const postId = getPostIdFromElement(button);
    console.log("postId", postId);
    if (postId == undefined) return;

    $.ajax({
        url: `/api/posts/${postId}/like`,
        type: "PUT",
        success: (postData) => {
            console.log(
                "response PUT Req", postData
            );
            button.find("span").text(postData.likes.length || "");
            if (postData.likes.includes(userLoggedIn._id)) {
                button.addClass("active");
            }
            else {
                button.removeClass("active");

            }

        }
    });

})

function getPostIdFromElement(element) {

    //Checking if root is there else already on root
    const isRoot = element.hasClass("post");

    const root = isRoot ? element : element.closest(".post")

    const postId = root.data().id;

    if (postId === undefined) {
        return alert("Post ID undefined")
    }

    return postId;




}


//Retweet Handler

$(document).on("click", ".retweetButton", (e) => {
    console.log("click");
    const button = $(e.target);
    console.log("button", button);
    const postId = getPostIdFromElement(button);
    console.log("postId", postId);
    if (postId == undefined) return;

    $.ajax({
        url: `/api/posts/${postId}/retweet`,
        type: "POST",
        success: (postData) => {
            console.log(
                "response PUT Req Retweet", postData
            );
            button.find("span").text(postData.retweetUsers.length || "");
            if (postData.retweetUsers.includes(userLoggedIn._id)) {
                button.addClass("active");
            }
            else {
                button.removeClass("active");

            }

        }
    });

})


//Post page
$(document).on("click", ".post", (e) => {
    const element = $(e.target);
    const postId = getPostIdFromElement(element);
    console.log("postId posts", postId);

    if (postId !== undefined && !element.is("button")) {
        console.log("if");
        window.location.href = '/post/' + postId;
    }

})


function outputPosts(results, container) {


    container.html("");

    if (!Array.isArray(results)) {
        results = [results]
    }

    results.forEach(element => {
        const html = createPostHtml(element)
        container.append(html)
    });

    if (results.length == 0) {
        container.append("<span class='noResults'>No Tweets yet :( </span>")
    }
}


function outputPostsWithReplies(results, container) {
    console.log("results", results);
    container.html("");
    if (results.replyTo !== undefined && results.replyTo._id !== undefined) {
        const html = createPostHtml(results.replyTo)
        container.append(html)
    }

    console.log("container 1", container);

    //Main
    const mainPostHtml = createPostHtml(results.postData, true)
    container.append(mainPostHtml)

    console.log("container 2", container);


    if (results.replies) {
        results.replies.forEach(element => {
            const html = createPostHtml(element)
            container.append(html)
        })
    }


    console.log("container 3", container);

}