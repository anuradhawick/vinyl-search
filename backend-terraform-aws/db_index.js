const databaseName = process.env.MONGODB_DATABASE_NAME;

if (!databaseName) {
  throw new Error("MONGODB_DATABASE_NAME must be set");
}

db = db.getSiblingDB(databaseName);

db.getCollection("forum_posts").createIndex(
  { textHTML: "text", postTitle: "text" },
  { weights: { textHTML: 1, postTitle: 5 } },
);
db.getCollection("records").createIndex(
  {
    "tracks.artists.name": "text",
    "tracks.title": "text",
    label: "text",
    mainArtist: "text",
    name: "text",
    catalogNo: "text",
  },
  {
    name: "recordsIndex",
  },
);
db.getCollection("selling_items").createIndex({
  name: "text",
});
