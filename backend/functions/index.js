const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

const forum_functions = require('./impl/forum_functions');
const new_record_functions = require('./impl/records/new_record_functions');
const fetch_records_metadata = require('./impl/records/fetchables');
const user_functions = require('./impl/user_functions');

exports.retrieve_posts = functions.https.onRequest(forum_functions.retrieve_posts);
exports.retrieve_post = functions.https.onRequest(forum_functions.retrieve_post);
exports.save_post = functions.https.onRequest(forum_functions.save_post);
exports.delete_post = functions.https.onRequest(forum_functions.delete_post);
exports.search_posts = functions.https.onRequest(forum_functions.search_posts);

exports.new_genre = functions.https.onRequest(new_record_functions.new_genre);
exports.new_style = functions.https.onRequest(new_record_functions.new_style);
exports.new_record = functions.https.onRequest(new_record_functions.new_record);
exports.fetch_genres = functions.https.onRequest(fetch_records_metadata.fetch_genres);
exports.fetch_record = functions.https.onRequest(fetch_records_metadata.fetch_record);

exports.register_user = functions.https.onRequest(user_functions.register_user);
