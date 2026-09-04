const mongoose = require('mongoose');

const { Schema } = mongoose;

/**
 * Collection 2 of 2: `posts`
 *
 * A single post document embeds its likes and comments so the whole
 * feed can be served from ONE collection (assignment constraint).
 *
 * - likes:    [{ user, username, createdAt }]  (username saved per spec)
 * - comments: [{ user, username, text, createdAt }]
 *
 * authorUsername is denormalised so the feed renders without a $lookup.
 */
const likeSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true, trim: true },
  },
  { timestamps: { createdAt: true, updatedAt: false }, _id: false }
);

const commentSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true, trim: true },
    text: {
      type: String,
      required: [true, 'Comment text is required'],
      trim: true,
      maxlength: [500, 'Comment must be at most 500 characters'],
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const postSchema = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    authorUsername: { type: String, required: true, trim: true },
    // Either `text` or `imageUrl` must be present (validated in route).
    text: { type: String, trim: true, maxlength: [2000, 'Post must be at most 2000 characters'], default: '' },
    // HTTP(S) URL or base64 data-URL (when image uploaded directly).
    imageUrl: { type: String, trim: true, default: '' },
  },
  { timestamps: true, collection: 'posts' }
);

// Embedded sub-documents.
postSchema.add({
  likes: { type: [likeSchema], default: [] },
  comments: { type: [commentSchema], default: [] },
});

// Newest posts first by default.
postSchema.index({ createdAt: -1 });

// Virtual counts — included in JSON responses.
postSchema.virtual('likeCount').get(function getLikeCount() {
  return this.likes ? this.likes.length : 0;
});
postSchema.virtual('commentCount').get(function getCommentCount() {
  return this.comments ? this.comments.length : 0;
});

postSchema.set('toJSON', { virtuals: true });
postSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Post', postSchema);
