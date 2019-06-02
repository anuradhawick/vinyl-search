
db.getCollection('records-metadata').createIndex({ name: 1}, {name: "genre_name", unique: true})
db.getCollection('users').createIndex({ uid: 1}, {name: "uid", unique: true})
db.getCollection('records').createIndex({id: 1}, {name: "record id",unique: true})
db.getCollection('forum_posts').createIndex({ textHTML: "text",  postTitle: "text" }, {weights: {textHTML: 1, postTitle: 5}})
db.getCollection('records').createIndex({
    "tracks.artists.name": "text",
    "tracks.title":"text",
    "label":"text",
    "mainArtist":"text",
    "name":"text",
    "catalogNo": "text"},
    {
        "name":"recordsIndex"
    })

