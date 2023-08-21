var cropper;
var timer;
var selectedUsers = [];

$(document).ready(() => {
    refreshMessagesBadge();
    refreshNotificationsBadge();
})

$(document).on("click", ".notification.active", (e) => {
    var container = $(e.target);
    var notificationId = container.data().id;

    var href = container.attr("href");
    e.preventDefault();

    var callback = () => window.location = href;
    markNotificationsAsOpened(notificationId, callback);
})

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

//Image
$("#filePhoto").change(function(){    
    if(this.files && this.files[0]) {
        var reader = new FileReader();
        reader.onload = (e) => {
            var image = document.getElementById("imagePreview");
            image.src = e.target.result;

            if(cropper !== undefined) {
                cropper.destroy();
            }

            cropper = new Cropper(image, {
                aspectRatio: 1 / 1,
                background: false
            });

        }
        reader.readAsDataURL(this.files[0]);
    }
    else {
        console.log("nope")
    }
})
$("#coverPhoto").change(function(){    
    if(this.files && this.files[0]) {
        var reader = new FileReader();
        reader.onload = (e) => {
            var image = document.getElementById("coverPreview");
            image.src = e.target.result;

            if(cropper !== undefined) {
                cropper.destroy();
            }

            cropper = new Cropper(image, {
                aspectRatio: 16 / 9,
                background: false
            });

        }
        reader.readAsDataURL(this.files[0]);
    }
})


$("#coverPhotoButton").click(() => {
    var canvas = cropper.getCroppedCanvas();

    if(canvas == null) {
        alert("Could not upload image. Make sure it is an image file.");
        return;
    }

    canvas.toBlob((blob) => {
        var formData = new FormData();
        formData.append("croppedImage", blob);

        $.ajax({
            url: "/api/users/coverPhoto",
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: () => location.reload()
        })
    })
})

$("#confirmPinModal").on("show.bs.modal", (event) => {
    var button = $(event.relatedTarget);
    var postId = getPostIdFromElement(button);
    $("#pinPostButton").data("id", postId);
})

$("#unpinModal").on("show.bs.modal", (event) => {
    var button = $(event.relatedTarget);
    var postId = getPostIdFromElement(button);
    $("#unpinPostButton").data("id", postId);
})


$("#coverPhoto").change(function(){    
    if(this.files && this.files[0]) {
        var reader = new FileReader();
        reader.onload = (e) => {
            var image = document.getElementById("coverPreview");
            image.src = e.target.result;

            if(cropper !== undefined) {
                cropper.destroy();
            }

            cropper = new Cropper(image, {
                aspectRatio: 16 / 9,
                background: false
            });

        }
        reader.readAsDataURL(this.files[0]);
    }
})

