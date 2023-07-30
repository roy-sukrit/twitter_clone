const experess = require('express');
const app = experess();
const router = experess.Router();
const bodyParser = require("body-parser")
const User = require('../../schemas/UserSchema');
const Post = require('../../schemas/PostSchema');



app.use(bodyParser.urlencoded({ extended: false }));


router.get('/', async (req, res, next) => {

    // let posts = await Post.find()
    //     .populate("postedBy")
    //     .populate("retweetData")
    //     .sort("createdAt:" - 1)
    //     .catch((e) => {
    //         console.log("error in get posts", e);
    //         return res.status(400)

    //     })

    // const data  = await User.populate(posts,{path:"retweetData.postedBy"})    .catch((e) => {
    //     console.log("error in populate retweetData", e);
    //     return res.status(400)

    // })

    const results = await getPosts({});
    console.log("results", results);

    res.status(200).send(results);

})

router.post('/', async (req, res, next) => {
    console.log("req body post ", req.body);
    let payload = {
        content: req.body.content,
        postedBy: req.session.user
    }
    if (!req.body.content) {
        console.log("Content param not sent with request");
        return res.sendStatus(400);
    }
    console.log("post payload", payload);

    if (req.body.replyTo) {
        payload.replyTo = req.body.replyTo;
    }
    let postedResponse = await Post.create(payload)
        .catch(e => {
            console.log("e", e);
            return res.sendStatus(400);

        })
    postedResponse = await User.populate(postedResponse, { path: "postedBy" })
    console.log("postedResponse", postedResponse);

    res.status(201).send(postedResponse)

})



router.put('/:id/like', async (req, res, next) => {

    console.log("Put", req.params.id);

    const postId = req.params.id;
    const userId = req.session.user._id;

    const isLiked = req.session.user.likes && req.session.user.likes.includes(postId);

    console.log("isLiked", isLiked);

    const option = isLiked ? "$pull" : "$addToSet"

    //Insert user and post like
    req.session.user = await User.findByIdAndUpdate(userId, { [option]: { likes: postId } }, { new: true })
        .catch((e) => {
            console.log("error", e);
            res.sendStatus(400)
        })


    const post = await Post.findByIdAndUpdate(postId, { [option]: { likes: userId } }, { new: true })
        .catch((e) => {
            console.log("error", e);
            res.sendStatus(400)
        })

    console.log("post", post);

    res.status(200).send(post)


})


router.post('/:id/retweet', async (req, res, next) => {

    console.log("post", req.params.id);

    const postId = req.params.id;
    const userId = req.session.user._id;


    //Try and delete if cant delete then retweet

    const deletedPost = await Post.findOneAndDelete({
        postedBy: userId,
        retweetData: postId
    }).catch((e) => {
        console.log("error", e);
        res.sendStatus(400)
    })
    console.log("deletedPost", deletedPost);

    const option = deletedPost !== null ? "$pull" : "$addToSet"

    let repost = deletedPost;
    console.log("repost", repost);
    if (repost == null) {
        repost = await Post.create({
            postedBy: userId,
            retweetData: postId
        })
            .catch((e) => {
                console.log("error", e);
                res.sendStatus(400)
            })
    }


    console.log("option", option);
    console.log("repost", repost);

    // //Insert user and post like
    req.session.user = await User.findByIdAndUpdate(userId, { [option]: { retweets: repost._id } }, { new: true })
        .catch((e) => {
            console.log("error", e);
            res.sendStatus(400)
        })


    //Update Post
    const post = await Post.findByIdAndUpdate(postId, { [option]: { retweetUsers: userId } }, { new: true })
        .catch((e) => {
            console.log("error", e);
            res.sendStatus(400)
        })

    // console.log("post",post);
    // retweetUsers
    res.status(200).send(post)


})



router.get("/:id", async (req, res, next) => {

    var postId = req.params.id;

    var postData = await getPosts({ _id: postId });
    postData = postData[0];

    var results = {
        postData: postData
    }

    if(postData.replyTo !== undefined) {
        results.replyTo = postData.replyTo;
    }

    results.replies = await getPosts({ replyTo: postId });

    res.status(200).send(results);
})


async function getPosts(filter) {
    let results = await Post.find(filter)
        .populate("postedBy")
        .populate("retweetData")
        .populate("replyTo")
        .sort({ "createdAt": -1 })
        .catch(error => console.log(error))

    results = await User.populate(results, { path: "replyTo.postedBy" });


    return await User.populate(results, { path: "retweetData.postedBy" });
}


router.delete("/:id", (req, res, next) => {
    Post.findByIdAndDelete(req.params.id)
    .then(() => res.sendStatus(202))
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })
})

module.exports = router;