$("#imageUploadButton").click(() => {
    var canvas = cropper.getCroppedCanvas();
    console.log("userLoggedIn modal",userLoggedIn);
    if(canvas == null) {
        alert("Could not upload image. Make sure it is an image file.");
        return;
    }

    canvas.toBlob((blob) => {
        var formData = new FormData();
        formData.append("croppedImage", blob);

        $.ajax({
            url: "/api/users/profilePicture",
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: () => location.reload()
        })
    })
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


$("#pinPostButton").click((event) => {
    var postId = $(event.target).data("id");

    $.ajax({
        url: `/api/posts/${postId}`,
        type: "PUT",
        data: { pinned: true },
        success: (data, status, xhr) => {

            if(xhr.status != 204) {
                alert("could not delete post");
                return;
            }
            
            location.reload();
        }
    })
})

$("#unpinPostButton").click((event) => {
    var postId = $(event.target).data("id");

    $.ajax({
        url: `/api/posts/${postId}`,
        type: "PUT",
        data: { pinned: false },
        success: (data, status, xhr) => {

            if(xhr.status != 204) {
                alert("could not delete post");
                return;
            }
            
            location.reload();
        }
    })
})

$("#replyModal").on("hidden.bs.modal", (e) => {
    $("#originalPostContainer").html("")

})


$('#submitPostButton,#submitReplyButton').click(e => {

    const button = $(e.target);


    // const isModal = textBox.parents(".modal").length == 1;

    // let textBox = isModal ? $('#replyTextarea') : $("#postTextArea");


    const isModal = button.parents(".modal").length == 1;
    const textBox = isModal ? $("#replyTextArea") : $("#postTextArea");
    let data = {
        content: textBox.val()
    }


    console.log("textBox.val()",textBox);
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
            emitNotification(userId);

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
//   let button = "";
//   if (postData.postedBy._id == userLoggedIn._id) {
//       button = `<button data-id="${postData._id}" data-toggle="modal" data-target="#deletePostModal"><i class='fas fa-times'></i> </button>`
//   }


    //Pin Logic
    let button = "";
    let pinnedPostText = "";
    console.log("userLoggedIn",JSON.parse(userLoggedIn)._id);
    if (postData.postedBy._id == JSON.parse(userLoggedIn)._id) {

        var pinnedClass = "";
        var dataTarget = "#confirmPinModal";
        if (postData.pinned === true) {
            pinnedClass = "active";
            dataTarget = "#unpinModal";
            pinnedPostText = "<i class='fas fa-thumbtack'></i> <span>Pinned post</span>";
        }

        button = `<button class='pinButton ${pinnedClass}' data-id="${postData._id}" data-toggle="modal" data-target="${dataTarget}"><i class='fas fa-thumbtack'></i></button>
                    <button data-id="${postData._id}" data-toggle="modal" data-target="#deletePostModal"><i class='fas fa-times'></i></button>`;
    }

    console.log("button",postData.postedBy._id,userLoggedIn._id,button);

    return `
    <div class="post ${largeFontClass}" data-id=${postData._id}>
     <div class ='postActionContainer'>${retweetText}</div>
    <div class="mainContentContainer">
        <div class="userImageContainer">
            <img src= ${postedBy.profilePic}>   
        </div>    
        <div class="postContentContainer">
            <div class='pinnedPostText'>${pinnedPostText}</div>
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

// function createPostHtml(postData, largefont = false) {

//     console.log("postData createPostHtml", postData);
//     console.log();
//     if (postData == null) {
//         return alert("Post object is null")
//     }

//     const isRetweet = postData.retweetData !== undefined;
//     console.log("isRetweet", isRetweet);

//     const retweetedBy = isRetweet ? postData.postedBy.userName : null;
//     console.log("retweetedBy", retweetedBy);
//     postData = isRetweet ? postData.retweetData : postData;




//     console.log("postData HTML", postData);
//     const postedBy = postData.postedBy;
//     if (postedBy._id === undefined) {
//         return console.log("User Object Not populated");
//     }

//     const displayName = postedBy.firstName + " " + postedBy.lastName;
//     const timestamp = timeDifference(new Date(), new Date(postData.createdAt));

//     const likesButtonActiveClass = postData.likes.includes(userLoggedIn._id) ? "active" : ""
//     const retweetButtonActiveClass = postData.retweetUsers.includes(userLoggedIn._id) ? "active" : ""
//     const largeFontClass = largefont ? "largeFont" : ""
//     let retweetText = ''
//     if (isRetweet) {
//         retweetText = `<span><i class="fas fa-retweet"></i>
//         Retweeted By <a href ='/profile/${retweetedBy}'>@${retweetedBy}</a>
//         </span>`
//     }

//     let replyFlag = '';

//     //Reply
//     if (postData.replyTo && postData.replyTo._id) {

//         if (!postData.replyTo._id) {
//             return alert("Reply to not populated")
//         }
//         else if (!postData.replyTo.postedBy._id) {
//             return alert("Posted By not populated")

//         }

//         var replyToUsername = postData.replyTo.postedBy.userName;
//         replyFlag = `<div class='replyFlag '>
//                        Replying to <a href=/profile/${replyToUsername}'>@${replyToUsername}</a>
//                      </div>`



//     }


//     //Delete Button Logic
//     let button = "";
//     if (postData.postedBy._id == userLoggedIn._id) {
//         button = `<button data-id="${postData._id}" data-toggle="modal" data-target="#deletePostModal"><i class='fas fa-times'></i> </button>`
//     }

//     return `
//     <div class="post ${largeFontClass}" data-id=${postData._id}>
//      <div class ='postActionContainer'>${retweetText}</div>
//     <div class="mainContentContainer">
//         <div class="userImageContainer">
//             <img src= ${postedBy.profilePic}>   
//         </div>    
//         <div class="postContentContainer">
//             <div class="header">
//             <a href='/profile/${postedBy.userName}' class="displayName">${displayName}</a>
//             <span class="username">@${postedBy.userName}</span>
//             <span class="date">${timestamp}</span>
//             ${button}
//             </div>
//             ${replyFlag}
//             <div class="postBody">
//             <span>${postData.content}</span>
//             </div>
//             <div class="postFooter">
//             <div class='postButtonContainer'>
//                 <button data-toggle='modal' data-target='#replyModal'>
//                       <i class='far fa-comment'></i>
//                 </button>
//             </div>
//             <div class="postButtonContainer green">
//                 <button class='retweetButton ${retweetButtonActiveClass}'>
//                 <i class="fas fa-retweet">
//                 </i>
//                 <span>${postData.retweetUsers.length || ""}</span>

//                 </button>
//             </div>
//             <div class="postButtonContainer red">
//                 <button class="likeButton ${likesButtonActiveClass}">
//                 <i class="far fa-heart">
//                 </i>
//                 <span>${postData.likes.length || ""}</span>
//                 </button>
//             </div>
            
//             </div>
//          </div>
//     </div>
// </div>`;

// }


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
                emitNotification(postData.postedBy)

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
            if (postData.retweetUsers.includes(JSON.parse(userLoggedIn)._id)) {
                button.addClass("active");
                console.log("retweet done sending notification");
                emitNotification(postData.postedBy)

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




$(document).on("click", ".followButton", (e) => {
    var button = $(e.target);
    var userId = button.data().user;
    
    $.ajax({
        url: `/api/users/${userId}/follow`,
        type: "PUT",
        success: (data, status, xhr) => { 
            
            if (xhr.status == 404) {
                alert("user not found");
                return;
            }
            
            var difference = 1;
            if(data.following && data.following.includes(userId)) {
                button.addClass("following");
                button.text("Following");
                emitNotification(userId);

            }
            else {
                button.removeClass("following");
                button.text("Follow");
                difference = -1;
            }
            
            var followersLabel = $("#followersValue");
            if(followersLabel.length != 0) {
                var followersText = followersLabel.text();
                followersText = parseInt(followersText);
                followersLabel.text(followersText + difference);
            }
        }
    })
});

function outputUsers(results, container) {
    container.html("");

    results.forEach(result => {
        var html = createUserHtml(result, true);
        container.append(html);
    });

    if(results.length == 0) {
        container.append("<span class='noResults'>No results found</span>")
    }
}

function outputPosts(results, container) {
    container.html("");

    if(!Array.isArray(results)) {
        results = [results];
    }

    results.forEach(result => {
        var html = createPostHtml(result)
        container.append(html);
    });

    if (results.length == 0) {
        container.append("<span class='noResults'>Nothing to show.</span>")
    }
}

function searchUsers(searchTerm) {
    $.get("/api/users", { search: searchTerm }, results => {
        outputSelectableUsers(results, $(".resultsContainer"));
    })
}

function outputSelectableUsers(results, container) {
    container.html("");

    results.forEach(result => {
        
        if(result._id == userLoggedIn._id || selectedUsers.some(u => u._id == result._id)) {
            return;
        }

        var html = createUserHtml(result, false);
        var element = $(html);
        element.click(() => userSelected(result))

        container.append(element);
    });

    if(results.length == 0) {
        container.append("<span class='noResults'>No results found</span>")
    }
}

$("#userSearchTextbox").keydown((event) => {
    clearTimeout(timer);
    var textbox = $(event.target);
    var value = textbox.val();

    if (value == "" && event.keyCode == 8) {
        // remove user from selection
        selectedUsers.pop();
        updateSelectedUsersHtml();
        $(".resultsContainer").html("");

        if(selectedUsers.length == 0) {
            $("#createChatButton").prop("disabled", true);
        }

        return;
    }

    timer = setTimeout(() => {
        value = textbox.val().trim();

        if(value == "") {
            $(".resultsContainer").html("");
        }
        else {
            searchUsers(value);
        }
    }, 1000)

})

$("#createChatButton").click(() => {
    var data = JSON.stringify(selectedUsers);

    $.post("/api/chats", { users: data }, chat => {

        if(!chat || !chat._id) return alert("Invalid response from server.");

        window.location.href = `/messages/${chat._id}`;
    })
})

function userSelected(user) {
    selectedUsers.push(user);
    updateSelectedUsersHtml()
    $("#userSearchTextbox").val("").focus();
    $(".resultsContainer").html("");
    $("#createChatButton").prop("disabled", false);
}


function updateSelectedUsersHtml() {
    var elements = [];

    selectedUsers.forEach(user => {
        var name = user.firstName + " " + user.lastName;
        var userElement = $(`<span class='selectedUser'>${name}</span>`);
        elements.push(userElement);
    })

    $(".selectedUser").remove();
    $("#selectedUsers").prepend(elements);
}



function createUserHtml(userData, showFollowButton) {

    var name = userData.firstName + " " + userData.lastName;
    var isFollowing = userLoggedIn.following && userLoggedIn.following.includes(userData._id);
    var text = isFollowing ? "Following" : "Follow"
    var buttonClass = isFollowing ? "followButton following" : "followButton"

    var followButton = "";
    if (showFollowButton && userLoggedIn._id != userData._id) {
        followButton = `<div class='followButtonContainer'>
                            <button class='${buttonClass}' data-user='${userData._id}'>${text}</button>
                        </div>`;
    }

    return `<div class='user'>
                <div class='userImageContainer'>
                    <img src='${userData.profilePic}'>
                </div>
                <div class='userDetailsContainer'>
                    <div class='header'>
                        <a href='/profile/${userData.userName}'>${name}</a>
                        <span class='username'>@${userData.userName}</span>
                    </div>
                </div>
                ${followButton}
            </div>`;
}

function getChatName(chatData) {
    var chatName = chatData.chatName;

    if(!chatName) {
        var otherChatUsers = getOtherChatUsers(chatData.users);
        var namesArray = otherChatUsers.map(user => user.firstName + " " + user.lastName);
        chatName = namesArray.join(", ")
    }

    return chatName;
}


function getOtherChatUsers(users) {
    if(users.length == 1) return users;

    return users.filter(user => user._id != userLoggedIn._id);
}



function messageReceived(newMessage) {
    if($(".chatContainer").length == 0) {
        // Show popup notification
    }
    else {
        addChatMessageHtml(newMessage);
    }

    refreshMessagesBadge()
}

function markNotificationsAsOpened(notificationId = null, callback = null) {
    if(callback == null) callback = () => location.reload();

    var url = notificationId != null ? `/api/notifications/${notificationId}/markAsOpened` : `/api/notifications/markAsOpened`;
    $.ajax({
        url: url,
        type: "PUT",
        success: () => callback()
    })
}

function refreshMessagesBadge() {
    $.get("/api/chats", { unreadOnly: true }, (data) => {
        
        var numResults = data.length;

        if(numResults > 0) {
            $("#messagesBadge").text(numResults).addClass("active");
        }
        else {
            $("#messagesBadge").text("").removeClass("active");
        }

    })
}

function refreshNotificationsBadge() {
    $.get("/api/notifications", { unreadOnly: true }, (data) => {
        console.log("refreshNotificationsBadge",data);
        var numResults = data.length;

        if(numResults > 0) {
            $("#notificationBadge").text(numResults).addClass("active");
        }
        else {
            $("#notificationBadge").text("").removeClass("active");
        }

    })
}

function showNotificationPopup(data) {
    var html = createNotificationHtml(data);
    var element = $(html);
    element.hide().prependTo("#notificationList").slideDown("fast");

    setTimeout(() => element.fadeOut(400), 5000);
}

function showMessagePopup(data) {

    if(!data.chat.latestMessage._id) {
        data.chat.latestMessage = data;
    }

    var html = createChatHtml(data.chat);
    var element = $(html);
    element.hide().prependTo("#notificationList").slideDown("fast");

    setTimeout(() => element.fadeOut(400), 5000);
}

function outputNotificationList(notifications, container) {
    notifications.forEach(notification => {
        var html = createNotificationHtml(notification);
        container.append(html);
    })

    if(notifications.length == 0) {
        container.append("<span class='noResults'>Nothing to show.</span>");
    }
}

function createNotificationHtml(notification) {
    var userFrom = notification.userFrom;
    var text = getNotificationText(notification);
    var href = getNotificationUrl(notification);
    var className = notification.opened ? "" : "active";

    return `<a href='${href}' class='resultListItem notification ${className}' data-id='${notification._id}'>
                <div class='resultsImageContainer'>
                    <img src='${userFrom.profilePic}'>
                </div>
                <div class='resultsDetailsContainer ellipsis'>
                    <span class='ellipsis'>${text}</span>
                </div>
            </a>`;
}

function getNotificationText(notification) {

    var userFrom = notification.userFrom;

    if(!userFrom.firstName || !userFrom.lastName) {
        return alert("user from data not populated");
    }

    var userFromName = `${userFrom.firstName} ${userFrom.lastName}`;
    
    var text;

    if(notification.notificationType == "retweet") {
        text = `${userFromName} retweeted one of your posts`;
    }
    else if(notification.notificationType == "postLike") {
        text = `${userFromName} liked one of your posts`;
    }
    else if(notification.notificationType == "reply") {
        text = `${userFromName} replied to one of your posts`;
    }
    else if(notification.notificationType == "follow") {
        text = `${userFromName} followed you`;
    }

    return `<span class='ellipsis'>${text}</span>`;
}

function getNotificationUrl(notification) { 
    var url = "#";

    if(notification.notificationType == "retweet" || 
        notification.notificationType == "postLike" || 
        notification.notificationType == "reply") {
            
        url = `/posts/${notification.entityId}`;
    }
    else if(notification.notificationType == "follow") {
        url = `/profile/${notification.entityId}`;
    }

    return url;
}

function createChatHtml(chatData) {
    var chatName = getChatName(chatData);
    var image = getChatImageElements(chatData);
    var latestMessage = getLatestMessage(chatData.latestMessage);

    var activeClass = !chatData.latestMessage || chatData.latestMessage.readBy.includes(userLoggedIn._id) ? "" : "active";
    
    return `<a href='/messages/${chatData._id}' class='resultListItem ${activeClass}'>
                ${image}
                <div class='resultsDetailsContainer ellipsis'>
                    <span class='heading ellipsis'>${chatName}</span>
                    <span class='subText ellipsis'>${latestMessage}</span>
                </div>
            </a>`;
}

function getLatestMessage(latestMessage) {
    if(latestMessage != null) {
        var sender = latestMessage.sender;
        return `${sender.firstName} ${sender.lastName}: ${latestMessage.content}`;
    }

    return "New chat";
}

function getChatImageElements(chatData) {
    var otherChatUsers = getOtherChatUsers(chatData.users);

    var groupChatClass = "";
    var chatImage = getUserChatImageElement(otherChatUsers[0]);

    if(otherChatUsers.length > 1) {
        groupChatClass = "groupChatImage";
        chatImage += getUserChatImageElement(otherChatUsers[1]);
    }

    return `<div class='resultsImageContainer ${groupChatClass}'>${chatImage}</div>`;
}

function getUserChatImageElement(user) {
    if(!user || !user.profilePic) {
        return alert("User passed into function is invalid");
    }

    return `<img src='${user.profilePic}' alt='User's profile pic'>`;
}
